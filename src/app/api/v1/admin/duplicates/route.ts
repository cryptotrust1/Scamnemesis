import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth, requireRateLimit } from '@/lib/middleware/auth';
import { handleApiError } from '@/lib/api/error-handler';

export const dynamic = 'force-dynamic';

const QuerySchema = z.object({
  status: z.enum(['pending', 'resolved', 'all']).default('pending'),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(request: NextRequest) {
  // Rate limiting - 60 requests per minute for admin endpoints
  const rateLimitError = await requireRateLimit(request, 60);
  if (rateLimitError) return rateLimitError;

  // Require admin:read scope
  const auth = await requireAuth(request, ['admin:read']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const query = QuerySchema.safeParse({
      status: searchParams.get('status') ?? 'pending',
      limit: searchParams.get('limit') ?? 20,
      offset: searchParams.get('offset') ?? 0,
    });

    if (!query.success) {
      return NextResponse.json(
        { error: 'validation_error', message: query.error.message },
        { status: 400 }
      );
    }

    const { status, limit, offset } = query.data;

    // Build where clause
    const where: Record<string, unknown> = {};
    if (status !== 'all') {
      where.status = status === 'pending' ? 'PENDING' : 'RESOLVED';
    }

    // Fetch duplicate clusters
    const [clusters, total] = await Promise.all([
      prisma.duplicateCluster.findMany({
        where,
        include: {
          reports: {
            include: {
              report: {
                include: {
                  perpetrators: {
                    select: {
                      id: true,
                      fullName: true,
                      email: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: [
          { status: 'asc' },
          { confidence: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.duplicateCluster.count({ where }),
    ]);

    // Map to DuplicateCluster interface expected by frontend
    return NextResponse.json({
      duplicates: clusters.map((cluster) => {
        // Get first perpetrator for simplified display (reserved for future use)
        const _firstPerp = cluster.reports[0]?.report?.perpetrators?.[0];

        return {
          id: cluster.id,
          status: cluster.status,
          confidence: cluster.confidence,
          matchType: cluster.matchType || 'unknown',
          createdAt: cluster.createdAt.toISOString(),
          mergedAt: cluster.resolvedAt?.toISOString(),
          reports: cluster.reports.map((clusterReport) => {
            const report = clusterReport.report;
            const perp = report.perpetrators?.[0];

            return {
              id: report.id,
              publicId: report.publicId,
              title: report.summary,
              fraudType: report.fraudType,
              perpetratorName: perp?.fullName || undefined,
              perpetratorPhone: perp?.phone || undefined,
              perpetratorEmail: perp?.email || undefined,
              amount: report.financialLossAmount
                ? Number(report.financialLossAmount)
                : undefined,
              currency: report.financialLossCurrency || undefined,
              createdAt: report.createdAt.toISOString(),
              isPrimary: clusterReport.isPrimary,
              similarity: clusterReport.similarity,
            };
          }),
        };
      }),
      total,
    });
  } catch (error) {
    return handleApiError(error, request, { route: 'GET /api/v1/admin/duplicates' });
  }
}
