/**
 * Tests for Environment Validation
 */

import { validateEnv, getEnv, isProduction, isDevelopment, isTest, getAllowedOrigins, getAllowedImageFormats, isFeatureEnabled, resetEnvCache } from '../env';

describe('Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Clear cache
    resetEnvCache();
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('validateEnv', () => {
    it('should validate correct environment variables', () => {
      process.env = {
        ...originalEnv,
        NODE_ENV: 'test',
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        REDIS_URL: 'redis://localhost:6379',
        S3_ENDPOINT: 'http://localhost:9000',
        S3_BUCKET: 'test-bucket',
        S3_ACCESS_KEY: 'minioadmin',
        S3_SECRET_KEY: 'minioadmin',
        TYPESENSE_HOST: 'localhost',
        TYPESENSE_API_KEY: 'test-key',
        ML_SERVICE_URL: 'http://localhost:8000',
        JWT_SECRET: 'test-jwt-secret-at-least-32-characters-long',
        JWT_REFRESH_SECRET: 'test-refresh-secret-at-least-32-characters-long',
      };

      expect(() => validateEnv()).not.toThrow();
    });

    it('should throw error if DATABASE_URL is missing', () => {
      process.env = {
        ...originalEnv,
        DATABASE_URL: '',
      };

      expect(() => validateEnv()).toThrow('DATABASE_URL');
    });

    it('should throw error if JWT_SECRET is too short', () => {
      process.env = {
        ...originalEnv,
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        REDIS_URL: 'redis://localhost:6379',
        S3_ENDPOINT: 'http://localhost:9000',
        S3_BUCKET: 'test',
        S3_ACCESS_KEY: 'key',
        S3_SECRET_KEY: 'secret',
        TYPESENSE_HOST: 'localhost',
        TYPESENSE_API_KEY: 'key',
        ML_SERVICE_URL: 'http://localhost:8000',
        JWT_SECRET: 'short',
        JWT_REFRESH_SECRET: 'test-refresh-secret-at-least-32-characters-long',
      };

      expect(() => validateEnv()).toThrow('JWT_SECRET');
    });

    it('should apply default values', () => {
      process.env = {
        ...originalEnv,
        NODE_ENV: 'test',
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        REDIS_URL: 'redis://localhost:6379',
        S3_ENDPOINT: 'http://localhost:9000',
        S3_BUCKET: 'test',
        S3_ACCESS_KEY: 'key',
        S3_SECRET_KEY: 'secret',
        TYPESENSE_HOST: 'localhost',
        TYPESENSE_API_KEY: 'key',
        ML_SERVICE_URL: 'http://localhost:8000',
        JWT_SECRET: 'test-jwt-secret-at-least-32-characters-long',
        JWT_REFRESH_SECRET: 'test-refresh-secret-at-least-32-characters-long',
      };

      const env = validateEnv();

      expect(env.PORT).toBe(3000);
      expect(env.S3_REGION).toBe('us-east-1');
      expect(env.TYPESENSE_PORT).toBe(8108);
      expect(env.TYPESENSE_PROTOCOL).toBe('http');
      expect(env.JWT_EXPIRES_IN).toBe('15m');
      expect(env.JWT_REFRESH_EXPIRES_IN).toBe('7d');
      expect(env.DUPLICATE_THRESHOLD_CONFIG).toBe('default');
    });

    it('should transform string to number', () => {
      process.env = {
        ...originalEnv,
        NODE_ENV: 'test',
        PORT: '4000',
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        REDIS_URL: 'redis://localhost:6379',
        S3_ENDPOINT: 'http://localhost:9000',
        S3_BUCKET: 'test',
        S3_ACCESS_KEY: 'key',
        S3_SECRET_KEY: 'secret',
        TYPESENSE_HOST: 'localhost',
        TYPESENSE_PORT: '9108',
        TYPESENSE_API_KEY: 'key',
        ML_SERVICE_URL: 'http://localhost:8000',
        JWT_SECRET: 'test-jwt-secret-at-least-32-characters-long',
        JWT_REFRESH_SECRET: 'test-refresh-secret-at-least-32-characters-long',
        RATE_LIMIT_MAX_REQUESTS: '200',
      };

      const env = validateEnv();

      expect(env.PORT).toBe(4000);
      expect(env.TYPESENSE_PORT).toBe(9108);
      expect(env.RATE_LIMIT_MAX_REQUESTS).toBe(200);
    });

    it('should transform string to boolean', () => {
      process.env = {
        ...originalEnv,
        NODE_ENV: 'test',
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        REDIS_URL: 'redis://localhost:6379',
        S3_ENDPOINT: 'http://localhost:9000',
        S3_BUCKET: 'test',
        S3_ACCESS_KEY: 'key',
        S3_SECRET_KEY: 'secret',
        TYPESENSE_HOST: 'localhost',
        TYPESENSE_API_KEY: 'key',
        ML_SERVICE_URL: 'http://localhost:8000',
        JWT_SECRET: 'test-jwt-secret-at-least-32-characters-long',
        JWT_REFRESH_SECRET: 'test-refresh-secret-at-least-32-characters-long',
        ENABLE_VIRUS_SCAN: 'true',
        ENABLE_FACE_DETECTION: 'false',
        ENABLE_EXACT_MATCH: 'true',
      };

      const env = validateEnv();

      expect(env.ENABLE_VIRUS_SCAN).toBe(true);
      expect(env.ENABLE_FACE_DETECTION).toBe(false);
      expect(env.ENABLE_EXACT_MATCH).toBe(true);
    });
  });

  describe('Helper functions', () => {
    beforeEach(() => {
      resetEnvCache();
      process.env = {
        ...originalEnv,
        NODE_ENV: 'test',
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        REDIS_URL: 'redis://localhost:6379',
        S3_ENDPOINT: 'http://localhost:9000',
        S3_BUCKET: 'test',
        S3_ACCESS_KEY: 'key',
        S3_SECRET_KEY: 'secret',
        TYPESENSE_HOST: 'localhost',
        TYPESENSE_API_KEY: 'key',
        ML_SERVICE_URL: 'http://localhost:8000',
        JWT_SECRET: 'test-jwt-secret-at-least-32-characters-long',
        JWT_REFRESH_SECRET: 'test-refresh-secret-at-least-32-characters-long',
      };
    });

    it('isProduction should return false in test', () => {
      expect(isProduction()).toBe(false);
    });

    it('isDevelopment should return false in test', () => {
      expect(isDevelopment()).toBe(false);
    });

    it('isTest should return true in test', () => {
      expect(isTest()).toBe(true);
    });

    it('getAllowedOrigins should parse comma-separated string', () => {
      resetEnvCache();
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000,https://example.com';
      const origins = getAllowedOrigins();
      expect(origins).toEqual(['http://localhost:3000', 'https://example.com']);
    });

    it('getAllowedOrigins should return default if not set', () => {
      resetEnvCache();
      delete process.env.ALLOWED_ORIGINS;
      const origins = getAllowedOrigins();
      expect(origins).toEqual(['http://localhost:3000']);
    });

    it('getAllowedImageFormats should parse formats', () => {
      resetEnvCache();
      process.env.ALLOWED_IMAGE_FORMATS = 'jpg,png,gif';
      const formats = getAllowedImageFormats();
      expect(formats).toEqual(['jpg', 'png', 'gif']);
    });

    it('isFeatureEnabled should check feature flags', () => {
      resetEnvCache();
      process.env.ENABLE_VIRUS_SCAN = 'true';
      process.env.ENABLE_FACE_DETECTION = 'false';

      expect(isFeatureEnabled('virus_scan')).toBe(true);
      expect(isFeatureEnabled('face_detection')).toBe(false);
    });
  });
});
