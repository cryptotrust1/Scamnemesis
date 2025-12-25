/**
 * One-time Admin Setup Endpoint
 * GET /api/setup/admin?token=SETUP_SECRET
 *
 * Creates the initial admin account. Can only be used once.
 * SECURITY: Credentials are read from environment variables only.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/db';
import { hashPassword } from '@/lib/auth/jwt';
import { checkRateLimit, getClientIp } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

// Rate limiting for setup endpoint - prevent brute force token guessing
const SETUP_RATE_LIMIT = 5; // 5 attempts
const SETUP_RATE_WINDOW = 3600000; // per hour

// SECURITY: All credentials MUST come from environment variables
function getSetupConfig() {
  const setupToken = process.env.ADMIN_SETUP_TOKEN;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!setupToken) {
    throw new Error('ADMIN_SETUP_TOKEN environment variable is required');
  }

  if (setupToken.length < 32) {
    throw new Error('ADMIN_SETUP_TOKEN must be at least 32 characters long');
  }

  return {
    setupToken,
    adminEmail: adminEmail || 'admin@scamnemesis.com',
    // Generate secure random password if not provided
    adminPassword: adminPassword || generateSecurePassword(),
  };
}

/**
 * Generate a cryptographically secure random password
 */
function generateSecurePassword(): string {
  const length = 24;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const randomBytes = crypto.randomBytes(length);
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  return password;
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting to prevent brute force token guessing
    const ip = getClientIp(request);
    const rateLimitKey = `setup:admin:${ip}`;
    const { allowed, resetAt } = await checkRateLimit(
      rateLimitKey,
      SETUP_RATE_LIMIT,
      SETUP_RATE_WINDOW
    );

    if (!allowed) {
      console.warn(`[Admin Setup] Rate limited IP: ${ip}`);
      return NextResponse.json(
        {
          error: 'rate_limited',
          message: 'Too many setup attempts. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((resetAt.getTime() - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // SECURITY: Only allow in production with proper setup token
    let config;
    try {
      config = getSetupConfig();
    } catch (err) {
      return NextResponse.json(
        {
          error: 'Setup not configured',
          message: 'ADMIN_SETUP_TOKEN environment variable must be set (min 32 chars)',
        },
        { status: 500 }
      );
    }

    // Check setup token
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // SECURITY: Constant-time comparison to prevent timing attacks
    if (!token || !crypto.timingSafeEqual(
      Buffer.from(token.padEnd(64, '\0')),
      Buffer.from(config.setupToken.padEnd(64, '\0'))
    )) {
      console.warn(`[Admin Setup] Invalid token attempt from IP: ${ip}`);
      return NextResponse.json(
        { error: 'Invalid setup token' },
        { status: 403 }
      );
    }

    // Check if admin already exists
    const existing = await prisma.user.findUnique({
      where: { email: config.adminEmail },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Admin already exists',
        email: config.adminEmail,
        note: 'Use your existing credentials to login. If you forgot the password, reset it via the database.',
      });
    }

    // Create admin with PBKDF2 hashing (matches verifyPassword in jwt.ts)
    const passwordHash = await hashPassword(config.adminPassword);

    await prisma.user.create({
      data: {
        email: config.adminEmail,
        passwordHash,
        name: 'Super Admin',
        displayName: 'Super Admin',
        role: 'SUPER_ADMIN',
        emailVerified: new Date(),
        isActive: true,
      },
    });

    // SECURITY: Check if password was provided via env or generated
    const passwordWasGenerated = !process.env.ADMIN_PASSWORD;

    // Log created admin for audit (without password)
    console.log(`[Admin Setup] Admin account created for: ${config.adminEmail}`);

    // SECURITY: Never return the actual password in production
    // Only show generated password once if it was auto-generated
    const response: Record<string, unknown> = {
      success: true,
      message: 'Admin account created!',
      email: config.adminEmail,
      loginUrl: '/admin/login',
      warning: 'IMPORTANT: Store your credentials securely and change the password after first login!',
    };

    // Only include password if it was auto-generated (user has no other way to get it)
    if (passwordWasGenerated) {
      response.generatedPassword = config.adminPassword;
      response.passwordNote = 'This password was auto-generated because ADMIN_PASSWORD was not set. Save it NOW - it will not be shown again!';
    } else {
      response.passwordNote = 'Password was set from ADMIN_PASSWORD environment variable.';
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Setup failed', details: process.env.NODE_ENV === 'development' ? String(error) : undefined },
      { status: 500 }
    );
  }
}
