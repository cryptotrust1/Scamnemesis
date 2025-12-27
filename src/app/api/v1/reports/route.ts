/**
 * Reports API Routes
 *
 * POST /api/v1/reports - Create a new report
 * GET /api/v1/reports - List reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import * as Sentry from '@sentry/nextjs';
import prisma from '@/lib/db';
import { requireAuth, requireRateLimit, getClientIp, optionalAuth } from '@/lib/middleware/auth';
import { FraudType, EvidenceType, Blockchain } from '@prisma/client';
import { runDuplicateDetection } from '@/lib/duplicate-detection/detector';
import { emailService } from '@/lib/services/email';
import { createRequestLogger, generateRequestId } from '@/lib/logger';

/**
 * Generate a unique case number in format: SN-YYYYMMDD-XXXX
 */
function generateCaseNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = randomBytes(2).toString('hex').toUpperCase();
  return `SN-${year}${month}${day}-${random}`;
}

/**
 * Generate a secure tracking token
 */
function generateTrackingToken(): string {
  return randomBytes(32).toString('hex');
}

export const dynamic = 'force-dynamic';

/**
 * Mask a name based on user role for privacy
 * - ADMIN/SUPER_ADMIN: Full name visible
 * - GOLD: First name + last initial (e.g., "John D.")
 * - STANDARD: First initial + last initial (e.g., "J. D.")
 * - BASIC/anonymous: Fully masked (e.g., "J***")
 */
function maskName(name: string | null, userRole: string): string | null {
  if (!name) return null;

  // Admin and Super Admin see everything unmasked
  if (['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
    return name;
  }

  const parts = name.trim().split(/\s+/);

  // Gold tier sees partial masking
  if (userRole === 'GOLD') {
    if (parts.length === 1) {
      return parts[0].charAt(0) + '***';
    }
    // First name + last initial
    return parts[0] + ' ' + parts[parts.length - 1].charAt(0) + '.';
  }

  // Standard tier sees more masking
  if (userRole === 'STANDARD') {
    // First initial + last initial
    if (parts.length === 1) {
      return parts[0].charAt(0) + '.';
    }
    return parts[0].charAt(0) + '. ' + parts[parts.length - 1].charAt(0) + '.';
  }

  // Basic tier and anonymous see heavy masking
  if (parts.length === 1) {
    return parts[0].charAt(0) + '***';
  }
  return parts.map((p) => p.charAt(0) + '.').join(' ');
}

// Validation schemas
const locationSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().max(2).optional(),
}).optional();

// Helper to validate datetime strings more leniently
// Accepts ISO 8601 format with or without timezone, or just date
// Also validates semantic correctness (not just format)
const dateTimeString = z.string()
  .refine((val) => {
    if (!val) return true;
    // Accept ISO 8601 datetime or just date format
    const isoPattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:?\d{2})?)?$/;
    if (!isoPattern.test(val)) return false;

    // Semantic validation: check if the date is actually valid
    const parsed = new Date(val);
    if (isNaN(parsed.getTime())) {
      console.log(`[DateValidation] Invalid date (NaN): ${val}`);
      return false;
    }

    // Additional semantic check: verify the parsed date matches the input
    // This catches cases like "2024-02-30" which JS auto-corrects to March 1
    const [datePart] = val.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    if (parsed.getUTCFullYear() !== year ||
        parsed.getUTCMonth() + 1 !== month ||
        parsed.getUTCDate() !== day) {
      console.log(`[DateValidation] Date mismatch: input=${val}, parsed=${parsed.toISOString()}`);
      return false;
    }

    return true;
  }, { message: 'Invalid date format or semantically invalid date. Expected ISO 8601 format with valid date.' })
  .optional()
  .or(z.literal(''));

const incidentSchema = z.object({
  fraud_type: z.nativeEnum(FraudType),
  date: dateTimeString,
  transaction_date: dateTimeString,
  summary: z.string().max(500),
  description: z.string().max(10000).optional(),
  financial_loss: z.object({
    amount: z.number().positive().optional(),
    currency: z.string().default('EUR'),
  }).optional(),
  location: locationSchema,
});

const perpetratorSchema = z.object({
  perpetrator_type: z.enum(['INDIVIDUAL', 'COMPANY', 'UNKNOWN']).optional(),
  full_name: z.string().max(255).optional(),
  nickname: z.string().max(100).optional(),
  username: z.string().max(100).optional(),
  approx_age: z.number().int().min(0).max(150).optional(),
  nationality: z.string().max(50).optional(),
  physical_description: z.string().max(2000).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: locationSchema,
}).optional();

// Helper to validate URL more leniently - accepts http/https URLs or empty
const laxUrl = z.string()
  .refine((val) => {
    if (!val || val === '') return true;
    try {
      // Must start with http:// or https://
      if (!val.startsWith('http://') && !val.startsWith('https://')) return false;
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, { message: 'Invalid URL format. Must start with http:// or https://' })
  .optional()
  .or(z.literal(''));

// Helper to validate IP address more leniently
const laxIp = z.string()
  .refine((val) => {
    if (!val || val === '') return true;
    // IPv4 pattern
    const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    // IPv6 pattern (simplified)
    const ipv6 = /^[a-fA-F0-9:]+$/;
    return ipv4.test(val) || ipv6.test(val);
  }, { message: 'Invalid IP address format' })
  .optional()
  .or(z.literal(''));

const digitalFootprintsSchema = z.object({
  telegram: z.string().optional(),
  whatsapp: z.string().optional(),
  signal: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  tiktok: z.string().optional(),
  twitter: z.string().optional(),
  website_url: laxUrl,
  domain_name: z.string().optional(),
  domain_creation_date: dateTimeString,
  ip_address: laxIp,
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
  external_url: laxUrl,
  description: z.string().max(500).optional(),
  mime_type: z.string().max(100).optional(),
  file_size: z.number().int().positive().optional(),
});

const reporterSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  preferred_language: z.string().default('en'),
  consent: z.boolean().optional().default(true),
  want_updates: z.boolean().optional().default(false),
  agree_to_terms: z.boolean().optional().default(false),
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
  const requestId = generateRequestId();
  const log = createRequestLogger(requestId, 'ReportsAPI');
  log.info('New report submission request');

  try {
    // Rate limiting - wrapped in try-catch to prevent unhandled errors
    log.debug('Step 1: Checking rate limit');
    let rateLimitError: Response | null = null;
    try {
      rateLimitError = await requireRateLimit(request, 10); // 10 reports per hour
    } catch (rateLimitException) {
      log.error('Rate limit check failed', { error: rateLimitException instanceof Error ? rateLimitException.message : String(rateLimitException) });
      // Continue without rate limiting if the check fails (fail-open for UX)
      // This could happen if Redis is down or rate limit table doesn't exist
    }
    if (rateLimitError) {
      log.warn('Rate limited - returning 429');
      return rateLimitError;
    }
    log.debug('Rate limit OK');

    // Authentication (optional - allows anonymous submissions)
    log.debug('Step 2: Checking authentication');
    const auth = await optionalAuth(request);
    log.debug('Auth result', { user: auth.user?.sub || 'none', apiKey: auth.apiKey?.id || 'none' });

    // Parse and validate body
    log.debug('Step 3: Parsing JSON body');
    let body;
    try {
      body = await request.json();
      log.debug('JSON parsed successfully');
    } catch (parseError) {
      log.error('JSON parse error', { error: parseError instanceof Error ? parseError.message : String(parseError) });
      return NextResponse.json(
        { error: 'parse_error', message: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Log incoming request for debugging (sanitized - no sensitive data in logs)
    log.info('Incoming report', {
      fraudType: body.incident?.fraud_type,
      date: body.incident?.date,
      hasPerpetrator: !!body.perpetrator,
      hasDigitalFootprints: !!body.digital_footprints,
      hasFinancial: !!body.financial,
      hasCrypto: !!body.crypto,
      hasCompany: !!body.company,
      hasVehicle: !!body.vehicle,
      evidenceCount: body.evidence?.length || 0,
      hasReporterEmail: !!body.reporter?.email,
    });

    log.debug('Step 4: Validating with Zod schema');
    const parsed = createReportSchema.safeParse(body);

    if (!parsed.success) {
      const flattenedErrors = parsed.error.flatten();
      log.warn('Validation failed', {
        fieldErrors: flattenedErrors.fieldErrors,
        formErrors: flattenedErrors.formErrors,
        issueCount: parsed.error.issues.length,
      });
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'Invalid request body',
          details: flattenedErrors.fieldErrors,
          issues: parsed.error.issues.map(i => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    log.debug('Validation passed');
    const data = parsed.data;
    let userId = auth.user?.sub || auth.apiKey?.userId;

    // Handle anonymous submissions - create or get anonymous user
    log.debug('Step 5: Processing user', { currentUserId: userId || 'none' });
    if (!userId) {
      // Find or create anonymous user for this session based on email
      const reporterEmail = data.reporter.email || 'anonymous@scamnemesis.com';
      log.debug('Processing anonymous reporter', {
        hasEmail: !!reporterEmail,
        hasName: !!data.reporter.name,
        hasPhone: !!data.reporter.phone,
      });

      try {
        // First, test database connection
        log.debug('Testing database connection');
        const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
        log.debug('Database connection OK', { result: dbTest });

        // Check if user already exists
        log.debug('Checking if user exists');
        const existingUser = await prisma.user.findUnique({
          where: { email: reporterEmail },
          select: { id: true, email: true },
        });

        if (existingUser) {
          userId = existingUser.id;
          log.debug('Found existing user', { userId });
        } else {
          // Create new user
          log.debug('Creating new user');
          const randomPasswordHash = randomBytes(32).toString('hex');
          const newUser = await prisma.user.create({
            data: {
              email: reporterEmail,
              passwordHash: randomPasswordHash,
              displayName: data.reporter.name || 'Anonymous Reporter',
              role: 'BASIC',
              emailVerified: null,
              isActive: true,
            },
          });
          userId = newUser.id;
          log.info('Created new anonymous user', { userId });
        }

        log.debug('User processing complete', { userId });
      } catch (userError) {
        // Enhanced error logging for debugging
        const userErrorDetails = {
          name: userError instanceof Error ? userError.name : 'Unknown',
          message: userError instanceof Error ? userError.message : String(userError),
          code: userError && typeof userError === 'object' && 'code' in userError ? (userError as { code: string }).code : undefined,
          meta: userError && typeof userError === 'object' && 'meta' in userError ? (userError as { meta: unknown }).meta : undefined,
        };
        log.error('Failed to create/find anonymous user', userErrorDetails);
        return NextResponse.json(
          {
            error: 'user_error',
            message: 'Failed to process reporter information',
            request_id: requestId,
            // Include error details for debugging
            error_type: userErrorDetails.name,
            error_code: userErrorDetails.code,
            timestamp: new Date().toISOString(),
          },
          { status: 500 }
        );
      }
    }

    // Generate tracking token and case number
    const trackingToken = generateTrackingToken();
    const caseNumber = generateCaseNumber();
    log.info('Generated tracking identifiers', { caseNumber, trackingTokenPrefix: trackingToken.substring(0, 8) });

    // Create report with relations
    log.debug('Step 6: Creating report in database transaction');
    const report = await prisma.$transaction(async (tx) => {
      log.debug('Transaction: Creating main report');
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
          reporterEmail: data.reporter.email || 'anonymous@scamnemesis.com',
          reporterName: data.reporter.name,
          reporterPhone: data.reporter.phone,
          reporterConsent: data.reporter.consent || false,
          reporterLang: data.reporter.preferred_language,
          wantUpdates: data.reporter.want_updates || false,
          agreeToTerms: data.reporter.agree_to_terms || false,
          agreeToGDPR: data.reporter.consent || false,
          trackingToken,
          caseNumber,
        },
      });
      log.debug('Transaction: Main report created', { reportId: newReport.id });

      // Create perpetrator if provided
      if (data.perpetrator) {
        log.debug('Transaction: Creating perpetrator');
        await tx.perpetrator.create({
          data: {
            reportId: newReport.id,
            perpetratorType: data.perpetrator.perpetrator_type || 'INDIVIDUAL',
            fullName: data.perpetrator.full_name,
            fullNameNormalized: data.perpetrator.full_name?.toLowerCase()?.trim(),
            nickname: data.perpetrator.nickname,
            username: data.perpetrator.username,
            approxAge: data.perpetrator.approx_age,
            nationality: data.perpetrator.nationality,
            physicalDescription: data.perpetrator.physical_description,
            phone: data.perpetrator.phone,
            phoneNormalized: data.perpetrator.phone?.replace(/\D/g, ''),
            email: data.perpetrator.email,
            emailNormalized: data.perpetrator.email?.toLowerCase()?.trim(),
            addressStreet: data.perpetrator.address?.street,
            addressCity: data.perpetrator.address?.city,
            addressPostalCode: data.perpetrator.address?.postal_code,
            addressCountry: data.perpetrator.address?.country,
          },
        });
      }

      // Create digital footprint if provided
      if (data.digital_footprints) {
        log.debug('Transaction: Creating digital footprint');
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
        log.debug('Transaction: Creating financial info');
        await tx.financialInfo.create({
          data: {
            reportId: newReport.id,
            iban: data.financial.iban,
            ibanNormalized: data.financial.iban?.replace(/\s/g, '')?.toUpperCase(),
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
        log.debug('Transaction: Creating crypto info');
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
        log.debug('Transaction: Creating company info');
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
        log.debug('Transaction: Creating vehicle info');
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
        log.debug('Transaction: Creating evidence items', { count: data.evidence.length });
        await tx.evidence.createMany({
          data: data.evidence.map((e) => ({
            reportId: newReport.id,
            type: e.type,
            fileKey: e.file_key,
            externalUrl: e.external_url,
            description: e.description,
            mimeType: e.mime_type,
            fileSize: e.file_size,
          })),
        });
      }

      // Create audit log
      log.debug('Transaction: Creating audit log');
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

      log.debug('Transaction: Complete');
      return newReport;
    });
    log.info('Report created successfully', { reportId: report.id });

    // Run duplicate detection (async, non-blocking)
    log.debug('Step 7: Running duplicate detection');
    let duplicateResult = {
      hasDuplicates: false,
      clusterId: null as string | null,
      matches: [] as Array<{ reportId: string; similarity: number }>,
      totalMatches: 0,
    };

    try {
      duplicateResult = await runDuplicateDetection(report.id);
      log.info('Duplicate detection complete', { matches: duplicateResult.totalMatches });
    } catch (duplicateError) {
      // Log but don't fail the request - duplicate detection is not critical
      log.warn('Duplicate detection error (non-fatal)', { error: duplicateError instanceof Error ? duplicateError.message : String(duplicateError) });
    }

    // Send confirmation email if reporter provided a valid email (not anonymous)
    log.debug('Step 8: Processing email');
    const reporterEmail = data.reporter.email;
    let emailSentSuccessfully = false;
    let emailError: string | undefined;

    if (reporterEmail && reporterEmail !== 'anonymous@scamnemesis.com' && reporterEmail.includes('@')) {
      log.debug('Sending confirmation email');
      try {
        const emailResult = await emailService.sendReportConfirmation({
          reporterName: data.reporter.name || 'Reporter',
          reporterEmail: reporterEmail,
          caseNumber: caseNumber,
          trackingToken: trackingToken,
          fraudType: data.incident.fraud_type,
          summary: data.incident.summary,
          financialLoss: data.incident.financial_loss?.amount
            ? {
                amount: data.incident.financial_loss.amount,
                currency: data.incident.financial_loss.currency || 'EUR',
              }
            : undefined,
          reportDate: new Date(),
          locale: data.reporter.preferred_language || 'sk',
        });

        if (emailResult.success) {
          log.info('Confirmation email sent successfully');
          emailSentSuccessfully = true;
        } else {
          log.warn('Failed to send confirmation email', { error: emailResult.error });
          emailError = emailResult.error;
        }
      } catch (emailException) {
        // Log but don't fail the request - email is not critical
        log.warn('Email sending error (non-fatal)', { error: emailException instanceof Error ? emailException.message : String(emailException) });
        emailError = emailException instanceof Error ? emailException.message : 'Unknown error';
      }
    } else {
      log.debug('Skipping email (anonymous or no email)');
    }

    // Send notification to admin users about new report
    log.debug('Step 8b: Sending admin notifications');
    try {
      // Get all admin and super admin users
      const adminUsers = await prisma.user.findMany({
        where: {
          role: { in: ['ADMIN', 'SUPER_ADMIN'] },
          isActive: true,
          emailVerified: { not: null },
        },
        select: { email: true },
      });

      if (adminUsers.length > 0) {
        log.debug('Notifying admins', { count: adminUsers.length });

        // Send notification to each admin (non-blocking)
        const adminNotifications = adminUsers.map(admin =>
          emailService.sendNewReportNotification(
            admin.email,
            report.id,
            data.incident.summary.substring(0, 100),
            data.incident.fraud_type
          ).catch(err => {
            log.warn('Failed to notify admin', { email: admin.email, error: err.message });
            return { success: false, error: err.message };
          })
        );

        // Wait for all notifications (but don't fail if some fail)
        const results = await Promise.allSettled(adminNotifications);
        const successCount = results.filter(r => r.status === 'fulfilled' && (r.value as { success: boolean }).success).length;
        log.info('Admin notifications sent', { success: successCount, total: adminUsers.length });
      } else {
        log.debug('No active admin users to notify');
      }
    } catch (adminNotifyError) {
      // Log but don't fail - admin notification is not critical
      log.warn('Admin notification error (non-fatal)', { error: adminNotifyError instanceof Error ? adminNotifyError.message : String(adminNotifyError) });
    }

    log.info('Request completed successfully');
    return NextResponse.json(
      {
        id: report.id,
        publicId: report.publicId,
        case_number: caseNumber,
        status: (report.status || 'PENDING').toLowerCase(),
        created_at: report.createdAt.toISOString(),
        duplicate_check: {
          has_duplicates: duplicateResult.hasDuplicates,
          cluster_id: duplicateResult.clusterId,
          match_count: duplicateResult.totalMatches,
        },
        email_sent: emailSentSuccessfully,
        ...(emailError && !emailSentSuccessfully ? {
          email_warning: emailError,
          email_note: 'Report was saved successfully, but confirmation email could not be sent. Please check server logs for details.'
        } : {}),
      },
      { status: 201 }
    );
  } catch (error) {
    // Send to Sentry for monitoring
    Sentry.captureException(error, {
      tags: { api: 'reports', method: 'POST' },
      extra: { requestId },
    });

    // Enhanced error logging for debugging
    const errorDetails = {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    };
    log.error('Create report error', errorDetails);

    // Prisma-specific error handling
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: unknown };
      log.error('Prisma error', { code: prismaError.code, meta: prismaError.meta });

      // Handle specific Prisma errors
      if (prismaError.code === 'P2002') {
        return NextResponse.json(
          { error: 'duplicate_error', message: 'A report with this data already exists' },
          { status: 409 }
        );
      }
      if (prismaError.code === 'P2003') {
        return NextResponse.json(
          { error: 'reference_error', message: 'Invalid reference in report data' },
          { status: 400 }
        );
      }
    }

    // Return detailed error - include debug info for troubleshooting
    // In production we still include error type and code for debugging
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      {
        error: 'internal_error',
        message: isDev ? errorDetails.message : 'An unexpected error occurred',
        // Always include request_id for log correlation
        request_id: requestId,
        // Include error type for debugging (safe, doesn't expose internals)
        error_type: errorDetails.name,
        // Include timestamp for debugging
        timestamp: new Date().toISOString(),
        ...(isDev ? { details: errorDetails } : {}),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/reports - List reports
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const log = createRequestLogger(requestId, 'ReportsAPI');

  try {
    // Rate limiting
    const rateLimitError = await requireRateLimit(request, 100);
    if (rateLimitError) return rateLimitError;

    // Authentication
    const authResult = await requireAuth(request, ['reports:read']);
    if (authResult instanceof NextResponse) return authResult;
    const { auth } = authResult;

    // Determine user role for masking
    const isAdmin = auth.scopes?.some((s: string) => s.startsWith('admin:'));
    const userRole = isAdmin ? 'ADMIN' : (auth.user?.role || 'BASIC');

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

    // Format response with masking based on user role
    const formattedReports = reports.map((report) => ({
      id: report.publicId,
      status: (report.status || 'PENDING').toLowerCase(),
      fraud_type: (report.fraudType || 'OTHER').toLowerCase(),
      incident_date: report.incidentDate?.toISOString()?.split('T')[0],
      country: report.locationCountry,
      perpetrator: report.perpetrators?.[0]
        ? {
            name: maskName(report.perpetrators[0]?.fullName, userRole),
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
    const errorDetails = {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    };
    log.error('List reports error', errorDetails);

    Sentry.captureException(error, {
      tags: { api: 'reports', method: 'GET' },
      extra: { requestId },
    });

    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'An unexpected error occurred',
        request_id: requestId,
      },
      { status: 500 }
    );
  }
}
