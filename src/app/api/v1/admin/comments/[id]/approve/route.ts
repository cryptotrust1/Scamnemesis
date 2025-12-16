import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, requireRateLimit } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

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
    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'not_found', message: 'Comment not found' },
        { status: 404 }
      );
    }

    if (comment.status === 'APPROVED') {
      return NextResponse.json(
        { error: 'already_approved', message: 'Comment is already approved' },
        { status: 400 }
      );
    }

    const now = new Date();

    // Update the comment to approved
    const updatedComment = await prisma.$transaction(async (tx) => {
      // Update the comment
      const updated = await tx.comment.update({
        where: { id },
        data: {
          status: 'APPROVED',
          moderatedAt: now,
          moderatedById: auth.userId,
        },
      });

      // Create audit log entry
      await tx.auditLog.create({
        data: {
          action: 'COMMENT_APPROVED',
          entityType: 'Comment',
          entityId: id,
          userId: auth.userId,
          changes: {
            previous_status: comment.status,
            new_status: 'APPROVED',
          },
          ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'),
        },
      });

      return updated;
    });

    return NextResponse.json({
      id: updatedComment.id,
      status: 'approved',
      approved_at: updatedComment.moderatedAt?.toISOString(),
    });
  } catch (error) {
    console.error('Error approving comment:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to approve comment' },
      { status: 500 }
    );
  }
}
