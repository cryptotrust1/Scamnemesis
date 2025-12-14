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
    const pageSize = parseInt(searchParams.get('page_size') || '20');
    const action = searchParams.get('action');
    const entityType = searchParams.get('entity_type');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (action) {
      where.action = action;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    // Fetch audit logs and count
    const [entries, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          userId: true,
          changes: true,
          ipAddress: true,
          createdAt: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Format response
    const formattedEntries = entries.map((entry) => ({
      id: entry.id,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      userId: entry.userId,
      userEmail: entry.user?.email || null,
      changes: entry.changes,
      ipAddress: entry.ipAddress,
      createdAt: entry.createdAt.toISOString(),
    }));

    return NextResponse.json({
      entries: formattedEntries,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to fetch audit log' },
      { status: 500 }
    );
  }
}
