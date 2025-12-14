import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Require admin:read scope
  const auth = await requireAuth(request, ['admin:read']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '10');
    const status = searchParams.get('status');
    const reported = searchParams.get('reported');
    const search = searchParams.get('q');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (reported === 'true') {
      where.isReported = true;
    }

    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { author: { email: { contains: search, mode: 'insensitive' } } },
        { author: { firstName: { contains: search, mode: 'insensitive' } } },
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
          isReported: true,
          reportReason: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          report: {
            select: {
              id: true,
              publicId: true,
              title: true,
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
      status: comment.status,
      reported: comment.isReported,
      reportReason: comment.reportReason,
      createdAt: comment.createdAt.toISOString(),
      author: {
        id: comment.author.id,
        displayName: comment.author.firstName && comment.author.lastName
          ? `${comment.author.firstName} ${comment.author.lastName}`
          : comment.author.firstName || 'Anonym',
        email: `${comment.author.email.substring(0, 5)}***@${comment.author.email.split('@')[1]}`,
      },
      report: {
        id: comment.report.id,
        publicId: comment.report.publicId,
        title: comment.report.title,
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
