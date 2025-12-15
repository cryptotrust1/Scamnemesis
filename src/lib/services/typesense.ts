/**
 * Typesense Search Service for ScamNemesis
 * Handles full-text search indexing and queries
 */

import Typesense from 'typesense';
import { Client as TypesenseClient } from 'typesense';

// Typesense configuration
const TYPESENSE_HOST = process.env.TYPESENSE_HOST || 'localhost';
const TYPESENSE_PORT = parseInt(process.env.TYPESENSE_PORT || '8108');
const TYPESENSE_PROTOCOL = process.env.TYPESENSE_PROTOCOL || 'http';
const TYPESENSE_API_KEY = process.env.TYPESENSE_API_KEY;

// Warn about missing Typesense API key
if (!TYPESENSE_API_KEY) {
  if (process.env.NODE_ENV === 'production') {
    console.error('[Typesense] TYPESENSE_API_KEY must be set in production!');
  } else {
    console.warn('[Typesense] TYPESENSE_API_KEY not set. Using development fallback.');
  }
}

// Collection names
export const COLLECTIONS = {
  REPORTS: 'reports',
  PERPETRATORS: 'perpetrators',
} as const;

// Initialize Typesense client
let client: TypesenseClient | null = null;

export function getTypesenseClient(): TypesenseClient {
  if (!client) {
    client = new Typesense.Client({
      nodes: [
        {
          host: TYPESENSE_HOST,
          port: TYPESENSE_PORT,
          protocol: TYPESENSE_PROTOCOL,
        },
      ],
      apiKey: TYPESENSE_API_KEY || 'xyz', // Development fallback
      connectionTimeoutSeconds: 10,
    });
  }
  return client;
}

/**
 * Report document schema for Typesense
 */
export interface ReportDocument {
  id: string;
  public_id: string;
  title: string;
  summary: string;
  description: string;
  fraud_type: string;
  severity: string;
  status: string;
  country: string;
  city: string;
  financial_loss_amount: number;
  financial_loss_currency: string;
  perpetrator_name: string;
  perpetrator_emails: string[];
  perpetrator_phones: string[];
  perpetrator_ibans: string[];
  perpetrator_wallets: string[];
  created_at: number; // Unix timestamp
  published_at: number;
  reporter_count: number;
  similar_count: number;
}

/**
 * Perpetrator document schema for Typesense
 */
export interface PerpetratorDocument {
  id: string;
  full_name: string;
  nickname: string;
  emails: string[];
  phones: string[];
  ibans: string[];
  wallets: string[];
  report_count: number;
  total_loss_amount: number;
  countries: string[];
  fraud_types: string[];
  first_report_at: number;
  last_report_at: number;
}

/**
 * Collection schemas
 */
const reportsSchema = {
  name: COLLECTIONS.REPORTS,
  fields: [
    { name: 'public_id', type: 'string' as const },
    { name: 'title', type: 'string' as const },
    { name: 'summary', type: 'string' as const },
    { name: 'description', type: 'string' as const },
    { name: 'fraud_type', type: 'string' as const, facet: true },
    { name: 'severity', type: 'string' as const, facet: true },
    { name: 'status', type: 'string' as const, facet: true },
    { name: 'country', type: 'string' as const, facet: true },
    { name: 'city', type: 'string' as const, facet: true },
    { name: 'financial_loss_amount', type: 'float' as const },
    { name: 'financial_loss_currency', type: 'string' as const },
    { name: 'perpetrator_name', type: 'string' as const },
    { name: 'perpetrator_emails', type: 'string[]' as const },
    { name: 'perpetrator_phones', type: 'string[]' as const },
    { name: 'perpetrator_ibans', type: 'string[]' as const },
    { name: 'perpetrator_wallets', type: 'string[]' as const },
    { name: 'created_at', type: 'int64' as const },
    { name: 'published_at', type: 'int64' as const },
    { name: 'reporter_count', type: 'int32' as const },
    { name: 'similar_count', type: 'int32' as const },
  ],
  default_sorting_field: 'published_at',
};

const perpetratorsSchema = {
  name: COLLECTIONS.PERPETRATORS,
  fields: [
    { name: 'full_name', type: 'string' as const },
    { name: 'nickname', type: 'string' as const },
    { name: 'emails', type: 'string[]' as const },
    { name: 'phones', type: 'string[]' as const },
    { name: 'ibans', type: 'string[]' as const },
    { name: 'wallets', type: 'string[]' as const },
    { name: 'report_count', type: 'int32' as const },
    { name: 'total_loss_amount', type: 'float' as const },
    { name: 'countries', type: 'string[]' as const, facet: true },
    { name: 'fraud_types', type: 'string[]' as const, facet: true },
    { name: 'first_report_at', type: 'int64' as const },
    { name: 'last_report_at', type: 'int64' as const },
  ],
  default_sorting_field: 'report_count',
};

/**
 * Initialize collections
 */
export async function initializeCollections(): Promise<void> {
  const typesense = getTypesenseClient();

  // Create reports collection if not exists
  try {
    await typesense.collections(COLLECTIONS.REPORTS).retrieve();
    console.log(`Collection ${COLLECTIONS.REPORTS} already exists`);
  } catch {
    await typesense.collections().create(reportsSchema);
    console.log(`Collection ${COLLECTIONS.REPORTS} created`);
  }

  // Create perpetrators collection if not exists
  try {
    await typesense.collections(COLLECTIONS.PERPETRATORS).retrieve();
    console.log(`Collection ${COLLECTIONS.PERPETRATORS} already exists`);
  } catch {
    await typesense.collections().create(perpetratorsSchema);
    console.log(`Collection ${COLLECTIONS.PERPETRATORS} created`);
  }
}

/**
 * Index a report document
 */
export async function indexReport(report: ReportDocument): Promise<void> {
  const typesense = getTypesenseClient();
  await typesense.collections(COLLECTIONS.REPORTS).documents().upsert(report);
}

/**
 * Index multiple reports
 */
export async function indexReports(reports: ReportDocument[]): Promise<void> {
  const typesense = getTypesenseClient();
  await typesense.collections(COLLECTIONS.REPORTS).documents().import(reports, { action: 'upsert' });
}

/**
 * Delete a report from index
 */
export async function deleteReport(id: string): Promise<void> {
  const typesense = getTypesenseClient();
  await typesense.collections(COLLECTIONS.REPORTS).documents(id).delete();
}

/**
 * Index a perpetrator document
 */
export async function indexPerpetrator(perpetrator: PerpetratorDocument): Promise<void> {
  const typesense = getTypesenseClient();
  await typesense.collections(COLLECTIONS.PERPETRATORS).documents().upsert(perpetrator);
}

/**
 * Search reports
 */
export interface SearchOptions {
  query: string;
  page?: number;
  perPage?: number;
  filters?: {
    fraudType?: string;
    country?: string;
    status?: string;
    severity?: string;
    dateFrom?: Date;
    dateTo?: Date;
    amountMin?: number;
    amountMax?: number;
  };
  sortBy?: string;
}

export interface SearchResult<T> {
  hits: T[];
  found: number;
  page: number;
  totalPages: number;
  facets?: Record<string, Array<{ value: string; count: number }>>;
}

export async function searchReports(options: SearchOptions): Promise<SearchResult<ReportDocument>> {
  const typesense = getTypesenseClient();

  const searchParams: Record<string, unknown> = {
    q: options.query || '*',
    query_by: 'title,summary,description,perpetrator_name,perpetrator_emails,perpetrator_phones,perpetrator_ibans,perpetrator_wallets',
    page: options.page || 1,
    per_page: options.perPage || 20,
    facet_by: 'fraud_type,country,status,severity',
  };

  // Build filter string
  const filters: string[] = [];

  if (options.filters?.fraudType) {
    filters.push(`fraud_type:=${options.filters.fraudType}`);
  }
  if (options.filters?.country) {
    filters.push(`country:=${options.filters.country}`);
  }
  if (options.filters?.status) {
    filters.push(`status:=${options.filters.status}`);
  }
  if (options.filters?.severity) {
    filters.push(`severity:=${options.filters.severity}`);
  }
  if (options.filters?.dateFrom) {
    filters.push(`published_at:>=${Math.floor(options.filters.dateFrom.getTime() / 1000)}`);
  }
  if (options.filters?.dateTo) {
    filters.push(`published_at:<=${Math.floor(options.filters.dateTo.getTime() / 1000)}`);
  }
  if (options.filters?.amountMin !== undefined) {
    filters.push(`financial_loss_amount:>=${options.filters.amountMin}`);
  }
  if (options.filters?.amountMax !== undefined) {
    filters.push(`financial_loss_amount:<=${options.filters.amountMax}`);
  }

  if (filters.length > 0) {
    searchParams.filter_by = filters.join(' && ');
  }

  // Sort
  if (options.sortBy) {
    const sortMap: Record<string, string> = {
      'date-desc': 'published_at:desc',
      'date-asc': 'published_at:asc',
      'amount-desc': 'financial_loss_amount:desc',
      'amount-asc': 'financial_loss_amount:asc',
      'relevance': '_text_match:desc',
    };
    searchParams.sort_by = sortMap[options.sortBy] || 'published_at:desc';
  }

  const result = await typesense.collections(COLLECTIONS.REPORTS).documents().search(searchParams);

  return {
    hits: (result.hits || []).map((hit) => hit.document as ReportDocument),
    found: result.found || 0,
    page: options.page || 1,
    totalPages: Math.ceil((result.found || 0) / (options.perPage || 20)),
    facets: result.facet_counts?.reduce((acc, facet) => {
      acc[facet.field_name] = facet.counts.map((c) => ({
        value: c.value,
        count: c.count,
      }));
      return acc;
    }, {} as Record<string, Array<{ value: string; count: number }>>),
  };
}

/**
 * Search perpetrators
 */
export async function searchPerpetrators(options: SearchOptions): Promise<SearchResult<PerpetratorDocument>> {
  const typesense = getTypesenseClient();

  const searchParams: Record<string, unknown> = {
    q: options.query || '*',
    query_by: 'full_name,nickname,emails,phones,ibans,wallets',
    page: options.page || 1,
    per_page: options.perPage || 20,
    facet_by: 'countries,fraud_types',
  };

  const result = await typesense.collections(COLLECTIONS.PERPETRATORS).documents().search(searchParams);

  return {
    hits: (result.hits || []).map((hit) => hit.document as PerpetratorDocument),
    found: result.found || 0,
    page: options.page || 1,
    totalPages: Math.ceil((result.found || 0) / (options.perPage || 20)),
    facets: result.facet_counts?.reduce((acc, facet) => {
      acc[facet.field_name] = facet.counts.map((c) => ({
        value: c.value,
        count: c.count,
      }));
      return acc;
    }, {} as Record<string, Array<{ value: string; count: number }>>),
  };
}

/**
 * Get collection stats
 */
export async function getCollectionStats(): Promise<{
  reports: { count: number };
  perpetrators: { count: number };
}> {
  const typesense = getTypesenseClient();

  const [reportsInfo, perpetratorsInfo] = await Promise.all([
    typesense.collections(COLLECTIONS.REPORTS).retrieve(),
    typesense.collections(COLLECTIONS.PERPETRATORS).retrieve(),
  ]);

  return {
    reports: { count: reportsInfo.num_documents || 0 },
    perpetrators: { count: perpetratorsInfo.num_documents || 0 },
  };
}

/**
 * Full resync from database
 */
export async function resyncFromDatabase(
  getReports: () => Promise<ReportDocument[]>,
  getPerpetrators: () => Promise<PerpetratorDocument[]>
): Promise<{ reports: number; perpetrators: number }> {
  const typesense = getTypesenseClient();

  // Delete and recreate collections
  try {
    await typesense.collections(COLLECTIONS.REPORTS).delete();
  } catch {
    // Collection might not exist
  }
  try {
    await typesense.collections(COLLECTIONS.PERPETRATORS).delete();
  } catch {
    // Collection might not exist
  }

  // Recreate collections
  await initializeCollections();

  // Import data
  const reports = await getReports();
  const perpetrators = await getPerpetrators();

  if (reports.length > 0) {
    await indexReports(reports);
  }

  if (perpetrators.length > 0) {
    await typesense.collections(COLLECTIONS.PERPETRATORS).documents().import(perpetrators, { action: 'create' });
  }

  return {
    reports: reports.length,
    perpetrators: perpetrators.length,
  };
}

export const typesenseService = {
  getClient: getTypesenseClient,
  initializeCollections,
  indexReport,
  indexReports,
  deleteReport,
  indexPerpetrator,
  searchReports,
  searchPerpetrators,
  getCollectionStats,
  resyncFromDatabase,
};

export default typesenseService;
