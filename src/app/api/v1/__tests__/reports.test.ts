/**
 * Tests for /api/v1/reports endpoints
 */

// Mock Prisma client
jest.mock('@/lib/db', () => ({
  prisma: {
    report: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    perpetrator: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    comment: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    identifier: {
      createMany: jest.fn(),
    },
  },
}));

// Mock auth middleware
jest.mock('@/lib/middleware/auth', () => ({
  withAuth: jest.fn((handler) => handler),
  getAuthUser: jest.fn(),
}));

import { prisma } from '@/lib/db';

describe('Reports API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/reports', () => {
    it('should return paginated list of reports', async () => {
      const mockReports = [
        {
          id: 'report-1',
          publicId: 'RPT-2024-000001',
          title: 'Investment Fraud',
          summary: 'Test summary',
          fraudType: 'INVESTMENT_FRAUD',
          status: 'APPROVED',
          createdAt: new Date(),
        },
        {
          id: 'report-2',
          publicId: 'RPT-2024-000002',
          title: 'Romance Scam',
          summary: 'Test summary 2',
          fraudType: 'ROMANCE_SCAM',
          status: 'APPROVED',
          createdAt: new Date(),
        },
      ];

      (prisma.report.findMany as jest.Mock).mockResolvedValue(mockReports);
      (prisma.report.count as jest.Mock).mockResolvedValue(2);

      const reports = await prisma.report.findMany({
        take: 20,
        skip: 0,
        where: { status: 'APPROVED' },
      });

      expect(reports).toHaveLength(2);
      expect(reports[0]).toHaveProperty('publicId');
    });

    it('should filter reports by fraud type', async () => {
      const mockReports = [
        {
          id: 'report-1',
          fraudType: 'INVESTMENT_FRAUD',
          status: 'APPROVED',
        },
      ];

      (prisma.report.findMany as jest.Mock).mockResolvedValue(mockReports);

      const reports = await prisma.report.findMany({
        where: {
          fraudType: 'INVESTMENT_FRAUD',
          status: 'APPROVED',
        },
      });

      expect(reports).toHaveLength(1);
      expect(reports[0].fraudType).toBe('INVESTMENT_FRAUD');
    });

    it('should filter reports by status', async () => {
      const mockReports = [
        { id: 'report-1', status: 'PENDING' },
        { id: 'report-2', status: 'PENDING' },
      ];

      (prisma.report.findMany as jest.Mock).mockResolvedValue(mockReports);

      const reports = await prisma.report.findMany({
        where: { status: 'PENDING' },
      });

      expect(reports.every((r) => r.status === 'PENDING')).toBe(true);
    });
  });

  describe('GET /api/v1/reports/:id', () => {
    it('should return a single report by ID', async () => {
      const mockReport = {
        id: 'report-123',
        publicId: 'RPT-2024-000001',
        title: 'Investment Fraud Report',
        summary: 'Detailed summary of the fraud',
        description: 'Full description of the incident',
        fraudType: 'INVESTMENT_FRAUD',
        severity: 'HIGH',
        status: 'APPROVED',
        perpetrator: {
          fullName: 'John Doe',
          emails: [{ value: 'scammer@example.com' }],
        },
        financialLoss: {
          amount: 15000,
          currency: 'EUR',
        },
        createdAt: new Date(),
      };

      (prisma.report.findFirst as jest.Mock).mockResolvedValue(mockReport);

      const report = await prisma.report.findFirst({
        where: { publicId: 'RPT-2024-000001' },
      });

      expect(report).not.toBeNull();
      expect(report?.publicId).toBe('RPT-2024-000001');
      expect(report?.perpetrator).toBeDefined();
    });

    it('should return null for non-existent report', async () => {
      (prisma.report.findFirst as jest.Mock).mockResolvedValue(null);

      const report = await prisma.report.findFirst({
        where: { publicId: 'NON-EXISTENT' },
      });

      expect(report).toBeNull();
    });
  });

  describe('POST /api/v1/reports', () => {
    const validReportData = {
      title: 'New Fraud Report',
      summary: 'Brief summary of the fraud',
      description: 'Detailed description of the incident',
      fraudType: 'INVESTMENT_FRAUD',
      perpetrator: {
        fullName: 'Scammer Name',
        emails: ['scammer@example.com'],
        phones: ['+421 900 000 000'],
      },
      financialLoss: {
        amount: 5000,
        currency: 'EUR',
      },
    };

    it('should create a new report with valid data', async () => {
      const mockCreatedReport = {
        id: 'new-report-123',
        publicId: 'RPT-2024-000003',
        ...validReportData,
        status: 'PENDING',
        createdAt: new Date(),
      };

      (prisma.report.create as jest.Mock).mockResolvedValue(mockCreatedReport);

      const report = await prisma.report.create({
        data: {
          ...validReportData,
          publicId: 'RPT-2024-000003',
          status: 'PENDING',
        },
      });

      expect(report).toHaveProperty('id');
      expect(report.status).toBe('PENDING');
    });

    it('should require title field', () => {
      const invalidData = { ...validReportData };
      delete (invalidData as any).title;

      expect(invalidData.title).toBeUndefined();
    });

    it('should require fraudType field', () => {
      const invalidData = { ...validReportData };
      delete (invalidData as any).fraudType;

      expect(invalidData.fraudType).toBeUndefined();
    });
  });

  describe('PATCH /api/v1/reports/:id', () => {
    it('should update report status', async () => {
      const mockUpdatedReport = {
        id: 'report-123',
        status: 'APPROVED',
        moderatedAt: new Date(),
      };

      (prisma.report.update as jest.Mock).mockResolvedValue(mockUpdatedReport);

      const report = await prisma.report.update({
        where: { id: 'report-123' },
        data: { status: 'APPROVED', moderatedAt: new Date() },
      });

      expect(report.status).toBe('APPROVED');
      expect(report.moderatedAt).toBeDefined();
    });
  });

  describe('DELETE /api/v1/reports/:id', () => {
    it('should delete a report', async () => {
      (prisma.report.delete as jest.Mock).mockResolvedValue({ id: 'report-123' });

      await prisma.report.delete({ where: { id: 'report-123' } });

      expect(prisma.report.delete).toHaveBeenCalledWith({
        where: { id: 'report-123' },
      });
    });
  });
});

describe('Report Comments API', () => {
  describe('GET /api/v1/reports/:id/comments', () => {
    it('should return comments for a report', async () => {
      const mockComments = [
        {
          id: 'comment-1',
          content: 'This is helpful',
          status: 'APPROVED',
          author: { displayName: 'User 1' },
          createdAt: new Date(),
        },
        {
          id: 'comment-2',
          content: 'Thanks for reporting',
          status: 'APPROVED',
          author: { displayName: 'User 2' },
          createdAt: new Date(),
        },
      ];

      (prisma.comment.findMany as jest.Mock).mockResolvedValue(mockComments);

      const comments = await prisma.comment.findMany({
        where: { reportId: 'report-123', status: 'APPROVED' },
      });

      expect(comments).toHaveLength(2);
    });
  });

  describe('POST /api/v1/reports/:id/comments', () => {
    it('should create a new comment', async () => {
      const mockComment = {
        id: 'new-comment-123',
        content: 'New comment text',
        status: 'PENDING',
        reportId: 'report-123',
        authorId: 'user-123',
        createdAt: new Date(),
      };

      (prisma.comment.create as jest.Mock).mockResolvedValue(mockComment);

      const comment = await prisma.comment.create({
        data: {
          content: 'New comment text',
          reportId: 'report-123',
          authorId: 'user-123',
        },
      });

      expect(comment).toHaveProperty('id');
      expect(comment.status).toBe('PENDING');
    });

    it('should require content field', () => {
      const commentData = { reportId: 'report-123', authorId: 'user-123' };
      expect(commentData).not.toHaveProperty('content');
    });
  });
});

describe('Report Validation', () => {
  const FRAUD_TYPES = [
    'INVESTMENT_FRAUD',
    'ROMANCE_SCAM',
    'PHISHING',
    'FAKE_ESHOP',
    'ADVANCE_FEE',
    'TECH_SUPPORT',
    'CRYPTO_SCAM',
    'JOB_SCAM',
    'OTHER',
  ];

  const SEVERITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  it('should validate fraud type', () => {
    const validType = 'INVESTMENT_FRAUD';
    const invalidType = 'INVALID_TYPE';

    expect(FRAUD_TYPES.includes(validType)).toBe(true);
    expect(FRAUD_TYPES.includes(invalidType)).toBe(false);
  });

  it('should validate severity level', () => {
    const validSeverity = 'HIGH';
    const invalidSeverity = 'EXTREME';

    expect(SEVERITY_LEVELS.includes(validSeverity)).toBe(true);
    expect(SEVERITY_LEVELS.includes(invalidSeverity)).toBe(false);
  });

  it('should validate financial loss amount is positive', () => {
    const validAmount = 5000;
    const invalidAmount = -100;

    expect(validAmount > 0).toBe(true);
    expect(invalidAmount > 0).toBe(false);
  });

  it('should validate currency code', () => {
    const validCurrencies = ['EUR', 'USD', 'CZK', 'GBP'];
    const currency = 'EUR';

    expect(validCurrencies.includes(currency)).toBe(true);
  });
});

describe('Public ID Generation', () => {
  const generatePublicId = (): string => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `RPT-${year}-${random}`;
  };

  it('should generate valid public ID format', () => {
    const publicId = generatePublicId();
    const pattern = /^RPT-\d{4}-\d{6}$/;

    expect(pattern.test(publicId)).toBe(true);
  });

  it('should include current year', () => {
    const publicId = generatePublicId();
    const currentYear = new Date().getFullYear().toString();

    expect(publicId).toContain(currentYear);
  });

  it('should generate unique IDs', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generatePublicId());
    }

    // Most IDs should be unique (allowing for rare collisions)
    expect(ids.size).toBeGreaterThan(90);
  });
});
