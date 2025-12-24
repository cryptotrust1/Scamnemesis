/**
 * GET /api/v1/auth/me - Get current authenticated user information
 * PATCH /api/v1/auth/me - Update current user profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { requireAuth, getClientIp } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

// Schema for profile updates
const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
});

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
        bio: true,
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
      bio: user.bio,
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

/**
 * PATCH /api/v1/auth/me - Update current user profile
 */
export async function PATCH(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId } = authResult;

    // Parse and validate request body
    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'Invalid request data',
          errors: parsed.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const { name, displayName, bio } = parsed.data;

    // Check if there's anything to update
    if (name === undefined && displayName === undefined && bio === undefined) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'At least one field (name, displayName, or bio) must be provided',
        },
        { status: 400 }
      );
    }

    // Get current user data for audit log
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        displayName: true,
        bio: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        {
          error: 'not_found',
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: { name?: string; displayName?: string; bio?: string | null } = {};
    if (name !== undefined) updateData.name = name;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio || null;

    // Update user and create audit log
    const ip = getClientIp(request);
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          displayName: true,
          bio: true,
          role: true,
          emailVerified: true,
          createdAt: true,
        },
      }),
      prisma.auditLog.create({
        data: {
          action: 'PROFILE_UPDATED',
          entityType: 'User',
          entityId: userId,
          userId: userId,
          changes: {
            before: {
              name: currentUser.name,
              displayName: currentUser.displayName,
              bio: currentUser.bio,
            },
            after: {
              name: name ?? currentUser.name,
              displayName: displayName ?? currentUser.displayName,
              bio: bio ?? currentUser.bio,
            },
          },
          ipAddress: ip,
        },
      }),
    ]);

    // Return updated user info
    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      displayName: updatedUser.displayName,
      bio: updatedUser.bio,
      role: updatedUser.role,
      emailVerified: updatedUser.emailVerified,
      createdAt: updatedUser.createdAt.toISOString(),
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
