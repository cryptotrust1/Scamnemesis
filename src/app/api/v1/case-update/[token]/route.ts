/**
 * Case Tracking API Routes
 *
 * GET /api/v1/case-update/[token] - Get report status by tracking token
 * POST /api/v1/case-update/[token] - Add update/comment to report
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { requireRateLimit, getClientIp } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

// Validation schema for updates
const updateSchema = z.object({
  message: z.string().min(10).max(5000),
  additional_evidence_urls: z.array(z.string().url()).max(5).optional(),
});

/**
 * GET /api/v1/case-update/[token] - Get report status by tracking token
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    // Rate limiting
    const rateLimitError = await requireRateLimit(request, 60);
    if (rateLimitError) return rateLimitError;

    const { token } = await params;

    if (!token || token.length < 20) {
      return NextResponse.json(
        { error: 'invalid_token', message: 'Invalid tracking token' },
        { status: 400 }
      );
    }

    // Find report by tracking token
    const report = await prisma.report.findFirst({
      where: { trackingToken: token },
      include: {
        perpetrators: {
          select: {
            fullName: true,
            perpetratorType: true,
          },
        },
        comments: {
          where: {
            status: 'APPROVED', // Only show approved comments
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            status: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'not_found', message: 'Report not found or invalid token' },
        { status: 404 }
      );
    }

    // Format status for display
    const statusMap: Record<string, { label: string; color: string; description: string }> = {
      PENDING: {
        label: 'Prijaté',
        color: 'yellow',
        description: 'Vaše hlásenie bolo prijaté a čaká na kontrolu administrátorom.',
      },
      UNDER_REVIEW: {
        label: 'Kontroluje sa',
        color: 'blue',
        description: 'Náš tím momentálne kontroluje vaše hlásenie.',
      },
      APPROVED: {
        label: 'Schválené',
        color: 'green',
        description: 'Vaše hlásenie bolo schválené a zverejnené v databáze.',
      },
      REJECTED: {
        label: 'Zamietnuté',
        color: 'red',
        description: 'Vaše hlásenie bolo zamietnuté. Kontaktujte nás pre viac informácií.',
      },
      MERGED: {
        label: 'Zlúčené',
        color: 'blue',
        description: 'Vaše hlásenie bolo zlúčené s podobným hlásením.',
      },
      ARCHIVED: {
        label: 'Archivované',
        color: 'gray',
        description: 'Prípad bol archivovaný.',
      },
    };

    const status = report.status || 'PENDING';
    const statusInfo = statusMap[status] || statusMap.PENDING;

    // Mask perpetrator name for privacy (show only first letter + ***)
    const maskedPerpetratorName = report.perpetrators?.[0]?.fullName
      ? report.perpetrators[0].fullName.charAt(0) + '***'
      : null;

    return NextResponse.json({
      case_number: report.caseNumber,
      status: {
        code: status.toLowerCase(),
        label: statusInfo.label,
        color: statusInfo.color,
        description: statusInfo.description,
      },
      report: {
        fraud_type: (report.fraudType || 'OTHER').toLowerCase().replace(/_/g, ' '),
        summary: report.summary,
        incident_date: report.incidentDate?.toISOString().split('T')[0] || null,
        created_at: report.createdAt.toISOString(),
        financial_loss: report.financialLossAmount
          ? {
              amount: Number(report.financialLossAmount),
              currency: report.financialLossCurrency || 'EUR',
            }
          : null,
        perpetrator: maskedPerpetratorName
          ? {
              name: maskedPerpetratorName,
              type: report.perpetrators?.[0]?.perpetratorType || 'UNKNOWN',
            }
          : null,
      },
      updates: report.comments.map((c) => ({
        id: c.id,
        message: c.content,
        date: c.createdAt.toISOString(),
      })),
      can_add_update: ['PENDING', 'UNDER_REVIEW'].includes(status),
    });
  } catch (error) {
    console.error('[Case Update API] GET error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/case-update/[token] - Add update/comment to report
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    // Rate limiting (stricter for updates)
    const rateLimitError = await requireRateLimit(request, 10);
    if (rateLimitError) return rateLimitError;

    const { token } = await params;

    if (!token || token.length < 20) {
      return NextResponse.json(
        { error: 'invalid_token', message: 'Invalid tracking token' },
        { status: 400 }
      );
    }

    // Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'parse_error', message: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'Invalid request body',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Find report
    const report = await prisma.report.findFirst({
      where: { trackingToken: token },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'not_found', message: 'Report not found or invalid token' },
        { status: 404 }
      );
    }

    // Check if updates are allowed
    const allowedStatuses = ['PENDING', 'UNDER_REVIEW'];
    if (!allowedStatuses.includes(report.status || 'PENDING')) {
      return NextResponse.json(
        {
          error: 'not_allowed',
          message: 'Updates are not allowed for this report status',
        },
        { status: 403 }
      );
    }

    // Create comment (PENDING_MODERATION by default)
    const comment = await prisma.comment.create({
      data: {
        reportId: report.id,
        userId: report.reporterId,
        content: parsed.data.message,
        status: 'PENDING_MODERATION',
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: report.reporterId,
        action: 'report.update_by_reporter',
        entityType: 'comment',
        entityId: comment.id,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get('user-agent'),
        changes: {
          reportId: report.id,
          caseNumber: report.caseNumber,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Update added successfully. It will be visible after moderation.',
      update: {
        id: comment.id,
        date: comment.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('[Case Update API] POST error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
