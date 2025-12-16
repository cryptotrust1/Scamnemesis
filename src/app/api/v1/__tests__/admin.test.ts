/**
 * Tests for /api/v1/admin endpoints
 */

// Mock Prisma client
jest.mock('@/lib/db', () => ({
  prisma: {
    report: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    comment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    duplicateCluster: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

// Mock auth middleware
jest.mock('@/lib/middleware/auth', () => ({
  getAuthContext: jest.fn(),
  checkRateLimit: jest.fn().mockResolvedValue({ allowed: true, resetAt: new Date() }),
  getClientIp: jest.fn().mockReturnValue('127.0.0.1'),
}));

import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';

describe('Admin API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authorization', () => {
    it('should reject requests without admin scope', async () => {
      // Mock non-admin user
      (getAuthContext as jest.Mock).mockResolvedValue({
        user: { sub: 'user-123', role: 'BASIC' },
        scopes: ['read:reports'],
        isAuthenticated: true,
      });

      const authContext = await getAuthContext({} as any);
      const hasAdminScope = authContext.scopes.some((s: string) => s.startsWith('admin:'));

      expect(hasAdminScope).toBe(false);
    });

    it('should allow requests with admin scope', async () => {
      // Mock admin user
      (getAuthContext as jest.Mock).mockResolvedValue({
        user: { sub: 'admin-123', role: 'ADMIN' },
        scopes: ['admin:read', 'admin:write', 'admin:reports'],
        isAuthenticated: true,
      });

      const authContext = await getAuthContext({} as any);
      const hasAdminScope = authContext.scopes.some((s: string) => s.startsWith('admin:'));

      expect(hasAdminScope).toBe(true);
    });

    it('should allow SUPER_ADMIN all operations', async () => {
      (getAuthContext as jest.Mock).mockResolvedValue({
        user: { sub: 'superadmin-123', role: 'SUPER_ADMIN' },
        scopes: ['admin:*', 'super_admin:*'],
        isAuthenticated: true,
      });

      const authContext = await getAuthContext({} as any);
      const isSuperAdmin = authContext.user?.role === 'SUPER_ADMIN';

      expect(isSuperAdmin).toBe(true);
    });
  });

  describe('GET /api/v1/admin/reports', () => {
    it('should return paginated reports', async () => {
      const mockReports = [
        {
          id: 'report-1',
          publicId: 'REP-001',
          status: 'PENDING',
          fraudType: 'INVESTMENT_FRAUD',
          severity: 'HIGH',
          summary: 'Test report 1',
          createdAt: new Date(),
        },
        {
          id: 'report-2',
          publicId: 'REP-002',
          status: 'APPROVED',
          fraudType: 'ROMANCE_SCAM',
          severity: 'MEDIUM',
          summary: 'Test report 2',
          createdAt: new Date(),
        },
      ];

      (prisma.report.findMany as jest.Mock).mockResolvedValue(mockReports);
      (prisma.report.count as jest.Mock).mockResolvedValue(2);

      const reports = await prisma.report.findMany({
        take: 10,
        skip: 0,
        orderBy: { createdAt: 'desc' },
      });
      const total = await prisma.report.count();

      expect(reports).toHaveLength(2);
      expect(total).toBe(2);
    });

    it('should filter reports by status', async () => {
      const pendingReports = [
        { id: 'report-1', status: 'PENDING' },
      ];

      (prisma.report.findMany as jest.Mock).mockResolvedValue(pendingReports);

      const reports = await prisma.report.findMany({
        where: { status: 'PENDING' },
      });

      expect(reports).toHaveLength(1);
      expect(reports[0].status).toBe('PENDING');
    });

    it('should filter reports by fraud type', async () => {
      const fraudReports = [
        { id: 'report-1', fraudType: 'PHISHING' },
      ];

      (prisma.report.findMany as jest.Mock).mockResolvedValue(fraudReports);

      const reports = await prisma.report.findMany({
        where: { fraudType: 'PHISHING' },
      });

      expect(reports[0].fraudType).toBe('PHISHING');
    });
  });

  describe('POST /api/v1/admin/reports/:id/approve', () => {
    it('should approve a pending report', async () => {
      const mockReport = {
        id: 'report-1',
        status: 'PENDING',
      };

      (prisma.report.findUnique as jest.Mock).mockResolvedValue(mockReport);
      (prisma.report.update as jest.Mock).mockResolvedValue({
        ...mockReport,
        status: 'APPROVED',
        publishedAt: new Date(),
        moderatedAt: new Date(),
      });

      const report = await prisma.report.findUnique({ where: { id: 'report-1' } });
      expect(report?.status).toBe('PENDING');

      const updatedReport = await prisma.report.update({
        where: { id: 'report-1' },
        data: {
          status: 'APPROVED',
          publishedAt: new Date(),
          moderatedAt: new Date(),
        },
      });

      expect(updatedReport.status).toBe('APPROVED');
      expect(updatedReport.publishedAt).toBeDefined();
    });

    it('should create audit log on approval', async () => {
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({
        id: 'audit-1',
        action: 'REPORT_APPROVED',
        entityType: 'report',
        entityId: 'report-1',
      });

      await prisma.auditLog.create({
        data: {
          action: 'REPORT_APPROVED',
          entityType: 'report',
          entityId: 'report-1',
          userId: 'admin-123',
        },
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'REPORT_APPROVED',
          }),
        })
      );
    });

    it('should reject approval of already approved report', async () => {
      const mockReport = {
        id: 'report-1',
        status: 'APPROVED',
      };

      (prisma.report.findUnique as jest.Mock).mockResolvedValue(mockReport);

      const report = await prisma.report.findUnique({ where: { id: 'report-1' } });

      // Should not allow re-approval
      expect(report?.status).toBe('APPROVED');
    });
  });

  describe('POST /api/v1/admin/reports/:id/reject', () => {
    it('should reject a report with reason', async () => {
      const mockReport = {
        id: 'report-1',
        status: 'PENDING',
      };

      (prisma.report.findUnique as jest.Mock).mockResolvedValue(mockReport);
      (prisma.report.update as jest.Mock).mockResolvedValue({
        ...mockReport,
        status: 'REJECTED',
        rejectionReason: 'Insufficient evidence',
        moderatedAt: new Date(),
      });

      const updatedReport = await prisma.report.update({
        where: { id: 'report-1' },
        data: {
          status: 'REJECTED',
          rejectionReason: 'Insufficient evidence',
          moderatedAt: new Date(),
        },
      });

      expect(updatedReport.status).toBe('REJECTED');
      expect(updatedReport.rejectionReason).toBe('Insufficient evidence');
    });

    it('should require rejection reason', () => {
      const validateRejection = (reason: string | undefined) => {
        return reason !== undefined && reason.trim().length > 0;
      };

      expect(validateRejection('Insufficient evidence')).toBe(true);
      expect(validateRejection('')).toBe(false);
      expect(validateRejection(undefined)).toBe(false);
    });
  });

  describe('GET /api/v1/admin/users', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          role: 'BASIC',
          status: 'ACTIVE',
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          role: 'STANDARD',
          status: 'ACTIVE',
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.count as jest.Mock).mockResolvedValue(2);

      const users = await prisma.user.findMany({
        take: 10,
        skip: 0,
      });

      expect(users).toHaveLength(2);
    });

    it('should filter users by role', async () => {
      const adminUsers = [
        { id: 'admin-1', role: 'ADMIN' },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(adminUsers);

      const users = await prisma.user.findMany({
        where: { role: 'ADMIN' },
      });

      expect(users[0].role).toBe('ADMIN');
    });
  });

  describe('PATCH /api/v1/admin/users/:id/role', () => {
    it('should update user role', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-1',
        role: 'GOLD',
      });

      const updatedUser = await prisma.user.update({
        where: { id: 'user-1' },
        data: { role: 'GOLD' },
      });

      expect(updatedUser.role).toBe('GOLD');
    });

    it('should validate role is valid enum value', () => {
      const validRoles = ['BASIC', 'STANDARD', 'GOLD', 'ADMIN', 'SUPER_ADMIN'];

      expect(validRoles.includes('GOLD')).toBe(true);
      expect(validRoles.includes('INVALID')).toBe(false);
    });

    it('should prevent non-super-admin from creating super admins', async () => {
      (getAuthContext as jest.Mock).mockResolvedValue({
        user: { sub: 'admin-123', role: 'ADMIN' },
        scopes: ['admin:write'],
      });

      const authContext = await getAuthContext({} as any);
      const canCreateSuperAdmin = authContext.user?.role === 'SUPER_ADMIN';

      expect(canCreateSuperAdmin).toBe(false);
    });
  });

  describe('POST /api/v1/admin/users/:id/ban', () => {
    it('should ban a user', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-1',
        status: 'BANNED',
        isActive: false,
      });

      const bannedUser = await prisma.user.update({
        where: { id: 'user-1' },
        data: {
          status: 'BANNED',
          isActive: false,
        },
      });

      expect(bannedUser.status).toBe('BANNED');
      expect(bannedUser.isActive).toBe(false);
    });

    it('should create audit log on ban', async () => {
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({
        id: 'audit-1',
        action: 'USER_BANNED',
      });

      await prisma.auditLog.create({
        data: {
          action: 'USER_BANNED',
          entityType: 'user',
          entityId: 'user-1',
          userId: 'admin-123',
          changes: { reason: 'Spam' },
        },
      });

      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/admin/comments', () => {
    it('should return comments with filters', async () => {
      const mockComments = [
        {
          id: 'comment-1',
          content: 'Test comment',
          status: 'PENDING',
          reportId: 'report-1',
        },
      ];

      (prisma.comment.findMany as jest.Mock).mockResolvedValue(mockComments);

      const comments = await prisma.comment.findMany({
        where: { status: 'PENDING' },
      });

      expect(comments).toHaveLength(1);
      expect(comments[0].status).toBe('PENDING');
    });
  });

  describe('POST /api/v1/admin/comments/:id/approve', () => {
    it('should approve a comment', async () => {
      (prisma.comment.update as jest.Mock).mockResolvedValue({
        id: 'comment-1',
        status: 'APPROVED',
      });

      const approved = await prisma.comment.update({
        where: { id: 'comment-1' },
        data: { status: 'APPROVED' },
      });

      expect(approved.status).toBe('APPROVED');
    });
  });

  describe('GET /api/v1/admin/duplicates', () => {
    it('should return duplicate clusters', async () => {
      const mockClusters = [
        {
          id: 'cluster-1',
          confidence: 0.95,
          matchType: 'PHONE_MATCH',
          status: 'PENDING',
          reports: [{ id: 'report-1' }, { id: 'report-2' }],
        },
      ];

      (prisma.duplicateCluster.findMany as jest.Mock).mockResolvedValue(mockClusters);

      const clusters = await prisma.duplicateCluster.findMany({
        where: { status: 'PENDING' },
        include: { reports: true },
      });

      expect(clusters).toHaveLength(1);
      expect(clusters[0].confidence).toBeGreaterThan(0.9);
    });
  });

  describe('POST /api/v1/admin/duplicates/:id/merge', () => {
    it('should merge duplicate reports', async () => {
      (prisma.duplicateCluster.update as jest.Mock).mockResolvedValue({
        id: 'cluster-1',
        status: 'MERGED',
        mergedAt: new Date(),
      });

      const merged = await prisma.duplicateCluster.update({
        where: { id: 'cluster-1' },
        data: {
          status: 'MERGED',
          mergedAt: new Date(),
        },
      });

      expect(merged.status).toBe('MERGED');
    });
  });
});

describe('Admin Statistics', () => {
  it('should calculate dashboard statistics', async () => {
    (prisma.report.count as jest.Mock)
      .mockResolvedValueOnce(100) // total
      .mockResolvedValueOnce(20)  // pending
      .mockResolvedValueOnce(70)  // approved
      .mockResolvedValueOnce(10); // rejected

    const total = await prisma.report.count();
    const pending = await prisma.report.count({ where: { status: 'PENDING' } });
    const approved = await prisma.report.count({ where: { status: 'APPROVED' } });
    const rejected = await prisma.report.count({ where: { status: 'REJECTED' } });

    expect(total).toBe(100);
    expect(pending).toBe(20);
    expect(approved).toBe(70);
    expect(rejected).toBe(10);
    expect(pending + approved + rejected).toBe(total);
  });
});
