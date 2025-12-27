/**
 * Database Schema Validator
 *
 * Validates that the production database schema matches what Prisma expects.
 * This prevents runtime errors from missing columns/tables after deployments.
 *
 * Best Practices (from Prisma docs):
 * - Always use `prisma migrate deploy` in production
 * - Run migrations at container start, not during Docker build
 * - Validate schema on app startup before accepting traffic
 */

import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';

export interface SchemaValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  checkedAt: string;
}

/**
 * Critical columns that MUST exist for the app to function.
 * Add new required columns here when adding migrations.
 */
const REQUIRED_SCHEMA = {
  users: [
    'id',
    'email',
    'password_hash',
    'name',
    'role',
    'is_active',
    'created_at',
    'updated_at',
    // 2FA columns (added in 20251226_add_totp_2fa migration)
    'totp_secret',
    'totp_enabled',
    'totp_verified_at',
    'backup_codes',
  ],
  reports: ['id', 'status', 'fraud_type', 'summary', 'reporter_id', 'created_at'],
  refresh_tokens: ['id', 'user_id', 'token', 'expires_at'],
  audit_logs: ['id', 'action', 'entity_type', 'entity_id', 'created_at'],
} as const;

/**
 * Check if a column exists in a table using raw SQL.
 */
async function columnExists(table: string, column: string): Promise<boolean> {
  try {
    const result = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = ${table}
        AND column_name = ${column}
      ) as exists
    `;
    return result[0]?.exists ?? false;
  } catch {
    return false;
  }
}

/**
 * Check if a table exists in the database.
 */
async function tableExists(table: string): Promise<boolean> {
  try {
    const result = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = ${table}
      ) as exists
    `;
    return result[0]?.exists ?? false;
  } catch {
    return false;
  }
}

/**
 * Validates the database schema matches Prisma expectations.
 *
 * This should be called:
 * 1. On app startup (before accepting traffic)
 * 2. In health check endpoints
 *
 * @returns Validation result with errors and warnings
 */
export async function validateDatabaseSchema(): Promise<SchemaValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // First, check database connectivity
    await prisma.$connect();

    // Check each required table and its columns
    for (const [table, columns] of Object.entries(REQUIRED_SCHEMA)) {
      const exists = await tableExists(table);

      if (!exists) {
        errors.push(`Missing table: ${table}`);
        continue;
      }

      for (const column of columns) {
        const colExists = await columnExists(table, column);
        if (!colExists) {
          errors.push(`Missing column: ${table}.${column}`);
        }
      }
    }

    // Additional validation: try a simple query on each critical model
    try {
      await prisma.user.findFirst({ take: 1, select: { id: true } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        errors.push(`User model query failed: ${e.code} - ${e.message}`);
      }
    }

    try {
      await prisma.report.findFirst({ take: 1, select: { id: true } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        errors.push(`Report model query failed: ${e.code} - ${e.message}`);
      }
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    errors.push(`Database connection failed: ${message}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Validates schema and throws if invalid.
 * Use this on app startup to prevent serving traffic with broken schema.
 */
export async function assertValidSchema(): Promise<void> {
  const result = await validateDatabaseSchema();

  if (!result.valid) {
    const errorMessage = [
      '='.repeat(60),
      'CRITICAL: Database schema validation failed!',
      '='.repeat(60),
      '',
      'The following schema issues were detected:',
      ...result.errors.map((e) => `  - ${e}`),
      '',
      'To fix this, run database migrations:',
      '  docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d scamnemesis',
      '',
      'Or apply pending Prisma migrations:',
      '  npx prisma migrate deploy',
      '',
      '='.repeat(60),
    ].join('\n');

    console.error(errorMessage);

    // In production, we log but don't crash to allow health checks to report the issue
    if (process.env.NODE_ENV === 'production') {
      console.error('[SCHEMA] App starting with schema errors - health checks will fail');
    } else {
      throw new Error(`Schema validation failed: ${result.errors.join(', ')}`);
    }
  } else {
    console.log('[SCHEMA] Database schema validation passed');
  }
}

/**
 * Quick health check for database - used by /api/v1/health endpoint.
 * Returns false if schema is invalid.
 */
export async function isDatabaseHealthy(): Promise<{
  healthy: boolean;
  schemaValid: boolean;
  message: string;
}> {
  try {
    // Quick connectivity check
    await prisma.$queryRaw`SELECT 1`;

    // Full schema validation (cached for performance in production)
    const schema = await validateDatabaseSchema();

    return {
      healthy: schema.valid,
      schemaValid: schema.valid,
      message: schema.valid
        ? 'Database healthy'
        : `Schema errors: ${schema.errors.slice(0, 3).join(', ')}${schema.errors.length > 3 ? '...' : ''}`,
    };
  } catch (e) {
    return {
      healthy: false,
      schemaValid: false,
      message: `Database error: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}
