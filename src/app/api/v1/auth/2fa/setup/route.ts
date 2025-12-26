import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';
import { generateTOTPSetup } from '@/lib/auth/totp';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/auth/2fa/setup
 * Initiate 2FA setup - returns secret and QR code data
 * User must verify with a code before 2FA is enabled
 */
export async function POST(request: NextRequest) {
  // Require authentication
  const auth = await requireAuth(request, []);
  if (auth instanceof NextResponse) return auth;

  try {
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        totpEnabled: true,
        totpSecret: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'not_found', message: 'User not found' },
        { status: 404 }
      );
    }

    // If 2FA is already enabled, user needs to disable it first
    if (user.totpEnabled) {
      return NextResponse.json(
        { error: 'already_enabled', message: '2FA is already enabled. Disable it first to set up a new authenticator.' },
        { status: 400 }
      );
    }

    // Generate setup data
    const setupData = generateTOTPSetup(user.email);

    // Store provisional secret (not yet enabled)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totpSecret: setupData.secret,
        totpEnabled: false, // Not enabled until verified
        backupCodes: setupData.hashedBackupCodes,
      },
    });

    // Return setup data to frontend
    // Note: backupCodes are returned ONLY ONCE during setup
    return NextResponse.json({
      secret: setupData.secret,
      auth_url: setupData.authURL,
      backup_codes: setupData.backupCodes,
      message: 'Scan the QR code with your authenticator app, then verify with a code',
    });
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to set up 2FA' },
      { status: 500 }
    );
  }
}
