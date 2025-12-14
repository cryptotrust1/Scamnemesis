import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

const RoleSchema = z.object({
  role: z.enum(['BASIC', 'STANDARD', 'GOLD', 'ADMIN', 'SUPER_ADMIN']),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Require admin:edit scope
  const auth = await requireAuth(request, ['admin:edit']);
  if (auth instanceof NextResponse) return auth;

  const { id } = params;

  try {
    const body = await request.json();
    const validated = RoleSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'validation_error', message: 'Invalid role' },
        { status: 400 }
      );
    }

    const { role } = validated.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'not_found', message: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent changing own role
    if (user.id === auth.userId) {
      return NextResponse.json(
        { error: 'forbidden', message: 'Cannot change your own role' },
        { status: 403 }
      );
    }

    const previousRole = user.role;

    // Update role
    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: { role },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          emailVerified: true,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: 'USER_ROLE_CHANGED',
          entityType: 'User',
          entityId: id,
          userId: auth.userId,
          changes: {
            previous_role: previousRole,
            new_role: role,
          },
          ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'),
        },
      });

      return updated;
    });

    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      displayName: updatedUser.firstName && updatedUser.lastName
        ? `${updatedUser.firstName} ${updatedUser.lastName}`
        : null,
      role: updatedUser.role,
      status: !updatedUser.isActive
        ? 'BANNED'
        : !updatedUser.emailVerified
        ? 'PENDING'
        : 'ACTIVE',
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to update role' },
      { status: 500 }
    );
  }
}
