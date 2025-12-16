/**
 * POST /api/v1/auth/logout
 *
 * Logout and invalidate refresh tokens
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { checkRateLimit, getClientIp, optionalAuth } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

// Rate limit for logout endpoint
const LOGOUT_RATE_LIMIT = 20; // 20 attempts per window
const LOGOUT_RATE_WINDOW = 900000; // 15 minutes

const logoutSchema = z.object({
  refresh_token: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting to prevent abuse
    const ip = getClientIp(request);
    const rateLimitKey = `auth:logout:${ip}`;
    const { allowed, resetAt } = await checkRateLimit(rateLimitKey, LOGOUT_RATE_LIMIT, LOGOUT_RATE_WINDOW);

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

    const { refresh_token } = parsed.data;

    // Get optional authentication context
    const auth = await optionalAuth(request);
    const userId = auth.user?.sub || auth.apiKey?.userId;

    // If a specific refresh token is provided, try to invalidate it
    if (refresh_token) {
      try {
        await prisma.refreshToken.delete({
          where: { token: refresh_token },
        });
      } catch {
        // Token might not exist, which is fine
      }
    }

    // If authenticated, invalidate all refresh tokens for the user
    if (userId) {
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });
    }

    // Always return success, even if not authenticated
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
