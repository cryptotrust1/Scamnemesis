/**
 * Search API Route
 *
 * GET /api/v1/search - Search reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { requireRateLimit, optionalAuth } from '@/lib/middleware/auth';

const searchParamsSchema = z.object({
  q: z.string().min(2).max(500),
  mode: z.enum(['auto', 'exact', 'fuzzy', 'semantic']).default('auto'),
  fields: z.string().optional(), // comma-separated
  country: z.string().max(2).optional(),
  fraud_type: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

type SearchMode = 'auto' | 'exact' | 'fuzzy' | 'semantic';

interface SearchResult {
  id: string;
  score: number;
  source: 'exact' | 'fuzzy' | 'semantic';
  perpetrator: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  fraud_type: string;
  country?: string;
  incident_date?: string;
  highlights?: Record<string, string[]>;
}

/**
 * Detect search type based on query
 */
function detectSearchType(query: string): string[] {
  const types: string[] = [];

  // Email pattern
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query)) {
    types.push('email');
  }

  // Phone pattern (various formats)
  if (/^[\d\s\-\+\(\)]{7,20}$/.test(query)) {
    types.push('phone');
  }

  // IBAN pattern
  if (/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/i.test(query.replace(/\s/g, ''))) {
    types.push('iban');
  }

  // Crypto wallet patterns
  if (/^0x[a-fA-F0-9]{40}$/.test(query)) {
    types.push('wallet'); // Ethereum
  }
  if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(query)) {
    types.push('wallet'); // Bitcoin
  }
  if (/^T[A-Za-z1-9]{33}$/.test(query)) {
    types.push('wallet'); // Tron
  }

  // Domain pattern
  if (/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(query)) {
    types.push('domain');
  }

  // Default to name search if no specific type detected
  if (types.length === 0) {
    types.push('name');
  }

  return types;
}

/**
 * Normalize search query based on type
 */
function normalizeQuery(query: string, type: string): string {
  switch (type) {
    case 'phone':
      return query.replace(/\D/g, '');
    case 'email':
      return query.toLowerCase().trim();
    case 'iban':
      return query.replace(/\s/g, '').toUpperCase();
    case 'wallet':
      return query.toLowerCase();
    case 'domain':
      return query.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');
    default:
      return query.toLowerCase().trim();
  }
}

/**
 * Perform exact search
 */
async function exactSearch(
  query: string,
  types: string[],
  filters: Record<string, unknown>,
  limit: number,
  offset: number
): Promise<{ results: SearchResult[]; total: number }> {
  const orConditions: Record<string, unknown>[] = [];

  for (const type of types) {
    const normalizedQuery = normalizeQuery(query, type);

    switch (type) {
      case 'email':
        orConditions.push({
          perpetrators: { some: { emailNormalized: normalizedQuery } },
        });
        break;
      case 'phone':
        orConditions.push({
          perpetrators: { some: { phoneNormalized: normalizedQuery } },
        });
        break;
      case 'iban':
        orConditions.push({
          financialInfo: { ibanNormalized: normalizedQuery },
        });
        break;
      case 'wallet':
        orConditions.push({
          cryptoInfo: { walletNormalized: normalizedQuery },
        });
        break;
      case 'domain':
        orConditions.push({
          digitalFootprint: { domainName: normalizedQuery },
        });
        break;
    }
  }

  if (orConditions.length === 0) {
    return { results: [], total: 0 };
  }

  const where = {
    status: 'APPROVED' as const,
    OR: orConditions,
    ...filters,
  };

  const [total, reports] = await Promise.all([
    prisma.report.count({ where }),
    prisma.report.findMany({
      where,
      include: {
        perpetrators: true,
        financialInfo: true,
        cryptoInfo: true,
        digitalFootprint: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
  ]);

  const results: SearchResult[] = reports.map((report) => ({
    id: report.publicId,
    score: 1.0,
    source: 'exact' as const,
    perpetrator: {
      name: report.perpetrators[0]?.fullName,
      phone: report.perpetrators[0]?.phone,
      email: report.perpetrators[0]?.email,
    },
    fraud_type: report.fraudType.toLowerCase(),
    country: report.locationCountry || undefined,
    incident_date: report.incidentDate?.toISOString().split('T')[0],
  }));

  return { results, total };
}

/**
 * Perform fuzzy search (name-based)
 */
async function fuzzySearch(
  query: string,
  filters: Record<string, unknown>,
  limit: number,
  offset: number
): Promise<{ results: SearchResult[]; total: number }> {
  const normalizedQuery = query.toLowerCase().trim();

  // Use PostgreSQL similarity search with trigrams
  const where = {
    status: 'APPROVED' as const,
    perpetrators: {
      some: {
        OR: [
          { fullNameNormalized: { contains: normalizedQuery } },
          { nickname: { contains: normalizedQuery, mode: 'insensitive' as const } },
          { username: { contains: normalizedQuery, mode: 'insensitive' as const } },
        ],
      },
    },
    ...filters,
  };

  const [total, reports] = await Promise.all([
    prisma.report.count({ where }),
    prisma.report.findMany({
      where,
      include: {
        perpetrators: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
  ]);

  const results: SearchResult[] = reports.map((report) => ({
    id: report.publicId,
    score: 0.8, // TODO: Calculate actual similarity score
    source: 'fuzzy' as const,
    perpetrator: {
      name: report.perpetrators[0]?.fullName,
    },
    fraud_type: report.fraudType.toLowerCase(),
    country: report.locationCountry || undefined,
    incident_date: report.incidentDate?.toISOString().split('T')[0],
    highlights: {
      name: report.perpetrators[0]?.fullName ? [report.perpetrators[0].fullName] : [],
    },
  }));

  return { results, total };
}

/**
 * GET /api/v1/search - Search for fraud reports
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitError = await requireRateLimit(request, 100);
    if (rateLimitError) return rateLimitError;

    // Authentication (optional for basic search)
    const _auth = await optionalAuth(request);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = {
      q: searchParams.get('q') || '',
      mode: searchParams.get('mode') as SearchMode || 'auto',
      fields: searchParams.get('fields') ?? undefined,
      country: searchParams.get('country') ?? undefined,
      fraud_type: searchParams.get('fraud_type') ?? undefined,
      date_from: searchParams.get('date_from') ?? undefined,
      date_to: searchParams.get('date_to') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      offset: searchParams.get('offset') ?? undefined,
    };

    const parsed = searchParamsSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'Invalid query parameters',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { q, mode, fields, country, fraud_type, date_from, date_to, limit, offset } = parsed.data;

    // Build filters
    const filters: Record<string, unknown> = {};

    if (country) {
      filters.locationCountry = country.toUpperCase();
    }

    if (fraud_type) {
      filters.fraudType = fraud_type.toUpperCase();
    }

    if (date_from || date_to) {
      filters.createdAt = {};
      if (date_from) {
        (filters.createdAt as Record<string, Date>).gte = new Date(date_from);
      }
      if (date_to) {
        (filters.createdAt as Record<string, Date>).lte = new Date(date_to);
      }
    }

    // Determine search types
    const searchTypes = fields
      ? fields.split(',').map((f) => f.trim())
      : detectSearchType(q);

    let results: SearchResult[] = [];
    let total = 0;

    // Execute search based on mode
    if (mode === 'auto') {
      // Try exact search first
      const exactResults = await exactSearch(q, searchTypes, filters, limit, offset);

      if (exactResults.total > 0) {
        results = exactResults.results;
        total = exactResults.total;
      } else {
        // Fall back to fuzzy search
        const fuzzyResults = await fuzzySearch(q, filters, limit, offset);
        results = fuzzyResults.results;
        total = fuzzyResults.total;
      }
    } else if (mode === 'exact') {
      const exactResults = await exactSearch(q, searchTypes, filters, limit, offset);
      results = exactResults.results;
      total = exactResults.total;
    } else if (mode === 'fuzzy') {
      const fuzzyResults = await fuzzySearch(q, filters, limit, offset);
      results = fuzzyResults.results;
      total = fuzzyResults.total;
    } else if (mode === 'semantic') {
      // TODO: Implement semantic search with embeddings
      // For now, fall back to fuzzy
      const fuzzyResults = await fuzzySearch(q, filters, limit, offset);
      results = fuzzyResults.results;
      total = fuzzyResults.total;
    }

    // Apply masking based on user role
    // TODO: Implement field-level masking

    // Build facets
    const facets: Record<string, Record<string, number>> = {};

    if (total > 0) {
      // Get country facets
      const countryFacets = await prisma.report.groupBy({
        by: ['locationCountry'],
        _count: true,
        where: { status: 'APPROVED', ...filters },
      });

      facets.country = {};
      countryFacets.forEach((f) => {
        if (f.locationCountry) {
          facets.country[f.locationCountry] = f._count;
        }
      });

      // Get fraud type facets
      const fraudTypeFacets = await prisma.report.groupBy({
        by: ['fraudType'],
        _count: true,
        where: { status: 'APPROVED', ...filters },
      });

      facets.fraud_type = {};
      fraudTypeFacets.forEach((f) => {
        facets.fraud_type[f.fraudType.toLowerCase()] = f._count;
      });
    }

    return NextResponse.json({
      total,
      results,
      facets,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
