/**
 * Detailed Health Check API Route
 *
 * GET /api/v1/health/detailed - Comprehensive system health check
 *
 * Checks:
 * - Database connection
 * - Required tables existence
 * - Redis connection (if configured)
 * - Email service configuration (Resend API key)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Required tables for the application to function
const REQUIRED_TABLES = [
  'users',
  'accounts',
  'sessions',
  'reports',
  'perpetrators',
  'evidence',
  'digital_footprints',
  'financial_info',
  'crypto_info',
];

interface TableStatus {
  [key: string]: boolean | string;
}

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: {
      status: 'ok' | 'error';
      latencyMs?: number;
      error?: string;
    };
    tables: {
      status: 'ok' | 'missing' | 'error';
      details: TableStatus;
      missingTables?: string[];
    };
    redis: {
      status: 'ok' | 'error' | 'not_configured';
      error?: string;
    };
    email: {
      status: 'ok' | 'not_configured';
      warning?: string;
    };
    auth: {
      status: 'ok' | 'error';
      jwt_secret?: boolean;
      jwt_refresh_secret?: boolean;
      auth_secret?: boolean;
      error?: string;
    };
  };
  version: string;
  environment: string;
}

export async function GET() {
  const startTime = Date.now();
  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'ok' },
      tables: { status: 'ok', details: {} },
      redis: { status: 'not_configured' },
      email: { status: 'ok' },
      auth: { status: 'ok' },
    },
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };

  // Check database connection
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    result.checks.database.latencyMs = Date.now() - dbStart;
  } catch (error) {
    result.checks.database.status = 'error';
    result.checks.database.error = error instanceof Error ? error.message : 'Unknown error';
    result.status = 'unhealthy';
  }

  // Check required tables
  if (result.checks.database.status === 'ok') {
    try {
      const tableCheckQuery = `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = ANY($1)
      `;

      const existingTables = await prisma.$queryRawUnsafe<{ table_name: string }[]>(
        tableCheckQuery,
        REQUIRED_TABLES
      );

      const existingTableNames = new Set(existingTables.map(t => t.table_name));
      const missingTables: string[] = [];

      for (const table of REQUIRED_TABLES) {
        const exists = existingTableNames.has(table);
        result.checks.tables.details[table] = exists;
        if (!exists) {
          missingTables.push(table);
        }
      }

      if (missingTables.length > 0) {
        result.checks.tables.status = 'missing';
        result.checks.tables.missingTables = missingTables;
        result.status = 'unhealthy';
      }
    } catch (error) {
      result.checks.tables.status = 'error';
      result.checks.tables.details = { error: error instanceof Error ? error.message : 'Unknown error' };
      result.status = 'unhealthy';
    }
  }

  // Check Redis connection
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    try {
      // Dynamic import to avoid issues if redis is not installed
      const Redis = (await import('ioredis')).default;
      const redis = new Redis(redisUrl, {
        connectTimeout: 3000,
        lazyConnect: true,
      });

      await redis.connect();
      await redis.ping();
      result.checks.redis.status = 'ok';
      await redis.quit();
    } catch (error) {
      result.checks.redis.status = 'error';
      result.checks.redis.error = error instanceof Error ? error.message : 'Unknown error';
      if (result.status === 'healthy') {
        result.status = 'degraded';
      }
    }
  }

  // Check Email Service configuration
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey || resendApiKey.trim() === '') {
    result.checks.email.status = 'not_configured';
    result.checks.email.warning = 'RESEND_API_KEY not set. Confirmation emails will not be sent after report submission.';
    // Email is not critical, so mark as degraded instead of unhealthy
    if (result.status === 'healthy') {
      result.status = 'degraded';
    }
  }

  // Check Authentication configuration (CRITICAL)
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  const authSecret = process.env.AUTH_SECRET;

  result.checks.auth.jwt_secret = !!(jwtSecret && jwtSecret.length >= 32);
  result.checks.auth.jwt_refresh_secret = !!(jwtRefreshSecret && jwtRefreshSecret.length >= 32);
  result.checks.auth.auth_secret = !!(authSecret && authSecret.length >= 32);

  const missingSecrets: string[] = [];
  if (!result.checks.auth.jwt_secret) missingSecrets.push('JWT_SECRET');
  if (!result.checks.auth.jwt_refresh_secret) missingSecrets.push('JWT_REFRESH_SECRET');
  if (!result.checks.auth.auth_secret) missingSecrets.push('AUTH_SECRET');

  if (missingSecrets.length > 0) {
    result.checks.auth.status = 'error';
    result.checks.auth.error = `Missing or invalid secrets (must be 32+ chars): ${missingSecrets.join(', ')}`;
    result.status = 'unhealthy';
  }

  // Determine HTTP status code
  const httpStatus = result.status === 'healthy' ? 200 : result.status === 'degraded' ? 200 : 503;

  return NextResponse.json(result, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Response-Time': `${Date.now() - startTime}ms`,
    },
  });
}
