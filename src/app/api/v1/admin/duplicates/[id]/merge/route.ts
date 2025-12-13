import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';

const MergeBodySchema = z.object({
  primary_report_id: z.string().uuid('Invalid primary report ID'),
  merge_report_ids: z.array(z.string().uuid('Invalid report ID')).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Require admin:edit scope
  const auth = await requireAuth(request, ['admin:edit']);
  if (auth instanceof NextResponse) return auth;

  const { id } = params;

  try {
    // Parse request body
    const body = await request.json();

    const validatedBody = MergeBodySchema.safeParse(body);
    if (!validatedBody.success) {
      return NextResponse.json(
        { error: 'validation_error', message: validatedBody.error.message },
        { status: 400 }
      );
    }

    const { primary_report_id, merge_report_ids } = validatedBody.data;

    // Find the duplicate cluster
    const cluster = await prisma.duplicateCluster.findUnique({
      where: { id },
      include: {
        reports: true,
      },
    });

    if (!cluster) {
      return NextResponse.json(
        { error: 'not_found', message: 'Duplicate cluster not found' },
        { status: 404 }
      );
    }

    if (cluster.status === 'RESOLVED') {
      return NextResponse.json(
        { error: 'already_resolved', message: 'Cluster is already resolved' },
        { status: 400 }
      );
    }

    // Verify primary report is in the cluster
    const clusterReportIds = cluster.reports.map((r) => r.reportId);
    if (!clusterReportIds.includes(primary_report_id)) {
      return NextResponse.json(
        { error: 'invalid_primary', message: 'Primary report is not in this cluster' },
        { status: 400 }
      );
    }

    // Determine which reports to merge
    const reportsToMerge = merge_report_ids
      ? merge_report_ids.filter((reportId) => clusterReportIds.includes(reportId) && reportId !== primary_report_id)
      : clusterReportIds.filter((reportId) => reportId !== primary_report_id);

    const now = new Date();

    // Perform the merge
    const result = await prisma.$transaction(async (tx) => {
      // Get primary report with all details
      const primaryReport = await tx.report.findUnique({
        where: { id: primary_report_id },
        include: {
          perpetrators: true,
          evidence: true,
        },
      });

      if (!primaryReport) {
        throw new Error('Primary report not found');
      }

      // Mark merged reports as duplicates and link to primary
      for (const reportId of reportsToMerge) {
        const mergedReport = await tx.report.findUnique({
          where: { id: reportId },
          include: {
            perpetrators: true,
            evidence: true,
          },
        });

        if (!mergedReport) continue;

        // Update merged report status
        await tx.report.update({
          where: { id: reportId },
          data: {
            status: 'MERGED',
            mergedIntoId: primary_report_id,
          },
        });

        // Optionally migrate perpetrators that don't exist in primary
        for (const perpetrator of mergedReport.perpetrators) {
          // Check if similar perpetrator exists
          const existingPerp = primaryReport.perpetrators.find((p) =>
            (p.email && p.email === perpetrator.email) ||
            (p.phone && p.phone === perpetrator.phone) ||
            (p.fullName && p.fullName === perpetrator.fullName)
          );

          if (!existingPerp) {
            // Link perpetrator to primary report as well
            await tx.perpetrator.update({
              where: { id: perpetrator.id },
              data: {
                reports: {
                  connect: { id: primary_report_id },
                },
              },
            });
          }
        }

        // Migrate evidence to primary report
        for (const evidence of mergedReport.evidence) {
          await tx.evidence.update({
            where: { id: evidence.id },
            data: {
              reportId: primary_report_id,
            },
          });
        }
      }

      // Update primary report to indicate it has merged reports
      await tx.report.update({
        where: { id: primary_report_id },
        data: {
          mergeCount: { increment: reportsToMerge.length },
        },
      });

      // Resolve the cluster
      await tx.duplicateCluster.update({
        where: { id },
        data: {
          status: 'RESOLVED',
          resolvedAt: now,
          resolvedById: auth.userId,
          primaryReportId: primary_report_id,
        },
      });

      // Create audit log entry
      await tx.auditLog.create({
        data: {
          action: 'CLUSTER_MERGED',
          entityType: 'DuplicateCluster',
          entityId: id,
          userId: auth.userId,
          changes: {
            primary_report_id,
            merged_report_ids: reportsToMerge,
            reports_merged_count: reportsToMerge.length,
          },
          ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'),
        },
      });

      return {
        cluster_id: id,
        primary_report_id,
        merged_reports: reportsToMerge,
      };
    });

    return NextResponse.json({
      id: result.cluster_id,
      status: 'resolved',
      primary_report_id: result.primary_report_id,
      merged_report_ids: result.merged_reports,
      merged_count: result.merged_reports.length,
      resolved_at: now.toISOString(),
    });
  } catch (error) {
    console.error('Error merging duplicate cluster:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to merge duplicate cluster' },
      { status: 500 }
    );
  }
}
