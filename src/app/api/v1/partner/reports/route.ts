/**
 * Partner API - Reports
 *
 * GET /api/v1/partner/reports - List approved fraud reports
 *
 * This endpoint is for external partners to access fraud data.
 * All data is masked (emails, phones, IBANs are partially hidden).
 * Requires API key with 'reports:read' scope.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { requireAuth, requireRateLimit } from '@/lib/middleware/auth';
import { ReportStatus, FraudType } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Query parameters schema
const QuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  fraud_type: z.nativeEnum(FraudType).optional(),
  country: z.string().length(2).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  min_loss: z.coerce.number().min(0).optional(),
  max_loss: z.coerce.number().min(0).optional(),
});

/**
 * Mask sensitive data for partner access
 */
function maskData(value: string | null | undefined, type: 'email' | 'phone' | 'iban' | 'name'): string | null {
  if (!value) return null;

  switch (type) {
    case 'email': {
      const [local, domain] = value.split('@');
      if (!domain) return value;
      const maskedLocal = local.length > 2
        ? local[0] + '***' + local[local.length - 1]
        : '***';
      return `${maskedLocal}@${domain}`;
    }
    case 'phone': {
      if (value.length < 6) return '***';
      return value.slice(0, 4) + '***' + value.slice(-3);
    }
    case 'iban': {
      if (value.length < 8) return '***';
      return value.slice(0, 4) + '***' + value.slice(-4);
    }
    case 'name': {
      const parts = value.split(' ');
      return parts.map(p => p[0] + '***').join(' ');
    }
    default:
      return value;
  }
}

/**
 * GET /api/v1/partner/reports
 * List approved fraud reports for partners
 */
export async function GET(request: NextRequest) {
  // Check rate limit first
  const rateLimitResult = await requireRateLimit(request, 100);
  if (rateLimitResult) return rateLimitResult;

  // Require API key with reports:read scope
  const authResult = await requireAuth(request, ['reports:read']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const query = QuerySchema.safeParse({
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
      fraud_type: searchParams.get('fraud_type'),
      country: searchParams.get('country'),
      date_from: searchParams.get('date_from'),
      date_to: searchParams.get('date_to'),
      min_loss: searchParams.get('min_loss'),
      max_loss: searchParams.get('max_loss'),
    });

    if (!query.success) {
      return NextResponse.json(
        { error: 'validation_error', message: query.error.message },
        { status: 400 }
      );
    }

    const { limit, offset, fraud_type, country, date_from, date_to, min_loss, max_loss } = query.data;

    // Build where clause - only approved reports
    const where: Record<string, unknown> = {
      status: ReportStatus.APPROVED,
    };

    if (fraud_type) where.fraudType = fraud_type;
    if (country) where.locationCountry = country;
    if (date_from || date_to) {
      where.createdAt = {};
      if (date_from) (where.createdAt as Record<string, unknown>).gte = new Date(date_from);
      if (date_to) (where.createdAt as Record<string, unknown>).lte = new Date(date_to);
    }
    if (min_loss !== undefined || max_loss !== undefined) {
      where.financialLossAmount = {};
      if (min_loss !== undefined) (where.financialLossAmount as Record<string, unknown>).gte = min_loss;
      if (max_loss !== undefined) (where.financialLossAmount as Record<string, unknown>).lte = max_loss;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          perpetrators: {
            select: {
              fullName: true,
              email: true,
              phone: true,
            },
            take: 1, // Just the primary perpetrator
          },
          digitalFootprint: {
            select: {
              websiteUrl: true,
              telegram: true,
              whatsapp: true,
              instagram: true,
              facebook: true,
            },
          },
          financialInfo: {
            select: {
              iban: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.report.count({ where }),
    ]);

    // Mask sensitive data
    const maskedReports = reports.map(report => {
      const perpetrator = report.perpetrators[0];
      const socialMedia: Record<string, string> = {};

      if (report.digitalFootprint?.telegram) socialMedia.telegram = report.digitalFootprint.telegram;
      if (report.digitalFootprint?.whatsapp) socialMedia.whatsapp = report.digitalFootprint.whatsapp;
      if (report.digitalFootprint?.instagram) socialMedia.instagram = report.digitalFootprint.instagram;
      if (report.digitalFootprint?.facebook) socialMedia.facebook = report.digitalFootprint.facebook;

      return {
        id: report.publicId,
        fraud_type: report.fraudType,
        status: report.status,
        country: report.locationCountry,
        currency: report.financialLossCurrency,
        financial_loss: report.financialLossAmount ? Number(report.financialLossAmount) : null,
        summary: report.summary,
        description: report.description?.slice(0, 500), // Truncate long descriptions
        perpetrator: {
          name: maskData(perpetrator?.fullName, 'name'),
          email: maskData(perpetrator?.email, 'email'),
          phone: maskData(perpetrator?.phone, 'phone'),
          iban: maskData(report.financialInfo?.iban, 'iban'),
          website: report.digitalFootprint?.websiteUrl || null,
          social_media: Object.keys(socialMedia).length > 0 ? socialMedia : null,
        },
        created_at: report.createdAt.toISOString(),
        updated_at: report.updatedAt.toISOString(),
      };
    });

    // Update API key last used (fire and forget)
    if (authResult.auth.apiKey) {
      prisma.apiKey.update({
        where: { id: authResult.auth.apiKey.id },
        data: { lastUsedAt: new Date() },
      }).catch(() => { /* ignore */ });
    }

    return NextResponse.json({
      data: maskedReports,
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + reports.length < total,
      },
      meta: {
        data_masked: true,
        note: 'Sensitive data (emails, phones, IBANs, names) are partially masked for privacy.',
      },
    }, {
      headers: {
        'X-Total-Count': total.toString(),
        'X-Data-Masked': 'true',
      },
    });
  } catch (error) {
    console.error('Error listing partner reports:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to list reports' },
      { status: 500 }
    );
  }
}
