/**
 * POST /api/v1/auth/register
 *
 * User registration endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { z, type ZodIssue } from 'zod';
import { SignJWT } from 'jose';
import * as Sentry from '@sentry/nextjs';
import prisma from '@/lib/db';
import {
  hashPassword,
  generateAccessToken,
  generateRefreshToken,
  getScopesForRole,
} from '@/lib/auth/jwt';
import { checkRateLimit, getClientIp } from '@/lib/middleware/auth';
import { emailService } from '@/lib/services/email';
import { verifyCaptcha, isCaptchaEnabled } from '@/lib/captcha';
import { createRequestLogger, generateRequestId } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://scamnemesis.com';

// Cookie configuration (must match token endpoint)
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: 'lax' as const,
  path: '/',
};

/**
 * Set auth tokens as HttpOnly cookies on the response
 */
function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): void {
  // Access token cookie - 1 hour
  response.cookies.set('access_token', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60, // 1 hour
  });

  // Refresh token cookie - 7 days
  response.cookies.set('refresh_token', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/api/v1/auth', // Restrict to auth endpoints only
  });
}

// JWT_SECRET validation at runtime to avoid build-time failures
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required.');
  }
  return secret;
}

// Rate limit: 25 registrations per hour per IP (5x increase for better UX)
const REGISTER_RATE_LIMIT = 25;
const REGISTER_RATE_WINDOW = 3600000; // 1 hour in milliseconds

// Password validation regex
// Requires: 9+ chars, uppercase, lowercase, number, and special character
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{9,}$/;

// Request schema
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(9, 'Password must be at least 9 characters')
    .regex(
      PASSWORD_REGEX,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*...)'
    ),
  name: z.string().optional(),
  captchaToken: z.string().optional(), // Turnstile CAPTCHA token
});

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const log = createRequestLogger(requestId, 'AuthRegister');

  try {
    // Rate limiting to prevent abuse
    const ip = getClientIp(request);
    const rateLimitKey = `auth:register:${ip}`;
    const { allowed, resetAt } = await checkRateLimit(
      rateLimitKey,
      REGISTER_RATE_LIMIT,
      REGISTER_RATE_WINDOW
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

    // Hash password
    const passwordHash = await hashPassword(password);

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

    // Get scopes for role
    const scopes = getScopesForRole(user.role);

    // Generate tokens
    const accessToken = await generateAccessToken(user.id, user.email, user.role, scopes);
    const refreshToken = await generateRefreshToken(user.id);

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

    // Generate email verification token (valid for 24 hours)
    const secret = new TextEncoder().encode(getJwtSecret());
    const verificationToken = await new SignJWT({
      sub: user.id,
      email: user.email,
      type: 'email_verification',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

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
    log.error('Registration error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    Sentry.captureException(error, {
      tags: { api: 'auth', method: 'POST', endpoint: 'register' },
      extra: { requestId },
    });

    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'An unexpected error occurred during registration',
        request_id: requestId,
      },
      { status: 500 }
    );
  }
}
