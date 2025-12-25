import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import {
  hashPassword,
  PASSWORD_REGEX,
  PASSWORD_REQUIREMENTS,
  verifySpecialToken,
} from '@/lib/auth/jwt';
import { checkRateLimit, getClientIp } from '@/lib/middleware/auth';
import { emailService } from '@/lib/services/email';
import { AUTH_RATE_LIMITS, getRateLimitKey } from '@/lib/auth/rate-limits';

export const dynamic = 'force-dynamic';

const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(9, 'Password must be at least 9 characters')
    .regex(PASSWORD_REGEX, PASSWORD_REQUIREMENTS),
});

/**
 * POST /api/v1/auth/reset-password
 *
 * Completes password reset by validating token and setting new password.
 */
export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = getClientIp(request);
  const rateLimitKey = getRateLimitKey('reset-password', ip);
  const rateLimit = await checkRateLimit(
    rateLimitKey,
    AUTH_RATE_LIMITS.RESET_PASSWORD.limit,
    AUTH_RATE_LIMITS.RESET_PASSWORD.windowMs
  );

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
    const payload = await verifySpecialToken(token, 'password_reset');

    if (!payload) {
      return NextResponse.json(
        {
          error: 'invalid_token',
          message: 'Invalid or expired reset token. Please request a new password reset.',
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
