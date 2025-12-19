/**
 * Create Admin User Script
 *
 * Usage: npx ts-node scripts/create-admin.ts
 * Or in Docker: docker exec -it scamnemesis-app npx ts-node scripts/create-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// ========================================
// CONFIGURE YOUR ADMIN ACCOUNT HERE
// ========================================
const ADMIN_EMAIL = 'admin@scamnemesis.com';
const ADMIN_PASSWORD = 'Admin123!@#';  // Change this!
const ADMIN_NAME = 'Super Admin';
// ========================================

/**
 * Hash password using PBKDF2 (must match verifyPassword in src/lib/auth/jwt.ts)
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const key = await crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 310000,
      hash: 'SHA-256',
    },
    key,
    256
  );

  const hashArray = new Uint8Array(derivedBits);
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');

  return `${saltHex}:${hashHex}`;
}

async function createAdmin() {
  console.log('🔐 Creating admin account...\n');

  try {
    // Check if admin already exists
    const existing = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (existing) {
      console.log(`⚠️  User with email ${ADMIN_EMAIL} already exists.`);
      console.log(`   Current role: ${existing.role}`);

      // Update to SUPER_ADMIN if not already
      if (existing.role !== 'SUPER_ADMIN') {
        await prisma.user.update({
          where: { email: ADMIN_EMAIL },
          data: { role: 'SUPER_ADMIN' },
        });
        console.log(`✅ Updated role to SUPER_ADMIN`);
      }
      return;
    }

    // Hash password using PBKDF2 (matches verifyPassword in jwt.ts)
    const passwordHash = await hashPassword(ADMIN_PASSWORD);

    // Create admin user
    await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        passwordHash,
        name: ADMIN_NAME,
        displayName: ADMIN_NAME,
        role: 'SUPER_ADMIN',
        emailVerified: new Date(),
        isActive: true,
      },
    });

    console.log('✅ Admin account created successfully!\n');
    console.log('========================================');
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role:     SUPER_ADMIN`);
    console.log('========================================\n');
    console.log('🔗 Login at: https://scamnemesis.com/admin/login');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
