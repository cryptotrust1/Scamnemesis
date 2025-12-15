/**
 * POST /api/v1/auth/refresh
 *
 * Refresh JWT token using refresh token
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import {
  generateAccessToken,
  generateRefreshToken,
  getScopesForRole,
} from '@/lib/auth/jwt';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

// JWT Secret - uses same env var as jwt.ts
const jwtSecretString = process.env.JWT_SECRET;
if (!jwtSecretString && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}
const JWT_SECRET = new TextEncoder().encode(
  jwtSecretString || 'dev-jwt-secret-not-for-production'
);

const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = refreshSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'refresh_token is required',
        },
        { status: 400 }
      );
    }

    const { refresh_token } = parsed.data;

    // Verify the refresh token
    let payload;
    try {
      const result = await jwtVerify(refresh_token, JWT_SECRET, {
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

    return NextResponse.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: newRefreshToken,
      scopes,
    });
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
