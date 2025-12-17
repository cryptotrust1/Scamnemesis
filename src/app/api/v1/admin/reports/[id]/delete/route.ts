import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth, requireRateLimit } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

const DeleteBodySchema = z.object({
  reason: z.string().min(1).max(1000).optional(),
  hardDelete: z.boolean().default(false),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Rate limiting - 10 requests per minute for delete operations
  const rateLimitError = await requireRateLimit(request, 10);
  if (rateLimitError) return rateLimitError;

  // Require admin:edit scope (SUPER_ADMIN for hard delete)
  const auth = await requireAuth(request, ['admin:edit']);
  if (auth instanceof NextResponse) return auth;

  const { id } = params;

  try {
    // Parse request body (optional)
    let body: { reason?: string; hardDelete: boolean } = { reason: undefined, hardDelete: false };
    try {
      const rawBody = await request.json();
      const parsed = DeleteBodySchema.safeParse(rawBody);
      if (parsed.success) {
        body = { reason: parsed.data.reason, hardDelete: parsed.data.hardDelete };
      }
    } catch {
      // Empty body is OK
    }

    // Check if SUPER_ADMIN for hard delete
    const isSuperAdmin = auth.auth?.scopes?.includes('*');
    if (body.hardDelete && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'forbidden', message: 'Only SUPER_ADMIN can perform hard delete' },
        { status: 403 }
      );
    }

    // Find the report
    const report = await prisma.report.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        summary: true,
        publicId: true,
        caseNumber: true,
        adminNotes: true,
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'not_found', message: 'Report not found' },
        { status: 404 }
      );
    }

    // Perform delete operation within transaction
    await prisma.$transaction(async (tx) => {
      if (body.hardDelete) {
        // Hard delete: Remove all related data and the report
        // Delete in correct order due to foreign key constraints
        await tx.comment.deleteMany({ where: { reportId: id } });
        await tx.evidence.deleteMany({ where: { reportId: id } });
        await tx.perpetrator.deleteMany({ where: { reportId: id } });
        await tx.digitalFootprint.deleteMany({ where: { reportId: id } });
        await tx.financialInfo.deleteMany({ where: { reportId: id } });
        await tx.cryptoInfo.deleteMany({ where: { reportId: id } });
        await tx.companyInfo.deleteMany({ where: { reportId: id } });
        await tx.vehicleInfo.deleteMany({ where: { reportId: id } });
        await tx.duplicateClusterReport.deleteMany({ where: { reportId: id } });
        await tx.reportView.deleteMany({ where: { reportId: id } });
        await tx.report.delete({ where: { id } });
      } else {
        // Soft delete: Change status to ARCHIVED
        await tx.report.update({
          where: { id },
          data: {
            status: 'ARCHIVED',
            adminNotes: body.reason
              ? `Archived: ${body.reason}${report.adminNotes ? '\n\nPrevious notes: ' + report.adminNotes : ''}`
              : report.adminNotes,
          },
        });
      }

      // Create audit log entry
      await tx.auditLog.create({
        data: {
          action: body.hardDelete ? 'REPORT_DELETED' : 'REPORT_ARCHIVED',
          entityType: 'Report',
          entityId: id,
          userId: auth.userId,
          changes: {
            reportId: id,
            publicId: report.publicId,
            caseNumber: report.caseNumber,
            previousStatus: report.status,
            reason: body.reason || 'No reason provided',
            hardDelete: body.hardDelete,
          },
          ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: body.hardDelete
        ? 'Report permanently deleted'
        : 'Report archived successfully',
      id,
      action: body.hardDelete ? 'deleted' : 'archived',
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to delete report' },
      { status: 500 }
    );
  }
}

// Also support DELETE method for REST compliance
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return POST(request, { params });
}
