/**
 * One-time Admin Setup Endpoint
 * GET /api/setup/admin?token=SETUP_SECRET
 *
 * Creates the initial admin account. Can only be used once.
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

// Admin credentials - CHANGE AFTER FIRST LOGIN!
const ADMIN_EMAIL = 'admin@scamnemesis.com';
const ADMIN_PASSWORD = 'Xk9#mP2$vL5@nQ8!';  // Strong password
const SETUP_TOKEN = 'scamnemesis-setup-2024';

export async function GET(request: NextRequest) {
  try {
    // Check setup token
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (token !== SETUP_TOKEN) {
      return NextResponse.json(
        { error: 'Invalid setup token' },
        { status: 403 }
      );
    }

    // Check if admin already exists
    const existing = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Admin already exists',
        email: ADMIN_EMAIL,
        note: 'Use existing credentials to login',
      });
    }

    // Create admin
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        passwordHash,
        name: 'Super Admin',
        displayName: 'Super Admin',
        role: 'SUPER_ADMIN',
        emailVerified: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Admin account created!',
      credentials: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
      loginUrl: '/admin/login',
      warning: 'CHANGE PASSWORD AFTER FIRST LOGIN!',
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Setup failed', details: String(error) },
      { status: 500 }
    );
  }
}
