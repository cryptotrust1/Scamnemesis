/**
 * Reports API Routes
 *
 * POST /api/v1/reports - Create a new report
 * GET /api/v1/reports - List reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { requireAuth, requireRateLimit, getClientIp } from '@/lib/middleware/auth';
import { FraudType, EvidenceType, Blockchain } from '@prisma/client';
import { runDuplicateDetection } from '@/lib/duplicate-detection/detector';

export const dynamic = 'force-dynamic';

// Validation schemas
const locationSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().max(2).optional(),
}).optional();

const incidentSchema = z.object({
  fraud_type: z.nativeEnum(FraudType),
  date: z.string().datetime().optional(),
  transaction_date: z.string().datetime().optional(),
  summary: z.string().max(500),
  description: z.string().max(10000).optional(),
  financial_loss: z.object({
    amount: z.number().positive().optional(),
    currency: z.string().default('EUR'),
  }).optional(),
  location: locationSchema,
});

const perpetratorSchema = z.object({
  full_name: z.string().max(255).optional(),
  nickname: z.string().max(100).optional(),
  username: z.string().max(100).optional(),
  approx_age: z.number().int().min(0).max(150).optional(),
  nationality: z.string().max(2).optional(),
  physical_description: z.string().max(2000).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().optional(),
  address: locationSchema,
}).optional();

const digitalFootprintsSchema = z.object({
  telegram: z.string().optional(),
  whatsapp: z.string().optional(),
  signal: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  tiktok: z.string().optional(),
  twitter: z.string().optional(),
  website_url: z.string().url().optional(),
  domain_name: z.string().optional(),
  domain_creation_date: z.string().datetime().optional(),
  ip_address: z.string().ip().optional(),
  ip_country: z.string().max(2).optional(),
  isp: z.string().optional(),
  ip_abuse_score: z.number().int().min(0).max(100).optional(),
}).optional();

const financialSchema = z.object({
  iban: z.string().optional(),
  account_holder: z.string().optional(),
  account_number: z.string().optional(),
  bank_name: z.string().optional(),
  bank_country: z.string().max(2).optional(),
  swift_bic: z.string().optional(),
  routing_number: z.string().optional(),
  bsb: z.string().optional(),
  sort_code: z.string().optional(),
  ifsc: z.string().optional(),
  cnaps: z.string().optional(),
  other_banking_details: z.string().optional(),
}).optional();

const cryptoSchema = z.object({
  wallet_address: z.string().optional(),
  blockchain: z.nativeEnum(Blockchain).optional(),
  exchange_wallet_name: z.string().optional(),
  transaction_hash: z.string().optional(),
  paypal_account: z.string().optional(),
}).optional();

const companySchema = z.object({
  name: z.string().optional(),
  vat_tax_id: z.string().optional(),
  address: locationSchema,
}).optional();

const vehicleSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  license_plate: z.string().optional(),
  vin: z.string().optional(),
  registered_owner: z.string().optional(),
}).optional();

const evidenceItemSchema = z.object({
  type: z.nativeEnum(EvidenceType),
  file_key: z.string().optional(),
  external_url: z.string().url().optional(),
  description: z.string().max(500).optional(),
});

const reporterSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  preferred_language: z.string().default('en'),
  consent: z.boolean(),
});

const createReportSchema = z.object({
  incident: incidentSchema,
  perpetrator: perpetratorSchema,
  digital_footprints: digitalFootprintsSchema,
  financial: financialSchema,
  crypto: cryptoSchema,
  company: companySchema,
  vehicle: vehicleSchema,
  evidence: z.array(evidenceItemSchema).max(10).optional(),
  reporter: reporterSchema,
});

/**
 * POST /api/v1/reports - Create a new fraud report
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitError = await requireRateLimit(request, 10); // 10 reports per hour
    if (rateLimitError) return rateLimitError;

    // Authentication (required)
    const authResult = await requireAuth(request, ['reports:write']);
    if (authResult instanceof NextResponse) return authResult;
    const { auth } = authResult;

    // Parse and validate body
    const body = await request.json();
    const parsed = createReportSchema.safeParse(body);

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

    const data = parsed.data;
    const userId = auth.user?.sub || auth.apiKey?.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'User ID not found' },
        { status: 401 }
      );
    }

    // Create report with relations
    const report = await prisma.$transaction(async (tx) => {
      // Create main report
      const newReport = await tx.report.create({
        data: {
          fraudType: data.incident.fraud_type,
          incidentDate: data.incident.date ? new Date(data.incident.date) : null,
          transactionDate: data.incident.transaction_date
            ? new Date(data.incident.transaction_date)
            : null,
          summary: data.incident.summary,
          description: data.incident.description,
          financialLossAmount: data.incident.financial_loss?.amount,
          financialLossCurrency: data.incident.financial_loss?.currency || 'EUR',
          locationStreet: data.incident.location?.street,
          locationCity: data.incident.location?.city,
          locationPostalCode: data.incident.location?.postal_code,
          locationCountry: data.incident.location?.country,
          reporterId: userId,
          reporterEmail: data.reporter.email,
          reporterName: data.reporter.name,
          reporterPhone: data.reporter.phone,
          reporterConsent: data.reporter.consent,
          reporterLang: data.reporter.preferred_language,
        },
      });

      // Create perpetrator if provided
      if (data.perpetrator) {
        await tx.perpetrator.create({
          data: {
            reportId: newReport.id,
            fullName: data.perpetrator.full_name,
            fullNameNormalized: data.perpetrator.full_name?.toLowerCase().trim(),
            nickname: data.perpetrator.nickname,
            username: data.perpetrator.username,
            approxAge: data.perpetrator.approx_age,
            nationality: data.perpetrator.nationality,
            physicalDescription: data.perpetrator.physical_description,
            phone: data.perpetrator.phone,
            phoneNormalized: data.perpetrator.phone?.replace(/\D/g, ''),
            email: data.perpetrator.email,
            emailNormalized: data.perpetrator.email?.toLowerCase().trim(),
            addressStreet: data.perpetrator.address?.street,
            addressCity: data.perpetrator.address?.city,
            addressPostalCode: data.perpetrator.address?.postal_code,
            addressCountry: data.perpetrator.address?.country,
          },
        });
      }

      // Create digital footprint if provided
      if (data.digital_footprints) {
        await tx.digitalFootprint.create({
          data: {
            reportId: newReport.id,
            telegram: data.digital_footprints.telegram,
            whatsapp: data.digital_footprints.whatsapp,
            signal: data.digital_footprints.signal,
            instagram: data.digital_footprints.instagram,
            facebook: data.digital_footprints.facebook,
            tiktok: data.digital_footprints.tiktok,
            twitter: data.digital_footprints.twitter,
            websiteUrl: data.digital_footprints.website_url,
            domainName: data.digital_footprints.domain_name,
            domainCreationDate: data.digital_footprints.domain_creation_date
              ? new Date(data.digital_footprints.domain_creation_date)
              : null,
            ipAddress: data.digital_footprints.ip_address,
            ipCountry: data.digital_footprints.ip_country,
            isp: data.digital_footprints.isp,
            ipAbuseScore: data.digital_footprints.ip_abuse_score,
          },
        });
      }

      // Create financial info if provided
      if (data.financial) {
        await tx.financialInfo.create({
          data: {
            reportId: newReport.id,
            iban: data.financial.iban,
            ibanNormalized: data.financial.iban?.replace(/\s/g, '').toUpperCase(),
            accountHolder: data.financial.account_holder,
            accountNumber: data.financial.account_number,
            bankName: data.financial.bank_name,
            bankCountry: data.financial.bank_country,
            swiftBic: data.financial.swift_bic,
            routingNumber: data.financial.routing_number,
            bsb: data.financial.bsb,
            sortCode: data.financial.sort_code,
            ifsc: data.financial.ifsc,
            cnaps: data.financial.cnaps,
            otherBankingDetails: data.financial.other_banking_details,
          },
        });
      }

      // Create crypto info if provided
      if (data.crypto) {
        await tx.cryptoInfo.create({
          data: {
            reportId: newReport.id,
            walletAddress: data.crypto.wallet_address,
            walletNormalized: data.crypto.wallet_address?.toLowerCase(),
            blockchain: data.crypto.blockchain,
            exchangeWalletName: data.crypto.exchange_wallet_name,
            transactionHash: data.crypto.transaction_hash,
            paypalAccount: data.crypto.paypal_account,
          },
        });
      }

      // Create company info if provided
      if (data.company) {
        await tx.companyInfo.create({
          data: {
            reportId: newReport.id,
            name: data.company.name,
            vatTaxId: data.company.vat_tax_id,
            addressStreet: data.company.address?.street,
            addressCity: data.company.address?.city,
            addressPostal: data.company.address?.postal_code,
            addressCountry: data.company.address?.country,
          },
        });
      }

      // Create vehicle info if provided
      if (data.vehicle) {
        await tx.vehicleInfo.create({
          data: {
            reportId: newReport.id,
            make: data.vehicle.make,
            model: data.vehicle.model,
            color: data.vehicle.color,
            licensePlate: data.vehicle.license_plate,
            vin: data.vehicle.vin,
            registeredOwner: data.vehicle.registered_owner,
          },
        });
      }

      // Create evidence items
      if (data.evidence && data.evidence.length > 0) {
        await tx.evidence.createMany({
          data: data.evidence.map((e) => ({
            reportId: newReport.id,
            type: e.type,
            fileKey: e.file_key,
            externalUrl: e.external_url,
            description: e.description,
          })),
        });
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'report.create',
          entityType: 'report',
          entityId: newReport.id,
          ipAddress: getClientIp(request),
          userAgent: request.headers.get('user-agent'),
        },
      });

      return newReport;
    });

    // Run duplicate detection (async, non-blocking)
    let duplicateResult = {
      hasDuplicates: false,
      clusterId: null as string | null,
      matches: [] as Array<{ reportId: string; similarity: number }>,
      totalMatches: 0,
    };

    try {
      duplicateResult = await runDuplicateDetection(report.id);
      console.log(`[Reports] Duplicate detection for ${report.id}: ${duplicateResult.totalMatches} matches`);
    } catch (duplicateError) {
      // Log but don't fail the request - duplicate detection is not critical
      console.error('[Reports] Duplicate detection error:', duplicateError);
    }

    return NextResponse.json(
      {
        id: report.publicId,
        status: report.status.toLowerCase(),
        created_at: report.createdAt.toISOString(),
        duplicate_check: {
          has_duplicates: duplicateResult.hasDuplicates,
          cluster_id: duplicateResult.clusterId,
          match_count: duplicateResult.totalMatches,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/reports - List reports
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitError = await requireRateLimit(request, 100);
    if (rateLimitError) return rateLimitError;

    // Authentication
    const authResult = await requireAuth(request, ['reports:read']);
    if (authResult instanceof NextResponse) return authResult;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'approved';
    const fraudType = searchParams.get('fraud_type');
    const country = searchParams.get('country');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (fraudType) {
      where.fraudType = fraudType.toUpperCase();
    }

    if (country) {
      where.locationCountry = country.toUpperCase();
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        (where.createdAt as Record<string, Date>).gte = new Date(dateFrom);
      }
      if (dateTo) {
        (where.createdAt as Record<string, Date>).lte = new Date(dateTo);
      }
    }

    // Get total count
    const total = await prisma.report.count({ where });

    // Get reports
    const reports = await prisma.report.findMany({
      where,
      include: {
        perpetrators: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Format response (with masking based on role)
    const formattedReports = reports.map((report) => ({
      id: report.publicId,
      status: report.status.toLowerCase(),
      fraud_type: report.fraudType.toLowerCase(),
      incident_date: report.incidentDate?.toISOString().split('T')[0],
      country: report.locationCountry,
      perpetrator: report.perpetrators[0]
        ? {
            name: report.perpetrators[0].fullName, // TODO: Apply masking
          }
        : null,
      created_at: report.createdAt.toISOString(),
    }));

    return NextResponse.json({
      total,
      limit,
      offset,
      reports: formattedReports,
    });
  } catch (error) {
    console.error('List reports error:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
