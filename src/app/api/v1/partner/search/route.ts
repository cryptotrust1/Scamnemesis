/**
 * Partner API - Search
 *
 * GET /api/v1/partner/search - Search fraud reports
 *
 * This endpoint allows partners to search for specific fraud cases.
 * All data is masked for privacy.
 * Requires API key with 'search:read' scope.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { requireAuth, requireRateLimit } from '@/lib/middleware/auth';
import { ReportStatus, FraudType } from '@prisma/client';

export const dynamic = 'force-dynamic';

const SearchSchema = z.object({
  q: z.string().min(3).max(200),
  field: z.enum(['email', 'phone', 'iban', 'website', 'name', 'all']).default('all'),
  fraud_type: z.nativeEnum(FraudType).optional(),
  country: z.string().length(2).optional(),
  limit: z.coerce.number().min(1).max(50).default(10),
  offset: z.coerce.number().min(0).default(0),
});

/**
 * Mask sensitive data
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
 * GET /api/v1/partner/search
 * Search fraud reports
 */
export async function GET(request: NextRequest) {
  // Check rate limit (stricter for search)
  const rateLimitResult = await requireRateLimit(request, 50);
  if (rateLimitResult) return rateLimitResult;

  // Require API key with search:read scope
  const authResult = await requireAuth(request, ['search:read']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const query = SearchSchema.safeParse({
      q: searchParams.get('q'),
      field: searchParams.get('field'),
      fraud_type: searchParams.get('fraud_type'),
      country: searchParams.get('country'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });

    if (!query.success) {
      return NextResponse.json(
        { error: 'validation_error', message: query.error.message },
        { status: 400 }
      );
    }

    const { q, field, fraud_type, country, limit, offset } = query.data;

    // Build search conditions using perpetrators relation
    const searchTerm = q.toLowerCase().trim();
    const normalizedPhone = searchTerm.replace(/\D/g, '');
    const normalizedIban = searchTerm.replace(/\s/g, '').toUpperCase();

    // Build perpetrator search conditions
    const perpetratorConditions: Record<string, unknown>[] = [];

    if (field === 'all' || field === 'email') {
      perpetratorConditions.push({ emailNormalized: { contains: searchTerm } });
    }
    if (field === 'all' || field === 'phone') {
      perpetratorConditions.push({ phoneNormalized: { contains: normalizedPhone } });
    }
    if (field === 'all' || field === 'name') {
      perpetratorConditions.push({ fullNameNormalized: { contains: searchTerm } });
    }

    // Build financial/digital search conditions
    const otherConditions: Record<string, unknown>[] = [];

    if (field === 'all' || field === 'iban') {
      otherConditions.push({
        financialInfo: {
          ibanNormalized: { contains: normalizedIban },
        },
      });
    }
    if (field === 'all' || field === 'website') {
      otherConditions.push({
        digitalFootprint: {
          websiteUrl: { contains: searchTerm, mode: 'insensitive' },
        },
      });
    }

    // Base where clause - only approved reports
    const where: Record<string, unknown> = {
      status: ReportStatus.APPROVED,
      OR: [
        // Search in perpetrators
        ...(perpetratorConditions.length > 0 ? [{
          perpetrators: {
            some: {
              OR: perpetratorConditions,
            },
          },
        }] : []),
        // Search in other relations
        ...otherConditions,
      ],
    };

    if (fraud_type) where.fraudType = fraud_type;
    if (country) where.locationCountry = country;

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
            take: 1,
          },
          digitalFootprint: {
            select: {
              websiteUrl: true,
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
    const results = reports.map(report => {
      const perpetrator = report.perpetrators[0];

      return {
        id: report.publicId,
        fraud_type: report.fraudType,
        status: report.status,
        country: report.locationCountry,
        financial_loss: report.financialLossAmount ? Number(report.financialLossAmount) : null,
        perpetrator: {
          name: maskData(perpetrator?.fullName, 'name'),
          email: maskData(perpetrator?.email, 'email'),
          phone: maskData(perpetrator?.phone, 'phone'),
          iban: maskData(report.financialInfo?.iban, 'iban'),
          website: report.digitalFootprint?.websiteUrl || null,
        },
        created_at: report.createdAt.toISOString(),
        match_score: 1.0, // Could be enhanced with actual relevance scoring
      };
    });

    // Update API key last used
    if (authResult.auth.apiKey) {
      prisma.apiKey.update({
        where: { id: authResult.auth.apiKey.id },
        data: { lastUsedAt: new Date() },
      }).catch(() => { /* ignore */ });
    }

    return NextResponse.json({
      query: {
        term: q,
        field,
        fraud_type,
        country,
      },
      results,
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + reports.length < total,
      },
      meta: {
        data_masked: true,
        note: 'Search results contain masked data for privacy.',
      },
    });
  } catch (error) {
    console.error('Error in partner search:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Search failed' },
      { status: 500 }
    );
  }
}
