/**
 * Create Admin User Script
 *
 * Usage: npx ts-node scripts/create-admin.ts
 * Or in Docker: docker exec -it scamnemesis-app npx ts-node scripts/create-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ========================================
// CONFIGURE YOUR ADMIN ACCOUNT HERE
// ========================================
const ADMIN_EMAIL = 'admin@scamnemesis.com';
const ADMIN_PASSWORD = 'Admin123!@#';  // Change this!
const ADMIN_NAME = 'Super Admin';
// ========================================

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

    // Hash password
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        passwordHash,
        name: ADMIN_NAME,
        displayName: ADMIN_NAME,
        role: 'SUPER_ADMIN',
        emailVerified: true,
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
