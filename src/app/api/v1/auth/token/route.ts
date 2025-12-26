/**
 * POST /api/v1/auth/token
 *
 * Authenticate and get JWT token
 * Sets HttpOnly cookies for secure token storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import prisma from '@/lib/db';
import {
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  getScopesForRole,
  needsHashUpgrade,
  hashPassword,
} from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/auth/cookies';
import { AUTH_RATE_LIMITS, getRateLimitKey } from '@/lib/auth/rate-limits';
import { checkRateLimit, getClientIp } from '@/lib/middleware/auth';
import {
  isAccountLocked,
  recordFailedAttempt,
  clearFailedAttempts,
} from '@/lib/services/brute-force';
import { createRequestLogger, generateRequestId } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// Request schemas
const passwordLoginSchema = z.object({
  grant_type: z.literal('password'),
  email: z.string().email(),
  password: z.string().min(1),
});

const apiKeyLoginSchema = z.object({
  grant_type: z.literal('api_key'),
  api_key: z.string().min(1),
});

const loginSchema = z.union([passwordLoginSchema, apiKeyLoginSchema]);

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const log = createRequestLogger(requestId, 'AuthToken');

  try {
    // Rate limiting to prevent brute force attacks
    const ip = getClientIp(request);
    const rateLimitKey = getRateLimitKey('token', ip);
    const { allowed, resetAt } = await checkRateLimit(
      rateLimitKey,
      AUTH_RATE_LIMITS.TOKEN.limit,
      AUTH_RATE_LIMITS.TOKEN.windowMs
    );

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'rate_limited',
          message: 'Too many authentication attempts. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((resetAt.getTime() - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'Invalid request body',
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.grant_type === 'password') {
      // SECURITY: Check if account is locked due to brute force
      const lockStatus = await isAccountLocked(data.email);
      if (lockStatus.locked) {
        const retryAfter = lockStatus.lockedUntil
          ? Math.ceil((lockStatus.lockedUntil.getTime() - Date.now()) / 1000)
          : 900;

        return NextResponse.json(
          {
            error: 'account_locked',
            message: 'Account temporarily locked due to too many failed login attempts.',
            locked_until: lockStatus.lockedUntil?.toISOString(),
          },
          {
            status: 423,
            headers: {
              'Retry-After': retryAfter.toString(),
            },
          }
        );
      }

      // Password authentication
      const user = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          role: true,
          isActive: true,
          emailVerified: true,
          totpEnabled: true,
          displayName: true,
        },
      });

      if (!user || !user.isActive) {
        // SECURITY: Record failed attempt for brute force protection
        const attemptResult = await recordFailedAttempt(data.email, ip);

        // Log failed login attempt
        await prisma.auditLog.create({
          data: {
            action: 'LOGIN_FAILED',
            entityType: 'Auth',
            entityId: data.email,
            userId: user?.id || null,
            changes: {
              reason: !user ? 'user_not_found' : 'user_inactive',
              email: data.email,
              remainingAttempts: attemptResult.remainingAttempts,
            },
            ipAddress: ip,
          },
        });

        return NextResponse.json(
          {
            error: 'unauthorized',
            message: 'Invalid email or password',
            remaining_attempts: attemptResult.remainingAttempts,
          },
          { status: 401 }
        );
      }

      const validPassword = await verifyPassword(data.password, user.passwordHash!);

      if (!validPassword) {
        // SECURITY: Record failed attempt for brute force protection
        const attemptResult = await recordFailedAttempt(data.email, ip);

        // Log failed login attempt
        await prisma.auditLog.create({
          data: {
            action: 'LOGIN_FAILED',
            entityType: 'Auth',
            entityId: user.id,
            userId: user.id,
            changes: {
              reason: 'invalid_password',
              email: data.email,
              remainingAttempts: attemptResult.remainingAttempts,
            },
            ipAddress: ip,
          },
        });

        const response: Record<string, unknown> = {
          error: 'unauthorized',
          message: 'Invalid email or password',
          remaining_attempts: attemptResult.remainingAttempts,
        };

        // Warn user if close to lockout
        if (attemptResult.remainingAttempts <= 2 && attemptResult.remainingAttempts > 0) {
          response.warning = `Warning: ${attemptResult.remainingAttempts} attempt(s) remaining before lockout.`;
        }

        if (attemptResult.locked) {
          response.locked_until = attemptResult.lockedUntil?.toISOString();
        }

        return NextResponse.json(response, { status: 401 });
      }

      // SECURITY: Clear failed attempts on successful login
      await clearFailedAttempts(data.email);

      // SECURITY: Upgrade legacy password hash if needed (v1 -> v2 with 600k iterations)
      if (user.passwordHash && needsHashUpgrade(user.passwordHash)) {
        try {
          const upgradedHash = await hashPassword(data.password);
          await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: upgradedHash },
          });
          log.info('Password hash upgraded to v2', { userId: user.id });
        } catch (upgradeError) {
          // Don't fail login if hash upgrade fails, just log it
          log.warn('Failed to upgrade password hash', {
            userId: user.id,
            error: upgradeError instanceof Error ? upgradeError.message : String(upgradeError),
          });
        }
      }

      // Check if email is verified
      if (!user.emailVerified) {
        // Log unverified login attempt
        await prisma.auditLog.create({
          data: {
            action: 'LOGIN_FAILED',
            entityType: 'Auth',
            entityId: user.id,
            userId: user.id,
            changes: {
              reason: 'email_not_verified',
              email: data.email,
            },
            ipAddress: ip,
          },
        });

        return NextResponse.json(
          {
            error: 'email_not_verified',
            message: 'Please verify your email address before logging in. Check your inbox for the verification link.',
            email: user.email,
          },
          { status: 403 }
        );
      }

      // Check if 2FA is enabled - if so, return temp token for 2FA verification
      if (user.totpEnabled) {
        // Clear failed attempts since password was correct
        await clearFailedAttempts(data.email);

        // Generate temporary token for 2FA verification (5 minute expiry)
        const tempToken = Buffer.from(JSON.stringify({
          userId: user.id,
          exp: Date.now() + 5 * 60 * 1000, // 5 minutes
        })).toString('base64');

        // Log 2FA required
        await prisma.auditLog.create({
          data: {
            action: 'LOGIN_2FA_REQUIRED',
            entityType: 'Auth',
            entityId: user.id,
            userId: user.id,
            changes: {
              email: data.email,
              requires_2fa: true,
            },
            ipAddress: ip,
          },
        });

        return NextResponse.json({
          requires_2fa: true,
          temp_token: tempToken,
          message: 'Two-factor authentication required. Please enter your verification code.',
        });
      }

      // Get scopes for role
      const scopes = getScopesForRole(user.role);

      // Generate tokens
      const accessToken = await generateAccessToken(user.id, user.email, user.role, scopes);
      const refreshToken = await generateRefreshToken(user.id);

      // Store refresh token
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      // Update last login and create audit log
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        }),
        prisma.auditLog.create({
          data: {
            action: 'LOGIN_SUCCESS',
            entityType: 'Auth',
            entityId: user.id,
            userId: user.id,
            changes: {
              method: 'password',
              email: user.email,
              role: user.role,
            },
            ipAddress: ip,
          },
        }),
      ]);

      // Create response with user info
      const response = NextResponse.json({
        token_type: 'Bearer',
        expires_in: 3600,
        scopes,
        // Include user info so clients don't need to parse JWT
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        // Note: Tokens are now set as HttpOnly cookies for security
        // Legacy: Still include tokens in response body for API clients
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      // Set HttpOnly cookies for browser clients
      setAuthCookies(response, accessToken, refreshToken);

      return response;
    } else {
      // API key authentication
      // Note: Using findFirst instead of findUnique because isActive is not part of unique constraint
      const apiKey = await prisma.apiKey.findFirst({
        where: { key: data.api_key, isActive: true },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              isActive: true,
            },
          },
        },
      });

      if (!apiKey || !apiKey.user.isActive) {
        return NextResponse.json(
          {
            error: 'unauthorized',
            message: 'Invalid API key',
          },
          { status: 401 }
        );
      }

      // Check expiration
      if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
        return NextResponse.json(
          {
            error: 'unauthorized',
            message: 'API key has expired',
          },
          { status: 401 }
        );
      }

      // Use API key scopes or default to role scopes
      const scopes = apiKey.scopes.length > 0
        ? apiKey.scopes
        : getScopesForRole(apiKey.user.role);

      // Generate access token (no refresh token for API key auth)
      const accessToken = await generateAccessToken(
        apiKey.user.id,
        apiKey.user.email,
        apiKey.user.role,
        scopes
      );

      // Update last used and create audit log
      await prisma.$transaction([
        prisma.apiKey.update({
          where: { id: apiKey.id },
          data: { lastUsedAt: new Date() },
        }),
        prisma.auditLog.create({
          data: {
            action: 'LOGIN_SUCCESS',
            entityType: 'Auth',
            entityId: apiKey.user.id,
            userId: apiKey.user.id,
            changes: {
              method: 'api_key',
              apiKeyId: apiKey.id,
              apiKeyName: apiKey.name,
              email: apiKey.user.email,
              role: apiKey.user.role,
            },
            ipAddress: ip,
          },
        }),
      ]);

      // Create response with user info
      const response = NextResponse.json({
        token_type: 'Bearer',
        expires_in: 3600,
        scopes,
        // Include user info so clients don't need to parse JWT
        user: {
          id: apiKey.user.id,
          email: apiKey.user.email,
          role: apiKey.user.role,
        },
        // Legacy: Still include token in response body for API clients
        access_token: accessToken,
      });

      // Set HttpOnly cookie for browser clients (no refresh token for API key auth)
      setAuthCookies(response, accessToken);

      return response;
    }
  } catch (error) {
    log.error('Auth error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    Sentry.captureException(error, {
      tags: { api: 'auth', method: 'POST', endpoint: 'token' },
      extra: { requestId },
    });

    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'An unexpected error occurred',
        request_id: requestId,
      },
      { status: 500 }
    );
  }
}
