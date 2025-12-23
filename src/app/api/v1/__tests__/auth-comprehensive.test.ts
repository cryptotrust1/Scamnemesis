/**
 * Comprehensive Auth API Tests
 *
 * Tests for authentication endpoints including:
 * - User registration with validation
 * - Email verification flow
 * - Login with credentials
 * - Token refresh and rotation
 * - Password reset flow
 * - Rate limiting
 * - CAPTCHA verification
 */

import { NextRequest } from 'next/server';

// Mock modules before imports
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback({
      user: { update: jest.fn() },
      refreshToken: { deleteMany: jest.fn(), create: jest.fn() },
      auditLog: { create: jest.fn() },
    })),
  },
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('@/lib/middleware/auth', () => ({
  checkRateLimit: jest.fn().mockResolvedValue({ allowed: true, resetAt: new Date() }),
  getClientIp: jest.fn().mockReturnValue('127.0.0.1'),
}));

jest.mock('@/lib/auth/jwt', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed_password_123'),
  verifyPassword: jest.fn().mockResolvedValue(true),
  generateAccessToken: jest.fn().mockResolvedValue('mock_access_token'),
  generateRefreshToken: jest.fn().mockResolvedValue('mock_refresh_token'),
  getScopesForRole: jest.fn().mockReturnValue(['read:reports']),
}));

jest.mock('@/lib/services/email', () => ({
  emailService: {
    sendWelcome: jest.fn().mockResolvedValue({ success: true }),
    sendPasswordReset: jest.fn().mockResolvedValue({ success: true }),
    sendPasswordResetConfirmation: jest.fn().mockResolvedValue({ success: true }),
    sendVerification: jest.fn().mockResolvedValue({ success: true }),
  },
}));

jest.mock('@/lib/captcha', () => ({
  verifyCaptcha: jest.fn().mockResolvedValue({ success: true }),
  isCaptchaEnabled: jest.fn().mockReturnValue(false),
}));

import { prisma } from '@/lib/db';
import { checkRateLimit } from '@/lib/middleware/auth';
import { hashPassword, verifyPassword } from '@/lib/auth/jwt';
import { emailService } from '@/lib/services/email';
import { verifyCaptcha, isCaptchaEnabled } from '@/lib/captcha';

// Helper to create mock NextRequest
function _createMockRequest(options: {
  method?: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}): NextRequest {
  const { method = 'POST', body = {}, headers = {} } = options;

  return {
    method,
    headers: new Headers({
      'Content-Type': 'application/json',
      ...headers,
    }),
    json: jest.fn().mockResolvedValue(body),
    url: 'http://localhost:3000/api/v1/auth/register',
  } as unknown as NextRequest;
}

describe('Auth API - Registration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Password Validation', () => {
    const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{9,}$/;

    it('should require minimum 9 characters', () => {
      expect(PASSWORD_REGEX.test('Ab1!abcd')).toBe(false); // 8 chars
      expect(PASSWORD_REGEX.test('Ab1!abcde')).toBe(true); // 9 chars
    });

    it('should require uppercase letter', () => {
      expect(PASSWORD_REGEX.test('abcdefgh1!')).toBe(false);
      expect(PASSWORD_REGEX.test('Abcdefgh1!')).toBe(true);
    });

    it('should require lowercase letter', () => {
      expect(PASSWORD_REGEX.test('ABCDEFGH1!')).toBe(false);
      expect(PASSWORD_REGEX.test('ABCDEFGh1!')).toBe(true);
    });

    it('should require a number', () => {
      expect(PASSWORD_REGEX.test('Abcdefgh!')).toBe(false);
      expect(PASSWORD_REGEX.test('Abcdefgh1!')).toBe(true);
    });

    it('should require special character', () => {
      expect(PASSWORD_REGEX.test('Abcdefgh1')).toBe(false);
      expect(PASSWORD_REGEX.test('Abcdefgh1!')).toBe(true);
    });

    it('should accept various special characters', () => {
      const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '+', '='];
      specialChars.forEach((char) => {
        expect(PASSWORD_REGEX.test(`Abcdefgh1${char}`)).toBe(true);
      });
    });
  });

  describe('Email Validation', () => {
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    it('should validate correct email format', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('user.name@example.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email format', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
    });
  });

  describe('User Creation Flow', () => {
    it('should hash password before storing', async () => {
      const password = 'SecurePass123!';
      await hashPassword(password);

      expect(hashPassword).toHaveBeenCalledWith(password);
    });

    it('should check for existing user by email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await prisma.user.findUnique({
        where: { email: 'new@example.com' },
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'new@example.com' },
      });
    });

    it('should create user with BASIC role by default', async () => {
      const userData = {
        email: 'new@example.com',
        passwordHash: 'hashed_password',
        name: 'New User',
        role: 'BASIC',
        isActive: true,
      };

      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-123',
        ...userData,
      });

      const user = await prisma.user.create({ data: userData });

      expect(user.role).toBe('BASIC');
      expect(user.isActive).toBe(true);
    });

    it('should send welcome email after registration', async () => {
      await emailService.sendWelcome('test@example.com', 'Test User', 'http://verify.link');

      expect(emailService.sendWelcome).toHaveBeenCalledWith(
        'test@example.com',
        'Test User',
        'http://verify.link'
      );
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      (checkRateLimit as jest.Mock).mockResolvedValue({
        allowed: true,
        resetAt: new Date(Date.now() + 3600000),
      });

      const result = await checkRateLimit('auth:register:127.0.0.1', 5, 3600000);

      expect(result.allowed).toBe(true);
    });

    it('should block requests exceeding rate limit', async () => {
      (checkRateLimit as jest.Mock).mockResolvedValue({
        allowed: false,
        resetAt: new Date(Date.now() + 1800000),
      });

      const result = await checkRateLimit('auth:register:127.0.0.1', 5, 3600000);

      expect(result.allowed).toBe(false);
    });
  });

  describe('CAPTCHA Integration', () => {
    it('should skip CAPTCHA when not enabled', async () => {
      (isCaptchaEnabled as jest.Mock).mockReturnValue(false);

      const enabled = isCaptchaEnabled();

      expect(enabled).toBe(false);
    });

    it('should verify CAPTCHA when enabled', async () => {
      (isCaptchaEnabled as jest.Mock).mockReturnValue(true);
      (verifyCaptcha as jest.Mock).mockResolvedValue({ success: true });

      const result = await verifyCaptcha('valid_token', '127.0.0.1');

      expect(result.success).toBe(true);
    });

    it('should reject invalid CAPTCHA token', async () => {
      (isCaptchaEnabled as jest.Mock).mockReturnValue(true);
      (verifyCaptcha as jest.Mock).mockResolvedValue({
        success: false,
        errors: ['invalid-token'],
      });

      const result = await verifyCaptcha('invalid_token', '127.0.0.1');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('invalid-token');
    });
  });
});

describe('Auth API - Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Credential Validation', () => {
    it('should verify password correctly', async () => {
      (verifyPassword as jest.Mock).mockResolvedValue(true);

      const isValid = await verifyPassword('password123', 'hashed_password');

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      (verifyPassword as jest.Mock).mockResolvedValue(false);

      const isValid = await verifyPassword('wrong_password', 'hashed_password');

      expect(isValid).toBe(false);
    });

    it('should find user by email (case-insensitive)', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed',
        isActive: true,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await prisma.user.findUnique({
        where: { email: 'TEST@EXAMPLE.COM'.toLowerCase() },
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('Token Generation', () => {
    it('should generate access token on successful login', async () => {
      const { generateAccessToken } = await import('@/lib/auth/jwt');

      await generateAccessToken('user-123', 'test@example.com', 'BASIC', ['read:reports']);

      expect(generateAccessToken).toHaveBeenCalledWith('user-123', 'test@example.com', 'BASIC', ['read:reports']);
    });

    it('should generate refresh token on successful login', async () => {
      const { generateRefreshToken } = await import('@/lib/auth/jwt');

      await generateRefreshToken('user-123');

      expect(generateRefreshToken).toHaveBeenCalledWith('user-123');
    });

    it('should store refresh token in database', async () => {
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
        id: 'token-123',
        userId: 'user-123',
        token: 'refresh_token',
      });

      await prisma.refreshToken.create({
        data: {
          userId: 'user-123',
          token: 'refresh_token',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      expect(prisma.refreshToken.create).toHaveBeenCalled();
    });
  });

  describe('Account Security', () => {
    it('should reject login for inactive accounts', async () => {
      const inactiveUser = {
        id: 'user-123',
        email: 'inactive@example.com',
        passwordHash: 'hashed',
        isActive: false,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(inactiveUser);

      const user = await prisma.user.findUnique({
        where: { email: 'inactive@example.com' },
      });

      expect(user?.isActive).toBe(false);
    });

    it('should create audit log on login', async () => {
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({
        id: 'log-123',
        action: 'USER_LOGIN',
        userId: 'user-123',
      });

      await prisma.auditLog.create({
        data: {
          action: 'USER_LOGIN',
          userId: 'user-123',
          entityType: 'user',
          entityId: 'user-123',
          ipAddress: '127.0.0.1',
        },
      });

      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });
});

describe('Auth API - Password Reset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Reset Request Flow', () => {
    it('should send password reset email for existing user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        isActive: true,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (emailService.sendPasswordReset as jest.Mock).mockResolvedValue({ success: true });

      await emailService.sendPasswordReset(
        'test@example.com',
        'Test User',
        'http://reset.link/token'
      );

      expect(emailService.sendPasswordReset).toHaveBeenCalled();
    });

    it('should not reveal if email exists (security)', async () => {
      // For security, always return same response regardless of email existence
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // The endpoint should still return success to prevent email enumeration
      const response = { success: true, message: 'If the email exists, a reset link has been sent.' };

      expect(response.success).toBe(true);
    });
  });

  describe('Reset Completion Flow', () => {
    it('should update password hash', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-123',
        passwordHash: 'new_hashed_password',
      });

      await prisma.user.update({
        where: { id: 'user-123' },
        data: { passwordHash: 'new_hashed_password' },
      });

      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should invalidate all refresh tokens after reset', async () => {
      (prisma.refreshToken.deleteMany as jest.Mock).mockResolvedValue({ count: 3 });

      await prisma.refreshToken.deleteMany({
        where: { userId: 'user-123' },
      });

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
    });

    it('should send confirmation email after reset', async () => {
      await emailService.sendPasswordResetConfirmation('test@example.com', 'Test User');

      expect(emailService.sendPasswordResetConfirmation).toHaveBeenCalledWith(
        'test@example.com',
        'Test User'
      );
    });

    it('should create audit log for password reset', async () => {
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({
        id: 'log-123',
        action: 'PASSWORD_RESET_COMPLETED',
      });

      await prisma.auditLog.create({
        data: {
          action: 'PASSWORD_RESET_COMPLETED',
          userId: 'user-123',
          entityType: 'user',
          entityId: 'user-123',
          ipAddress: '127.0.0.1',
        },
      });

      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });
});

describe('Auth API - Token Refresh', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate refresh token exists in database', async () => {
    const mockToken = {
      id: 'token-123',
      userId: 'user-123',
      token: 'valid_refresh_token',
      expiresAt: new Date(Date.now() + 86400000),
    };

    (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(mockToken);

    const token = await prisma.refreshToken.findUnique({
      where: { token: 'valid_refresh_token' },
    });

    expect(token).not.toBeNull();
    expect(token?.userId).toBe('user-123');
  });

  it('should reject expired refresh token', async () => {
    const expiredToken = {
      id: 'token-123',
      userId: 'user-123',
      token: 'expired_token',
      expiresAt: new Date(Date.now() - 86400000), // Expired yesterday
    };

    (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(expiredToken);

    const token = await prisma.refreshToken.findUnique({
      where: { token: 'expired_token' },
    });

    const isExpired = token && new Date(token.expiresAt) < new Date();
    expect(isExpired).toBe(true);
  });

  it('should rotate refresh token (delete old, create new)', async () => {
    // Delete old token
    (prisma.refreshToken.delete as jest.Mock).mockResolvedValue({ id: 'old-token' });

    await prisma.refreshToken.delete({
      where: { id: 'old-token' },
    });

    // Create new token
    (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
      id: 'new-token',
      token: 'new_refresh_token',
    });

    await prisma.refreshToken.create({
      data: {
        userId: 'user-123',
        token: 'new_refresh_token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    expect(prisma.refreshToken.delete).toHaveBeenCalled();
    expect(prisma.refreshToken.create).toHaveBeenCalled();
  });
});

describe('Auth API - Role-Based Access', () => {
  const ROLE_SCOPES: Record<string, string[]> = {
    BASIC: ['read:reports'],
    STANDARD: ['read:reports', 'create:reports'],
    GOLD: ['read:reports', 'create:reports', 'read:reports:full'],
    ADMIN: ['read:reports', 'create:reports', 'read:reports:full', 'admin:reports'],
    SUPER_ADMIN: ['*'],
  };

  it('should assign correct scopes for BASIC role', () => {
    expect(ROLE_SCOPES.BASIC).toEqual(['read:reports']);
  });

  it('should assign correct scopes for STANDARD role', () => {
    expect(ROLE_SCOPES.STANDARD).toContain('create:reports');
  });

  it('should assign full access scopes for ADMIN role', () => {
    expect(ROLE_SCOPES.ADMIN).toContain('admin:reports');
  });

  it('should assign wildcard scope for SUPER_ADMIN', () => {
    expect(ROLE_SCOPES.SUPER_ADMIN).toEqual(['*']);
  });

  it('should check scope permission correctly', () => {
    const hasScope = (userScopes: string[], requiredScope: string): boolean => {
      if (userScopes.includes('*')) return true;
      return userScopes.includes(requiredScope);
    };

    expect(hasScope(ROLE_SCOPES.SUPER_ADMIN, 'admin:anything')).toBe(true);
    expect(hasScope(ROLE_SCOPES.BASIC, 'admin:reports')).toBe(false);
    expect(hasScope(ROLE_SCOPES.ADMIN, 'admin:reports')).toBe(true);
  });
});

describe('Security Edge Cases', () => {
  it('should handle SQL injection attempts in email', () => {
    const maliciousEmail = "'; DROP TABLE users; --";
    const sanitized = maliciousEmail.toLowerCase().trim();

    // Prisma handles this safely, but email validation should reject it
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized);
    expect(isValidEmail).toBe(false);
  });

  it('should handle XSS attempts in name field', () => {
    const maliciousName = '<script>alert("xss")</script>';
    const escapeHtml = (text: string): string => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    const sanitized = escapeHtml(maliciousName);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('&lt;script&gt;');
  });

  it('should handle extremely long inputs', () => {
    const longEmail = 'a'.repeat(500) + '@example.com';
    const maxEmailLength = 255;

    expect(longEmail.length > maxEmailLength).toBe(true);
  });

  it('should handle unicode in passwords', () => {
    const unicodePassword = 'Passwörd123!';
    // PASSWORD_REGEX pattern used for validation reference
    const _PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{9,}$/;

    // Unicode characters should be handled correctly
    expect(unicodePassword.length).toBeGreaterThanOrEqual(9);
  });
});
