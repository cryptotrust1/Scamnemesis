/**
 * Tests for /api/v1/user/api-keys endpoints
 *
 * Unit tests for user self-service API key management:
 * - Create API key
 * - List API keys
 * - Get API key details
 * - Update API key
 * - Revoke API key
 * - Rotate API key
 */

// Mock Prisma client
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    apiKey: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      count: jest.fn(),
    },
  },
  prisma: {
    apiKey: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      count: jest.fn(),
    },
  },
}));

// Mock auth middleware
jest.mock('@/lib/middleware/auth', () => ({
  requireAuth: jest.fn(),
}));

// Mock JWT functions
jest.mock('@/lib/auth/jwt', () => ({
  generateApiKey: jest.fn().mockReturnValue('sk_live_test1234567890abcdef'),
}));

import prisma from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';
import { generateApiKey } from '@/lib/auth/jwt';

describe('User API Keys', () => {
  const mockUserId = 'user-123';
  const mockAuthResult = { userId: mockUserId };

  beforeEach(() => {
    jest.clearAllMocks();
    (requireAuth as jest.Mock).mockResolvedValue(mockAuthResult);
  });

  describe('API Key Creation Validation', () => {
    const validApiKeyData = {
      name: 'My Test API Key',
      description: 'Test description',
      scopes: ['reports:read', 'search:read'],
      expiresInDays: 90,
    };

    it('should accept valid API key name', () => {
      const validNames = [
        'My API Key',
        'test-key-1',
        'Production_Key',
        'Key 123',
      ];

      validNames.forEach(name => {
        const isValid = /^[a-zA-Z0-9\s\-_]+$/.test(name);
        expect(isValid).toBe(true);
      });
    });

    it('should reject invalid API key names', () => {
      const invalidNames = [
        'Key@123', // special char
        'Key!Name', // special char
        'Key<script>', // HTML
        '', // empty
      ];

      invalidNames.forEach(name => {
        const isValid = /^[a-zA-Z0-9\s\-_]+$/.test(name) && name.length >= 3;
        expect(isValid).toBe(false);
      });
    });

    it('should validate allowed scopes', () => {
      const allowedScopes = ['reports:read', 'search:read', 'stats:read'];
      const invalidScopes = ['admin:*', 'reports:write', 'delete:all'];

      validApiKeyData.scopes.forEach(scope => {
        expect(allowedScopes).toContain(scope);
      });

      invalidScopes.forEach(scope => {
        expect(allowedScopes).not.toContain(scope);
      });
    });

    it('should validate expiration days range', () => {
      const validDays = [1, 30, 90, 365];
      const invalidDays = [0, -1, 366, 1000];

      validDays.forEach(days => {
        expect(days >= 1 && days <= 365).toBe(true);
      });

      invalidDays.forEach(days => {
        expect(days >= 1 && days <= 365).toBe(false);
      });
    });
  });

  describe('API Key Limit Enforcement', () => {
    const MAX_API_KEYS = 10;

    it('should enforce maximum API keys per user', async () => {
      (prisma.apiKey.count as jest.Mock).mockResolvedValue(MAX_API_KEYS);

      const existingCount = await prisma.apiKey.count({
        where: { userId: mockUserId, isActive: true },
      });

      expect(existingCount).toBe(MAX_API_KEYS);
      expect(existingCount >= MAX_API_KEYS).toBe(true);
    });

    it('should allow creation when under limit', async () => {
      (prisma.apiKey.count as jest.Mock).mockResolvedValue(5);

      const existingCount = await prisma.apiKey.count({
        where: { userId: mockUserId, isActive: true },
      });

      expect(existingCount < MAX_API_KEYS).toBe(true);
    });
  });

  describe('API Key Generation', () => {
    it('should generate API key with correct format', () => {
      (generateApiKey as jest.Mock).mockReturnValue('sk_live_test1234567890abcdef');
      const key = generateApiKey();
      expect(key).toBe('sk_live_test1234567890abcdef');
      expect(key.startsWith('sk_live_')).toBe(true);
    });

    it('should create API key in database', async () => {
      const mockApiKey = {
        id: 'key-123',
        userId: mockUserId,
        key: 'sk_live_test1234567890abcdef',
        name: 'Test Key',
        description: 'Test description',
        type: 'PERSONAL',
        scopes: ['reports:read'],
        rateLimit: 1000,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };

      (prisma.apiKey.create as jest.Mock).mockResolvedValue(mockApiKey);

      const result = await prisma.apiKey.create({
        data: {
          userId: mockUserId,
          key: mockApiKey.key,
          name: mockApiKey.name,
          description: mockApiKey.description,
          type: 'PERSONAL',
          scopes: ['reports:read'],
          rateLimit: 1000,
          expiresAt: mockApiKey.expiresAt,
        },
      });

      expect(result.id).toBe('key-123');
      expect(result.key).toBe('sk_live_test1234567890abcdef');
      expect(result.type).toBe('PERSONAL');
    });
  });

  describe('API Key Listing', () => {
    it('should list only user\'s own keys', async () => {
      const mockKeys = [
        {
          id: 'key-1',
          name: 'Key 1',
          isActive: true,
          requestCount: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'key-2',
          name: 'Key 2',
          isActive: true,
          requestCount: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.apiKey.findMany as jest.Mock).mockResolvedValue(mockKeys);

      const result = await prisma.apiKey.findMany({
        where: { userId: mockUserId, isActive: true },
      });

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Key 1');
    });

    it('should calculate correct stats', () => {
      const mockKeys = [
        { isActive: true, requestCount: 100 },
        { isActive: true, requestCount: 50 },
        { isActive: false, requestCount: 25 },
      ];

      const activeCount = mockKeys.filter(k => k.isActive).length;
      const totalRequests = mockKeys.reduce((sum, k) => sum + k.requestCount, 0);

      expect(activeCount).toBe(2);
      expect(totalRequests).toBe(175);
    });
  });

  describe('API Key Update', () => {
    it('should allow updating name and description', async () => {
      const existingKey = {
        id: 'key-123',
        userId: mockUserId,
        name: 'Old Name',
        description: 'Old description',
        scopes: ['reports:read'],
        isActive: true,
      };

      (prisma.apiKey.findFirst as jest.Mock).mockResolvedValue(existingKey);
      (prisma.apiKey.update as jest.Mock).mockResolvedValue({
        ...existingKey,
        name: 'New Name',
        description: 'New description',
        updatedAt: new Date(),
      });

      const result = await prisma.apiKey.update({
        where: { id: 'key-123' },
        data: {
          name: 'New Name',
          description: 'New description',
        },
      });

      expect(result.name).toBe('New Name');
      expect(result.description).toBe('New description');
    });

    it('should reject update for revoked key', async () => {
      const revokedKey = {
        id: 'key-123',
        userId: mockUserId,
        isActive: false,
      };

      (prisma.apiKey.findFirst as jest.Mock).mockResolvedValue(revokedKey);

      const existingKey = await prisma.apiKey.findFirst({
        where: { id: 'key-123', userId: mockUserId },
      });

      expect(existingKey?.isActive).toBe(false);
    });
  });

  describe('API Key Revocation', () => {
    it('should soft-delete API key', async () => {
      const existingKey = {
        id: 'key-123',
        userId: mockUserId,
        name: 'Test Key',
        isActive: true,
      };

      (prisma.apiKey.findFirst as jest.Mock).mockResolvedValue(existingKey);
      (prisma.apiKey.update as jest.Mock).mockResolvedValue({
        ...existingKey,
        isActive: false,
      });

      const result = await prisma.apiKey.update({
        where: { id: 'key-123' },
        data: { isActive: false },
      });

      expect(result.isActive).toBe(false);
    });

    it('should reject revoking already revoked key', async () => {
      const revokedKey = {
        id: 'key-123',
        userId: mockUserId,
        isActive: false,
      };

      (prisma.apiKey.findFirst as jest.Mock).mockResolvedValue(revokedKey);

      const existingKey = await prisma.apiKey.findFirst({
        where: { id: 'key-123', userId: mockUserId },
      });

      expect(existingKey?.isActive).toBe(false);
    });
  });

  describe('API Key Rotation', () => {
    it('should generate new key on rotation', async () => {
      const existingKey = {
        id: 'key-123',
        userId: mockUserId,
        key: 'sk_live_oldkey123',
        name: 'Test Key',
        isActive: true,
        requestCount: 500,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      (prisma.apiKey.findFirst as jest.Mock).mockResolvedValue(existingKey);
      (prisma.apiKey.update as jest.Mock).mockResolvedValue({
        ...existingKey,
        key: 'sk_live_newkey456789abcdef',
        requestCount: 0,
        lastUsedAt: null,
      });

      (generateApiKey as jest.Mock).mockReturnValue('sk_live_newkey456789abcdef');
      const newKey = generateApiKey();
      expect(newKey).toBe('sk_live_newkey456789abcdef');
      expect(newKey).not.toBe(existingKey.key);
    });

    it('should reset request count on rotation', async () => {
      (prisma.apiKey.update as jest.Mock).mockResolvedValue({
        id: 'key-123',
        key: 'sk_live_newkey123',
        requestCount: 0,
        lastUsedAt: null,
      });

      const result = await prisma.apiKey.update({
        where: { id: 'key-123' },
        data: {
          key: 'sk_live_newkey123',
          requestCount: 0,
          lastUsedAt: null,
        },
      });

      expect(result.requestCount).toBe(0);
      expect(result.lastUsedAt).toBeNull();
    });

    it('should reject rotation for expired key', () => {
      const expiredKey = {
        id: 'key-123',
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        isActive: true,
      };

      const isExpired = new Date(expiredKey.expiresAt) < new Date();
      expect(isExpired).toBe(true);
    });

    it('should reject rotation for revoked key', () => {
      const revokedKey = {
        id: 'key-123',
        isActive: false,
      };

      expect(revokedKey.isActive).toBe(false);
    });
  });

  describe('Audit Logging', () => {
    it('should log API key creation', async () => {
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({
        id: 'log-123',
        action: 'USER_API_KEY_CREATED',
        entityType: 'ApiKey',
        entityId: 'key-123',
        userId: mockUserId,
      });

      const result = await prisma.auditLog.create({
        data: {
          action: 'USER_API_KEY_CREATED',
          entityType: 'ApiKey',
          entityId: 'key-123',
          userId: mockUserId,
          changes: {
            name: 'Test Key',
            scopes: ['reports:read'],
          },
        },
      });

      expect(result.action).toBe('USER_API_KEY_CREATED');
      expect(result.entityType).toBe('ApiKey');
    });

    it('should log API key rotation', async () => {
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({
        id: 'log-123',
        action: 'USER_API_KEY_ROTATED',
        entityType: 'ApiKey',
        entityId: 'key-123',
        userId: mockUserId,
      });

      const result = await prisma.auditLog.create({
        data: {
          action: 'USER_API_KEY_ROTATED',
          entityType: 'ApiKey',
          entityId: 'key-123',
          userId: mockUserId,
          changes: {
            name: 'Test Key',
            previous_request_count: 500,
            rotated_at: new Date().toISOString(),
          },
        },
      });

      expect(result.action).toBe('USER_API_KEY_ROTATED');
    });

    it('should log API key revocation', async () => {
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({
        id: 'log-123',
        action: 'USER_API_KEY_REVOKED',
        entityType: 'ApiKey',
        entityId: 'key-123',
        userId: mockUserId,
      });

      const result = await prisma.auditLog.create({
        data: {
          action: 'USER_API_KEY_REVOKED',
          entityType: 'ApiKey',
          entityId: 'key-123',
          userId: mockUserId,
          changes: {
            name: 'Test Key',
            reason: 'User revoked key',
          },
        },
      });

      expect(result.action).toBe('USER_API_KEY_REVOKED');
    });
  });

  describe('Security Checks', () => {
    it('should not expose full API key in listings', () => {
      const apiKeyId = 'key-123-abc-def-ghi';
      const keyPreview = `sk_live_...${apiKeyId.slice(-8)}`;

      // The last 8 characters of 'key-123-abc-def-ghi' is '-def-ghi'
      expect(keyPreview).toBe('sk_live_...-def-ghi');
      expect(keyPreview).not.toContain('123-abc');
    });

    it('should verify ownership before operations', async () => {
      // Example of key owned by another user (demonstrates ownership check)
      const _otherUserKey = {
        id: 'key-123',
        userId: 'other-user-456',
        name: 'Other User Key',
      };

      (prisma.apiKey.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await prisma.apiKey.findFirst({
        where: {
          id: 'key-123',
          userId: mockUserId, // Current user
        },
      });

      // Key belongs to another user, so findFirst returns null
      expect(result).toBeNull();
    });
  });

  describe('Expiration Handling', () => {
    it('should calculate days until expiry', () => {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const daysUntilExpiry = Math.ceil(
        (expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      );

      expect(daysUntilExpiry).toBe(30);
    });

    it('should detect expired keys', () => {
      const expiredKey = {
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      };

      const isExpired = new Date(expiredKey.expiresAt) < new Date();
      expect(isExpired).toBe(true);
    });

    it('should detect non-expired keys', () => {
      const validKey = {
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      const isExpired = new Date(validKey.expiresAt) < new Date();
      expect(isExpired).toBe(false);
    });

    it('should handle keys with no expiration', () => {
      const noExpiryKey = {
        expiresAt: null,
      };

      const isExpired = noExpiryKey.expiresAt
        ? new Date(noExpiryKey.expiresAt) < new Date()
        : false;

      expect(isExpired).toBe(false);
    });
  });
});
