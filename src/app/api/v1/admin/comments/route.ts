import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, requireRateLimit } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Rate limiting - 60 requests per minute for admin endpoints
  const rateLimitError = await requireRateLimit(request, 60);
  if (rateLimitError) return rateLimitError;

  // Require admin:read scope
  const auth = await requireAuth(request, ['admin:read']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('q');

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status) {
      // Map frontend status to Prisma enum
      if (status === 'PENDING') {
        where.status = 'PENDING_MODERATION';
      } else {
        where.status = status;
      }
    }

    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Fetch comments and count
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          status: true,
          rejectionReason: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              displayName: true,
            },
          },
          report: {
            select: {
              id: true,
              publicId: true,
              summary: true,
            },
          },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    // Format response
    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      status: comment.status === 'PENDING_MODERATION' ? 'PENDING' : comment.status,
      reported: false, // No isReported field in schema
      reportReason: comment.rejectionReason,
      createdAt: comment.createdAt.toISOString(),
      author: {
        id: comment.user.id,
        displayName: comment.user.displayName || comment.user.name || 'Anonym',
        email: comment.user.email
          ? `${comment.user.email.substring(0, 5)}***@${comment.user.email.split('@')[1]}`
          : 'skrytý',
      },
      report: {
        id: comment.report.id,
        publicId: comment.report.publicId,
        title: comment.report.summary,
      },
    }));

    return NextResponse.json({
      comments: formattedComments,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
