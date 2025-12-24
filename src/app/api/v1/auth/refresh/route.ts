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
} from '@/lib/auth/jwt';
import { checkRateLimit, getClientIp } from '@/lib/middleware/auth';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

// Cookie configuration
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
  response.cookies.set('access_token', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60, // 1 hour
  });

  response.cookies.set('refresh_token', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/api/v1/auth',
  });
}

// Rate limit for refresh endpoint
const REFRESH_RATE_LIMIT = 20; // 20 attempts per window
const REFRESH_RATE_WINDOW = 900000; // 15 minutes

// Lazy initialization of JWT secret to avoid build-time errors
let _jwtSecret: Uint8Array | null = null;

function getJwtSecret(): Uint8Array {
  if (_jwtSecret) return _jwtSecret;

  const jwtSecretString = process.env.JWT_SECRET;

  // JWT_SECRET is required in all environments for security
  if (!jwtSecretString) {
    throw new Error(
      'JWT_SECRET environment variable is required. ' +
      'Please set JWT_SECRET in your .env file with a secure random string (min 32 characters).'
    );
  }

  _jwtSecret = new TextEncoder().encode(jwtSecretString);

  return _jwtSecret;
}

const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting to prevent abuse
    const ip = getClientIp(request);
    const rateLimitKey = `auth:refresh:${ip}`;
    const { allowed, resetAt } = await checkRateLimit(rateLimitKey, REFRESH_RATE_LIMIT, REFRESH_RATE_WINDOW);

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
        issuer: 'scamnemesis',
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
