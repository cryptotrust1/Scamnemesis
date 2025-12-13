import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

const QuerySchema = z.object({
  status: z.enum(['pending', 'resolved', 'all']).default('pending'),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(request: NextRequest) {
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

    return NextResponse.json({
      clusters: clusters.map((cluster) => ({
        id: cluster.id,
        status: cluster.status.toLowerCase(),
        confidence: cluster.confidence,
        match_type: cluster.matchType?.toLowerCase(),
        reports: cluster.reports.map((clusterReport) => ({
          id: clusterReport.report.id,
          fraud_type: clusterReport.report.fraudType?.toLowerCase(),
          summary: clusterReport.report.summary,
          status: clusterReport.report.status.toLowerCase(),
          financial_loss: clusterReport.report.financialLossAmount ? {
            amount: Number(clusterReport.report.financialLossAmount),
            currency: clusterReport.report.financialLossCurrency,
          } : null,
          perpetrators: clusterReport.report.perpetrators.map((p) => ({
            id: p.id,
            full_name: p.fullName,
            email: p.email,
            phone: p.phone,
          })),
          created_at: clusterReport.report.createdAt.toISOString(),
          similarity: clusterReport.similarity,
          is_primary: clusterReport.isPrimary,
        })),
        created_at: cluster.createdAt.toISOString(),
        resolved_at: cluster.resolvedAt?.toISOString(),
      })),
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching duplicate clusters:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to fetch duplicate clusters' },
      { status: 500 }
    );
  }
}
