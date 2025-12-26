import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';
import { verifyTOTP } from '@/lib/auth/totp';

export const dynamic = 'force-dynamic';

const VerifySchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must contain only digits'),
});

/**
 * POST /api/v1/auth/2fa/verify
 * Verify TOTP code and enable 2FA
 */
export async function POST(request: NextRequest) {
  // Require authentication
  const auth = await requireAuth(request, []);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const validated = VerifySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'validation_error', message: validated.error.message },
        { status: 400 }
      );
    }

    // Get user with TOTP secret
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        totpSecret: true,
        totpEnabled: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'not_found', message: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.totpSecret) {
      return NextResponse.json(
        { error: 'not_setup', message: 'Please set up 2FA first by calling /api/v1/auth/2fa/setup' },
        { status: 400 }
      );
    }

    if (user.totpEnabled) {
      return NextResponse.json(
        { error: 'already_enabled', message: '2FA is already enabled' },
        { status: 400 }
      );
    }

    // Verify the code
    const isValid = verifyTOTP(validated.data.code, user.totpSecret);

    if (!isValid) {
      return NextResponse.json(
        { error: 'invalid_code', message: 'Invalid verification code. Please try again.' },
        { status: 400 }
      );
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totpEnabled: true,
        totpVerifiedAt: new Date(),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'TOTP_ENABLED',
        entityType: 'User',
        entityId: user.id,
        userId: user.id,
        changes: { enabled: true },
        ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'),
      },
    });

    return NextResponse.json({
      enabled: true,
      message: 'Two-factor authentication has been enabled successfully',
    });
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to verify 2FA' },
      { status: 500 }
    );
  }
}
