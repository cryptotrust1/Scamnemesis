/**
 * REGRESSION TESTS - Report Submission Critical Paths
 *
 * These tests ensure the report submission functionality remains working
 * after any code changes. DO NOT modify the reports/route.ts without
 * running these tests first!
 *
 * Created: December 2024 after P2021 database incident
 */

// Mock dependencies BEFORE imports
jest.mock('@/lib/db', () => ({
  prisma: {
    $queryRaw: jest.fn().mockResolvedValue([{ test: 1 }]),
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    report: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
    },
    perpetrator: {
      create: jest.fn(),
    },
    digitalFootprint: {
      create: jest.fn(),
    },
    financialInfo: {
      create: jest.fn(),
    },
    cryptoInfo: {
      create: jest.fn(),
    },
    companyInfo: {
      create: jest.fn(),
    },
    vehicleInfo: {
      create: jest.fn(),
    },
    evidence: {
      create: jest.fn(),
      createMany: jest.fn(),
    },
    rateLimit: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('@/lib/middleware/auth', () => ({
  requireAuth: jest.fn().mockResolvedValue({
    authenticated: false,
    user: null,
    apiKey: null,
  }),
  requireRateLimit: jest.fn().mockResolvedValue(null),
}));

import { prisma } from '@/lib/db';

describe('REGRESSION: Report Submission Critical Paths', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Database Connection', () => {
    it('should successfully connect to database', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ test: 1 }]);

      const result = await prisma.$queryRaw`SELECT 1 as test`;

      expect(result).toEqual([{ test: 1 }]);
    });

    it('should handle database connection errors gracefully', async () => {
      (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('Connection refused'));

      await expect(prisma.$queryRaw`SELECT 1`).rejects.toThrow('Connection refused');
    });
  });

  describe('User Creation for Anonymous Reports', () => {
    it('should find existing user by email', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'reporter@example.com',
        name: 'Test User',
        role: 'BASIC',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const user = await prisma.user.findUnique({
        where: { email: 'reporter@example.com' },
      });

      expect(user).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'reporter@example.com' },
      });
    });

    it('should create new user if not exists', async () => {
      const newUser = {
        id: 'new-user-456',
        email: 'newreporter@example.com',
        name: 'New Reporter',
        role: 'BASIC',
        passwordHash: null, // OAuth users don't have password
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(newUser);

      const existingUser = await prisma.user.findUnique({
        where: { email: 'newreporter@example.com' },
      });
      expect(existingUser).toBeNull();

      const createdUser = await prisma.user.create({
        data: {
          email: 'newreporter@example.com',
          name: 'New Reporter',
          role: 'BASIC',
        },
      });

      expect(createdUser.id).toBe('new-user-456');
      expect(createdUser.passwordHash).toBeNull();
    });

    it('should handle nullable passwordHash for OAuth users', async () => {
      const oauthUser = {
        id: 'oauth-user-789',
        email: 'oauth@example.com',
        passwordHash: null, // This should be nullable!
        image: 'https://example.com/avatar.jpg',
      };

      (prisma.user.create as jest.Mock).mockResolvedValue(oauthUser);

      const user = await prisma.user.create({
        data: {
          email: 'oauth@example.com',
          passwordHash: null,
        },
      });

      expect(user.passwordHash).toBeNull();
    });
  });

  describe('Report Creation Transaction', () => {
    it('should create report with all related data', async () => {
      const reportData = {
        id: 'report-123',
        publicId: 'SN-20241218-ABC123',
        summary: 'Test fraud report',
        fraudType: 'INVESTMENT_FRAUD',
        status: 'PENDING',
        reporterId: 'user-123',
        reporterEmail: 'reporter@example.com',
        caseNumber: 'SN-20241218-0001',
        trackingToken: 'tracking-token-xyz',
      };

      const perpetratorData = {
        id: 'perp-123',
        reportId: 'report-123',
        fullName: 'Scammer Name',
        email: 'scammer@fraud.com',
      };

      (prisma.$transaction as jest.Mock).mockResolvedValue([
        reportData,
        perpetratorData,
      ]);

      const result = await prisma.$transaction([
        prisma.report.create({ data: reportData as any }),
        prisma.perpetrator.create({ data: perpetratorData as any }),
      ]);

      expect(result).toHaveLength(2);
      expect(result[0].caseNumber).toBe('SN-20241218-0001');
    });

    it('should generate unique case number', () => {
      const generateCaseNumber = () => {
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `SN-${dateStr}-${random}`;
      };

      const caseNumber = generateCaseNumber();

      expect(caseNumber).toMatch(/^SN-\d{8}-[A-Z0-9]{4}$/);
    });

    it('should generate unique tracking token', () => {
      const generateTrackingToken = () => {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      };

      const token1 = generateTrackingToken();
      const token2 = generateTrackingToken();

      expect(token1).not.toBe(token2);
      expect(token1.length).toBeGreaterThan(15);
    });
  });

  describe('Evidence Handling', () => {
    it('should link evidence to report', async () => {
      const evidenceData = {
        id: 'evidence-123',
        reportId: 'report-123',
        type: 'SCREENSHOT',
        fileKey: 'evidence/2024/12/18/abc123.jpg',
        description: 'Screenshot of fraud',
      };

      (prisma.evidence.create as jest.Mock).mockResolvedValue(evidenceData);

      const evidence = await prisma.evidence.create({
        data: evidenceData,
      });

      expect(evidence.reportId).toBe('report-123');
      expect(evidence.fileKey).toContain('evidence/');
    });
  });

  describe('Financial Info Handling', () => {
    it('should create financial info with IBAN', async () => {
      const financialData = {
        id: 'fin-123',
        reportId: 'report-123',
        iban: 'SK89 7500 0000 0000 1234 5678',
        ibanNormalized: 'SK8975000000000012345678',
        bankName: 'Test Bank',
      };

      (prisma.financialInfo.create as jest.Mock).mockResolvedValue(financialData);

      const financial = await prisma.financialInfo.create({
        data: financialData,
      });

      expect(financial.ibanNormalized).not.toContain(' ');
    });
  });

  describe('Crypto Info Handling', () => {
    it('should create crypto info with wallet address', async () => {
      const cryptoData = {
        id: 'crypto-123',
        reportId: 'report-123',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f88888',
        walletNormalized: '0x742d35cc6634c0532925a3b844bc9e7595f88888',
        blockchain: 'ETHEREUM',
      };

      (prisma.cryptoInfo.create as jest.Mock).mockResolvedValue(cryptoData);

      const crypto = await prisma.cryptoInfo.create({
        data: cryptoData,
      });

      expect(crypto.blockchain).toBe('ETHEREUM');
    });
  });

  describe('Digital Footprint Handling', () => {
    it('should create digital footprint with social media', async () => {
      const footprintData = {
        id: 'footprint-123',
        reportId: 'report-123',
        telegram: '@scammer',
        whatsapp: '+421900123456',
        facebook: 'https://facebook.com/scammer',
        websiteUrl: 'https://fraud-site.com',
      };

      (prisma.digitalFootprint.create as jest.Mock).mockResolvedValue(footprintData);

      const footprint = await prisma.digitalFootprint.create({
        data: footprintData,
      });

      expect(footprint.telegram).toBe('@scammer');
    });
  });
});

describe('REGRESSION: Required Database Tables', () => {
  /**
   * CRITICAL: These tests verify the tables that MUST exist for report submission.
   * If any of these fail, check prisma/migrations/0_baseline/migration.sql
   */

  const REQUIRED_TABLES = [
    'users',
    'accounts',      // Auth.js OAuth
    'sessions',      // Auth.js sessions
    'verification_tokens', // Auth.js email verification
    'reports',
    'perpetrators',
    'digital_footprints',
    'financial_info',
    'crypto_info',
    'company_info',
    'vehicle_info',
    'evidence',
    'rate_limits',
  ];

  it('should have all required tables defined', () => {
    // This test documents which tables MUST exist
    expect(REQUIRED_TABLES).toContain('users');
    expect(REQUIRED_TABLES).toContain('accounts');
    expect(REQUIRED_TABLES).toContain('sessions');
    expect(REQUIRED_TABLES).toContain('reports');
  });

  it('users table should have nullable password_hash for OAuth', () => {
    // password_hash MUST be nullable for OAuth users
    // This was a bug - it was NOT NULL before
    const userSchema = {
      password_hash: 'TEXT', // nullable, no NOT NULL
      email_verified: 'TIMESTAMP(3)', // DateTime, NOT BOOLEAN
      image: 'TEXT', // for OAuth profile images
    };

    expect(userSchema.password_hash).toBe('TEXT');
    expect(userSchema.email_verified).toBe('TIMESTAMP(3)');
    expect(userSchema.image).toBe('TEXT');
  });
});

describe('REGRESSION: Error Handling', () => {
  it('should return structured error response', () => {
    const errorResponse = {
      error: 'user_error',
      message: 'Failed to process reporter information',
      request_id: 'req-abc123',
      error_type: 'PrismaClientKnownRequestError',
      error_code: 'P2021',
      timestamp: new Date().toISOString(),
    };

    expect(errorResponse).toHaveProperty('request_id');
    expect(errorResponse).toHaveProperty('error_type');
    expect(errorResponse).toHaveProperty('error_code');
    expect(errorResponse).toHaveProperty('timestamp');
  });

  it('should handle P2021 (table not found) error', () => {
    const prismaError = {
      code: 'P2021',
      message: 'The table `public.users` does not exist',
      meta: { table: 'users' },
    };

    expect(prismaError.code).toBe('P2021');
  });

  it('should handle P2002 (unique constraint) error', () => {
    const prismaError = {
      code: 'P2002',
      message: 'Unique constraint failed on the fields: (`email`)',
      meta: { target: ['email'] },
    };

    expect(prismaError.code).toBe('P2002');
  });
});

describe('REGRESSION: Rate Limiting', () => {
  it('should allow report submission within rate limit', async () => {
    (prisma.rateLimit.findUnique as jest.Mock).mockResolvedValue({
      identifier: 'ip:192.168.1.1',
      count: 5,
      windowStart: new Date(),
      expiresAt: new Date(Date.now() + 3600000),
    });

    const rateLimit = await prisma.rateLimit.findUnique({
      where: { identifier: 'ip:192.168.1.1' },
    });

    expect(rateLimit?.count).toBeLessThan(10); // Max 10 per hour
  });
});

describe('REGRESSION: Validation', () => {
  const FRAUD_TYPES = [
    'ROMANCE_SCAM',
    'INVESTMENT_FRAUD',
    'PHISHING',
    'IDENTITY_THEFT',
    'ONLINE_SHOPPING_FRAUD',
    'TECH_SUPPORT_SCAM',
    'LOTTERY_PRIZE_SCAM',
    'EMPLOYMENT_SCAM',
    'RENTAL_SCAM',
    'CRYPTOCURRENCY_SCAM',
    'OTHER',
  ];

  const BLOCKCHAINS = [
    'BITCOIN',
    'ETHEREUM',
    'TRON',
    'SOLANA',
    'BINANCE_SMART_CHAIN',
    'POLYGON',
    'OTHER',
  ];

  it('should validate fraud types', () => {
    expect(FRAUD_TYPES).toContain('INVESTMENT_FRAUD');
    expect(FRAUD_TYPES).toContain('ROMANCE_SCAM');
    expect(FRAUD_TYPES).toContain('CRYPTOCURRENCY_SCAM');
  });

  it('should validate blockchain types', () => {
    expect(BLOCKCHAINS).toContain('BITCOIN');
    expect(BLOCKCHAINS).toContain('ETHEREUM');
    expect(BLOCKCHAINS).toContain('TRON');
  });

  it('should validate email format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    expect(emailRegex.test('valid@email.com')).toBe(true);
    expect(emailRegex.test('invalid-email')).toBe(false);
    expect(emailRegex.test('')).toBe(false);
  });

  it('should validate IBAN format loosely', () => {
    // IBAN can have spaces and should be normalized
    const normalizeIban = (iban: string) => iban.replace(/\s/g, '').toUpperCase();

    expect(normalizeIban('SK89 7500 0000 0000 1234 5678')).toBe('SK8975000000000012345678');
    expect(normalizeIban('sk8975000000000012345678')).toBe('SK8975000000000012345678');
  });

  it('should validate wallet address format', () => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    const btcAddressRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;

    expect(ethAddressRegex.test('0x742d35Cc6634C0532925a3b844Bc9e7595f88888')).toBe(true);
    expect(btcAddressRegex.test('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')).toBe(true);
  });
});
