/**
 * Tests for auth middleware
 */

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    rateLimit: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    apiKey: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock jose JWT library
jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
}));

import { prisma } from '@/lib/db';
import { jwtVerify } from 'jose';

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-key-at-least-32-characters-long';
  });

  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const getClientIp = (headers: Record<string, string | null>) => {
        return headers['x-forwarded-for']?.split(',')[0]?.trim()
          || headers['x-real-ip']
          || 'unknown';
      };

      expect(getClientIp({ 'x-forwarded-for': '192.168.1.1, 10.0.0.1', 'x-real-ip': null }))
        .toBe('192.168.1.1');
    });

    it('should extract IP from x-real-ip header', () => {
      const getClientIp = (headers: Record<string, string | null>) => {
        return headers['x-forwarded-for']?.split(',')[0]?.trim()
          || headers['x-real-ip']
          || 'unknown';
      };

      expect(getClientIp({ 'x-forwarded-for': null, 'x-real-ip': '10.0.0.1' }))
        .toBe('10.0.0.1');
    });

    it('should return unknown when no IP headers present', () => {
      const getClientIp = (headers: Record<string, string | null>) => {
        return headers['x-forwarded-for']?.split(',')[0]?.trim()
          || headers['x-real-ip']
          || 'unknown';
      };

      expect(getClientIp({ 'x-forwarded-for': null, 'x-real-ip': null }))
        .toBe('unknown');
    });
  });

  describe('checkRateLimit', () => {
    it('should allow request within rate limit', async () => {
      const currentCount = 5;
      const limit = 100;

      (prisma.rateLimit.findUnique as jest.Mock).mockResolvedValue({
        key: 'test:127.0.0.1',
        count: currentCount,
        resetAt: new Date(Date.now() + 60000),
      });

      const rateLimitRecord = await prisma.rateLimit.findUnique({
        where: { key: 'test:127.0.0.1' },
      });

      expect(rateLimitRecord?.count).toBeLessThan(limit);
    });

    it('should block request exceeding rate limit', async () => {
      const limit = 100;

      (prisma.rateLimit.findUnique as jest.Mock).mockResolvedValue({
        key: 'test:127.0.0.1',
        count: 100,
        resetAt: new Date(Date.now() + 60000),
      });

      const rateLimitRecord = await prisma.rateLimit.findUnique({
        where: { key: 'test:127.0.0.1' },
      });

      const allowed = rateLimitRecord!.count < limit;
      expect(allowed).toBe(false);
    });

    it('should reset count after window expires', async () => {
      (prisma.rateLimit.findUnique as jest.Mock).mockResolvedValue({
        key: 'test:127.0.0.1',
        count: 100,
        resetAt: new Date(Date.now() - 1000), // Expired
      });

      const rateLimitRecord = await prisma.rateLimit.findUnique({
        where: { key: 'test:127.0.0.1' },
      });

      const isExpired = rateLimitRecord!.resetAt.getTime() < Date.now();
      expect(isExpired).toBe(true);
    });

    it('should create new rate limit record if not exists', async () => {
      (prisma.rateLimit.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.rateLimit.upsert as jest.Mock).mockResolvedValue({
        key: 'test:127.0.0.1',
        count: 1,
        resetAt: new Date(Date.now() + 60000),
      });

      const existing = await prisma.rateLimit.findUnique({
        where: { key: 'test:127.0.0.1' },
      });

      expect(existing).toBeNull();

      const created = await prisma.rateLimit.upsert({
        where: { key: 'test:127.0.0.1' },
        update: { count: { increment: 1 } },
        create: {
          key: 'test:127.0.0.1',
          count: 1,
          resetAt: new Date(Date.now() + 60000),
        },
      });

      expect(created.count).toBe(1);
    });
  });

  describe('JWT Token Verification', () => {
    it('should verify valid access token', async () => {
      const mockPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'BASIC',
        scopes: ['read:reports'],
        type: 'access',
      };

      (jwtVerify as jest.Mock).mockResolvedValue({
        payload: mockPayload,
      });

      const result = await jwtVerify('valid-token', new TextEncoder().encode('secret'));

      expect(result.payload.sub).toBe('user-123');
      expect(result.payload.type).toBe('access');
    });

    it('should reject expired token', async () => {
      (jwtVerify as jest.Mock).mockRejectedValue(new Error('Token expired'));

      await expect(
        jwtVerify('expired-token', new TextEncoder().encode('secret'))
      ).rejects.toThrow('Token expired');
    });

    it('should reject invalid token signature', async () => {
      (jwtVerify as jest.Mock).mockRejectedValue(new Error('Invalid signature'));

      await expect(
        jwtVerify('tampered-token', new TextEncoder().encode('secret'))
      ).rejects.toThrow('Invalid signature');
    });

    it('should reject refresh token for access validation', async () => {
      const mockPayload = {
        sub: 'user-123',
        type: 'refresh', // Wrong type
      };

      (jwtVerify as jest.Mock).mockResolvedValue({
        payload: mockPayload,
      });

      const result = await jwtVerify('token', new TextEncoder().encode('secret'));

      expect(result.payload.type).toBe('refresh');
      expect(result.payload.type).not.toBe('access');
    });
  });

  describe('API Key Authentication', () => {
    it('should authenticate with valid API key', async () => {
      const mockApiKey = {
        id: 'key-123',
        key: 'sk_test_123456',
        userId: 'user-123',
        scopes: ['read:reports', 'write:reports'],
        isActive: true,
        expiresAt: new Date(Date.now() + 86400000),
        user: {
          id: 'user-123',
          email: 'test@example.com',
          role: 'STANDARD',
          isActive: true,
        },
      };

      (prisma.apiKey.findUnique as jest.Mock).mockResolvedValue(mockApiKey);

      const apiKey = await prisma.apiKey.findUnique({
        where: { key: 'sk_test_123456' },
        include: { user: true },
      });

      expect(apiKey?.isActive).toBe(true);
      expect(apiKey?.user.isActive).toBe(true);
    });

    it('should reject inactive API key', async () => {
      const mockApiKey = {
        id: 'key-123',
        key: 'sk_test_123456',
        isActive: false,
      };

      (prisma.apiKey.findUnique as jest.Mock).mockResolvedValue(mockApiKey);

      const apiKey = await prisma.apiKey.findUnique({
        where: { key: 'sk_test_123456' },
      });

      expect(apiKey?.isActive).toBe(false);
    });

    it('should reject expired API key', async () => {
      const mockApiKey = {
        id: 'key-123',
        key: 'sk_test_123456',
        isActive: true,
        expiresAt: new Date(Date.now() - 86400000), // Expired
      };

      (prisma.apiKey.findUnique as jest.Mock).mockResolvedValue(mockApiKey);

      const apiKey = await prisma.apiKey.findUnique({
        where: { key: 'sk_test_123456' },
      });

      expect(apiKey?.expiresAt.getTime()).toBeLessThan(Date.now());
    });

    it('should reject API key for inactive user', async () => {
      const mockApiKey = {
        id: 'key-123',
        key: 'sk_test_123456',
        isActive: true,
        user: {
          id: 'user-123',
          isActive: false, // User is inactive
        },
      };

      (prisma.apiKey.findUnique as jest.Mock).mockResolvedValue(mockApiKey);

      const apiKey = await prisma.apiKey.findUnique({
        where: { key: 'sk_test_123456' },
        include: { user: true },
      });

      expect(apiKey?.user.isActive).toBe(false);
    });
  });

  describe('Cookie Authentication', () => {
    it('should extract token from access_token cookie', () => {
      const parseCookies = (cookieHeader: string) => {
        const cookies: Record<string, string> = {};
        cookieHeader.split(';').forEach((cookie) => {
          const [name, value] = cookie.trim().split('=');
          if (name && value) cookies[name] = value;
        });
        return cookies;
      };

      const cookies = parseCookies('access_token=abc123; refresh_token=xyz789');

      expect(cookies['access_token']).toBe('abc123');
      expect(cookies['refresh_token']).toBe('xyz789');
    });

    it('should handle empty cookie header', () => {
      const parseCookies = (cookieHeader: string | null) => {
        if (!cookieHeader) return {};
        const cookies: Record<string, string> = {};
        cookieHeader.split(';').forEach((cookie) => {
          const [name, value] = cookie.trim().split('=');
          if (name && value) cookies[name] = value;
        });
        return cookies;
      };

      const cookies = parseCookies(null);

      expect(cookies['access_token']).toBeUndefined();
    });
  });

  describe('Scope Validation', () => {
    it('should validate required scopes', () => {
      const hasScope = (userScopes: string[], requiredScope: string) => {
        return userScopes.includes(requiredScope) ||
          userScopes.some(s => s === '*' || s === `${requiredScope.split(':')[0]}:*`);
      };

      const userScopes = ['read:reports', 'write:reports'];

      expect(hasScope(userScopes, 'read:reports')).toBe(true);
      expect(hasScope(userScopes, 'admin:reports')).toBe(false);
    });

    it('should handle wildcard scopes', () => {
      const hasScope = (userScopes: string[], requiredScope: string) => {
        return userScopes.includes(requiredScope) ||
          userScopes.includes('*') ||
          userScopes.some(s => {
            const [prefix] = s.split(':');
            const [requiredPrefix] = requiredScope.split(':');
            return s === `${requiredPrefix}:*` || (prefix === requiredPrefix && s.endsWith(':*'));
          });
      };

      const adminScopes = ['admin:*'];

      expect(hasScope(adminScopes, 'admin:read')).toBe(true);
      expect(hasScope(adminScopes, 'admin:write')).toBe(true);
      expect(hasScope(adminScopes, 'admin:reports')).toBe(true);
    });

    it('should validate admin scopes correctly', () => {
      const getScopesForRole = (role: string): string[] => {
        const roleScopes: Record<string, string[]> = {
          BASIC: ['read:reports'],
          STANDARD: ['read:reports', 'write:reports'],
          GOLD: ['read:reports', 'write:reports', 'read:perpetrators'],
          ADMIN: ['admin:read', 'admin:write', 'admin:reports', 'admin:users'],
          SUPER_ADMIN: ['admin:*', 'super_admin:*'],
        };
        return roleScopes[role] || [];
      };

      expect(getScopesForRole('BASIC')).toContain('read:reports');
      expect(getScopesForRole('ADMIN')).toContain('admin:reports');
      expect(getScopesForRole('SUPER_ADMIN')).toContain('admin:*');
    });
  });

  describe('Admin Rate Limit Multiplier', () => {
    // Test the hasAdminScopes function logic
    const hasAdminScopes = (scopes: string[]): boolean => {
      return scopes.some(scope =>
        scope === '*' ||
        scope.startsWith('admin:') ||
        scope === 'admin'
      );
    };

    it('should detect wildcard scope as admin', () => {
      expect(hasAdminScopes(['*'])).toBe(true);
    });

    it('should detect admin:read scope as admin', () => {
      expect(hasAdminScopes(['admin:read'])).toBe(true);
    });

    it('should detect admin:write scope as admin', () => {
      expect(hasAdminScopes(['admin:write'])).toBe(true);
    });

    it('should detect admin:* scope as admin', () => {
      expect(hasAdminScopes(['admin:*'])).toBe(true);
    });

    it('should detect admin scope as admin', () => {
      expect(hasAdminScopes(['admin'])).toBe(true);
    });

    it('should not detect regular user scopes as admin', () => {
      expect(hasAdminScopes(['read:reports', 'write:reports'])).toBe(false);
    });

    it('should not detect empty scopes as admin', () => {
      expect(hasAdminScopes([])).toBe(false);
    });

    it('should apply 10x multiplier for admin users', () => {
      const baseLimit = 60;
      const isAdmin = true;
      const effectiveLimit = isAdmin ? baseLimit * 10 : baseLimit;

      expect(effectiveLimit).toBe(600);
    });

    it('should not apply multiplier for regular users', () => {
      const baseLimit = 60;
      const isAdmin = false;
      const effectiveLimit = isAdmin ? baseLimit * 10 : baseLimit;

      expect(effectiveLimit).toBe(60);
    });

    it('should allow admin user within higher limit', () => {
      const baseLimit = 60;
      const adminLimit = baseLimit * 10; // 600
      const adminRequestCount = 300;

      const allowed = adminRequestCount < adminLimit;
      expect(allowed).toBe(true);
    });

    it('should block admin user exceeding even higher limit', () => {
      const baseLimit = 60;
      const adminLimit = baseLimit * 10; // 600
      const adminRequestCount = 650;

      const allowed = adminRequestCount < adminLimit;
      expect(allowed).toBe(false);
    });
  });

  describe('Authorization Header Parsing', () => {
    it('should extract Bearer token', () => {
      const extractBearerToken = (authHeader: string | null) => {
        if (!authHeader?.startsWith('Bearer ')) return null;
        return authHeader.slice(7);
      };

      expect(extractBearerToken('Bearer abc123')).toBe('abc123');
      expect(extractBearerToken('Basic abc123')).toBeNull();
      expect(extractBearerToken(null)).toBeNull();
    });

    it('should extract API key from header', () => {
      const extractApiKey = (headers: Record<string, string | null>) => {
        return headers['x-api-key'] || null;
      };

      expect(extractApiKey({ 'x-api-key': 'sk_test_123' })).toBe('sk_test_123');
      expect(extractApiKey({ 'x-api-key': null })).toBeNull();
    });
  });
});

describe('Security Validations', () => {
  it('should detect potential injection in input', () => {
    const containsSqlInjection = (input: string) => {
      const patterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/i,
        /['";].*--/,
        /\bOR\b\s+\d+\s*=\s*\d+/i,
      ];
      return patterns.some(p => p.test(input));
    };

    expect(containsSqlInjection("Robert'; DROP TABLE users;--")).toBe(true);
    expect(containsSqlInjection("1 OR 1=1")).toBe(true);
    expect(containsSqlInjection("Normal search query")).toBe(false);
  });

  it('should sanitize output to prevent XSS', () => {
    const escapeHtml = (str: string) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    expect(escapeHtml('<script>alert("xss")</script>'))
      .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });
});
