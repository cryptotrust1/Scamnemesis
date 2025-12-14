import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Require admin:read scope
  const auth = await requireAuth(request, ['admin:read']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '10');
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
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch users and count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
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
      displayName: user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || user.lastName || null,
      firstName: user.firstName,
      lastName: user.lastName,
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
