/**
 * POST /api/v1/auth/register
 *
 * User registration endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { z, type ZodIssue } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/db';
import {
  hashPassword,
  generateAccessToken,
  generateRefreshToken,
  getScopesForRole,
  PASSWORD_REGEX,
  PASSWORD_REQUIREMENTS,
  generateEmailVerificationToken,
} from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/auth/cookies';
import { AUTH_RATE_LIMITS, getRateLimitKey } from '@/lib/auth/rate-limits';
import { checkRateLimit, getClientIp } from '@/lib/middleware/auth';
import { emailService } from '@/lib/services/email';
import { verifyCaptcha, isCaptchaEnabled } from '@/lib/captcha';
import { createRequestLogger, generateRequestId } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://scamnemesis.com';

// Request schema
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(9, 'Password must be at least 9 characters')
    .regex(PASSWORD_REGEX, PASSWORD_REQUIREMENTS),
  name: z.string().optional(),
  captchaToken: z.string().optional(), // Turnstile CAPTCHA token
});

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const log = createRequestLogger(requestId, 'AuthRegister');

  // Track which step we're on for debugging 500 errors
  let currentStep = 'init';

  try {
    currentStep = 'rate-limiting';
    // Rate limiting to prevent abuse
    const ip = getClientIp(request);
    const rateLimitKey = getRateLimitKey('register', ip);
    const { allowed, resetAt } = await checkRateLimit(
      rateLimitKey,
      AUTH_RATE_LIMITS.REGISTER.limit,
      AUTH_RATE_LIMITS.REGISTER.windowMs
    );

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'rate_limited',
          message: 'Too many registration attempts. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((resetAt.getTime() - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    currentStep = 'parse-body';
    // Parse and validate request body
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.errors.map((err: ZodIssue) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'Invalid request data',
          errors,
        },
        { status: 400 }
      );
    }

    const { email, password, name, captchaToken } = parsed.data;

    currentStep = 'captcha-check';
    // Verify CAPTCHA if enabled
    if (isCaptchaEnabled()) {
      const captchaResult = await verifyCaptcha(captchaToken, ip);
      if (!captchaResult.success) {
        return NextResponse.json(
          {
            error: 'captcha_failed',
            message: 'CAPTCHA verification failed. Please try again.',
            errors: captchaResult.errors,
          },
          { status: 400 }
        );
      }
    }

    currentStep = 'check-existing-user';
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'email_exists',
          message: 'An account with this email already exists',
        },
        { status: 409 }
      );
    }

    currentStep = 'hash-password';
    // Hash password
    const passwordHash = await hashPassword(password);

    currentStep = 'create-user';
    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name: name || email.split('@')[0],
        role: 'BASIC',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    currentStep = 'generate-tokens';
    // Get scopes for role
    const scopes = getScopesForRole(user.role);

    // Generate tokens
    const accessToken = await generateAccessToken(user.id, user.email, user.role, scopes);
    const refreshToken = await generateRefreshToken(user.id);

    currentStep = 'store-refresh-token';
    // Store refresh token and create audit log
    await prisma.$transaction([
      prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      }),
      prisma.auditLog.create({
        data: {
          action: 'USER_REGISTERED',
          entityType: 'User',
          entityId: user.id,
          userId: user.id,
          changes: {
            email: user.email,
            name: user.name,
            role: user.role,
          },
          ipAddress: ip,
        },
      }),
    ]);

    currentStep = 'generate-email-token';
    // Generate email verification token (valid for 24 hours)
    const verificationToken = await generateEmailVerificationToken(user.id, user.email);

    // Build verification URL
    const verificationUrl = `${SITE_URL}/auth/verify-email?token=${verificationToken}`;

    // Send welcome email with verification link (async, don't wait for it)
    emailService.sendWelcome(user.email, user.name || 'User', verificationUrl).catch((error) => {
      console.error('Failed to send welcome email:', error);
      // Don't fail the registration if email fails
    });

    // Create response with user info
    const response = NextResponse.json(
      {
        token_type: 'Bearer',
        expires_in: 3600,
        scopes,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          email_verified: false, // Email verification required
        },
        message: 'Registration successful. Please check your email to verify your account.',
        // Legacy: Still include tokens in response body for API clients
        access_token: accessToken,
        refresh_token: refreshToken,
      },
      { status: 201 }
    );

    // Set HttpOnly cookies for browser clients
    setAuthCookies(response, accessToken, refreshToken);

    return response;
  } catch (error) {
    // Handle Prisma unique constraint violation (race condition: same email registered twice)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      log.warn('Registration race condition - email already exists', {
        step: currentStep,
        requestId,
      });
      return NextResponse.json(
        {
          error: 'email_exists',
          message: 'An account with this email already exists',
        },
        { status: 409 }
      );
    }

    // Log detailed error with the step where it failed
    log.error('Registration error', {
      step: currentStep,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Also log to console for easier debugging
    console.error(`[Register] FAILED at step '${currentStep}':`, error);

    Sentry.captureException(error, {
      tags: { api: 'auth', method: 'POST', endpoint: 'register', step: currentStep },
      extra: { requestId, failedStep: currentStep },
    });

    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'An unexpected error occurred during registration',
        request_id: requestId,
        // Include step in response for debugging (remove in production if sensitive)
        debug_step: currentStep,
      },
      { status: 500 }
    );
  }
}
