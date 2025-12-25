/**
 * PATCH /api/v1/auth/me/password
 *
 * Change current user's password
 * Requires current password for verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import prisma from '@/lib/db';
import { requireAuth, getClientIp, checkRateLimit } from '@/lib/middleware/auth';
import { verifyPassword, hashPassword, PASSWORD_REGEX, PASSWORD_REQUIREMENTS } from '@/lib/auth/jwt';
import { AUTH_RATE_LIMITS, getRateLimitKey } from '@/lib/auth/rate-limits';
import { createRequestLogger, generateRequestId } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// Request schema - uses centralized password validation from @/lib/auth/jwt
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(9, 'Password must be at least 9 characters')
    .regex(PASSWORD_REGEX, PASSWORD_REQUIREMENTS),
});

export async function PATCH(request: NextRequest) {
  const requestId = generateRequestId();
  const log = createRequestLogger(requestId, 'PasswordChange');

  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId } = authResult;

    // Rate limiting using centralized configuration
    const ip = getClientIp(request);
    const rateLimitKey = getRateLimitKey('password-change', userId);
    const { allowed, resetAt } = await checkRateLimit(
      rateLimitKey,
      AUTH_RATE_LIMITS.PASSWORD_CHANGE.limit,
      AUTH_RATE_LIMITS.PASSWORD_CHANGE.windowMs
    );

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'rate_limited',
          message: 'Too many password change attempts. Please try again later.',
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
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'Invalid request data',
          errors: parsed.error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        {
          error: 'not_found',
          message: 'User not found or password not set',
        },
        { status: 404 }
      );
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      // Log failed attempt
      await prisma.auditLog.create({
        data: {
          action: 'PASSWORD_CHANGE_FAILED',
          entityType: 'User',
          entityId: userId,
          userId: userId,
          changes: {
            reason: 'invalid_current_password',
          },
          ipAddress: ip,
        },
      });

      return NextResponse.json(
        {
          error: 'invalid_password',
          message: 'Current password is incorrect',
        },
        { status: 400 }
      );
    }

    // Check new password is different from current
    const isSamePassword = await verifyPassword(newPassword, user.passwordHash);
    if (isSamePassword) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'New password must be different from current password',
        },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password and invalidate all refresh tokens (security best practice)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      }),
      // Invalidate all refresh tokens - force re-login on all devices
      prisma.refreshToken.deleteMany({
        where: { userId },
      }),
      // Create audit log
      prisma.auditLog.create({
        data: {
          action: 'PASSWORD_CHANGED',
          entityType: 'User',
          entityId: userId,
          userId: userId,
          changes: {
            note: 'Password changed by user, all sessions invalidated',
          },
          ipAddress: ip,
        },
      }),
    ]);

    log.info('Password changed successfully', { userId });

    return NextResponse.json({
      message: 'Password changed successfully. Please log in again with your new password.',
      sessions_invalidated: true,
    });
  } catch (error) {
    log.error('Password change error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    Sentry.captureException(error, {
      tags: { api: 'auth', method: 'PATCH', endpoint: 'me/password' },
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
