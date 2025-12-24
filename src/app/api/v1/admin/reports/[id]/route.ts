import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth, requireRateLimit } from '@/lib/middleware/auth';
import { handleApiError } from '@/lib/api/error-handler';

export const dynamic = 'force-dynamic';

const FraudTypeEnum = z.enum([
  'romance_scam', 'investment_fraud', 'phishing', 'identity_theft',
  'online_shopping_fraud', 'tech_support_scam', 'lottery_prize_scam',
  'employment_scam', 'rental_scam', 'cryptocurrency_scam',
  'pyramid_mlm_scheme', 'insurance_fraud', 'credit_card_fraud',
  'wire_fraud', 'money_mule', 'advance_fee_fraud',
  'business_email_compromise', 'social_engineering', 'fake_charity',
  'government_impersonation', 'utility_scam', 'grandparent_scam',
  'sextortion', 'ransomware', 'account_takeover', 'sim_swapping',
  'catfishing', 'ponzi_scheme', 'other'
]);

const ReportUpdateSchema = z.object({
  fraud_type: FraudTypeEnum.optional(),
  summary: z.string().max(500).optional(),
  description: z.string().max(10000).optional(),
  financial_loss: z.object({
    amount: z.number().positive().optional(),
    currency: z.string().length(3).optional(),
  }).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW']).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  admin_notes: z.string().optional(),
  masking_overrides: z.record(z.any()).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Rate limiting - 30 requests per minute for admin write operations
  const rateLimitError = await requireRateLimit(request, 30);
  if (rateLimitError) return rateLimitError;

  // Require admin:edit scope
  const auth = await requireAuth(request, ['admin:edit']);
  if (auth instanceof NextResponse) return auth;

  const { id } = params;

  try {
    // Parse request body
    const body = await request.json();

    const validatedBody = ReportUpdateSchema.safeParse(body);
    if (!validatedBody.success) {
      return NextResponse.json(
        { error: 'validation_error', message: validatedBody.error.message },
        { status: 400 }
      );
    }

    const updates = validatedBody.data;

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

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (updates.fraud_type) {
      updateData.fraudType = updates.fraud_type.toUpperCase().replace(/_/g, '_');
    }
    if (updates.summary) updateData.summary = updates.summary;
    if (updates.description) updateData.description = updates.description;
    if (updates.financial_loss) {
      if (updates.financial_loss.amount !== undefined) {
        updateData.financialLossAmount = updates.financial_loss.amount;
      }
      if (updates.financial_loss.currency) {
        updateData.financialLossCurrency = updates.financial_loss.currency;
      }
    }
    if (updates.status) updateData.status = updates.status;
    if (updates.severity) updateData.severity = updates.severity;
    if (updates.admin_notes !== undefined) updateData.adminNotes = updates.admin_notes;
    if (updates.masking_overrides !== undefined) updateData.maskingOverrides = updates.masking_overrides;

    // Perform the update
    const updatedReport = await prisma.$transaction(async (tx) => {
      // Update the report
      const updated = await tx.report.update({
        where: { id },
        data: updateData,
        include: {
          perpetrators: true,
        },
      });

      // Create audit log entry
      await tx.auditLog.create({
        data: {
          action: 'REPORT_UPDATED',
          entityType: 'Report',
          entityId: id,
          userId: auth.userId,
          changes: {
            before: {
              fraudType: report.fraudType,
              summary: report.summary,
              description: report.description,
              status: report.status,
              severity: report.severity,
            },
            after: updates,
          },
          ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'),
        },
      });

      return updated;
    });

    return NextResponse.json({
      id: updatedReport.id,
      status: updatedReport.status.toLowerCase(),
      fraud_type: updatedReport.fraudType?.toLowerCase(),
      summary: updatedReport.summary,
      severity: updatedReport.severity?.toLowerCase(),
      updated_at: updatedReport.updatedAt.toISOString(),
    });
  } catch (error) {
    return handleApiError(error, request, { route: 'PATCH /api/v1/admin/reports/[id]' });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Rate limiting - 60 requests per minute for admin endpoints
  const rateLimitError = await requireRateLimit(request, 60);
  if (rateLimitError) return rateLimitError;

  // Require admin:read scope
  const auth = await requireAuth(request, ['admin:read']);
  if (auth instanceof NextResponse) return auth;

  const { id } = params;

  try {
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        perpetrators: true,
        evidence: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
        reporter: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
        moderatedBy: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'not_found', message: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: report.id,
      status: report.status.toLowerCase(),
      fraud_type: report.fraudType?.toLowerCase(),
      summary: report.summary,
      description: report.description,
      severity: report.severity?.toLowerCase(),
      financial_loss: report.financialLossAmount ? {
        amount: Number(report.financialLossAmount),
        currency: report.financialLossCurrency,
      } : null,
      incident_date: report.incidentDate?.toISOString(),
      location: report.location,
      perpetrators: report.perpetrators.map(p => ({
        id: p.id,
        full_name: p.fullName,
        nickname: p.nickname,
        email: p.email,
        phone: p.phone,
      })),
      evidence: report.evidence.map(e => ({
        id: e.id,
        type: e.type.toLowerCase(),
        url: e.url,
        hash: e.hash,
      })),
      comments: report.comments.map(c => ({
        id: c.id,
        content: c.content,
        status: c.status.toLowerCase(),
        user: c.user ? {
          id: c.user.id,
          display_name: c.user.displayName,
        } : null,
        created_at: c.createdAt.toISOString(),
      })),
      reporter: report.reporter ? {
        id: report.reporter.id,
        email: report.reporter.email,
        display_name: report.reporter.displayName,
      } : null,
      moderated_by: report.moderatedBy ? {
        id: report.moderatedBy.id,
        display_name: report.moderatedBy.displayName,
      } : null,
      admin_notes: report.adminNotes,
      rejection_reason: report.rejectionReason,
      created_at: report.createdAt.toISOString(),
      updated_at: report.updatedAt.toISOString(),
      published_at: report.publishedAt?.toISOString(),
      moderated_at: report.moderatedAt?.toISOString(),
    });
  } catch (error) {
    return handleApiError(error, request, { route: 'GET /api/v1/admin/reports/[id]' });
  }
}
