import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth, requireRateLimit } from '@/lib/middleware/auth';
import { handleApiError } from '@/lib/api/error-handler';

export const dynamic = 'force-dynamic';

const RejectBodySchema = z.object({
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
    const updatedComment = await prisma.$transaction(async (tx) => {
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
    return handleApiError(error, request, { route: 'POST /api/v1/admin/comments/[id]/reject' });
  }
}
