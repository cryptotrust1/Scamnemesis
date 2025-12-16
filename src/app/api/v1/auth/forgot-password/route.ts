import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SignJWT } from 'jose';
import { prisma } from '@/lib/db';
import { emailService } from '@/lib/services/email';
import { checkRateLimit, getClientIp } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://scamnemesis.com';

// JWT_SECRET is required - no fallback allowed for security
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required. Application cannot start without it.');
}

const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

/**
 * POST /api/v1/auth/forgot-password
 *
 * Initiates password reset flow by sending a reset email.
 * Rate limited to prevent abuse.
 */
export async function POST(request: NextRequest) {
  // Rate limiting: 5 requests per hour per IP
  const ip = getClientIp(request);
  const rateLimitKey = `forgot-password:${ip}`;
  const rateLimit = await checkRateLimit(rateLimitKey, 5, 3600000); // 5 per hour

  if (!rateLimit.allowed) {
    const retryAfter = Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: 'rate_limit_exceeded',
        message: 'Too many password reset requests. Please try again later.',
        retry_after: retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  try {
    const body = await request.json();
    const validated = ForgotPasswordSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'Invalid email format',
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true, isActive: true },
    });

    // Always return success to prevent email enumeration
    // But only send email if user exists and is active
    if (user && user.isActive) {
      // Generate password reset token (valid for 1 hour)
      const secret = new TextEncoder().encode(JWT_SECRET);
      const resetToken = await new SignJWT({
        sub: user.id,
        email: user.email,
        type: 'password_reset',
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(secret);

      // Build reset URL
      const resetUrl = `${SITE_URL}/auth/reset-password?token=${resetToken}`;

      // Send password reset email
      const emailResult = await emailService.sendPasswordReset(
        user.email,
        user.name || 'User',
        resetUrl
      );

      if (!emailResult.success) {
        console.error('[ForgotPassword] Failed to send email:', emailResult.error);
        // Don't expose email send errors to prevent enumeration
      }

      // Log the action for audit
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'PASSWORD_RESET_REQUESTED',
          entityType: 'user',
          entityId: user.id,
          ipAddress: ip,
          userAgent: request.headers.get('user-agent')?.substring(0, 255),
        },
      });
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, you will receive a password reset link.',
    });
  } catch (error) {
    console.error('[ForgotPassword] Error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}
