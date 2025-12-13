/**
 * Stats API Route
 *
 * GET /api/v1/stats - Get global statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireRateLimit } from '@/lib/middleware/auth';

interface StatsCache {
  data: {
    total_reports: number;
    total_amount_lost: number;
    users_protected: number;
    reports_this_month: number;
    top_fraud_types: { type: string; count: number }[];
    top_countries: { country: string; count: number }[];
  };
  cachedAt: number;
}

let statsCache: StatsCache | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * GET /api/v1/stats - Get global fraud statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitError = await requireRateLimit(request, 300);
    if (rateLimitError) return rateLimitError;

    // Check cache
    const now = Date.now();
    if (statsCache && now - statsCache.cachedAt < CACHE_TTL) {
      return NextResponse.json(statsCache.data, {
        headers: {
          'Cache-Control': 'public, max-age=300',
          'X-Cache': 'HIT',
        },
      });
    }

    // Calculate statistics
    const [
      totalReports,
      totalAmountResult,
      reportsThisMonth,
      fraudTypeCounts,
      countryCounts,
      uniqueReporters,
    ] = await Promise.all([
      // Total approved reports
      prisma.report.count({
        where: { status: 'APPROVED' },
      }),

      // Total amount lost
      prisma.report.aggregate({
        where: { status: 'APPROVED' },
        _sum: { financialLossAmount: true },
      }),

      // Reports this month
      prisma.report.count({
        where: {
          status: 'APPROVED',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),

      // Top fraud types
      prisma.report.groupBy({
        by: ['fraudType'],
        where: { status: 'APPROVED' },
        _count: true,
        orderBy: { _count: { fraudType: 'desc' } },
        take: 10,
      }),

      // Top countries
      prisma.report.groupBy({
        by: ['locationCountry'],
        where: { status: 'APPROVED', locationCountry: { not: null } },
        _count: true,
        orderBy: { _count: { locationCountry: 'desc' } },
        take: 10,
      }),

      // Unique reporters (as proxy for users protected)
      prisma.report.groupBy({
        by: ['reporterId'],
        where: { status: 'APPROVED' },
      }),
    ]);

    const stats = {
      total_reports: totalReports,
      total_amount_lost: Number(totalAmountResult._sum.financialLossAmount || 0),
      users_protected: uniqueReporters.length * 10, // Estimate: each report protects ~10 potential victims
      reports_this_month: reportsThisMonth,
      top_fraud_types: fraudTypeCounts.map((f) => ({
        type: f.fraudType.toLowerCase(),
        count: f._count,
      })),
      top_countries: countryCounts
        .filter((c) => c.locationCountry)
        .map((c) => ({
          country: c.locationCountry!,
          count: c._count,
        })),
    };

    // Update cache
    statsCache = {
      data: stats,
      cachedAt: now,
    };

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, max-age=300',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
