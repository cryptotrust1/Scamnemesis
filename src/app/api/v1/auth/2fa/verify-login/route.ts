import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SignJWT } from 'jose';
import { prisma } from '@/lib/db';
import { verifyTOTP, verifyBackupCode } from '@/lib/auth/totp';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret';

const VerifyLoginSchema = z.object({
  temp_token: z.string().min(1, 'Temporary token is required'),
  code: z.string().min(1, 'Verification code is required'),
  is_backup_code: z.boolean().optional().default(false),
});

/**
 * POST /api/v1/auth/2fa/verify-login
 * Verify TOTP code during login flow
 * Called after successful password authentication when 2FA is enabled
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = VerifyLoginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'validation_error', message: validated.error.message },
        { status: 400 }
      );
    }

    const { temp_token, code, is_backup_code } = validated.data;

    // Verify temp token (should be a short-lived token from initial login)
    // The temp token contains the user ID encrypted
    let userId: string;
    try {
      // Simple decode - in production use proper JWT verification
      const decoded = JSON.parse(Buffer.from(temp_token, 'base64').toString());
      userId = decoded.userId;
      const expiry = decoded.exp;

      // Check if expired (5 minute window)
      if (Date.now() > expiry) {
        return NextResponse.json(
          { error: 'token_expired', message: 'Verification session expired. Please login again.' },
          { status: 401 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'invalid_token', message: 'Invalid verification token' },
        { status: 401 }
      );
    }

    // Get user with TOTP info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        displayName: true,
        totpSecret: true,
        totpEnabled: true,
        backupCodes: true,
      },
    });

    if (!user || !user.totpEnabled || !user.totpSecret) {
      return NextResponse.json(
        { error: 'invalid_state', message: 'Invalid authentication state' },
        { status: 400 }
      );
    }

    let isValid = false;
    let usedBackupCodeIndex = -1;

    if (is_backup_code) {
      // Verify backup code
      usedBackupCodeIndex = verifyBackupCode(code, user.backupCodes);
      isValid = usedBackupCodeIndex >= 0;
    } else {
      // Verify TOTP code
      const cleanCode = code.replace(/\s/g, '');
      if (cleanCode.length === 6 && /^\d+$/.test(cleanCode)) {
        isValid = verifyTOTP(cleanCode, user.totpSecret);
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'invalid_code', message: is_backup_code ? 'Invalid backup code' : 'Invalid verification code' },
        { status: 401 }
      );
    }

    // If backup code was used, remove it from the list
    if (usedBackupCodeIndex >= 0) {
      const newBackupCodes = [...user.backupCodes];
      newBackupCodes.splice(usedBackupCodeIndex, 1);
      await prisma.user.update({
        where: { id: user.id },
        data: { backupCodes: newBackupCodes },
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate full JWT token
    const scopes = getDefaultScopes(user.role);
    const token = await new SignJWT({
      sub: user.id,
      email: user.email,
      role: user.role,
      scopes,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(JWT_SECRET));

    // Create response with cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        display_name: user.displayName,
        role: user.role.toLowerCase(),
        scopes,
      },
      token,
      message: 'Login successful',
      backup_codes_remaining: is_backup_code ? user.backupCodes.length - 1 : undefined,
    });

    // Set HttpOnly cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error verifying 2FA login:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to verify 2FA' },
      { status: 500 }
    );
  }
}

function getDefaultScopes(role: string): string[] {
  switch (role) {
    case 'SUPER_ADMIN':
      return ['*'];
    case 'ADMIN':
      return ['admin:read', 'admin:edit', 'report:read', 'report:write', 'comment:create'];
    case 'MODERATOR':
      return ['admin:read', 'report:read', 'report:write', 'comment:create'];
    case 'GOLD':
      return ['report:read', 'report:write', 'comment:create', 'premium:read'];
    case 'STANDARD':
      return ['report:read', 'report:write', 'comment:create'];
    default:
      return ['report:read', 'report:create'];
  }
}
