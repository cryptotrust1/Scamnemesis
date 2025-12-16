/**
 * Search API Route
 *
 * GET /api/v1/search - Search reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { requireRateLimit, optionalAuth } from '@/lib/middleware/auth';
import { generateSearchEmbedding, isEmbeddingServiceAvailable } from '@/lib/services/embeddings';

export const dynamic = 'force-dynamic';

/**
 * Mask sensitive data based on user role
 */
function maskField(
  value: string | null | undefined,
  fieldType: 'email' | 'phone' | 'name',
  userRole: string
): string | null {
  if (!value) return null;

  // Admin and Super Admin see everything unmasked
  if (['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
    return value;
  }

  // Gold tier sees partial masking
  if (userRole === 'GOLD') {
    switch (fieldType) {
      case 'email':
        const [local, domain] = value.split('@');
        if (!domain) return '***@***.***';
        return `${local.slice(0, 2)}***@${domain}`;
      case 'phone':
        return value.slice(0, 4) + '****' + value.slice(-2);
      case 'name':
        const parts = value.split(' ');
        return parts.map(p => p[0] + '***').join(' ');
      default:
        return value;
    }
  }

  // Standard tier sees more masking
  if (userRole === 'STANDARD') {
    switch (fieldType) {
      case 'email':
        const [local2, domain2] = value.split('@');
        if (!domain2) return '***@***.***';
        return `${local2[0]}***@***`;
      case 'phone':
        return value.slice(0, 3) + '*****' + value.slice(-2);
      case 'name':
        const parts2 = value.split(' ');
        return parts2.map(p => p[0] + '***').join(' ');
      default:
        return value;
    }
  }

  // Basic tier and anonymous see heavy masking
  switch (fieldType) {
    case 'email':
      return '***@***.***';
    case 'phone':
      return '***-***-' + value.slice(-2);
    case 'name':
      const parts3 = value.split(' ');
      return parts3.map(p => p[0] + '.').join(' ');
    default:
      return '***';
  }
}

const searchParamsSchema = z.object({
  q: z.string().min(2).max(500),
  mode: z.enum(['auto', 'exact', 'fuzzy', 'semantic']).default('auto'),
  fields: z.string().optional(), // comma-separated
  country: z.string().max(2).optional(),
  fraud_type: z.string().optional(),
  status: z.string().optional(), // Ignored - always searches APPROVED reports
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  amount_min: z.coerce.number().min(0).optional(),
  amount_max: z.coerce.number().min(0).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sort: z.enum(['created_at', 'financial_loss', 'relevance']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

type SortField = 'created_at' | 'financial_loss' | 'relevance';
type SortOrder = 'asc' | 'desc';

/**
 * Build orderBy clause based on sort parameters
 */
function buildOrderBy(sort: SortField, order: SortOrder): Record<string, 'asc' | 'desc'> {
  switch (sort) {
    case 'financial_loss':
      return { financialLossAmount: order };
    case 'created_at':
    default:
      return { createdAt: order };
  }
}

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
  offset: number,
  sort: SortField = 'created_at',
  order: SortOrder = 'desc'
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
      orderBy: buildOrderBy(sort, order),
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
 * Calculate string similarity using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;

  // Simple trigram similarity calculation
  const getTrigrams = (s: string): Set<string> => {
    const trigrams = new Set<string>();
    const padded = `  ${s} `;
    for (let i = 0; i < padded.length - 2; i++) {
      trigrams.add(padded.substring(i, i + 3));
    }
    return trigrams;
  };

  const trigrams1 = getTrigrams(s1);
  const trigrams2 = getTrigrams(s2);

  let intersection = 0;
  trigrams1.forEach((t) => {
    if (trigrams2.has(t)) intersection++;
  });

  const union = trigrams1.size + trigrams2.size - intersection;
  return union > 0 ? intersection / union : 0;
}

/**
 * Perform fuzzy search (name-based) with actual similarity scores
 */
async function fuzzySearch(
  query: string,
  filters: Record<string, unknown>,
  limit: number,
  offset: number,
  sort: SortField = 'created_at',
  order: SortOrder = 'desc'
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
      orderBy: sort === 'relevance' ? { createdAt: order } : buildOrderBy(sort, order),
      take: limit,
      skip: offset,
    }),
  ]);

  // Calculate actual similarity scores
  const results: SearchResult[] = reports.map((report) => {
    const perpetratorName = report.perpetrators[0]?.fullName || '';
    const nickname = report.perpetrators[0]?.nickname || '';
    const username = report.perpetrators[0]?.username || '';

    // Calculate similarity against all relevant fields and take the best match
    const nameScore = calculateSimilarity(normalizedQuery, perpetratorName);
    const nicknameScore = calculateSimilarity(normalizedQuery, nickname);
    const usernameScore = calculateSimilarity(normalizedQuery, username);
    const bestScore = Math.max(nameScore, nicknameScore, usernameScore);

    // Boost score if query is contained in the name (substring match)
    const containsBoost =
      perpetratorName.toLowerCase().includes(normalizedQuery) ||
      nickname.toLowerCase().includes(normalizedQuery) ||
      username.toLowerCase().includes(normalizedQuery)
        ? 0.2
        : 0;

    const finalScore = Math.min(1.0, bestScore + containsBoost);

    return {
      id: report.publicId,
      score: Math.round(finalScore * 100) / 100, // Round to 2 decimal places
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
    };
  });

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return { results, total };
}

/**
 * Perform semantic search using vector embeddings
 */
async function semanticSearch(
  query: string,
  filters: Record<string, unknown>,
  limit: number,
  offset: number,
  sort: SortField = 'created_at',
  order: SortOrder = 'desc'
): Promise<{ results: SearchResult[]; total: number }> {
  // Check if embedding service is available
  if (!isEmbeddingServiceAvailable()) {
    console.warn('[Search] Embedding service not available, falling back to fuzzy search');
    return fuzzySearch(query, filters, limit, offset, sort, order);
  }

  // Generate embedding for the search query
  const embeddingResult = await generateSearchEmbedding(query);

  if (!embeddingResult.success || !embeddingResult.embedding) {
    console.warn('[Search] Failed to generate embedding, falling back to fuzzy search');
    return fuzzySearch(query, filters, limit, offset, sort, order);
  }

  const embedding = embeddingResult.embedding;
  const embeddingStr = `[${embedding.join(',')}]`;

  try {
    // Safely extract and validate filter values (whitelist approach)
    const countryFilter = filters.locationCountry
      ? String(filters.locationCountry).replace(/[^A-Z]/gi, '').toUpperCase().slice(0, 2)
      : null;
    const fraudTypeFilter = filters.fraudType
      ? String(filters.fraudType).replace(/[^A-Z_]/gi, '').toUpperCase()
      : null;

    // Validate country format (must be exactly 2 uppercase letters)
    const validCountry = countryFilter && /^[A-Z]{2}$/.test(countryFilter) ? countryFilter : null;
    // Validate fraud type format (must be uppercase letters and underscores only)
    const validFraudType = fraudTypeFilter && /^[A-Z_]+$/.test(fraudTypeFilter) ? fraudTypeFilter : null;

    // Extract amount filters with type safety
    const amountGte = filters.financialLossAmount && typeof filters.financialLossAmount === 'object'
      ? Number((filters.financialLossAmount as Record<string, number>).gte) || null
      : null;
    const amountLte = filters.financialLossAmount && typeof filters.financialLossAmount === 'object'
      ? Number((filters.financialLossAmount as Record<string, number>).lte) || null
      : null;

    // Use pgvector cosine similarity search with parameterized queries
    // SECURITY: All user inputs are passed as parameters, not interpolated into SQL
    type SemanticResult = {
      id: string;
      public_id: string;
      fraud_type: string;
      location_country: string | null;
      incident_date: Date | null;
      perpetrator_name: string | null;
      similarity: number;
    };

    const results = await prisma.$queryRaw<SemanticResult[]>`
      SELECT
        r.id,
        r.public_id,
        r.fraud_type,
        r.location_country,
        r.incident_date,
        p.full_name as perpetrator_name,
        1 - (p.name_embedding <=> ${embeddingStr}::vector) as similarity
      FROM reports r
      LEFT JOIN perpetrators p ON p.report_id = r.id
      WHERE r.status = 'APPROVED'
        AND (${validCountry}::text IS NULL OR r.location_country = ${validCountry})
        AND (${validFraudType}::text IS NULL OR r.fraud_type = ${validFraudType})
        AND (${amountGte}::numeric IS NULL OR r.financial_loss_amount >= ${amountGte})
        AND (${amountLte}::numeric IS NULL OR r.financial_loss_amount <= ${amountLte})
        AND p.name_embedding IS NOT NULL
        AND 1 - (p.name_embedding <=> ${embeddingStr}::vector) > 0.3
      ORDER BY similarity DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    // Get total count with the same parameterized approach
    const countResult = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(DISTINCT r.id) as count
      FROM reports r
      LEFT JOIN perpetrators p ON p.report_id = r.id
      WHERE r.status = 'APPROVED'
        AND (${validCountry}::text IS NULL OR r.location_country = ${validCountry})
        AND (${validFraudType}::text IS NULL OR r.fraud_type = ${validFraudType})
        AND (${amountGte}::numeric IS NULL OR r.financial_loss_amount >= ${amountGte})
        AND (${amountLte}::numeric IS NULL OR r.financial_loss_amount <= ${amountLte})
        AND p.name_embedding IS NOT NULL
        AND 1 - (p.name_embedding <=> ${embeddingStr}::vector) > 0.3
    `;

    const total = Number(countResult[0]?.count || 0);

    const searchResults: SearchResult[] = results.map((row) => ({
      id: row.public_id,
      score: Math.round(row.similarity * 100) / 100,
      source: 'semantic' as const,
      perpetrator: {
        name: row.perpetrator_name,
      },
      fraud_type: row.fraud_type.toLowerCase(),
      country: row.location_country || undefined,
      incident_date: row.incident_date?.toISOString().split('T')[0],
    }));

    return { results: searchResults, total };
  } catch (error) {
    console.error('[Search] Semantic search error:', error);
    // Fall back to fuzzy search on error
    return fuzzySearch(query, filters, limit, offset, sort, order);
  }
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
    const auth = await optionalAuth(request);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = {
      q: searchParams.get('q') || '',
      mode: searchParams.get('mode') as SearchMode || 'auto',
      fields: searchParams.get('fields') ?? undefined,
      country: searchParams.get('country') ?? undefined,
      fraud_type: searchParams.get('fraud_type') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      date_from: searchParams.get('date_from') ?? undefined,
      date_to: searchParams.get('date_to') ?? undefined,
      amount_min: searchParams.get('amount_min') ?? undefined,
      amount_max: searchParams.get('amount_max') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      offset: searchParams.get('offset') ?? undefined,
      sort: searchParams.get('sort') ?? undefined,
      order: searchParams.get('order') ?? undefined,
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

    const { q, mode, fields, country, fraud_type, date_from, date_to, amount_min, amount_max, limit, offset, sort, order } = parsed.data;

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

    if (amount_min !== undefined || amount_max !== undefined) {
      filters.financialLossAmount = {};
      if (amount_min !== undefined) {
        (filters.financialLossAmount as Record<string, number>).gte = amount_min;
      }
      if (amount_max !== undefined) {
        (filters.financialLossAmount as Record<string, number>).lte = amount_max;
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
      const exactResults = await exactSearch(q, searchTypes, filters, limit, offset, sort, order);

      if (exactResults.total > 0) {
        results = exactResults.results;
        total = exactResults.total;
      } else {
        // Fall back to fuzzy search
        const fuzzyResults = await fuzzySearch(q, filters, limit, offset, sort, order);
        results = fuzzyResults.results;
        total = fuzzyResults.total;
      }
    } else if (mode === 'exact') {
      const exactResults = await exactSearch(q, searchTypes, filters, limit, offset, sort, order);
      results = exactResults.results;
      total = exactResults.total;
    } else if (mode === 'fuzzy') {
      const fuzzyResults = await fuzzySearch(q, filters, limit, offset, sort, order);
      results = fuzzyResults.results;
      total = fuzzyResults.total;
    } else if (mode === 'semantic') {
      const semanticResults = await semanticSearch(q, filters, limit, offset, sort, order);
      results = semanticResults.results;
      total = semanticResults.total;
    }

    // Determine user role for masking
    const isAdmin = auth.scopes?.some(s => s.startsWith('admin:')) || false;
    const userRole = isAdmin ? 'ADMIN' : (auth.user ? (auth.user.role || 'STANDARD') : 'BASIC');

    // Apply masking based on user role
    results = results.map((result) => ({
      ...result,
      perpetrator: {
        name: maskField(result.perpetrator.name, 'name', userRole),
        phone: maskField(result.perpetrator.phone, 'phone', userRole),
        email: maskField(result.perpetrator.email, 'email', userRole),
      },
    }));

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

    // Calculate pagination info
    const page = Math.floor(offset / limit) + 1;
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      total,
      results,
      facets,
      pagination: {
        page,
        pages,
        total_pages: pages, // Added for frontend compatibility
        total,
        limit,
        offset,
      },
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
