/**
 * Search API Tests
 *
 * Tests for /api/v1/search endpoint
 */

import { NextRequest } from 'next/server';

// Mock Prisma - using jest.fn() directly to avoid hoisting issues
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    report: {
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

// Get reference to mocked module
import db from '@/lib/db';
const mockPrismaReport = db.report as jest.Mocked<typeof db.report>;

// Mock middleware
jest.mock('@/lib/middleware/auth', () => ({
  requireAuth: jest.fn().mockResolvedValue(null),
  requireRateLimit: jest.fn().mockResolvedValue(null),
  optionalAuth: jest.fn().mockResolvedValue({ userId: 'user-1' }),
}));

import { GET } from '../search/route';
import { requireRateLimit, optionalAuth } from '@/lib/middleware/auth';

describe('Search API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrismaReport.count.mockResolvedValue(0);
    mockPrismaReport.findMany.mockResolvedValue([]);
    mockPrismaReport.groupBy.mockResolvedValue([]);
  });

  // Helper to create request
  const createRequest = (params: Record<string, string>) => {
    const url = new URL('http://localhost/api/v1/search');
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return new NextRequest(url);
  };

  describe('GET /api/v1/search - Validation', () => {
    it('should return 400 when query is missing', async () => {
      const request = createRequest({});

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('validation_error');
    });

    it('should return 400 when query is too short', async () => {
      const request = createRequest({ q: 'a' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('validation_error');
      expect(data.details.q).toBeDefined();
    });

    it('should return 400 when query exceeds max length', async () => {
      const request = createRequest({ q: 'a'.repeat(501) });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('validation_error');
    });

    it('should return 400 for invalid mode', async () => {
      const request = createRequest({ q: 'test query', mode: 'invalid' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('validation_error');
    });

    it('should return 400 for invalid limit', async () => {
      const request = createRequest({ q: 'test', limit: '200' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('validation_error');
    });

    it('should return 400 for negative offset', async () => {
      const request = createRequest({ q: 'test', offset: '-1' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('validation_error');
    });
  });

  describe('GET /api/v1/search - Search Modes', () => {
    const mockReport = {
      publicId: 'report-123',
      fraudType: 'PHISHING',
      locationCountry: 'SK',
      incidentDate: new Date('2024-01-15'),
      createdAt: new Date(),
      perpetrator: {
        fullName: 'John Scammer',
        phone: '+421900111222',
        email: 'scammer@example.com',
        fullNameNormalized: 'john scammer',
        phoneNormalized: '421900111222',
        emailNormalized: 'scammer@example.com',
      },
    };

    it('should search with auto mode (default)', async () => {
      mockPrismaReport.count.mockResolvedValue(1);
      mockPrismaReport.findMany.mockResolvedValue([mockReport]);
      mockPrismaReport.groupBy.mockResolvedValue([]);

      const request = createRequest({ q: 'test query' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.total).toBeDefined();
      expect(data.results).toBeDefined();
      expect(data.facets).toBeDefined();
    });

    it('should search with exact mode', async () => {
      mockPrismaReport.count.mockResolvedValue(0);
      mockPrismaReport.findMany.mockResolvedValue([]);

      const request = createRequest({ q: 'scammer@example.com', mode: 'exact' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.results).toEqual([]);
    });

    it('should search with fuzzy mode', async () => {
      mockPrismaReport.count.mockResolvedValue(1);
      mockPrismaReport.findMany.mockResolvedValue([mockReport]);
      mockPrismaReport.groupBy.mockResolvedValue([]);

      const request = createRequest({ q: 'John Scam', mode: 'fuzzy' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.total).toBe(1);
    });

    it('should fallback to fuzzy for semantic mode (not implemented)', async () => {
      mockPrismaReport.count.mockResolvedValue(1);
      mockPrismaReport.findMany.mockResolvedValue([mockReport]);
      mockPrismaReport.groupBy.mockResolvedValue([]);

      const request = createRequest({ q: 'scam reports', mode: 'semantic' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/v1/search - Query Type Detection', () => {
    it('should detect email query', async () => {
      mockPrismaReport.count.mockResolvedValue(0);
      mockPrismaReport.findMany.mockResolvedValue([]);

      const request = createRequest({ q: 'scammer@example.com', mode: 'exact' });

      await GET(request);

      // Email queries should search in perpetrator.emailNormalized
      expect(mockPrismaReport.findMany).toHaveBeenCalled();
    });

    it('should detect phone query', async () => {
      mockPrismaReport.count.mockResolvedValue(0);
      mockPrismaReport.findMany.mockResolvedValue([]);

      const request = createRequest({ q: '+421 900 111 222', mode: 'exact' });

      await GET(request);

      expect(mockPrismaReport.findMany).toHaveBeenCalled();
    });

    it('should detect IBAN query', async () => {
      mockPrismaReport.count.mockResolvedValue(0);
      mockPrismaReport.findMany.mockResolvedValue([]);

      const request = createRequest({ q: 'SK89 7500 0000 0000 1234 5678', mode: 'exact' });

      await GET(request);

      expect(mockPrismaReport.findMany).toHaveBeenCalled();
    });

    it('should detect Ethereum wallet query', async () => {
      mockPrismaReport.count.mockResolvedValue(0);
      mockPrismaReport.findMany.mockResolvedValue([]);

      const request = createRequest({
        q: '0x742d35Cc6634C0532925a3b844Bc9e7595f5bB27',
        mode: 'exact',
      });

      await GET(request);

      expect(mockPrismaReport.findMany).toHaveBeenCalled();
    });

    it('should detect Bitcoin wallet query', async () => {
      mockPrismaReport.count.mockResolvedValue(0);
      mockPrismaReport.findMany.mockResolvedValue([]);

      const request = createRequest({
        q: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        mode: 'exact',
      });

      await GET(request);

      expect(mockPrismaReport.findMany).toHaveBeenCalled();
    });

    it('should detect domain query', async () => {
      mockPrismaReport.count.mockResolvedValue(0);
      mockPrismaReport.findMany.mockResolvedValue([]);

      const request = createRequest({ q: 'fake-bank.com', mode: 'exact' });

      await GET(request);

      expect(mockPrismaReport.findMany).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/search - Filters', () => {
    it('should filter by country', async () => {
      mockPrismaReport.count.mockResolvedValue(0);
      mockPrismaReport.findMany.mockResolvedValue([]);

      const request = createRequest({ q: 'test', country: 'SK' });

      await GET(request);

      expect(mockPrismaReport.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            locationCountry: 'SK',
          }),
        })
      );
    });

    it('should filter by fraud type', async () => {
      mockPrismaReport.count.mockResolvedValue(0);
      mockPrismaReport.findMany.mockResolvedValue([]);

      const request = createRequest({ q: 'test', fraud_type: 'phishing' });

      await GET(request);

      expect(mockPrismaReport.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            fraudType: 'PHISHING',
          }),
        })
      );
    });

    it('should filter by date range', async () => {
      mockPrismaReport.count.mockResolvedValue(0);
      mockPrismaReport.findMany.mockResolvedValue([]);

      const request = createRequest({
        q: 'test',
        date_from: '2024-01-01',
        date_to: '2024-12-31',
      });

      await GET(request);

      expect(mockPrismaReport.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });

    it('should support custom fields parameter', async () => {
      mockPrismaReport.count.mockResolvedValue(0);
      mockPrismaReport.findMany.mockResolvedValue([]);

      const request = createRequest({
        q: 'scammer@example.com',
        fields: 'email,phone',
        mode: 'exact',
      });

      await GET(request);

      expect(mockPrismaReport.findMany).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/search - Pagination', () => {
    it('should use default limit and offset', async () => {
      mockPrismaReport.count.mockResolvedValue(0);
      mockPrismaReport.findMany.mockResolvedValue([]);

      const request = createRequest({ q: 'test' });

      await GET(request);

      expect(mockPrismaReport.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
          skip: 0,
        })
      );
    });

    it('should apply custom limit and offset', async () => {
      mockPrismaReport.count.mockResolvedValue(0);
      mockPrismaReport.findMany.mockResolvedValue([]);

      const request = createRequest({ q: 'test', limit: '50', offset: '100' });

      await GET(request);

      expect(mockPrismaReport.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
          skip: 100,
        })
      );
    });
  });

  describe('GET /api/v1/search - Response Format', () => {
    const mockReports = [
      {
        publicId: 'report-1',
        fraudType: 'PHISHING',
        locationCountry: 'SK',
        incidentDate: new Date('2024-01-15'),
        perpetrator: {
          fullName: 'John Scammer',
          phone: '+421900111222',
          email: 'scammer@example.com',
        },
      },
      {
        publicId: 'report-2',
        fraudType: 'INVESTMENT',
        locationCountry: 'CZ',
        incidentDate: new Date('2024-02-20'),
        perpetrator: {
          fullName: 'Jane Fraud',
        },
      },
    ];

    it('should return results in correct format', async () => {
      mockPrismaReport.count.mockResolvedValue(2);
      mockPrismaReport.findMany.mockResolvedValue(mockReports);
      mockPrismaReport.groupBy.mockResolvedValue([]);

      const request = createRequest({ q: 'test', mode: 'fuzzy' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.total).toBe(2);
      expect(data.results).toHaveLength(2);
      expect(data.results[0]).toMatchObject({
        id: 'report-1',
        fraud_type: 'phishing',
        country: 'SK',
      });
    });

    it('should return facets when results exist', async () => {
      mockPrismaReport.count.mockResolvedValue(5);
      mockPrismaReport.findMany.mockResolvedValue(mockReports);
      mockPrismaReport.groupBy
        .mockResolvedValueOnce([
          { locationCountry: 'SK', _count: 3 },
          { locationCountry: 'CZ', _count: 2 },
        ])
        .mockResolvedValueOnce([
          { fraudType: 'PHISHING', _count: 3 },
          { fraudType: 'INVESTMENT', _count: 2 },
        ]);

      const request = createRequest({ q: 'test', mode: 'fuzzy' });

      const response = await GET(request);
      const data = await response.json();

      expect(data.facets).toBeDefined();
      expect(data.facets.country).toBeDefined();
      expect(data.facets.fraud_type).toBeDefined();
    });

    it('should return empty facets when no results', async () => {
      mockPrismaReport.count.mockResolvedValue(0);
      mockPrismaReport.findMany.mockResolvedValue([]);

      const request = createRequest({ q: 'nonexistent' });

      const response = await GET(request);
      const data = await response.json();

      expect(data.total).toBe(0);
      expect(data.results).toEqual([]);
      expect(data.facets).toEqual({});
    });
  });

  describe('GET /api/v1/search - Rate Limiting', () => {
    it('should apply rate limiting', async () => {
      const request = createRequest({ q: 'test' });

      await GET(request);

      expect(requireRateLimit).toHaveBeenCalledWith(request, 100);
    });

    it('should return rate limit error when exceeded', async () => {
      const mockRateLimitError = Response.json(
        { error: 'rate_limit_exceeded' },
        { status: 429 }
      );
      (requireRateLimit as jest.Mock).mockResolvedValueOnce(mockRateLimitError);

      const request = createRequest({ q: 'test' });

      const response = await GET(request);

      expect(response.status).toBe(429);
    });
  });

  describe('GET /api/v1/search - Authentication', () => {
    it('should support optional authentication', async () => {
      const request = createRequest({ q: 'test' });

      await GET(request);

      expect(optionalAuth).toHaveBeenCalledWith(request);
    });
  });

  describe('GET /api/v1/search - Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockPrismaReport.findMany.mockRejectedValue(new Error('Database error'));

      const request = createRequest({ q: 'test' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('internal_error');
    });
  });

  describe('GET /api/v1/search - Auto Mode Fallback', () => {
    it('should fallback to fuzzy when exact returns no results', async () => {
      // First call (exact search) returns 0
      mockPrismaReport.count
        .mockResolvedValueOnce(0) // exact search count
        .mockResolvedValueOnce(5); // fuzzy search count

      mockPrismaReport.findMany
        .mockResolvedValueOnce([]) // exact search results
        .mockResolvedValueOnce([
          {
            publicId: 'report-1',
            fraudType: 'PHISHING',
            perpetrator: { fullName: 'John Test' },
          },
        ]); // fuzzy search results

      mockPrismaReport.groupBy.mockResolvedValue([]);

      const request = createRequest({ q: 'John Test', mode: 'auto' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.total).toBe(5);
    });

    it('should use exact results when found in auto mode', async () => {
      mockPrismaReport.count.mockResolvedValue(1);
      mockPrismaReport.findMany.mockResolvedValue([
        {
          publicId: 'report-1',
          fraudType: 'PHISHING',
          perpetrator: {
            email: 'scammer@test.com',
            emailNormalized: 'scammer@test.com',
          },
        },
      ]);
      mockPrismaReport.groupBy.mockResolvedValue([]);

      const request = createRequest({ q: 'scammer@test.com', mode: 'auto' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.total).toBe(1);
    });
  });
});
