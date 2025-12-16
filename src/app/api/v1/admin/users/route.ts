import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, requireRateLimit } from '@/lib/middleware/auth';
import { parsePagination } from '@/lib/utils/pagination';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Rate limiting - 60 requests per minute for admin endpoints
  const rateLimitError = await requireRateLimit(request, 60);
  if (rateLimitError) return rateLimitError;

  // Require admin:read scope
  const auth = await requireAuth(request, ['admin:read']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    // Safe pagination parsing with bounds checking to prevent DoS
    const { page, pageSize, skip } = parsePagination(searchParams);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('q');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (role) {
      where.role = role;
    }

    if (status) {
      if (status === 'ACTIVE') {
        where.isActive = true;
      } else if (status === 'BANNED') {
        where.isActive = false;
      } else if (status === 'PENDING') {
        where.emailVerified = false;
      }
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch users and count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          displayName: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              reports: true,
              comments: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Format response
    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      displayName: user.displayName || user.name || null,
      name: user.name,
      role: user.role,
      status: !user.isActive
        ? 'BANNED'
        : !user.emailVerified
        ? 'PENDING'
        : 'ACTIVE',
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      reportsCount: user._count.reports,
      commentsCount: user._count.comments,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
    }));

    return NextResponse.json({
      users: formattedUsers,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
