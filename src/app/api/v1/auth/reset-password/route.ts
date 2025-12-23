import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth/jwt';
import { checkRateLimit, getClientIp } from '@/lib/middleware/auth';
import { emailService } from '@/lib/services/email';

export const dynamic = 'force-dynamic';

// JWT_SECRET validation at runtime to avoid build-time failures
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required.');
  }
  return secret;
}

// Password validation - MUST match register endpoint exactly
// Requires: 9+ chars, uppercase, lowercase, number, and special character
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{9,}$/;

const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(9, 'Password must be at least 9 characters')
    .regex(
      PASSWORD_REGEX,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*...)'
    ),
});

/**
 * POST /api/v1/auth/reset-password
 *
 * Completes password reset by validating token and setting new password.
 */
export async function POST(request: NextRequest) {
  // Rate limiting: 10 attempts per hour per IP
  const ip = getClientIp(request);

  const rateLimitKey = `reset-password:${ip}`;
  const rateLimit = await checkRateLimit(rateLimitKey, 10, 3600000); // 10 per hour

  if (!rateLimit.allowed) {
    const retryAfter = Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: 'rate_limit_exceeded',
        message: 'Too many password reset attempts. Please try again later.',
        retry_after: retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(10),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  try {
    const body = await request.json();
    const validated = ResetPasswordSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'Validation failed',
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { token, password } = validated.data;

    // Verify the reset token
    let payload;
    try {
      const secret = new TextEncoder().encode(getJwtSecret());
      const result = await jwtVerify(token, secret);
      payload = result.payload;
    } catch {
      return NextResponse.json(
        {
          error: 'invalid_token',
          message: 'Invalid or expired reset token. Please request a new password reset.',
        },
        { status: 400 }
      );
    }

    // Validate token payload
    if (payload.type !== 'password_reset' || !payload.sub || typeof payload.sub !== 'string') {
      return NextResponse.json(
        {
          error: 'invalid_token',
          message: 'Invalid reset token format.',
        },
        { status: 400 }
      );
    }

    const userId = payload.sub;

    // Find user and verify they exist and are active
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, isActive: true },
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

    // Hash the new password using the same function as register endpoint
    const passwordHash = await hashPassword(password);

    // Update user's password and invalidate all refresh tokens
    await prisma.$transaction([
      // Update password
      prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      }),
      // Invalidate all existing refresh tokens (logout from all devices)
      prisma.refreshToken.deleteMany({
        where: { userId },
      }),
      // Create audit log
      prisma.auditLog.create({
        data: {
          userId,
          action: 'PASSWORD_RESET_COMPLETED',
          entityType: 'user',
          entityId: userId,
          ipAddress: ip,
          userAgent: request.headers.get('user-agent')?.substring(0, 255),
        },
      }),
    ]);

    // Send confirmation email (async, don't wait)
    emailService.sendPasswordResetConfirmation(user.email, user.name || 'User').catch((error) => {
      console.error('Failed to send password reset confirmation email:', error);
    });

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('[ResetPassword] Error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}
