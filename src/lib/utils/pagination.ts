/**
 * Pagination Utilities
 * Provides safe parsing and validation for pagination parameters
 */

import { z } from 'zod';

/**
 * Default pagination values
 */
export const PAGINATION_DEFAULTS = {
  page: 1,
  pageSize: 10,
  maxPageSize: 100,
  maxPage: 10000,
} as const;

/**
 * Pagination schema for validation
 */
export const PaginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => {
      const parsed = parseInt(val || '1', 10);
      if (isNaN(parsed) || parsed < 1) return PAGINATION_DEFAULTS.page;
      return Math.min(parsed, PAGINATION_DEFAULTS.maxPage);
    }),
  pageSize: z
    .string()
    .optional()
    .transform((val) => {
      const parsed = parseInt(val || String(PAGINATION_DEFAULTS.pageSize), 10);
      if (isNaN(parsed) || parsed < 1) return PAGINATION_DEFAULTS.pageSize;
      return Math.min(parsed, PAGINATION_DEFAULTS.maxPageSize);
    }),
});

/**
 * Parse and validate pagination parameters from URL search params
 * Returns safe, bounded values to prevent DoS attacks
 */
export function parsePagination(searchParams: URLSearchParams): {
  page: number;
  pageSize: number;
  skip: number;
} {
  const result = PaginationSchema.safeParse({
    page: searchParams.get('page') ?? undefined,
    pageSize: searchParams.get('page_size') ?? searchParams.get('pageSize') ?? undefined,
  });

  const page = result.success ? result.data.page : PAGINATION_DEFAULTS.page;
  const pageSize = result.success ? result.data.pageSize : PAGINATION_DEFAULTS.pageSize;

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
  };
}

/**
 * Parse limit parameter with safe bounds
 */
export function parseLimit(
  value: string | null,
  defaultLimit: number = 20,
  maxLimit: number = 100
): number {
  if (!value) return defaultLimit;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 1) return defaultLimit;
  return Math.min(parsed, maxLimit);
}

/**
 * Parse offset parameter with safe bounds
 */
export function parseOffset(value: string | null, maxOffset: number = 100000): number {
  if (!value) return 0;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 0) return 0;
  return Math.min(parsed, maxOffset);
}

/**
 * Build pagination response metadata
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  pageSize: number
): {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
} {
  const totalPages = Math.ceil(total / pageSize);
  return {
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
