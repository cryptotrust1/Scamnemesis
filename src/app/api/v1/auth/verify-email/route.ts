import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { jwtVerify, SignJWT } from 'jose';
import { prisma } from '@/lib/db';
import { emailService } from '@/lib/services/email';
import { checkRateLimit, getClientIp } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://scamnemesis.com';

// JWT_SECRET validation at runtime to avoid build-time failures
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required.');
  }
  return secret;
}

const VerifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

const ResendVerificationSchema = z.object({
  email: z.string().email('Invalid email format'),
});

/**
 * POST /api/v1/auth/verify-email
 *
 * Verifies user's email address using the verification token.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // Rate limiting: 20 attempts per hour
  const rateLimitKey = `verify-email:${ip}`;
  const rateLimit = await checkRateLimit(rateLimitKey, 20, 3600000); // 20 per hour

  if (!rateLimit.allowed) {
    const retryAfter = Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: 'rate_limit_exceeded',
        message: 'Too many verification attempts. Please try again later.',
        retry_after: retryAfter,
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const validated = VerifyEmailSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'Invalid verification token',
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { token } = validated.data;

    // Verify the token
    let payload;
    try {
      const secret = new TextEncoder().encode(getJwtSecret());
      const result = await jwtVerify(token, secret);
      payload = result.payload;
    } catch {
      return NextResponse.json(
        {
          error: 'invalid_token',
          message: 'Invalid or expired verification token. Please request a new verification email.',
        },
        { status: 400 }
      );
    }

    // Validate token payload
    if (payload.type !== 'email_verification' || !payload.sub || typeof payload.sub !== 'string') {
      return NextResponse.json(
        {
          error: 'invalid_token',
          message: 'Invalid verification token format.',
        },
        { status: 400 }
      );
    }

    const userId = payload.sub;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, emailVerified: true, isActive: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'user_not_found', message: 'User not found.' },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'account_disabled', message: 'This account has been disabled.' },
        { status: 403 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Email is already verified.',
        already_verified: true,
      });
    }

    // Update user's email verification status
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      }),
      prisma.auditLog.create({
        data: {
          userId,
          action: 'EMAIL_VERIFIED',
          entityType: 'user',
          entityId: userId,
          ipAddress: ip,
          userAgent: request.headers.get('user-agent')?.substring(0, 255),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully. You can now access all features.',
    });
  } catch (error) {
    console.error('[VerifyEmail] Error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/auth/verify-email
 *
 * Resends verification email to user.
 */
export async function PUT(request: NextRequest) {
  const ip = getClientIp(request);

  // Strict rate limiting: 3 resends per hour
  const rateLimitKey = `resend-verification:${ip}`;
  const rateLimit = await checkRateLimit(rateLimitKey, 3, 3600000); // 3 per hour

  if (!rateLimit.allowed) {
    const retryAfter = Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: 'rate_limit_exceeded',
        message: 'Too many verification emails requested. Please try again later.',
        retry_after: retryAfter,
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const validated = ResendVerificationSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'Invalid email format',
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true, emailVerified: true, isActive: true },
    });

    // Always return success to prevent email enumeration
    if (user && user.isActive && !user.emailVerified) {
      // Generate verification token (valid for 24 hours)
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

      // Send verification email
      const emailResult = await emailService.sendVerification(
        user.email,
        user.name || 'User',
        verificationUrl
      );

      if (!emailResult.success) {
        console.error('[VerifyEmail] Failed to send email:', emailResult.error);
      }

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'VERIFICATION_EMAIL_RESENT',
          entityType: 'user',
          entityId: user.id,
          ipAddress: ip,
          userAgent: request.headers.get('user-agent')?.substring(0, 255),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'If an unverified account with this email exists, you will receive a verification email.',
    });
  } catch (error) {
    console.error('[VerifyEmail] Error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}
