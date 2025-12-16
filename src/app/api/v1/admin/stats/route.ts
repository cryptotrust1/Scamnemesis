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
    // Get date ranges
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch all stats in parallel
    const [
      totalReports,
      pendingReports,
      approvedReports,
      rejectedReports,
      totalUsers,
      activeUsers,
      reportsThisWeek,
      reportsLastWeek,
      pendingComments,
      pendingDuplicates,
      fraudTypeStats,
      recentReports,
    ] = await Promise.all([
      // Total reports
      prisma.report.count(),
      // Pending reports
      prisma.report.count({ where: { status: 'PENDING' } }),
      // Approved reports
      prisma.report.count({ where: { status: 'APPROVED' } }),
      // Rejected reports
      prisma.report.count({ where: { status: 'REJECTED' } }),
      // Total users
      prisma.user.count(),
      // Active users (logged in last month)
      prisma.user.count({
        where: {
          lastLoginAt: { gte: monthAgo },
          isActive: true,
        },
      }),
      // Reports this week
      prisma.report.count({
        where: { createdAt: { gte: weekAgo } },
      }),
      // Reports last week
      prisma.report.count({
        where: {
          createdAt: { gte: twoWeeksAgo, lt: weekAgo },
        },
      }),
      // Pending comments (using correct enum value)
      prisma.comment.count({ where: { status: 'PENDING_MODERATION' } }),
      // Pending duplicate clusters
      prisma.duplicateCluster.count({ where: { status: 'PENDING' } }),
      // Fraud type distribution
      prisma.report.groupBy({
        by: ['fraudType'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
      // Recent reports (using correct field names)
      prisma.report.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          publicId: true,
          summary: true,
          status: true,
          fraudType: true,
          createdAt: true,
          reporterEmail: true,
        },
      }),
    ]);

    // Calculate change percentage
    let reportsChange = '+0%';
    if (reportsLastWeek > 0) {
      const change = ((reportsThisWeek - reportsLastWeek) / reportsLastWeek) * 100;
      reportsChange = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    } else if (reportsThisWeek > 0) {
      reportsChange = '+100%';
    }

    // Format fraud type distribution
    const fraudTypeDistribution = fraudTypeStats.map((stat) => ({
      type: stat.fraudType,
      count: stat._count.id,
    }));

    // Format recent reports
    const formattedRecentReports = recentReports.map((report) => ({
      id: report.id,
      publicId: report.publicId,
      title: report.summary,
      status: report.status,
      fraudType: report.fraudType,
      createdAt: report.createdAt.toISOString(),
      reporterEmail: report.reporterEmail
        ? `${report.reporterEmail.substring(0, 3)}***@${report.reporterEmail.split('@')[1]}`
        : null,
    }));

    return NextResponse.json({
      totalReports,
      pendingReports,
      approvedReports,
      rejectedReports,
      totalUsers,
      activeUsers,
      reportsThisWeek,
      reportsChange,
      pendingComments,
      reportedComments: 0, // No isReported field in schema
      pendingDuplicates,
      fraudTypeDistribution,
      recentReports: formattedRecentReports,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
