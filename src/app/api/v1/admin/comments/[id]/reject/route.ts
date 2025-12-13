import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';

const RejectBodySchema = z.object({
  reason: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Require admin:moderate scope
  const auth = await requireAuth(request, ['admin:moderate']);
  if (auth instanceof NextResponse) return auth;

  const { id } = params;

  try {
    // Parse request body (optional)
    let body = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is OK
    }

    const validatedBody = RejectBodySchema.safeParse(body);
    if (!validatedBody.success) {
      return NextResponse.json(
        { error: 'validation_error', message: validatedBody.error.message },
        { status: 400 }
      );
    }

    const { reason } = validatedBody.data;

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

    if (comment.status === 'REJECTED') {
      return NextResponse.json(
        { error: 'already_rejected', message: 'Comment is already rejected' },
        { status: 400 }
      );
    }

    const now = new Date();

    // Update the comment to rejected
    const updatedComment = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update the comment
      const updated = await tx.comment.update({
        where: { id },
        data: {
          status: 'REJECTED',
          moderatedAt: now,
          moderatedById: auth.userId,
          rejectionReason: reason,
        },
      });

      // Create audit log entry
      await tx.auditLog.create({
        data: {
          action: 'COMMENT_REJECTED',
          entityType: 'Comment',
          entityId: id,
          userId: auth.userId,
          changes: {
            previous_status: comment.status,
            new_status: 'REJECTED',
            reason,
          },
          ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'),
        },
      });

      return updated;
    });

    return NextResponse.json({
      id: updatedComment.id,
      status: 'rejected',
      reason,
      rejected_at: updatedComment.moderatedAt?.toISOString(),
    });
  } catch (error) {
    console.error('Error rejecting comment:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to reject comment' },
      { status: 500 }
    );
  }
}
