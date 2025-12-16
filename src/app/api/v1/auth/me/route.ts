/**
 * GET /api/v1/auth/me
 *
 * Get current authenticated user information
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/auth/me - Get current user info
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId } = authResult;

    // Look up user in database by the sub claim (userId) from JWT
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // Return 404 if user not found in database
    if (!user) {
      return NextResponse.json(
        {
          error: 'not_found',
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    // Return current user info
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      displayName: user.displayName,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Get user info error:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
