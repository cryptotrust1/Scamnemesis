/**
 * Verify API Route
 *
 * GET /api/v1/verify - Quick verification of an identifier
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { requireRateLimit } from '@/lib/middleware/auth';

const verifyParamsSchema = z.object({
  identifier: z.string().min(2).max(500),
  type: z.enum(['auto', 'email', 'phone', 'wallet', 'iban', 'domain']).default('auto'),
});

/**
 * Detect identifier type
 */
function detectType(identifier: string): string {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) return 'email';
  if (/^[\d\s\-\+\(\)]{7,20}$/.test(identifier)) return 'phone';
  if (/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/i.test(identifier.replace(/\s/g, ''))) return 'iban';
  if (/^0x[a-fA-F0-9]{40}$/.test(identifier)) return 'wallet';
  if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(identifier)) return 'wallet';
  if (/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(identifier)) return 'domain';
  return 'unknown';
}

/**
 * Normalize identifier based on type
 */
function normalize(identifier: string, type: string): string {
  switch (type) {
    case 'phone':
      return identifier.replace(/\D/g, '');
    case 'email':
      return identifier.toLowerCase().trim();
    case 'iban':
      return identifier.replace(/\s/g, '').toUpperCase();
    case 'wallet':
      return identifier.toLowerCase();
    case 'domain':
      return identifier.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');
    default:
      return identifier.toLowerCase().trim();
  }
}

/**
 * GET /api/v1/verify - Check if an identifier is in the database
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitError = await requireRateLimit(request, 200); // Higher limit for verify
    if (rateLimitError) return rateLimitError;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = {
      identifier: searchParams.get('identifier') || '',
      type: searchParams.get('type') || 'auto',
    };

    const parsed = verifyParamsSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'identifier parameter is required',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { identifier, type } = parsed.data;

    // Detect type if auto
    const detectedType = type === 'auto' ? detectType(identifier) : type;
    const normalizedIdentifier = normalize(identifier, detectedType);

    // Search in database
    let reportCount = 0;
    let lastReported: Date | null = null;
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    const where: Record<string, unknown> = { status: 'APPROVED' };

    switch (detectedType) {
      case 'email':
        where.perpetrators = { some: { emailNormalized: normalizedIdentifier } };
        break;
      case 'phone':
        where.perpetrators = { some: { phoneNormalized: normalizedIdentifier } };
        break;
      case 'iban':
        where.financialInfo = { ibanNormalized: normalizedIdentifier };
        break;
      case 'wallet':
        where.cryptoInfo = { walletNormalized: normalizedIdentifier };
        break;
      case 'domain':
        where.digitalFootprint = { domainName: normalizedIdentifier };
        break;
      default:
        // For unknown types, search across multiple fields
        where.OR = [
          { perpetrators: { some: { emailNormalized: normalizedIdentifier } } },
          { perpetrators: { some: { phoneNormalized: normalizedIdentifier } } },
          { financialInfo: { ibanNormalized: normalizedIdentifier } },
          { cryptoInfo: { walletNormalized: normalizedIdentifier } },
          { digitalFootprint: { domainName: normalizedIdentifier } },
        ];
    }

    // Count matching reports
    reportCount = await prisma.report.count({ where });

    if (reportCount > 0) {
      // Get the latest report
      const latestReport = await prisma.report.findFirst({
        where,
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      });

      lastReported = latestReport?.createdAt || null;

      // Calculate risk level based on report count
      if (reportCount >= 5) {
        riskLevel = 'high';
      } else if (reportCount >= 2) {
        riskLevel = 'medium';
      } else {
        riskLevel = 'low';
      }
    }

    return NextResponse.json({
      is_reported: reportCount > 0,
      report_count: reportCount,
      risk_level: reportCount > 0 ? riskLevel : null,
      last_reported: lastReported?.toISOString() || null,
      identifier_type: detectedType,
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
