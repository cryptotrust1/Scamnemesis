import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth, requireRateLimit } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

const BanSchema = z.object({
  reason: z.string().min(1).max(500).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Rate limiting for admin operations
  const rateLimitError = await requireRateLimit(request, 30);
  if (rateLimitError) return rateLimitError;

  // Require admin:moderate scope
  const auth = await requireAuth(request, ['admin:moderate']);
  if (auth instanceof NextResponse) return auth;

  const { id } = params;

  try {
    let body = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is OK
    }

    const validated = BanSchema.safeParse(body);
    const reason = validated.success ? validated.data.reason : undefined;

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

    // Prevent banning yourself
    if (user.id === auth.userId) {
      return NextResponse.json(
        { error: 'forbidden', message: 'Cannot ban yourself' },
        { status: 403 }
      );
    }

    // Prevent banning admins unless super admin
    if ((user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && !auth.auth.scopes.includes('*')) {
      return NextResponse.json(
        { error: 'forbidden', message: 'Cannot ban admin users' },
        { status: 403 }
      );
    }

    // Update user
    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: { isActive: false },
        select: {
          id: true,
          email: true,
          name: true,
          displayName: true,
          role: true,
          isActive: true,
          emailVerified: true,
        },
      });

      // Revoke all refresh tokens
      await tx.refreshToken.deleteMany({
        where: { userId: id },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: 'USER_BANNED',
          entityType: 'User',
          entityId: id,
          userId: auth.userId,
          changes: {
            reason,
          },
          ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'),
        },
      });

      return updated;
    });

    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      displayName: updatedUser.displayName || updatedUser.name || null,
      role: updatedUser.role,
      status: 'BANNED',
      isActive: false,
    });
  } catch (error) {
    console.error('Error banning user:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to ban user' },
      { status: 500 }
    );
  }
}
