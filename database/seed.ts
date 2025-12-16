/**
 * Database Seed Script
 *
 * Seeds the database with sample data for development and testing.
 * WARNING: Do NOT run this in production!
 *
 * Usage: npm run db:seed
 */

import { PrismaClient, UserRole, FraudType, Severity, ReportStatus, EvidenceType, CommentStatus } from '@prisma/client';
import { hashPassword } from '../src/lib/auth/jwt';

const prisma = new PrismaClient();

// Sample data
const SAMPLE_USERS = [
  {
    email: 'admin@scamnemesis.com',
    name: 'Admin User',
    displayName: 'Admin',
    role: UserRole.SUPER_ADMIN,
    password: 'Admin123!@#',
    emailVerified: true,
  },
  {
    email: 'moderator@scamnemesis.com',
    name: 'Moderator User',
    displayName: 'Moderator',
    role: UserRole.ADMIN,
    password: 'Moderator123!@#',
    emailVerified: true,
  },
  {
    email: 'gold@scamnemesis.com',
    name: 'Gold User',
    displayName: 'Gold Member',
    role: UserRole.GOLD,
    password: 'GoldUser123!@#',
    emailVerified: true,
  },
  {
    email: 'standard@scamnemesis.com',
    name: 'Standard User',
    displayName: 'Standard Member',
    role: UserRole.STANDARD,
    password: 'Standard123!@#',
    emailVerified: true,
  },
  {
    email: 'basic@scamnemesis.com',
    name: 'Basic User',
    displayName: 'Basic Member',
    role: UserRole.BASIC,
    password: 'BasicUser123!@#',
    emailVerified: true,
  },
];

const SAMPLE_REPORTS = [
  {
    summary: 'Romance scam - falsony profil na dating aplikacii',
    description: `Dotyčná osoba sa predstavila ako zahraničný investor. Po niekoľkých týždňoch komunikácie požiadala o finančnú pomoc na "núdzovú operáciu". Celková strata: 15,000 EUR.

Komunikácia prebiehala cez WhatsApp a neskôr aj emailom. Osoba používala fotografie z internetu a vytvorila si falošný profil.

Varovné znaky:
- Odmietala video hovory
- Vždy mala výhovorky prečo sa nemôžeme stretnúť
- Požiadala o peniaze po krátkom čase`,
    fraudType: FraudType.ROMANCE_SCAM,
    severity: Severity.HIGH,
    status: ReportStatus.APPROVED,
    financialLossAmount: 15000,
    financialLossCurrency: 'EUR',
    locationCity: 'Bratislava',
    locationCountry: 'SK',
    perpetrator: {
      fullName: 'John Anderson',
      nickname: 'johnny_love',
      email: 'john.anderson.love@gmail.com',
      phone: '+1-555-0123',
    },
    digitalFootprint: {
      whatsapp: '+1-555-0123',
      instagram: '@johnny_investor',
      website_url: 'https://fake-investment-site.com',
    },
  },
  {
    summary: 'Investicny podvod - krypto platforma',
    description: `Falošná investičná platforma sľubovala garantované výnosy 30% mesačne. Po vložení počiatočnej investície a "ziskoch" požadovali ďalšie vklady na "odblokovanie" výberov.

Platforma: CryptoProfit.io (už nefunkčná)
Celková investícia: 50,000 EUR
"Zisk" na platforme: 80,000 EUR (nikdy vyplatený)

Komunikácia prebiehala cez Telegram so "senior account managerom".`,
    fraudType: FraudType.INVESTMENT_FRAUD,
    severity: Severity.CRITICAL,
    status: ReportStatus.APPROVED,
    financialLossAmount: 50000,
    financialLossCurrency: 'EUR',
    locationCity: 'Kosice',
    locationCountry: 'SK',
    perpetrator: {
      fullName: 'Michael Smith',
      nickname: 'crypto_mike',
      email: 'support@cryptoprofit.io',
    },
    digitalFootprint: {
      telegram: '@crypto_mike_support',
      website_url: 'https://cryptoprofit.io',
    },
    cryptoInfo: {
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f8d0aB',
      blockchain: 'ETHEREUM',
    },
    financialInfo: {
      iban: 'LT123456789012345678',
      bankName: 'Unknown Baltic Bank',
      bankCountry: 'LT',
    },
  },
  {
    summary: 'Phishing - falsoná banka',
    description: `Dostal som SMS správu tvrdiacu, že moja karta bola zablokovaná. Link viedol na falošnú stránku banky, kde som zadal prihlasovacie údaje.

Do 2 hodín boli z môjho účtu prevedené všetky peniaze - 3,500 EUR.

Falošná URL: secure-banking-sk.com (kópia mojej banky)`,
    fraudType: FraudType.PHISHING,
    severity: Severity.MEDIUM,
    status: ReportStatus.APPROVED,
    financialLossAmount: 3500,
    financialLossCurrency: 'EUR',
    locationCity: 'Zilina',
    locationCountry: 'SK',
    digitalFootprint: {
      website_url: 'https://secure-banking-sk.com',
    },
  },
  {
    summary: 'Tech support scam - Microsoft',
    description: `Volajúci tvrdil, že je z Microsoft support a môj počítač má vírus. Požiadal o vzdialený prístup cez TeamViewer a neskôr o platbu za "opravy".

Zaplatil som 500 EUR za neexistujúcu službu. Navyše môžu mať prístup k mojim údajom.`,
    fraudType: FraudType.TECH_SUPPORT_SCAM,
    severity: Severity.MEDIUM,
    status: ReportStatus.PENDING,
    financialLossAmount: 500,
    financialLossCurrency: 'EUR',
    locationCity: 'Nitra',
    locationCountry: 'SK',
    perpetrator: {
      nickname: 'Microsoft Support',
      phone: '+44-20-1234-5678',
    },
  },
  {
    summary: 'E-shop podvod - neexistujuci tovar',
    description: `Objednal som elektroniku z e-shopu super-deals-sk.com. Po zaplatení som nedostal žiaden tovar ani odpoveď na emaily.

Stránka mala dobré recenzie (falošné) a nízke ceny.

Objednávka: iPhone 15 Pro za 800 EUR
Platba: kartou`,
    fraudType: FraudType.ONLINE_SHOPPING_FRAUD,
    severity: Severity.LOW,
    status: ReportStatus.APPROVED,
    financialLossAmount: 800,
    financialLossCurrency: 'EUR',
    locationCity: 'Presov',
    locationCountry: 'SK',
    digitalFootprint: {
      website_url: 'https://super-deals-sk.com',
    },
  },
];

async function main() {
  console.log('Starting database seed...');

  // Check if we're in production
  if (process.env.NODE_ENV === 'production') {
    console.error('ERROR: Cannot run seed in production environment!');
    process.exit(1);
  }

  // Clear existing data (in development only)
  console.log('Clearing existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.cryptoInfo.deleteMany();
  await prisma.financialInfo.deleteMany();
  await prisma.digitalFootprint.deleteMany();
  await prisma.companyInfo.deleteMany();
  await prisma.vehicleInfo.deleteMany();
  await prisma.perpetrator.deleteMany();
  await prisma.duplicateMatch.deleteMany();
  await prisma.duplicateCluster.deleteMany();
  await prisma.report.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.rateLimit.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log('Creating users...');
  const createdUsers: Record<string, string> = {};

  for (const userData of SAMPLE_USERS) {
    const passwordHash = await hashPassword(userData.password);
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        displayName: userData.displayName,
        role: userData.role,
        passwordHash,
        emailVerified: userData.emailVerified,
        emailVerifiedAt: userData.emailVerified ? new Date() : null,
        isActive: true,
      },
    });
    createdUsers[userData.email] = user.id;
    console.log(`  Created user: ${userData.email} (${userData.role})`);
  }

  // Create reports
  console.log('Creating reports...');
  const adminId = createdUsers['admin@scamnemesis.com'];
  const basicId = createdUsers['basic@scamnemesis.com'];

  for (const reportData of SAMPLE_REPORTS) {
    const report = await prisma.report.create({
      data: {
        summary: reportData.summary,
        description: reportData.description,
        fraudType: reportData.fraudType,
        severity: reportData.severity,
        status: reportData.status,
        financialLossAmount: reportData.financialLossAmount,
        financialLossCurrency: reportData.financialLossCurrency,
        locationCity: reportData.locationCity,
        locationCountry: reportData.locationCountry,
        reporterId: basicId,
        reporterEmail: 'reporter@example.com',
        reporterConsent: true,
        reporterLang: 'sk',
        moderatedById: reportData.status === ReportStatus.APPROVED ? adminId : null,
        moderatedAt: reportData.status === ReportStatus.APPROVED ? new Date() : null,
        publishedAt: reportData.status === ReportStatus.APPROVED ? new Date() : null,
      },
    });

    // Create perpetrator if exists
    if (reportData.perpetrator) {
      await prisma.perpetrator.create({
        data: {
          reportId: report.id,
          fullName: reportData.perpetrator.fullName,
          fullNameNormalized: reportData.perpetrator.fullName?.toLowerCase(),
          nickname: reportData.perpetrator.nickname,
          email: reportData.perpetrator.email,
          emailNormalized: reportData.perpetrator.email?.toLowerCase(),
          phone: reportData.perpetrator.phone,
          phoneNormalized: reportData.perpetrator.phone?.replace(/\D/g, ''),
        },
      });
    }

    // Create digital footprint if exists
    if (reportData.digitalFootprint) {
      await prisma.digitalFootprint.create({
        data: {
          reportId: report.id,
          telegram: reportData.digitalFootprint.telegram,
          whatsapp: reportData.digitalFootprint.whatsapp,
          instagram: reportData.digitalFootprint.instagram,
          websiteUrl: reportData.digitalFootprint.website_url,
        },
      });
    }

    // Create crypto info if exists
    if (reportData.cryptoInfo) {
      await prisma.cryptoInfo.create({
        data: {
          reportId: report.id,
          walletAddress: reportData.cryptoInfo.walletAddress,
          walletNormalized: reportData.cryptoInfo.walletAddress?.toLowerCase(),
          blockchain: reportData.cryptoInfo.blockchain as any,
        },
      });
    }

    // Create financial info if exists
    if (reportData.financialInfo) {
      await prisma.financialInfo.create({
        data: {
          reportId: report.id,
          iban: reportData.financialInfo.iban,
          ibanNormalized: reportData.financialInfo.iban?.replace(/\s/g, '').toUpperCase(),
          bankName: reportData.financialInfo.bankName,
          bankCountry: reportData.financialInfo.bankCountry,
        },
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: basicId,
        action: 'report.create',
        entityType: 'report',
        entityId: report.id,
      },
    });

    if (reportData.status === ReportStatus.APPROVED) {
      await prisma.auditLog.create({
        data: {
          userId: adminId,
          action: 'report.approve',
          entityType: 'report',
          entityId: report.id,
        },
      });
    }

    console.log(`  Created report: ${reportData.summary.substring(0, 50)}...`);
  }

  // Create some sample comments
  console.log('Creating comments...');
  const reports = await prisma.report.findMany({ where: { status: 'APPROVED' }, take: 3 });

  for (const report of reports) {
    await prisma.comment.create({
      data: {
        reportId: report.id,
        userId: createdUsers['standard@scamnemesis.com'],
        content: 'Podobny pripad sa mi stal aj mne. Dakujem za upozornenie!',
        status: CommentStatus.APPROVED,
        moderatedById: adminId,
        moderatedAt: new Date(),
      },
    });
  }

  console.log('Seed completed successfully!');
  console.log('\nCreated:');
  console.log(`  - ${SAMPLE_USERS.length} users`);
  console.log(`  - ${SAMPLE_REPORTS.length} reports`);
  console.log(`  - ${reports.length} comments`);
  console.log('\nTest accounts:');
  console.log('  Admin: admin@scamnemesis.com / Admin123!@#');
  console.log('  Moderator: moderator@scamnemesis.com / Moderator123!@#');
  console.log('  Gold: gold@scamnemesis.com / GoldUser123!@#');
  console.log('  Standard: standard@scamnemesis.com / Standard123!@#');
  console.log('  Basic: basic@scamnemesis.com / BasicUser123!@#');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
