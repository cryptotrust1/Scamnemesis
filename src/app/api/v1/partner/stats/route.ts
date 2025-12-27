/**
 * Partner API - Statistics
 *
 * GET /api/v1/partner/stats - Get aggregated fraud statistics
 *
 * This endpoint provides statistical data about fraud reports.
 * No sensitive data is exposed.
 * Requires API key with 'stats:read' scope.
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth, requireRateLimit } from '@/lib/middleware/auth';
import { ReportStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/partner/stats
 * Get aggregated fraud statistics
 */
export async function GET(request: NextRequest) {
  // Check rate limit
  const rateLimitResult = await requireRateLimit(request, 100);
  if (rateLimitResult) return rateLimitResult;

  // Require API key with stats:read scope
  const authResult = await requireAuth(request, ['stats:read']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    // Only count approved reports
    const statusFilter = ReportStatus.APPROVED;

    // Parallel queries for performance
    const [
      totalReports,
      reportsLast30Days,
      byFraudType,
      byCountry,
      byMonth,
      financialStats,
      topFraudTypes,
    ] = await Promise.all([
      // Total approved reports
      prisma.report.count({
        where: { status: statusFilter },
      }),

      // Reports in last 30 days
      prisma.report.count({
        where: {
          status: statusFilter,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),

      // By fraud type
      prisma.report.groupBy({
        by: ['fraudType'],
        where: { status: statusFilter },
        _count: true,
        orderBy: { _count: { fraudType: 'desc' } },
      }),

      // By country (top 20) - using raw query since locationCountry needs special handling
      prisma.$queryRaw<{ locationCountry: string | null; count: bigint }[]>`
        SELECT location_country as "locationCountry", COUNT(*)::bigint as count
        FROM reports
        WHERE status = 'APPROVED' AND location_country IS NOT NULL
        GROUP BY location_country
        ORDER BY count DESC
        LIMIT 20
      `,

      // By month (last 12 months)
      prisma.$queryRaw<{ month: string; count: bigint }[]>`
        SELECT
          TO_CHAR(created_at, 'YYYY-MM') as month,
          COUNT(*)::bigint as count
        FROM reports
        WHERE status = 'APPROVED'
          AND created_at >= ${oneYearAgo}
        GROUP BY TO_CHAR(created_at, 'YYYY-MM')
        ORDER BY month DESC
        LIMIT 12
      `,

      // Financial loss statistics
      prisma.report.aggregate({
        where: {
          status: statusFilter,
          financialLossAmount: { not: null },
        },
        _sum: { financialLossAmount: true },
        _avg: { financialLossAmount: true },
        _max: { financialLossAmount: true },
        _count: { financialLossAmount: true },
      }),

      // Top fraud types by financial loss
      prisma.report.groupBy({
        by: ['fraudType'],
        where: {
          status: statusFilter,
          financialLossAmount: { not: null },
        },
        _sum: { financialLossAmount: true },
        _count: true,
        orderBy: { _sum: { financialLossAmount: 'desc' } },
        take: 5,
      }),
    ]);

    // Update API key last used (fire and forget)
    if (authResult.auth.apiKey) {
      prisma.apiKey.update({
        where: { id: authResult.auth.apiKey.id },
        data: { lastUsedAt: now },
      }).catch(() => { /* ignore */ });
    }

    const reportsWithFinancialData = financialStats._count?.financialLossAmount ?? 0;
    const totalLoss = financialStats._sum?.financialLossAmount ? Number(financialStats._sum.financialLossAmount) : 0;
    const avgLoss = financialStats._avg?.financialLossAmount ? Number(financialStats._avg.financialLossAmount) : 0;
    const maxLoss = financialStats._max?.financialLossAmount ? Number(financialStats._max.financialLossAmount) : 0;

    return NextResponse.json({
      overview: {
        total_reports: totalReports,
        reports_last_30_days: reportsLast30Days,
        reports_with_financial_data: reportsWithFinancialData,
      },
      financial_impact: {
        total_loss: totalLoss,
        average_loss: avgLoss,
        highest_loss: maxLoss,
        currency: 'EUR', // Primary currency
      },
      by_fraud_type: byFraudType.map(item => ({
        fraud_type: item.fraudType,
        count: item._count,
        percentage: totalReports > 0 ? Math.round((item._count / totalReports) * 100 * 10) / 10 : 0,
      })),
      by_country: byCountry.map(item => ({
        country: item.locationCountry,
        count: Number(item.count),
      })),
      monthly_trend: byMonth.map(item => ({
        month: item.month,
        count: Number(item.count),
      })),
      top_fraud_types_by_loss: topFraudTypes.map(item => ({
        fraud_type: item.fraudType,
        total_loss: item._sum?.financialLossAmount ? Number(item._sum.financialLossAmount) : 0,
        report_count: item._count,
      })),
      meta: {
        generated_at: now.toISOString(),
        data_period: {
          from: oneYearAgo.toISOString(),
          to: now.toISOString(),
        },
        note: 'Statistics are based on approved reports only.',
      },
    });
  } catch (error) {
    console.error('Error generating partner stats:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to generate statistics' },
      { status: 500 }
    );
  }
}
