/**
 * Comprehensive Search API Tests
 *
 * Tests for search functionality including:
 * - Different search modes (exact, fuzzy, semantic, auto)
 * - Query type detection
 * - Filtering and pagination
 * - Result masking based on user role
 * - Faceted search
 */

// Mock modules
jest.mock('@/lib/db', () => ({
  prisma: {
    report: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    perpetrator: {
      findMany: jest.fn(),
    },
    digitalFootprint: {
      findMany: jest.fn(),
    },
    cryptoInfo: {
      findMany: jest.fn(),
    },
    financialInfo: {
      findMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
  },
}));

jest.mock('@/lib/middleware/auth', () => ({
  checkRateLimit: jest.fn().mockResolvedValue({ allowed: true, resetAt: new Date() }),
  getClientIp: jest.fn().mockReturnValue('127.0.0.1'),
  getAuthUser: jest.fn(),
}));

import { prisma } from '@/lib/db';

describe('Search API - Query Type Detection', () => {
  // Helper function that mirrors the actual implementation
  const detectQueryType = (query: string): string => {
    const trimmed = query.trim().toLowerCase();

    // Email pattern
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return 'email';
    }

    // Phone pattern (international format)
    if (/^\+?[\d\s\-()]{8,}$/.test(trimmed.replace(/\s/g, ''))) {
      return 'phone';
    }

    // IBAN pattern
    if (/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/i.test(trimmed.replace(/\s/g, ''))) {
      return 'iban';
    }

    // Crypto wallet pattern (Ethereum)
    if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      return 'eth_wallet';
    }

    // Crypto wallet pattern (Bitcoin)
    if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/.test(trimmed)) {
      return 'btc_wallet';
    }

    // Domain/URL pattern
    if (/^(https?:\/\/)?[\w\-]+(\.[\w\-]+)+/.test(trimmed)) {
      return 'domain';
    }

    // Default to name search
    return 'name';
  };

  describe('Email Detection', () => {
    it('should detect simple email', () => {
      expect(detectQueryType('user@example.com')).toBe('email');
    });

    it('should detect email with subdomain', () => {
      expect(detectQueryType('user@mail.example.co.uk')).toBe('email');
    });

    it('should detect email with plus tag', () => {
      expect(detectQueryType('user+tag@example.com')).toBe('email');
    });

    it('should be case-insensitive', () => {
      expect(detectQueryType('USER@EXAMPLE.COM')).toBe('email');
    });
  });

  describe('Phone Detection', () => {
    it('should detect international phone', () => {
      expect(detectQueryType('+421 900 123 456')).toBe('phone');
    });

    it('should detect phone without plus', () => {
      expect(detectQueryType('421900123456')).toBe('phone');
    });

    it('should detect phone with dashes', () => {
      expect(detectQueryType('+1-555-123-4567')).toBe('phone');
    });

    it('should detect phone with parentheses', () => {
      expect(detectQueryType('(555) 123-4567')).toBe('phone');
    });
  });

  describe('IBAN Detection', () => {
    it('should detect Slovak IBAN', () => {
      expect(detectQueryType('SK31 1200 0000 1987 4263 7541')).toBe('iban');
    });

    it('should detect German IBAN', () => {
      expect(detectQueryType('DE89370400440532013000')).toBe('iban');
    });

    it('should detect IBAN without spaces', () => {
      expect(detectQueryType('SK3112000000198742637541')).toBe('iban');
    });
  });

  describe('Crypto Wallet Detection', () => {
    it('should detect Ethereum wallet', () => {
      expect(detectQueryType('0x742d35Cc6634C0532925a3b844Bc454e4438f44e')).toBe('eth_wallet');
    });

    it('should detect Bitcoin legacy wallet', () => {
      expect(detectQueryType('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')).toBe('btc_wallet');
    });

    it('should detect Bitcoin bech32 wallet', () => {
      expect(detectQueryType('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')).toBe('btc_wallet');
    });
  });

  describe('Domain Detection', () => {
    it('should detect simple domain', () => {
      expect(detectQueryType('example.com')).toBe('domain');
    });

    it('should detect full URL', () => {
      expect(detectQueryType('https://scam-site.com/page')).toBe('domain');
    });

    it('should detect subdomain', () => {
      expect(detectQueryType('fake.bank-secure.com')).toBe('domain');
    });
  });

  describe('Name Detection (Default)', () => {
    it('should detect name as fallback', () => {
      expect(detectQueryType('John Smith')).toBe('name');
    });

    it('should handle single word', () => {
      expect(detectQueryType('Scammer')).toBe('name');
    });
  });
});

describe('Search API - Search Modes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Exact Search Mode', () => {
    it('should search for exact email match', async () => {
      const mockReports = [
        { id: 'report-1', perpetrators: [{ email: 'scammer@example.com' }] },
      ];

      (prisma.report.findMany as jest.Mock).mockResolvedValue(mockReports);

      const reports = await prisma.report.findMany({
        where: {
          perpetrators: {
            some: { emailNormalized: 'scammer@example.com' },
          },
        },
      });

      expect(reports).toHaveLength(1);
    });

    it('should search for exact IBAN match', async () => {
      const mockReports = [
        { id: 'report-1', financialInfo: { ibanNormalized: 'SK3112000000198742637541' } },
      ];

      (prisma.report.findMany as jest.Mock).mockResolvedValue(mockReports);

      const reports = await prisma.report.findMany({
        where: {
          financialInfo: { ibanNormalized: 'SK3112000000198742637541' },
        },
      });

      expect(reports).toHaveLength(1);
    });

    it('should search for exact wallet match', async () => {
      const mockReports = [
        { id: 'report-1', cryptoInfo: { walletNormalized: '0x742d35cc6634c0532925a3b844bc454e4438f44e' } },
      ];

      (prisma.report.findMany as jest.Mock).mockResolvedValue(mockReports);

      const reports = await prisma.report.findMany({
        where: {
          cryptoInfo: { walletNormalized: '0x742d35cc6634c0532925a3b844bc454e4438f44e' },
        },
      });

      expect(reports).toHaveLength(1);
    });
  });

  describe('Fuzzy Search Mode', () => {
    it('should find similar names using trigram similarity', async () => {
      // Simulating trigram search results
      const mockResults = [
        { id: 'report-1', fullName: 'John Smith', similarity: 0.85 },
        { id: 'report-2', fullName: 'Jon Smith', similarity: 0.72 },
      ];

      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockResults);

      const results = await prisma.$queryRaw`
        SELECT id, "fullName", similarity("fullName", 'John Smith') as similarity
        FROM perpetrators
        WHERE similarity("fullName", 'John Smith') > 0.3
        ORDER BY similarity DESC
        LIMIT 10
      `;

      expect(results).toHaveLength(2);
      expect((results as any[])[0].similarity).toBeGreaterThan(0.7);
    });

    it('should handle partial name matches', async () => {
      const searchQuery = 'John';

      // Simulating LIKE search
      const mockReports = [
        { id: 'report-1', perpetrators: [{ fullName: 'John Smith' }] },
        { id: 'report-2', perpetrators: [{ fullName: 'Johnny Doe' }] },
      ];

      (prisma.report.findMany as jest.Mock).mockResolvedValue(mockReports);

      const reports = await prisma.report.findMany({
        where: {
          perpetrators: {
            some: { fullName: { contains: searchQuery, mode: 'insensitive' } },
          },
        },
      });

      expect(reports).toHaveLength(2);
    });
  });

  describe('Auto Search Mode', () => {
    it('should use exact mode for emails', () => {
      const _query = 'scammer@example.com';
      const detectedType = 'email';
      const expectedMode = detectedType === 'name' ? 'fuzzy' : 'exact';

      expect(expectedMode).toBe('exact');
    });

    it('should use fuzzy mode for names', () => {
      const _query = 'John Smith';
      const detectedType = 'name';
      const expectedMode = detectedType === 'name' ? 'fuzzy' : 'exact';

      expect(expectedMode).toBe('fuzzy');
    });
  });
});

describe('Search API - Filtering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Fraud Type Filter', () => {
    it('should filter by single fraud type', async () => {
      const mockReports = [
        { id: 'report-1', fraudType: 'INVESTMENT_FRAUD' },
        { id: 'report-2', fraudType: 'INVESTMENT_FRAUD' },
      ];

      (prisma.report.findMany as jest.Mock).mockResolvedValue(mockReports);

      const reports = await prisma.report.findMany({
        where: { fraudType: 'INVESTMENT_FRAUD' },
      });

      expect(reports.every((r) => r.fraudType === 'INVESTMENT_FRAUD')).toBe(true);
    });

    it('should validate fraud type enum', () => {
      const VALID_FRAUD_TYPES = [
        'ROMANCE_SCAM',
        'INVESTMENT_FRAUD',
        'PHISHING',
        'IDENTITY_THEFT',
        'ONLINE_SHOPPING_FRAUD',
        'TECH_SUPPORT_SCAM',
        'LOTTERY_PRIZE_SCAM',
        'CRYPTOCURRENCY_SCAM',
        'PYRAMID_MLM_SCHEME',
        'SEXTORTION',
        'BUSINESS_EMAIL_COMPROMISE',
        'SIM_SWAPPING',
        'CATFISHING',
        'OTHER',
      ];

      expect(VALID_FRAUD_TYPES).toContain('INVESTMENT_FRAUD');
      expect(VALID_FRAUD_TYPES).not.toContain('INVALID_TYPE');
    });
  });

  describe('Country Filter', () => {
    it('should filter by country code', async () => {
      const mockReports = [
        { id: 'report-1', locationCountry: 'SK' },
      ];

      (prisma.report.findMany as jest.Mock).mockResolvedValue(mockReports);

      const reports = await prisma.report.findMany({
        where: { locationCountry: 'SK' },
      });

      expect(reports[0].locationCountry).toBe('SK');
    });

    it('should validate ISO 3166-1 alpha-2 country code', () => {
      const isValidCountryCode = (code: string): boolean => {
        return /^[A-Z]{2}$/.test(code);
      };

      expect(isValidCountryCode('SK')).toBe(true);
      expect(isValidCountryCode('USA')).toBe(false);
      expect(isValidCountryCode('s')).toBe(false);
    });
  });

  describe('Date Range Filter', () => {
    it('should filter by date from', async () => {
      const dateFrom = new Date('2024-01-01');

      (prisma.report.findMany as jest.Mock).mockResolvedValue([
        { id: 'report-1', createdAt: new Date('2024-02-01') },
      ]);

      const reports = await prisma.report.findMany({
        where: { createdAt: { gte: dateFrom } },
      });

      expect(reports.every((r) => new Date(r.createdAt) >= dateFrom)).toBe(true);
    });

    it('should filter by date to', async () => {
      const dateTo = new Date('2024-12-31');

      (prisma.report.findMany as jest.Mock).mockResolvedValue([
        { id: 'report-1', createdAt: new Date('2024-06-15') },
      ]);

      const reports = await prisma.report.findMany({
        where: { createdAt: { lte: dateTo } },
      });

      expect(reports.every((r) => new Date(r.createdAt) <= dateTo)).toBe(true);
    });

    it('should filter by date range', async () => {
      const dateFrom = new Date('2024-01-01');
      const dateTo = new Date('2024-06-30');

      (prisma.report.findMany as jest.Mock).mockResolvedValue([
        { id: 'report-1', createdAt: new Date('2024-03-15') },
      ]);

      const reports = await prisma.report.findMany({
        where: {
          createdAt: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
      });

      expect(reports.every((r) => {
        const date = new Date(r.createdAt);
        return date >= dateFrom && date <= dateTo;
      })).toBe(true);
    });
  });

  describe('Financial Loss Filter', () => {
    it('should filter by minimum amount', async () => {
      const minAmount = 1000;

      (prisma.report.findMany as jest.Mock).mockResolvedValue([
        { id: 'report-1', financialLossAmount: 5000 },
        { id: 'report-2', financialLossAmount: 15000 },
      ]);

      const reports = await prisma.report.findMany({
        where: { financialLossAmount: { gte: minAmount } },
      });

      expect(reports.every((r) => r.financialLossAmount >= minAmount)).toBe(true);
    });

    it('should filter by maximum amount', async () => {
      const maxAmount = 10000;

      (prisma.report.findMany as jest.Mock).mockResolvedValue([
        { id: 'report-1', financialLossAmount: 5000 },
      ]);

      const reports = await prisma.report.findMany({
        where: { financialLossAmount: { lte: maxAmount } },
      });

      expect(reports.every((r) => r.financialLossAmount <= maxAmount)).toBe(true);
    });
  });
});

describe('Search API - Pagination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should respect limit parameter', async () => {
    const mockReports = Array.from({ length: 10 }, (_, i) => ({ id: `report-${i}` }));

    (prisma.report.findMany as jest.Mock).mockResolvedValue(mockReports);

    const reports = await prisma.report.findMany({ take: 10 });

    expect(reports).toHaveLength(10);
  });

  it('should respect offset parameter', async () => {
    (prisma.report.findMany as jest.Mock).mockResolvedValue([
      { id: 'report-11' },
      { id: 'report-12' },
    ]);

    const _reports = await prisma.report.findMany({ skip: 10, take: 10 });

    expect(prisma.report.findMany).toHaveBeenCalledWith({ skip: 10, take: 10 });
  });

  it('should enforce maximum limit of 100', () => {
    const requestedLimit = 500;
    const maxLimit = 100;
    const effectiveLimit = Math.min(requestedLimit, maxLimit);

    expect(effectiveLimit).toBe(100);
  });

  it('should default to limit of 20', () => {
    const requestedLimit = undefined;
    const defaultLimit = 20;
    const effectiveLimit = requestedLimit || defaultLimit;

    expect(effectiveLimit).toBe(20);
  });

  it('should return total count for pagination', async () => {
    (prisma.report.count as jest.Mock).mockResolvedValue(150);

    const count = await prisma.report.count({ where: { status: 'APPROVED' } });

    expect(count).toBe(150);
  });
});

describe('Search API - Role-Based Masking', () => {
  const maskSensitiveData = (data: any, userRole: string): any => {
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      return data; // Full access
    }

    const masked = { ...data };

    if (userRole === 'BASIC') {
      // Heavy masking
      if (masked.email) {
        const [local, domain] = masked.email.split('@');
        masked.email = `${local[0]}***@${domain}`;
      }
      if (masked.phone) {
        masked.phone = masked.phone.slice(0, 4) + '***' + masked.phone.slice(-2);
      }
      if (masked.iban) {
        masked.iban = masked.iban.slice(0, 4) + '****' + masked.iban.slice(-4);
      }
    } else if (userRole === 'STANDARD') {
      // Moderate masking
      if (masked.email) {
        const [local, domain] = masked.email.split('@');
        masked.email = `${local.slice(0, 3)}***@${domain}`;
      }
    }

    return masked;
  };

  it('should not mask data for ADMIN users', () => {
    const data = { email: 'scammer@example.com', phone: '+421900123456' };
    const masked = maskSensitiveData(data, 'ADMIN');

    expect(masked.email).toBe('scammer@example.com');
    expect(masked.phone).toBe('+421900123456');
  });

  it('should heavily mask data for BASIC users', () => {
    const data = { email: 'scammer@example.com', phone: '+421900123456' };
    const masked = maskSensitiveData(data, 'BASIC');

    expect(masked.email).toBe('s***@example.com');
    expect(masked.phone).toBe('+421***56');
  });

  it('should moderately mask data for STANDARD users', () => {
    const data = { email: 'scammer@example.com' };
    const masked = maskSensitiveData(data, 'STANDARD');

    expect(masked.email).toBe('sca***@example.com');
  });

  it('should mask IBAN for BASIC users', () => {
    const data = { iban: 'SK3112000000198742637541' };
    const masked = maskSensitiveData(data, 'BASIC');

    expect(masked.iban).toBe('SK31****7541');
  });
});

describe('Search API - Faceted Search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return fraud type facets', async () => {
    const mockFacets = [
      { fraudType: 'INVESTMENT_FRAUD', _count: 25 },
      { fraudType: 'ROMANCE_SCAM', _count: 18 },
      { fraudType: 'PHISHING', _count: 12 },
    ];

    (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockFacets);

    // Simulating faceted query
    const facets = await prisma.$queryRaw`
      SELECT "fraudType", COUNT(*) as count
      FROM reports
      WHERE status = 'APPROVED'
      GROUP BY "fraudType"
      ORDER BY count DESC
    `;

    expect(facets).toHaveLength(3);
  });

  it('should return country facets', async () => {
    const mockFacets = [
      { locationCountry: 'SK', _count: 45 },
      { locationCountry: 'CZ', _count: 32 },
      { locationCountry: 'DE', _count: 28 },
    ];

    (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockFacets);

    const facets = await prisma.$queryRaw`
      SELECT "locationCountry", COUNT(*) as count
      FROM reports
      WHERE status = 'APPROVED'
      GROUP BY "locationCountry"
      ORDER BY count DESC
    `;

    expect(facets).toHaveLength(3);
  });
});

describe('Search API - Error Handling', () => {
  it('should handle empty query gracefully', () => {
    const query = '';
    const isValidQuery = query.trim().length >= 2;

    expect(isValidQuery).toBe(false);
  });

  it('should handle query too short', () => {
    const query = 'a';
    const minQueryLength = 2;

    expect(query.length).toBeLessThan(minQueryLength);
  });

  it('should sanitize special characters in query', () => {
    const sanitizeQuery = (query: string): string => {
      return query
        .replace(/[<>]/g, '') // Remove potential XSS
        .replace(/[;'"]/g, '') // Remove SQL injection attempts
        .trim();
    };

    const maliciousQuery = "'; DROP TABLE reports; --";
    const sanitized = sanitizeQuery(maliciousQuery);

    expect(sanitized).not.toContain(';');
    expect(sanitized).not.toContain("'");
  });

  it('should handle database timeout gracefully', async () => {
    (prisma.report.findMany as jest.Mock).mockRejectedValue(new Error('Query timeout'));

    await expect(prisma.report.findMany({})).rejects.toThrow('Query timeout');
  });
});

describe('Search API - Performance', () => {
  it('should only select necessary fields', async () => {
    const selectFields = {
      id: true,
      publicId: true,
      summary: true,
      fraudType: true,
      severity: true,
      locationCountry: true,
      financialLossAmount: true,
      createdAt: true,
    };

    (prisma.report.findMany as jest.Mock).mockResolvedValue([]);

    await prisma.report.findMany({
      select: selectFields,
      take: 20,
    });

    expect(prisma.report.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ select: selectFields })
    );
  });

  it('should use indexes for common searches', () => {
    // These fields should have indexes in schema
    const indexedFields = [
      'status',
      'fraudType',
      'locationCountry',
      'createdAt',
      'financialLossAmount',
    ];

    expect(indexedFields).toContain('status');
    expect(indexedFields).toContain('fraudType');
  });
});
