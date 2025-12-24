import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth, requireRateLimit } from '@/lib/middleware/auth';
import { emailService } from '@/lib/services/email';
import { handleApiError } from '@/lib/api/error-handler';

export const dynamic = 'force-dynamic';

const ApproveBodySchema = z.object({
  masking_overrides: z.record(z.boolean()).optional(),
  admin_notes: z.string().max(2000).optional(),
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
    let body = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is OK
    }

    const validatedBody = ApproveBodySchema.safeParse(body);
    if (!validatedBody.success) {
      return NextResponse.json(
        { error: 'validation_error', message: validatedBody.error.message },
        { status: 400 }
      );
    }

    const { masking_overrides, admin_notes, notify_reporter } = validatedBody.data;

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

    if (report.status === 'APPROVED') {
      return NextResponse.json(
        { error: 'already_approved', message: 'Report is already approved' },
        { status: 400 }
      );
    }

    const now = new Date();

    // Update the report to approved
    const updatedReport = await prisma.$transaction(async (tx) => {
      // Update the report
      const updated = await tx.report.update({
        where: { id },
        data: {
          status: 'APPROVED',
          publishedAt: now,
          moderatedAt: now,
          moderatedById: auth.userId,
          maskingOverrides: masking_overrides ?? undefined,
          adminNotes: admin_notes ?? undefined,
        },
      });

      // Create audit log entry
      await tx.auditLog.create({
        data: {
          action: 'REPORT_APPROVED',
          entityType: 'Report',
          entityId: id,
          userId: auth.userId,
          changes: {
            previous_status: report.status,
            new_status: 'APPROVED',
            masking_overrides,
            admin_notes,
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
          'approved'
        );

        if (!result.success) {
          console.error(`[Approve] Failed to send notification for report ${report.publicId}:`, result.error);
        }
      } catch (emailError) {
        console.error('[Approve] Email notification error:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      id: updatedReport.id,
      status: 'approved',
      published_at: updatedReport.publishedAt?.toISOString(),
    });
  } catch (error) {
    return handleApiError(error, request, { route: 'POST /api/v1/admin/reports/[id]/approve' });
  }
}
