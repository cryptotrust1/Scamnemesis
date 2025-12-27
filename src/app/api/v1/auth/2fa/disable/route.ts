import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';
import { verifyTOTP } from '@/lib/auth/totp';
import { verifyPassword } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

const DisableSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  code: z.string().length(6, 'TOTP code must be 6 digits').regex(/^\d+$/, 'Code must contain only digits').optional(),
});

/**
 * POST /api/v1/auth/2fa/disable
 * Disable 2FA - requires password and optionally current TOTP code
 */
export async function POST(request: NextRequest) {
  // Require authentication
  const auth = await requireAuth(request, []);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const validated = DisableSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'validation_error', message: validated.error.message },
        { status: 400 }
      );
    }

    // Get user with password and TOTP info
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        passwordHash: true,
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

    if (!user.totpEnabled) {
      return NextResponse.json(
        { error: 'not_enabled', message: '2FA is not enabled' },
        { status: 400 }
      );
    }

    // Verify password
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'oauth_user', message: 'OAuth users cannot disable 2FA this way. Please contact support.' },
        { status: 400 }
      );
    }

    const passwordValid = await verifyPassword(validated.data.password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'invalid_password', message: 'Incorrect password' },
        { status: 401 }
      );
    }

    // If TOTP code is provided, verify it (extra security)
    if (validated.data.code && user.totpSecret) {
      const codeValid = verifyTOTP(validated.data.code, user.totpSecret);
      if (!codeValid) {
        return NextResponse.json(
          { error: 'invalid_code', message: 'Invalid verification code' },
          { status: 400 }
        );
      }
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totpEnabled: false,
        totpSecret: null,
        totpVerifiedAt: null,
        backupCodes: [],
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'TOTP_DISABLED',
        entityType: 'User',
        entityId: user.id,
        userId: user.id,
        changes: { disabled: true },
        ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'),
      },
    });

    return NextResponse.json({
      enabled: false,
      message: 'Two-factor authentication has been disabled',
    });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to disable 2FA' },
      { status: 500 }
    );
  }
}
