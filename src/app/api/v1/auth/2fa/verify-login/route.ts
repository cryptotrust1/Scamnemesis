import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { verifyTOTP, verifyBackupCode } from '@/lib/auth/totp';
import { verify2FATempToken, generateAccessToken, generateRefreshToken, getScopesForRole } from '@/lib/auth/jwt';
import { checkRateLimit, getClientIp } from '@/lib/middleware/auth';
import { getRateLimitKey } from '@/lib/auth/rate-limits';
import { setAuthCookies } from '@/lib/auth/cookies';

export const dynamic = 'force-dynamic';

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
    // SECURITY: Rate limiting to prevent brute force attacks on 2FA codes
    // This is critical since TOTP has only 1,000,000 possible 6-digit codes
    const ip = getClientIp(request);
    const rateLimitKey = getRateLimitKey('2fa_verify', ip);
    const { allowed, resetAt } = await checkRateLimit(
      rateLimitKey,
      10, // 10 attempts per 15 minutes (stricter than login due to fewer possible codes)
      15 * 60 * 1000 // 15 minutes
    );

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'rate_limited',
          message: 'Too many 2FA verification attempts. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((resetAt.getTime() - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const body = await request.json();
    const validated = VerifyLoginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'validation_error', message: validated.error.message },
        { status: 400 }
      );
    }

    const { temp_token, code, is_backup_code } = validated.data;

    // Verify temp token using proper JWT verification with signature check
    const userId = await verify2FATempToken(temp_token);

    if (!userId) {
      return NextResponse.json(
        { error: 'invalid_token', message: 'Invalid or expired verification token. Please login again.' },
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

    // Generate tokens using the centralized JWT functions
    const scopes = getScopesForRole(user.role);
    const accessToken = await generateAccessToken(user.id, user.email, user.role, scopes);
    const refreshToken = await generateRefreshToken(user.id);

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Create response with user info
    const response = NextResponse.json({
      token_type: 'Bearer',
      expires_in: 3600,
      scopes,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.displayName,
        role: user.role,
      },
      message: 'Login successful',
      backup_codes_remaining: is_backup_code ? user.backupCodes.length - 1 : undefined,
      // Legacy: Include tokens in response body for API clients
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // CRITICAL FIX: Use centralized setAuthCookies to set 'access_token' cookie
    // Previously this was setting 'auth_token' which middleware couldn't find
    setAuthCookies(response, accessToken, refreshToken);

    return response;
  } catch (error) {
    console.error('Error verifying 2FA login:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to verify 2FA' },
      { status: 500 }
    );
  }
}
