import { NextRequest, NextResponse } from 'next/server';
import { Prisma, CommentStatus } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireAuth, requireRateLimit } from '@/lib/middleware/auth';
import { parsePagination } from '@/lib/utils/pagination';
import { handleApiError } from '@/lib/api/error-handler';

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
    // Safe pagination parsing with bounds checking to prevent DoS
    const { page, pageSize, skip } = parsePagination(searchParams);
    const status = searchParams.get('status');
    const search = searchParams.get('q');
    const reported = searchParams.get('reported');

    // Build where clause with proper typing
    const where: Prisma.CommentWhereInput = {};

    if (status) {
      // Map frontend status to Prisma enum
      if (status === 'PENDING') {
        where.status = CommentStatus.PENDING_MODERATION;
      } else if (Object.values(CommentStatus).includes(status as CommentStatus)) {
        where.status = status as CommentStatus;
      }
    }

    // Filter by reported status
    if (reported === 'true') {
      where.isReported = true;
    }

    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Fetch comments, count, and stats (including attachments)
    const [comments, total, pendingCount, reportedCount] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          status: true,
          rejectionReason: true,
          createdAt: true,
          isReported: true,
          reportReason: true,
          reportedAt: true,
          upvotes: true,
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
          attachments: {
            select: {
              id: true,
              fileKey: true,
              fileName: true,
              fileSize: true,
              mimeType: true,
              uploadedAt: true,
            },
          },
        },
      }),
      prisma.comment.count({ where }),
      prisma.comment.count({ where: { status: 'PENDING_MODERATION' } }),
      prisma.comment.count({ where: { isReported: true } }),
    ]);

    // Generate URLs for attachments
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

    // Format response with attachments
    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      status: comment.status === 'PENDING_MODERATION' ? 'PENDING' : comment.status,
      reported: comment.isReported,
      reportReason: comment.reportReason || comment.rejectionReason,
      reportedAt: comment.reportedAt?.toISOString() || null,
      upvotes: comment.upvotes,
      createdAt: comment.createdAt.toISOString(),
      author: {
        id: comment.user.id,
        displayName: comment.user.displayName || comment.user.name || 'Anonym',
        email: comment.user.email && comment.user.email.includes('@')
          ? `${comment.user.email.substring(0, 5)}***@${comment.user.email.split('@')[1]}`
          : 'skrytý',
      },
      report: {
        id: comment.report.id,
        publicId: comment.report.publicId,
        title: comment.report.summary,
      },
      attachments: comment.attachments.map(a => ({
        id: a.id,
        fileName: a.fileName,
        fileSize: a.fileSize,
        mimeType: a.mimeType,
        uploadedAt: a.uploadedAt.toISOString(),
        url: siteUrl
          ? `${siteUrl}/api/v1/evidence/files/${encodeURIComponent(a.fileKey)}`
          : `/api/v1/evidence/files/${encodeURIComponent(a.fileKey)}`,
      })),
      attachmentsCount: comment.attachments.length,
    }));

    return NextResponse.json({
      comments: formattedComments,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      stats: {
        pending: pendingCount,
        reported: reportedCount,
        total,
      },
    });
  } catch (error) {
    return handleApiError(error, request, { route: 'GET /api/v1/admin/comments' });
  }
}
