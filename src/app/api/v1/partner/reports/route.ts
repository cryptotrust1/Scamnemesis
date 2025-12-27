/**
 * Partner API - Reports
 *
 * GET /api/v1/partner/reports - List approved fraud reports with ALL available data
 *
 * This endpoint is for external partners to access fraud data.
 * Sensitive data is masked (emails, phones, IBANs, wallet addresses, names are partially hidden).
 * Requires API key with 'reports:read' scope.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { requireAuth, requireRateLimit } from '@/lib/middleware/auth';
import { ReportStatus, FraudType, Severity, EvidenceType } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Query parameters schema
const QuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  fraud_type: z.nativeEnum(FraudType).optional(),
  severity: z.nativeEnum(Severity).optional(),
  country: z.string().length(2).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  min_loss: z.coerce.number().min(0).optional(),
  max_loss: z.coerce.number().min(0).optional(),
  include_evidence: z.coerce.boolean().default(false),
});

/**
 * Mask sensitive data for partner access
 */
function maskData(
  value: string | null | undefined,
  type: 'email' | 'phone' | 'iban' | 'name' | 'wallet' | 'account' | 'vat'
): string | null {
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
    case 'wallet': {
      if (value.length < 10) return '***';
      return value.slice(0, 6) + '...' + value.slice(-4);
    }
    case 'account': {
      if (value.length < 6) return '***';
      return value.slice(0, 2) + '***' + value.slice(-2);
    }
    case 'vat': {
      if (value.length < 6) return '***';
      return value.slice(0, 2) + '***' + value.slice(-3);
    }
    default:
      return value;
  }
}

// Type for evidence with all needed fields
interface EvidenceData {
  id: string;
  type: EvidenceType;
  url: string | null;
  externalUrl: string | null;
  description: string | null;
  mimeType: string | null;
  fileSize: number | null;
  thumbnailUrl: string | null;
  createdAt: Date;
}

/**
 * GET /api/v1/partner/reports
 * List approved fraud reports for partners with ALL available data
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
      severity: searchParams.get('severity'),
      country: searchParams.get('country'),
      date_from: searchParams.get('date_from'),
      date_to: searchParams.get('date_to'),
      min_loss: searchParams.get('min_loss'),
      max_loss: searchParams.get('max_loss'),
      include_evidence: searchParams.get('include_evidence'),
    });

    if (!query.success) {
      return NextResponse.json(
        { error: 'validation_error', message: query.error.message },
        { status: 400 }
      );
    }

    const { limit, offset, fraud_type, severity, country, date_from, date_to, min_loss, max_loss, include_evidence } = query.data;

    // Build where clause - only approved reports
    const where: Record<string, unknown> = {
      status: ReportStatus.APPROVED,
    };

    if (fraud_type) where.fraudType = fraud_type;
    if (severity) where.severity = severity;
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
          // ALL perpetrators (not just one)
          perpetrators: {
            select: {
              id: true,
              perpetratorType: true,
              fullName: true,
              nickname: true,
              username: true,
              approxAge: true,
              nationality: true,
              physicalDescription: true,
              phone: true,
              email: true,
              addressStreet: true,
              addressCity: true,
              addressPostalCode: true,
              addressCountry: true,
            },
          },
          // Full digital footprint
          digitalFootprint: {
            select: {
              telegram: true,
              whatsapp: true,
              signal: true,
              instagram: true,
              facebook: true,
              tiktok: true,
              twitter: true,
              websiteUrl: true,
              domainName: true,
              domainCreationDate: true,
              ipAddress: true,
              ipCountry: true,
              isp: true,
              ipAbuseScore: true,
            },
          },
          // Full financial info
          financialInfo: {
            select: {
              iban: true,
              accountHolder: true,
              accountNumber: true,
              bankName: true,
              bankCountry: true,
              swiftBic: true,
              routingNumber: true,
              bsb: true,
              sortCode: true,
              ifsc: true,
              cnaps: true,
              otherBankingDetails: true,
            },
          },
          // Crypto info
          cryptoInfo: {
            select: {
              walletAddress: true,
              blockchain: true,
              exchangeWalletName: true,
              transactionHash: true,
              paypalAccount: true,
            },
          },
          // Company info
          companyInfo: {
            select: {
              name: true,
              vatTaxId: true,
              addressStreet: true,
              addressCity: true,
              addressPostal: true,
              addressCountry: true,
            },
          },
          // Vehicle info
          vehicleInfo: {
            select: {
              make: true,
              model: true,
              color: true,
              licensePlate: true,
              vin: true,
              registeredOwner: true,
            },
          },
          // Evidence (optional)
          ...(include_evidence && {
            evidence: {
              select: {
                id: true,
                type: true,
                url: true,
                externalUrl: true,
                description: true,
                mimeType: true,
                fileSize: true,
                thumbnailUrl: true,
                createdAt: true,
              },
            },
          }),
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.report.count({ where }),
    ]);

    // Transform and mask sensitive data
    const transformedReports = reports.map(report => {
      // Transform perpetrators with masked data
      const perpetrators = report.perpetrators.map(perp => ({
        id: perp.id,
        type: perp.perpetratorType,
        name: maskData(perp.fullName, 'name'),
        nickname: perp.nickname,
        username: perp.username,
        approx_age: perp.approxAge,
        nationality: perp.nationality,
        physical_description: perp.physicalDescription,
        phone: maskData(perp.phone, 'phone'),
        email: maskData(perp.email, 'email'),
        address: perp.addressCity || perp.addressCountry ? {
          street: perp.addressStreet ? maskData(perp.addressStreet, 'name') : null,
          city: perp.addressCity,
          postal_code: perp.addressPostalCode,
          country: perp.addressCountry,
        } : null,
      }));

      // Transform digital footprint
      const digitalFootprint = report.digitalFootprint ? {
        social_media: {
          telegram: report.digitalFootprint.telegram,
          whatsapp: report.digitalFootprint.whatsapp,
          signal: report.digitalFootprint.signal,
          instagram: report.digitalFootprint.instagram,
          facebook: report.digitalFootprint.facebook,
          tiktok: report.digitalFootprint.tiktok,
          twitter: report.digitalFootprint.twitter,
        },
        website: {
          url: report.digitalFootprint.websiteUrl,
          domain: report.digitalFootprint.domainName,
          domain_created: report.digitalFootprint.domainCreationDate?.toISOString() || null,
        },
        technical: {
          ip_address: report.digitalFootprint.ipAddress,
          ip_country: report.digitalFootprint.ipCountry,
          isp: report.digitalFootprint.isp,
          ip_abuse_score: report.digitalFootprint.ipAbuseScore,
        },
      } : null;

      // Transform financial info with masking
      const financialInfo = report.financialInfo ? {
        iban: maskData(report.financialInfo.iban, 'iban'),
        account_holder: maskData(report.financialInfo.accountHolder, 'name'),
        account_number: maskData(report.financialInfo.accountNumber, 'account'),
        bank_name: report.financialInfo.bankName,
        bank_country: report.financialInfo.bankCountry,
        swift_bic: report.financialInfo.swiftBic,
        routing_number: report.financialInfo.routingNumber,
        bsb: report.financialInfo.bsb,
        sort_code: report.financialInfo.sortCode,
        ifsc: report.financialInfo.ifsc,
        cnaps: report.financialInfo.cnaps,
        other_details: report.financialInfo.otherBankingDetails,
      } : null;

      // Transform crypto info with masking
      const cryptoInfo = report.cryptoInfo ? {
        wallet_address: maskData(report.cryptoInfo.walletAddress, 'wallet'),
        blockchain: report.cryptoInfo.blockchain,
        exchange_wallet_name: report.cryptoInfo.exchangeWalletName,
        transaction_hash: report.cryptoInfo.transactionHash,
        paypal_account: maskData(report.cryptoInfo.paypalAccount, 'email'),
      } : null;

      // Transform company info with masking
      const companyInfo = report.companyInfo ? {
        name: report.companyInfo.name,
        vat_tax_id: maskData(report.companyInfo.vatTaxId, 'vat'),
        address: {
          street: report.companyInfo.addressStreet,
          city: report.companyInfo.addressCity,
          postal: report.companyInfo.addressPostal,
          country: report.companyInfo.addressCountry,
        },
      } : null;

      // Transform vehicle info
      const vehicleInfo = report.vehicleInfo ? {
        make: report.vehicleInfo.make,
        model: report.vehicleInfo.model,
        color: report.vehicleInfo.color,
        license_plate: report.vehicleInfo.licensePlate,
        vin: report.vehicleInfo.vin ? maskData(report.vehicleInfo.vin, 'account') : null,
        registered_owner: maskData(report.vehicleInfo.registeredOwner, 'name'),
      } : null;

      // Transform evidence if included
      const reportWithEvidence = report as typeof report & { evidence?: EvidenceData[] };
      const evidence = include_evidence && reportWithEvidence.evidence
        ? reportWithEvidence.evidence.map(e => ({
            id: e.id,
            type: e.type,
            url: e.url || e.externalUrl,
            description: e.description,
            mime_type: e.mimeType,
            file_size: e.fileSize,
            thumbnail_url: e.thumbnailUrl,
            created_at: e.createdAt.toISOString(),
          }))
        : undefined;

      return {
        // Report identifiers
        id: report.publicId,
        case_number: report.caseNumber,

        // Classification
        fraud_type: report.fraudType,
        severity: report.severity,
        status: report.status,

        // Dates
        incident_date: report.incidentDate?.toISOString() || null,
        transaction_date: report.transactionDate?.toISOString() || null,
        created_at: report.createdAt.toISOString(),
        updated_at: report.updatedAt.toISOString(),
        published_at: report.publishedAt?.toISOString() || null,

        // Content
        summary: report.summary,
        description: report.description,

        // Financial loss
        financial_loss: {
          amount: report.financialLossAmount ? Number(report.financialLossAmount) : null,
          currency: report.financialLossCurrency,
        },

        // Location
        location: {
          street: report.locationStreet,
          city: report.locationCity,
          postal_code: report.locationPostalCode,
          country: report.locationCountry,
        },

        // Metrics
        view_count: report.viewCount,
        merge_count: report.mergeCount,

        // Related data
        perpetrators,
        digital_footprint: digitalFootprint,
        financial_info: financialInfo,
        crypto_info: cryptoInfo,
        company_info: companyInfo,
        vehicle_info: vehicleInfo,

        // Evidence (if requested)
        ...(evidence && { evidence }),

        // Metadata
        metadata: report.metadata,
      };
    });

    // Update API key last used (fire and forget)
    if (authResult.auth.apiKey) {
      prisma.apiKey.update({
        where: { id: authResult.auth.apiKey.id },
        data: {
          lastUsedAt: new Date(),
          requestCount: { increment: 1 },
        },
      }).catch(() => { /* ignore */ });
    }

    return NextResponse.json({
      data: transformedReports,
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + reports.length < total,
      },
      meta: {
        data_masked: true,
        masked_fields: [
          'perpetrators.name',
          'perpetrators.email',
          'perpetrators.phone',
          'perpetrators.address.street',
          'financial_info.iban',
          'financial_info.account_holder',
          'financial_info.account_number',
          'crypto_info.wallet_address',
          'crypto_info.paypal_account',
          'company_info.vat_tax_id',
          'vehicle_info.vin',
          'vehicle_info.registered_owner',
        ],
        note: 'Sensitive data is partially masked for privacy. Contact us for full data access agreements.',
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
