import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth, requireRateLimit } from '@/lib/middleware/auth';
import { emailService } from '@/lib/services/email';

export const dynamic = 'force-dynamic';

const RejectBodySchema = z.object({
  reason: z.string().min(1, 'Reason is required').max(1000),
  notify_reporter: z.boolean().default(true),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Rate limiting for admin operations
  const rateLimitError = await requireRateLimit(request, 30);
  if (rateLimitError) return rateLimitError;

  // Require admin:approve scope
  const auth = await requireAuth(request, ['admin:approve']);
  if (auth instanceof NextResponse) return auth;

  const { id } = params;

  try {
    // Parse request body
    const body = await request.json();

    const validatedBody = RejectBodySchema.safeParse(body);
    if (!validatedBody.success) {
      return NextResponse.json(
        { error: 'validation_error', message: validatedBody.error.message },
        { status: 400 }
      );
    }

    const { reason, notify_reporter } = validatedBody.data;

    // Find the report
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        reporter: true,
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'not_found', message: 'Report not found' },
        { status: 404 }
      );
    }

    if (report.status === 'REJECTED') {
      return NextResponse.json(
        { error: 'already_rejected', message: 'Report is already rejected' },
        { status: 400 }
      );
    }

    const now = new Date();

    // Update the report to rejected
    const updatedReport = await prisma.$transaction(async (tx) => {
      // Update the report
      const updated = await tx.report.update({
        where: { id },
        data: {
          status: 'REJECTED',
          moderatedAt: now,
          moderatedById: auth.userId,
          rejectionReason: reason,
          adminNotes: `Rejected: ${reason}`,
        },
      });

      // Create audit log entry
      await tx.auditLog.create({
        data: {
          action: 'REPORT_REJECTED',
          entityType: 'Report',
          entityId: id,
          userId: auth.userId,
          changes: {
            previous_status: report.status,
            new_status: 'REJECTED',
            reason,
            notify_reporter,
          },
          ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'),
        },
      });

      return updated;
    });

    // Send notification email to reporter (outside transaction)
    if (notify_reporter && report.reporter?.email) {
      try {
        const reporterName = report.reporter.name || 'Používateľ';
        const reportTitle = report.summary || `Report #${report.publicId}`;

        const result = await emailService.sendReportStatusUpdate(
          report.reporter.email,
          reporterName,
          reportTitle,
          'rejected',
          reason
        );

        if (!result.success) {
          console.error(`[Reject] Failed to send notification for report ${report.publicId}:`, result.error);
        }
      } catch (emailError) {
        console.error('[Reject] Email notification error:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      id: updatedReport.id,
      status: 'rejected',
      reason,
      rejected_at: updatedReport.moderatedAt?.toISOString(),
    });
  } catch (error) {
    console.error('Error rejecting report:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to reject report' },
      { status: 500 }
    );
  }
}
