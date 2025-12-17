import { NextRequest, NextResponse } from 'next/server';
import { Prisma, ReportStatus, Severity, FraudType } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth, requireRateLimit } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

// Query parameter validation schema
const QuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'MERGED', 'ARCHIVED']).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  fraudType: z.string().optional(),
  q: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'severity', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(request: NextRequest) {
  // Rate limiting - 60 requests per minute for admin endpoints
  const rateLimitError = await requireRateLimit(request, 60);
  if (rateLimitError) return rateLimitError;

  // Require admin:read scope
  const auth = await requireAuth(request, ['admin:read']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const queryResult = QuerySchema.safeParse({
      page: searchParams.get('page') || 1,
      pageSize: searchParams.get('pageSize') || searchParams.get('page_size') || 20,
      status: searchParams.get('status') || undefined,
      severity: searchParams.get('severity') || undefined,
      fraudType: searchParams.get('fraudType') || searchParams.get('fraud_type') || undefined,
      q: searchParams.get('q') || searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || searchParams.get('sort_by') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || searchParams.get('sort_order') || 'desc',
    });

    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'validation_error', message: 'Invalid query parameters', details: queryResult.error.errors },
        { status: 400 }
      );
    }

    const { page, pageSize, status, severity, fraudType, q, sortBy, sortOrder } = queryResult.data;
    const skip = (page - 1) * pageSize;

    // Build where clause with proper typing
    const where: Prisma.ReportWhereInput = {};

    if (status) {
      where.status = status as ReportStatus;
    }

    if (severity) {
      where.severity = severity as Severity;
    }

    if (fraudType) {
      const upperFraudType = fraudType.toUpperCase() as FraudType;
      if (Object.values(FraudType).includes(upperFraudType)) {
        where.fraudType = upperFraudType;
      }
    }

    if (q) {
      where.OR = [
        { summary: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { publicId: { contains: q, mode: 'insensitive' } },
        { caseNumber: { contains: q, mode: 'insensitive' } },
        { reporter: { email: { contains: q, mode: 'insensitive' } } },
        { perpetrators: { some: { fullName: { contains: q, mode: 'insensitive' } } } },
        { perpetrators: { some: { email: { contains: q, mode: 'insensitive' } } } },
        { perpetrators: { some: { phone: { contains: q, mode: 'insensitive' } } } },
      ];
    }

    // Build orderBy
    const orderBy: Prisma.ReportOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Fetch reports and count in parallel
    const [reports, total, statusCounts] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        select: {
          id: true,
          publicId: true,
          caseNumber: true,
          status: true,
          severity: true,
          fraudType: true,
          summary: true,
          financialLossAmount: true,
          financialLossCurrency: true,
          locationCountry: true,
          createdAt: true,
          updatedAt: true,
          publishedAt: true,
          moderatedAt: true,
          reporter: {
            select: {
              id: true,
              email: true,
              displayName: true,
            },
          },
          reporterEmail: true,
          moderatedBy: {
            select: {
              id: true,
              displayName: true,
            },
          },
          _count: {
            select: {
              perpetrators: true,
              evidence: true,
              comments: true,
            },
          },
        },
      }),
      prisma.report.count({ where }),
      // Get status counts for dashboard stats
      prisma.report.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    // Format reports for response
    const formattedReports = reports.map((report) => ({
      id: report.id,
      publicId: report.publicId,
      caseNumber: report.caseNumber,
      status: report.status.toLowerCase(),
      severity: report.severity?.toLowerCase() || null,
      fraudType: report.fraudType?.toLowerCase() || null,
      summary: report.summary,
      financialLoss: report.financialLossAmount ? {
        amount: Number(report.financialLossAmount),
        currency: report.financialLossCurrency,
      } : null,
      country: report.locationCountry,
      reporter: report.reporter ? {
        id: report.reporter.id,
        email: report.reporter.email,
        displayName: report.reporter.displayName,
      } : report.reporterEmail ? {
        email: report.reporterEmail,
      } : null,
      moderatedBy: report.moderatedBy ? {
        id: report.moderatedBy.id,
        displayName: report.moderatedBy.displayName,
      } : null,
      counts: {
        perpetrators: report._count.perpetrators,
        evidence: report._count.evidence,
        comments: report._count.comments,
      },
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
      publishedAt: report.publishedAt?.toISOString() || null,
      moderatedAt: report.moderatedAt?.toISOString() || null,
    }));

    // Format status counts
    const stats = {
      pending: 0,
      underReview: 0,
      approved: 0,
      rejected: 0,
      merged: 0,
      archived: 0,
    };

    statusCounts.forEach((sc) => {
      switch (sc.status) {
        case 'PENDING':
          stats.pending = sc._count.status;
          break;
        case 'UNDER_REVIEW':
          stats.underReview = sc._count.status;
          break;
        case 'APPROVED':
          stats.approved = sc._count.status;
          break;
        case 'REJECTED':
          stats.rejected = sc._count.status;
          break;
        case 'MERGED':
          stats.merged = sc._count.status;
          break;
        case 'ARCHIVED':
          stats.archived = sc._count.status;
          break;
      }
    });

    return NextResponse.json({
      reports: formattedReports,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      stats,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
