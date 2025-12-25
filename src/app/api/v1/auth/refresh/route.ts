/**
 * POST /api/v1/auth/refresh
 *
 * Refresh JWT token using refresh token
 * Supports both HttpOnly cookie and request body for refresh token
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import {
  generateAccessToken,
  generateRefreshToken,
  getScopesForRole,
  getJwtSecret,
  JWT_ISSUER,
} from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/auth/cookies';
import { AUTH_RATE_LIMITS, getRateLimitKey } from '@/lib/auth/rate-limits';
import { checkRateLimit, getClientIp } from '@/lib/middleware/auth';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting to prevent abuse
    const ip = getClientIp(request);
    const rateLimitKey = getRateLimitKey('refresh', ip);
    const { allowed, resetAt } = await checkRateLimit(
      rateLimitKey,
      AUTH_RATE_LIMITS.REFRESH.limit,
      AUTH_RATE_LIMITS.REFRESH.windowMs
    );

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'rate_limited',
          message: 'Too many refresh attempts. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((resetAt.getTime() - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Try to get refresh token from cookie first, then from request body
    let refresh_token: string | undefined;

    // Check cookie first (preferred for browser clients)
    const cookieToken = request.cookies.get('refresh_token')?.value;
    if (cookieToken) {
      refresh_token = cookieToken;
    } else {
      // Fall back to request body (for API clients)
      try {
        const body = await request.json();
        const parsed = refreshSchema.safeParse(body);
        if (parsed.success) {
          refresh_token = parsed.data.refresh_token;
        }
      } catch {
        // No body or invalid JSON - that's ok if we have a cookie
      }
    }

    if (!refresh_token) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'refresh_token is required (via cookie or request body)',
        },
        { status: 400 }
      );
    }

    // Verify the refresh token
    let payload;
    try {
      const result = await jwtVerify(refresh_token, getJwtSecret(), {
        issuer: JWT_ISSUER,
      });
      payload = result.payload;
    } catch {
      return NextResponse.json(
        {
          error: 'unauthorized',
          message: 'Invalid or expired refresh token',
        },
        { status: 401 }
      );
    }

    if (payload.type !== 'refresh' || !payload.sub) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          message: 'Invalid token type',
        },
        { status: 401 }
      );
    }

    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refresh_token },
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

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          message: 'Refresh token not found or expired',
        },
        { status: 401 }
      );
    }

    if (!storedToken.user.isActive) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          message: 'User account is disabled',
        },
        { status: 401 }
      );
    }

    // Delete old refresh token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    // Generate new tokens
    const scopes = getScopesForRole(storedToken.user.role);
    const accessToken = await generateAccessToken(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.role,
      scopes
    );
    const newRefreshToken = await generateRefreshToken(storedToken.user.id);

    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        userId: storedToken.user.id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Create response
    const response = NextResponse.json({
      token_type: 'Bearer',
      expires_in: 3600,
      scopes,
      user: {
        id: storedToken.user.id,
        email: storedToken.user.email,
        role: storedToken.user.role,
      },
      // Legacy: Still include tokens in response body for API clients
      access_token: accessToken,
      refresh_token: newRefreshToken,
    });

    // Set HttpOnly cookies for browser clients
    setAuthCookies(response, accessToken, newRefreshToken);

    return response;
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
