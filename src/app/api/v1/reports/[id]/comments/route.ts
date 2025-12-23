import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

const CommentCreateSchema = z.object({
  content: z.string().min(10, 'Comment must be at least 10 characters').max(3000, 'Comment must not exceed 3000 characters'),
});

const CommentQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sort: z.enum(['newest', 'oldest']).default('newest'),
});

// GET /reports/:id/comments - List comments for a report
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const { searchParams } = new URL(request.url);
    const query = CommentQuerySchema.safeParse({
      limit: searchParams.get('limit') ?? 20,
      offset: searchParams.get('offset') ?? 0,
      sort: searchParams.get('sort') ?? 'newest',
    });

    if (!query.success) {
      return NextResponse.json(
        { error: 'validation_error', message: query.error.message },
        { status: 400 }
      );
    }

    const { limit, offset, sort } = query.data;

    // Find the report
    const report = await prisma.report.findFirst({
      where: {
        OR: [{ id }, { publicId: id }],
        status: 'APPROVED',
      },
      select: { id: true },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'not_found', message: 'Report not found' },
        { status: 404 }
      );
    }

    // Fetch approved comments
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          reportId: report.id,
          status: 'APPROVED',
        },
        include: {
          user: {
            select: {
              displayName: true,
            },
          },
        },
        orderBy: {
          createdAt: sort === 'newest' ? 'desc' : 'asc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.comment.count({
        where: {
          reportId: report.id,
          status: 'APPROVED',
        },
      }),
    ]);

    return NextResponse.json({
      comments: comments.map(c => ({
        id: c.id,
        content: c.content,
        author: c.user?.displayName || 'Anonymous',
        created_at: c.createdAt.toISOString(),
      })),
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /reports/:id/comments - Add a comment to a report
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Require authentication
  const auth = await requireAuth(request, ['comment:create']);
  if (auth instanceof NextResponse) return auth;

  const { id } = params;

  try {
    const body = await request.json();
    const validated = CommentCreateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'validation_error', message: validated.error.message },
        { status: 400 }
      );
    }

    // Find the report
    const report = await prisma.report.findFirst({
      where: {
        OR: [{ id }, { publicId: id }],
        status: 'APPROVED',
      },
      select: { id: true },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'not_found', message: 'Report not found' },
        { status: 404 }
      );
    }

    // Check if user has already commented recently (spam prevention)
    const recentComment = await prisma.comment.findFirst({
      where: {
        reportId: report.id,
        userId: auth.userId,
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000), // Within last minute
        },
      },
    });

    if (recentComment) {
      return NextResponse.json(
        { error: 'rate_limited', message: 'Please wait before posting another comment' },
        { status: 429 }
      );
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        reportId: report.id,
        userId: auth.userId,
        content: validated.data.content,
        status: 'PENDING_MODERATION',
      },
      include: {
        user: {
          select: {
            displayName: true,
          },
        },
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'COMMENT_CREATED',
        entityType: 'Comment',
        entityId: comment.id,
        userId: auth.userId,
        changes: {
          report_id: report.id,
          content_length: validated.data.content.length,
        },
        ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'),
      },
    });

    return NextResponse.json({
      id: comment.id,
      content: comment.content,
      author: comment.user?.displayName || 'Anonymous',
      status: 'pending_moderation',
      message: 'Your comment has been submitted and is pending moderation.',
      created_at: comment.createdAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
