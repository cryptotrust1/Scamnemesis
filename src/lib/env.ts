/**
 * Environment Configuration Validation
 *
 * Validates all environment variables at startup using Zod
 * Prevents the application from starting with invalid configuration
 */

import { z } from 'zod';

// ===========================================================================
// SCHEMA DEFINITION
// ===========================================================================

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),

  // Database
  DATABASE_URL: z.string().url().min(1, 'DATABASE_URL is required'),

  // Redis
  REDIS_URL: z.string().url().min(1, 'REDIS_URL is required'),
  REDIS_PASSWORD: z.string().optional(),

  // S3/MinIO
  S3_ENDPOINT: z.string().url().min(1, 'S3_ENDPOINT is required'),
  S3_BUCKET: z.string().min(1, 'S3_BUCKET is required'),
  S3_REGION: z.string().default('us-east-1'),
  S3_ACCESS_KEY: z.string().min(1, 'S3_ACCESS_KEY is required'),
  S3_SECRET_KEY: z.string().min(1, 'S3_SECRET_KEY is required'),

  // Typesense
  TYPESENSE_HOST: z.string().min(1, 'TYPESENSE_HOST is required'),
  TYPESENSE_PORT: z.string().default('8108').transform(Number),
  TYPESENSE_PROTOCOL: z.enum(['http', 'https']).default('http'),
  TYPESENSE_API_KEY: z.string().min(1, 'TYPESENSE_API_KEY is required'),

  // ML Service
  ML_SERVICE_URL: z.string().url().min(1, 'ML_SERVICE_URL is required'),

  // ClamAV
  CLAMAV_HOST: z.string().optional(),
  CLAMAV_PORT: z.string().optional().transform((val) => val ? Number(val) : undefined),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // API
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  API_VERSION: z.string().default('v1'),
  ALLOWED_ORIGINS: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('60000').transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),

  // File Upload
  MAX_FILE_SIZE_MB: z.string().default('10').transform(Number),
  ALLOWED_IMAGE_FORMATS: z.string().default('jpg,jpeg,png,gif,webp'),

  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional().transform((val) => val ? Number(val) : undefined),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),

  // Duplicate Detection
  DUPLICATE_THRESHOLD_CONFIG: z.enum(['default', 'strict', 'relaxed']).default('default'),
  ENABLE_EXACT_MATCH: z.string().default('true').transform((val) => val === 'true'),
  ENABLE_FUZZY_MATCH: z.string().default('true').transform((val) => val === 'true'),
  ENABLE_VECTOR_MATCH: z.string().default('true').transform((val) => val === 'true'),
  ENABLE_IMAGE_MATCH: z.string().default('true').transform((val) => val === 'true'),

  // Background Jobs
  WORKER_CONCURRENCY: z.string().default('5').transform(Number),
  JOB_TIMEOUT_MS: z.string().default('30000').transform(Number),

  // Monitoring (optional)
  SENTRY_DSN: z.string().url().optional().or(z.literal('')),
  NEW_RELIC_LICENSE_KEY: z.string().optional(),

  // Feature Flags
  ENABLE_VIRUS_SCAN: z.string().default('true').transform((val) => val === 'true'),
  ENABLE_FACE_DETECTION: z.string().default('false').transform((val) => val === 'true'),
  ENABLE_OCR: z.string().default('false').transform((val) => val === 'true'),
  ENABLE_WEB_CRAWLERS: z.string().default('false').transform((val) => val === 'true'),

  // Logging
  LOG_LEVEL: z.enum(['DEBUG', 'INFO', 'WARNING', 'ERROR']).default('INFO'),
});

// ===========================================================================
// TYPE INFERENCE
// ===========================================================================

export type Env = z.infer<typeof envSchema>;

// ===========================================================================
// VALIDATION FUNCTION
// ===========================================================================

let cachedEnv: Env | null = null;

/**
 * Validates and returns typed environment variables
 * Throws an error if validation fails
 * Results are cached after first call
 */
export function validateEnv(): Env {
  // Return cached result if available
  if (cachedEnv) {
    return cachedEnv;
  }

  try {
    // Validate environment variables
    const parsed = envSchema.parse(process.env);
    cachedEnv = parsed;

    // Log successful validation in development
    if (parsed.NODE_ENV === 'development') {
      console.log('✅ Environment variables validated successfully');
    }

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      console.error(error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      })));

      throw new Error(
        `Environment validation failed:\n${error.errors
          .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
          .join('\n')}`
      );
    }
    throw error;
  }
}

/**
 * Get validated environment variables
 * Use this function throughout your application
 */
export function getEnv(): Env {
  return validateEnv();
}

/**
 * Reset the environment cache
 * This should only be used in tests
 */
export function resetEnvCache(): void {
  cachedEnv = null;
}

// ===========================================================================
// HELPERS
// ===========================================================================

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === 'development';
}

/**
 * Check if running in test
 */
export function isTest(): boolean {
  return getEnv().NODE_ENV === 'test';
}

/**
 * Get allowed origins as array
 */
export function getAllowedOrigins(): string[] {
  const env = getEnv();
  if (!env.ALLOWED_ORIGINS) {
    return ['http://localhost:3000'];
  }
  return env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim());
}

/**
 * Get allowed image formats as array
 */
export function getAllowedImageFormats(): string[] {
  const env = getEnv();
  return env.ALLOWED_IMAGE_FORMATS.split(',').map((format) => format.trim());
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: 'virus_scan' | 'face_detection' | 'ocr' | 'web_crawlers'): boolean {
  const env = getEnv();
  switch (feature) {
    case 'virus_scan':
      return env.ENABLE_VIRUS_SCAN;
    case 'face_detection':
      return env.ENABLE_FACE_DETECTION;
    case 'ocr':
      return env.ENABLE_OCR;
    case 'web_crawlers':
      return env.ENABLE_WEB_CRAWLERS;
    default:
      return false;
  }
}

// ===========================================================================
// AUTO-VALIDATE ON IMPORT (in non-test environments)
// ===========================================================================

if (process.env.NODE_ENV !== 'test' && process.env.SKIP_ENV_VALIDATION !== 'true') {
  validateEnv();
}
