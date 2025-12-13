/**
 * POST /api/v1/auth/token
 *
 * Authenticate and get JWT token
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import {
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  getScopesForRole,
} from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

// Request schemas
const passwordLoginSchema = z.object({
  grant_type: z.literal('password'),
  email: z.string().email(),
  password: z.string().min(1),
});

const apiKeyLoginSchema = z.object({
  grant_type: z.literal('api_key'),
  api_key: z.string().min(1),
});

const loginSchema = z.union([passwordLoginSchema, apiKeyLoginSchema]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'Invalid request body',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.grant_type === 'password') {
      // Password authentication
      const user = await prisma.user.findUnique({
        where: { email: data.email },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          role: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        return NextResponse.json(
          {
            error: 'unauthorized',
            message: 'Invalid email or password',
          },
          { status: 401 }
        );
      }

      const validPassword = await verifyPassword(data.password, user.passwordHash);

      if (!validPassword) {
        return NextResponse.json(
          {
            error: 'unauthorized',
            message: 'Invalid email or password',
          },
          { status: 401 }
        );
      }

      // Get scopes for role
      const scopes = getScopesForRole(user.role);

      // Generate tokens
      const accessToken = await generateAccessToken(user.id, user.email, user.role, scopes);
      const refreshToken = await generateRefreshToken(user.id);

      // Store refresh token
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      return NextResponse.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: refreshToken,
        scopes,
      });
    } else {
      // API key authentication
      const apiKey = await prisma.apiKey.findUnique({
        where: { key: data.api_key, isActive: true },
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

      if (!apiKey || !apiKey.user.isActive) {
        return NextResponse.json(
          {
            error: 'unauthorized',
            message: 'Invalid API key',
          },
          { status: 401 }
        );
      }

      // Check expiration
      if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
        return NextResponse.json(
          {
            error: 'unauthorized',
            message: 'API key has expired',
          },
          { status: 401 }
        );
      }

      // Use API key scopes or default to role scopes
      const scopes = apiKey.scopes.length > 0
        ? apiKey.scopes
        : getScopesForRole(apiKey.user.role);

      // Generate access token (no refresh token for API key auth)
      const accessToken = await generateAccessToken(
        apiKey.user.id,
        apiKey.user.email,
        apiKey.user.role,
        scopes
      );

      // Update last used
      await prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
      });

      return NextResponse.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        scopes,
      });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
