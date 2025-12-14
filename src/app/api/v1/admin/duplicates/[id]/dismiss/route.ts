import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Require admin:edit scope
  const auth = await requireAuth(request, ['admin:edit']);
  if (auth instanceof NextResponse) return auth;

  const { id } = params;

  try {
    // Find the duplicate cluster
    const cluster = await prisma.duplicateCluster.findUnique({
      where: { id },
    });

    if (!cluster) {
      return NextResponse.json(
        { error: 'not_found', message: 'Duplicate cluster not found' },
        { status: 404 }
      );
    }

    if (cluster.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'invalid_state', message: 'Cluster is not pending' },
        { status: 400 }
      );
    }

    // Update cluster status
    const updatedCluster = await prisma.$transaction(async (tx) => {
      const updated = await tx.duplicateCluster.update({
        where: { id },
        data: {
          status: 'DISMISSED',
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: 'DUPLICATES_DISMISSED',
          entityType: 'DuplicateCluster',
          entityId: id,
          userId: auth.userId,
          changes: {},
          ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'),
        },
      });

      return updated;
    });

    return NextResponse.json({
      id: updatedCluster.id,
      status: 'dismissed',
    });
  } catch (error) {
    console.error('Error dismissing duplicates:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to dismiss duplicates' },
      { status: 500 }
    );
  }
}
