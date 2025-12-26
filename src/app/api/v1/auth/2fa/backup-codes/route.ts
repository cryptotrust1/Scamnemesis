import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';
import { generateBackupCodes, hashBackupCode, verifyTOTP } from '@/lib/auth/totp';

export const dynamic = 'force-dynamic';

const RegenerateSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  code: z.string().length(6, 'TOTP code must be 6 digits').regex(/^\d+$/, 'Code must contain only digits'),
});

/**
 * POST /api/v1/auth/2fa/backup-codes
 * Regenerate backup codes - requires password and current TOTP code
 */
export async function POST(request: NextRequest) {
  // Require authentication
  const auth = await requireAuth(request, []);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const validated = RegenerateSchema.safeParse(body);

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

    if (!user.totpEnabled || !user.totpSecret) {
      return NextResponse.json(
        { error: 'not_enabled', message: '2FA is not enabled' },
        { status: 400 }
      );
    }

    // Verify password
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'oauth_user', message: 'OAuth users cannot regenerate backup codes this way' },
        { status: 400 }
      );
    }

    const passwordValid = await bcrypt.compare(validated.data.password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'invalid_password', message: 'Incorrect password' },
        { status: 401 }
      );
    }

    // Verify TOTP code
    const codeValid = verifyTOTP(validated.data.code, user.totpSecret);
    if (!codeValid) {
      return NextResponse.json(
        { error: 'invalid_code', message: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Generate new backup codes
    const backupCodes = generateBackupCodes(10);
    const hashedBackupCodes = backupCodes.map(hashBackupCode);

    // Update user with new backup codes
    await prisma.user.update({
      where: { id: user.id },
      data: { backupCodes: hashedBackupCodes },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'BACKUP_CODES_REGENERATED',
        entityType: 'User',
        entityId: user.id,
        userId: user.id,
        changes: { regenerated: true },
        ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'),
      },
    });

    return NextResponse.json({
      backup_codes: backupCodes,
      message: 'New backup codes generated. Store them in a safe place.',
    });
  } catch (error) {
    console.error('Error regenerating backup codes:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to regenerate backup codes' },
      { status: 500 }
    );
  }
}
