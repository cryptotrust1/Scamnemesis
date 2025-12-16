/**
 * POST /api/v1/auth/register
 *
 * User registration endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { z, type ZodIssue } from 'zod';
import { SignJWT } from 'jose';
import prisma from '@/lib/db';
import {
  hashPassword,
  generateAccessToken,
  generateRefreshToken,
  getScopesForRole,
} from '@/lib/auth/jwt';
import { checkRateLimit, getClientIp } from '@/lib/middleware/auth';
import { emailService } from '@/lib/services/email';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://scamnemesis.com';

// JWT_SECRET is required - no fallback allowed for security
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required. Application cannot start without it.');
}

// Rate limit: 5 registrations per hour per IP
const REGISTER_RATE_LIMIT = 5;
const REGISTER_RATE_WINDOW = 3600000; // 1 hour in milliseconds

// Password validation regex
// Requires: 9+ chars, uppercase, lowercase, number, and special character
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{9,}$/;

// Request schema
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(9, 'Password must be at least 9 characters')
    .regex(
      PASSWORD_REGEX,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*...)'
    ),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting to prevent abuse
    const ip = getClientIp(request);
    const rateLimitKey = `auth:register:${ip}`;
    const { allowed, resetAt } = await checkRateLimit(
      rateLimitKey,
      REGISTER_RATE_LIMIT,
      REGISTER_RATE_WINDOW
    );

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'rate_limited',
          message: 'Too many registration attempts. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((resetAt.getTime() - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.errors.map((err: ZodIssue) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'Invalid request data',
          errors,
        },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'email_exists',
          message: 'An account with this email already exists',
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name: name || email.split('@')[0],
        role: 'BASIC',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Get scopes for role
    const scopes = getScopesForRole(user.role);

    // Generate tokens
    const accessToken = await generateAccessToken(user.id, user.email, user.role, scopes);
    const refreshToken = await generateRefreshToken(user.id);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Generate email verification token (valid for 24 hours)
    const secret = new TextEncoder().encode(JWT_SECRET);
    const verificationToken = await new SignJWT({
      sub: user.id,
      email: user.email,
      type: 'email_verification',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    // Build verification URL
    const verificationUrl = `${SITE_URL}/auth/verify-email?token=${verificationToken}`;

    // Send welcome email with verification link (async, don't wait for it)
    emailService.sendWelcome(user.email, user.name || 'User', verificationUrl).catch((error) => {
      console.error('Failed to send welcome email:', error);
      // Don't fail the registration if email fails
    });

    // Return success response with tokens and user data
    return NextResponse.json(
      {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: 3600,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          email_verified: false, // Email verification required
        },
        message: 'Registration successful. Please check your email to verify your account.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'An unexpected error occurred during registration',
      },
      { status: 500 }
    );
  }
}
