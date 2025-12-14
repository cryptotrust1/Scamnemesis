import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Require admin:moderate scope
  const auth = await requireAuth(request, ['admin:moderate']);
  if (auth instanceof NextResponse) return auth;

  const { id } = params;

  try {
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

    // Update user
    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: { isActive: true },
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
          action: 'USER_UNBANNED',
          entityType: 'User',
          entityId: id,
          userId: auth.userId,
          changes: {},
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
      status: !updatedUser.emailVerified ? 'PENDING' : 'ACTIVE',
      isActive: true,
    });
  } catch (error) {
    console.error('Error unbanning user:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to unban user' },
      { status: 500 }
    );
  }
}
