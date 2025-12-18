/**
 * GET /api/metrics
 *
 * Prometheus-compatible metrics endpoint
 * Exposes application metrics in OpenMetrics format
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Metrics cache to avoid too frequent DB queries
let metricsCache: { data: string; timestamp: number } | null = null;
const CACHE_TTL = 15000; // 15 seconds

/**
 * Format a metric in Prometheus format
 */
function metric(name: string, value: number, help?: string, type = 'gauge', labels?: Record<string, string>): string {
  const lines: string[] = [];
  if (help) {
    lines.push(`# HELP ${name} ${help}`);
  }
  lines.push(`# TYPE ${name} ${type}`);

  if (labels && Object.keys(labels).length > 0) {
    const labelStr = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    lines.push(`${name}{${labelStr}} ${value}`);
  } else {
    lines.push(`${name} ${value}`);
  }

  return lines.join('\n');
}

/**
 * Get application metrics
 */
async function getMetrics(): Promise<string> {
  // Check cache
  const now = Date.now();
  if (metricsCache && now - metricsCache.timestamp < CACHE_TTL) {
    return metricsCache.data;
  }

  const metrics: string[] = [];

  try {
    // Report metrics
    const [
      totalReports,
      pendingReports,
      approvedReports,
      rejectedReports,
      underReviewReports,
    ] = await Promise.all([
      prisma.report.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.report.count({ where: { status: 'APPROVED' } }),
      prisma.report.count({ where: { status: 'REJECTED' } }),
      prisma.report.count({ where: { status: 'UNDER_REVIEW' } }),
    ]);

    metrics.push(metric(
      'scamnemesis_reports_total',
      totalReports,
      'Total number of reports in the system',
      'gauge'
    ));

    metrics.push(metric(
      'scamnemesis_reports_by_status',
      pendingReports,
      'Number of reports by status',
      'gauge',
      { status: 'pending' }
    ));

    metrics.push(metric(
      'scamnemesis_reports_by_status',
      approvedReports,
      undefined,
      'gauge',
      { status: 'approved' }
    ));

    metrics.push(metric(
      'scamnemesis_reports_by_status',
      rejectedReports,
      undefined,
      'gauge',
      { status: 'rejected' }
    ));

    metrics.push(metric(
      'scamnemesis_reports_by_status',
      underReviewReports,
      undefined,
      'gauge',
      { status: 'under_review' }
    ));

    // User metrics
    const [totalUsers, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
    ]);

    metrics.push(metric(
      'scamnemesis_users_total',
      totalUsers,
      'Total number of registered users',
      'gauge'
    ));

    metrics.push(metric(
      'scamnemesis_users_active',
      activeUsers,
      'Number of active users',
      'gauge'
    ));

    // Media metrics
    const [totalMedia, processingMedia, readyMedia] = await Promise.all([
      prisma.media.count({ where: { deletedAt: null } }),
      prisma.media.count({ where: { status: 'PROCESSING', deletedAt: null } }),
      prisma.media.count({ where: { status: 'READY', deletedAt: null } }),
    ]);

    metrics.push(metric(
      'scamnemesis_media_total',
      totalMedia,
      'Total number of media files',
      'gauge'
    ));

    metrics.push(metric(
      'scamnemesis_media_by_status',
      processingMedia,
      'Number of media files by status',
      'gauge',
      { status: 'processing' }
    ));

    metrics.push(metric(
      'scamnemesis_media_by_status',
      readyMedia,
      undefined,
      'gauge',
      { status: 'ready' }
    ));

    // Duplicate cluster metrics
    const [pendingClusters, resolvedClusters] = await Promise.all([
      prisma.duplicateCluster.count({ where: { status: 'PENDING' } }),
      prisma.duplicateCluster.count({ where: { status: 'RESOLVED' } }),
    ]);

    metrics.push(metric(
      'scamnemesis_duplicate_clusters_pending',
      pendingClusters,
      'Number of pending duplicate clusters',
      'gauge'
    ));

    metrics.push(metric(
      'scamnemesis_duplicate_clusters_resolved',
      resolvedClusters,
      'Number of resolved duplicate clusters',
      'gauge'
    ));

    // Process metrics
    metrics.push(metric(
      'scamnemesis_process_uptime_seconds',
      process.uptime(),
      'Process uptime in seconds',
      'gauge'
    ));

    const memUsage = process.memoryUsage();
    metrics.push(metric(
      'scamnemesis_process_memory_heap_bytes',
      memUsage.heapUsed,
      'Process heap memory used in bytes',
      'gauge'
    ));

    metrics.push(metric(
      'scamnemesis_process_memory_rss_bytes',
      memUsage.rss,
      'Process RSS memory in bytes',
      'gauge'
    ));

  } catch (error) {
    console.error('Error collecting metrics:', error);
    // Return basic metrics even if DB is down
    metrics.push(metric(
      'scamnemesis_health',
      0,
      'Application health status (1=healthy, 0=unhealthy)',
      'gauge'
    ));
  }

  // Always add health metric
  metrics.push(metric(
    'scamnemesis_health',
    1,
    'Application health status (1=healthy, 0=unhealthy)',
    'gauge'
  ));

  const result = metrics.join('\n\n') + '\n';

  // Update cache
  metricsCache = { data: result, timestamp: now };

  return result;
}

export async function GET() {
  try {
    const metricsData = await getMetrics();

    return new NextResponse(metricsData, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating metrics:', error);

    // Return basic error metric
    const errorMetric = metric(
      'scamnemesis_health',
      0,
      'Application health status (1=healthy, 0=unhealthy)',
      'gauge'
    ) + '\n';

    return new NextResponse(errorMetric, {
      status: 200, // Prometheus expects 200 even for partial data
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      },
    });
  }
}
