import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';

const ApproveBodySchema = z.object({
  masking_overrides: z.record(z.any()).optional(),
  admin_notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { masking_overrides, admin_notes } = validatedBody.data;

    // Find the report
    const report = await prisma.report.findUnique({
      where: { id },
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
    const updatedReport = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

    return NextResponse.json({
      id: updatedReport.id,
      status: 'approved',
      published_at: updatedReport.publishedAt?.toISOString(),
    });
  } catch (error) {
    console.error('Error approving report:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to approve report' },
      { status: 500 }
    );
  }
}
