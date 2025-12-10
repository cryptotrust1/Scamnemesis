/**
 * Jest Setup File
 *
 * Runs before each test suite
 */

// Load environment variables for testing
require('dotenv').config({ path: '.env.test' });

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:test@localhost:5432/scamnemesis_test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-purposes-only';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-for-testing';
process.env.S3_ENDPOINT = 'http://localhost:9000';
process.env.S3_BUCKET = 'scamnemesis-test';
process.env.S3_ACCESS_KEY = 'minioadmin';
process.env.S3_SECRET_KEY = 'minioadmin';
process.env.S3_REGION = 'us-east-1';
process.env.TYPESENSE_HOST = 'localhost';
process.env.TYPESENSE_PORT = '8108';
process.env.TYPESENSE_API_KEY = 'test-typesense-key';
process.env.ML_SERVICE_URL = 'http://localhost:8000';

// Set test timeout
jest.setTimeout(30000);

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    report: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    perpetrator: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    evidence: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    comment: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    duplicateCluster: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

// Mock Redis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    expire: jest.fn(),
    quit: jest.fn(),
    on: jest.fn(),
  }));
});

// Mock BullMQ
jest.mock('bullmq', () => {
  return {
    Queue: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      close: jest.fn(),
    })),
    Worker: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      close: jest.fn(),
    })),
  };
});

// Mock Next.js headers
jest.mock('next/headers', () => ({
  headers: jest.fn(() => new Map()),
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

// Global test utilities
global.mockRequest = (options = {}) => {
  return {
    headers: new Headers(options.headers || {}),
    method: options.method || 'GET',
    url: options.url || 'http://localhost:3000',
    json: jest.fn().mockResolvedValue(options.body || {}),
  };
};

global.mockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  };
  return res;
};

// Console spy to suppress logs during tests (optional)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
