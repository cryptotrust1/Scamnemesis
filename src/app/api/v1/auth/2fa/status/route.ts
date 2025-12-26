import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/auth/2fa/status
 * Get current 2FA status for the authenticated user
 */
export async function GET(request: NextRequest) {
  // Require authentication
  const auth = await requireAuth(request, []);
  if (auth instanceof NextResponse) return auth;

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        totpEnabled: true,
        totpVerifiedAt: true,
        backupCodes: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'not_found', message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      enabled: user.totpEnabled,
      verified_at: user.totpVerifiedAt?.toISOString() || null,
      backup_codes_count: user.backupCodes?.length || 0,
    });
  } catch (error) {
    console.error('Error getting 2FA status:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to get 2FA status' },
      { status: 500 }
    );
  }
}
