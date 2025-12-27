/**
 * POST /api/v1/auth/logout
 *
 * Logout and invalidate refresh tokens
 * Clears HttpOnly auth cookies
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { checkRateLimit, getClientIp, optionalAuth } from '@/lib/middleware/auth';
import { clearAuthCookies } from '@/lib/auth/cookies';
import { AUTH_RATE_LIMITS, getRateLimitKey } from '@/lib/auth/rate-limits';

export const dynamic = 'force-dynamic';

const logoutSchema = z.object({
  refresh_token: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting to prevent abuse
    const ip = getClientIp(request);
    const rateLimitKey = getRateLimitKey('logout', ip);
    const { allowed, resetAt } = await checkRateLimit(
      rateLimitKey,
      AUTH_RATE_LIMITS.LOGOUT.limit,
      AUTH_RATE_LIMITS.LOGOUT.windowMs
    );

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'rate_limited',
          message: 'Too many logout attempts. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((resetAt.getTime() - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      // Empty body is fine for logout
      body = {};
    }

    const parsed = logoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'Invalid request body',
        },
        { status: 400 }
      );
    }

    const { refresh_token: bodyRefreshToken } = parsed.data;

    // Get refresh token from cookie or body
    const cookieRefreshToken = request.cookies.get('refresh_token')?.value;
    const refreshTokenToInvalidate = cookieRefreshToken || bodyRefreshToken;

    // Get optional authentication context
    const auth = await optionalAuth(request);
    const userId = auth.user?.sub || auth.apiKey?.userId;

    // If a specific refresh token is provided, try to invalidate it
    if (refreshTokenToInvalidate) {
      try {
        await prisma.refreshToken.delete({
          where: { token: refreshTokenToInvalidate },
        });
      } catch {
        // Token might not exist, which is fine
      }
    }

    // If authenticated, invalidate all refresh tokens for the user and log the logout
    if (userId) {
      await prisma.$transaction([
        prisma.refreshToken.deleteMany({
          where: { userId },
        }),
        prisma.auditLog.create({
          data: {
            action: 'LOGOUT',
            entityType: 'Auth',
            entityId: userId,
            userId: userId,
            changes: {
              method: auth.apiKey ? 'api_key' : 'password',
            },
            ipAddress: ip,
          },
        }),
      ]);
    }

    // Create response and clear cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear auth cookies
    clearAuthCookies(response);

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    // Even on error, we should clear cookies
    const response = NextResponse.json(
      {
        error: 'internal_error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
    clearAuthCookies(response);
    return response;
  }
}
