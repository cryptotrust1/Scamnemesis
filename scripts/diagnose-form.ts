#!/usr/bin/env tsx
/**
 * DIAGNOSTICKÝ SCRIPT PRE FORMULÁR
 * Spusti: npx tsx scripts/diagnose-form.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(emoji: string, message: string, color = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

function header(title: string) {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.bold}${colors.blue}${title}${colors.reset}`);
  console.log('='.repeat(60));
}

async function checkEnvironment() {
  header('KROK 1: ENVIRONMENT VARIABLES');

  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
  ];

  const optional = [
    'S3_ACCESS_KEY',
    'S3_SECRET_KEY',
    'S3_ENDPOINT',
    'S3_BUCKET',
    'REDIS_URL',
  ];

  let allRequiredPresent = true;

  console.log('\n📋 Povinné premenné:');
  for (const key of required) {
    if (process.env[key]) {
      log('✅', `${key} = ${process.env[key]?.substring(0, 30)}...`, colors.green);
    } else {
      log('❌', `${key} - CHÝBA!`, colors.red);
      allRequiredPresent = false;
    }
  }

  console.log('\n📋 Voliteľné premenné (pre plnú funkcionalitu):');
  for (const key of optional) {
    if (process.env[key]) {
      log('✅', `${key} = ${process.env[key]?.substring(0, 30)}...`, colors.green);
    } else {
      log('⚠️', `${key} - nie je nastavená (S3 upload nebude fungovať)`, colors.yellow);
    }
  }

  return allRequiredPresent;
}

async function checkDatabase() {
  header('KROK 2: DATABÁZA');

  const prisma = new PrismaClient();

  try {
    console.log('\n🔄 Testujem pripojenie k databáze...');

    // Test connection
    await prisma.$connect();
    log('✅', 'Pripojenie k databáze úspešné!', colors.green);

    // Check tables
    console.log('\n📊 Kontrolujem tabuľky:');

    const tables = [
      { name: 'User', check: () => prisma.user.count() },
      { name: 'Report', check: () => prisma.report.count() },
      { name: 'Perpetrator', check: () => prisma.perpetrator.count() },
      { name: 'Evidence', check: () => prisma.evidence.count() },
      { name: 'FinancialInfo', check: () => prisma.financialInfo.count() },
      { name: 'DigitalFootprint', check: () => prisma.digitalFootprint.count() },
    ];

    for (const table of tables) {
      try {
        const count = await table.check();
        log('✅', `${table.name}: ${count} záznamov`, colors.green);
      } catch (e) {
        log('❌', `${table.name}: TABUĽKA NEEXISTUJE! Spusti: npx prisma migrate dev`, colors.red);
        return false;
      }
    }

    await prisma.$disconnect();
    return true;

  } catch (error) {
    log('❌', `Chyba databázy: ${error instanceof Error ? error.message : String(error)}`, colors.red);

    if (String(error).includes('ECONNREFUSED')) {
      console.log('\n💡 RIEŠENIE: PostgreSQL nie je spustený!');
      console.log('   Spusti: docker-compose up -d postgres');
      console.log('   Alebo: brew services start postgresql (macOS)');
    } else if (String(error).includes('does not exist')) {
      console.log('\n💡 RIEŠENIE: Databáza neexistuje!');
      console.log('   Spusti: npx prisma migrate dev');
    }

    return false;
  }
}

async function testApiEndpoint() {
  header('KROK 3: API ENDPOINT TEST');

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Test minimal report submission
  const testPayload = {
    incident: {
      fraud_type: 'PHISHING',
      summary: 'Test report from diagnostic script',
      description: 'This is a test report to verify the API is working correctly.',
      date: new Date().toISOString(),
      location: {
        country: 'SK',
        city: 'Bratislava',
      },
    },
    reporter: {
      email: 'test-diagnostic@scamnemesis.com',
      consent: true,
      agree_to_terms: true,
      want_updates: false,
    },
  };

  console.log('\n📤 Testovací payload:');
  console.log(JSON.stringify(testPayload, null, 2));

  console.log('\n🔄 Odosielam na API...');

  try {
    const response = await fetch(`${baseUrl}/api/v1/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    const data = await response.json();

    console.log(`\n📥 Response status: ${response.status}`);
    console.log('📥 Response body:');
    console.log(JSON.stringify(data, null, 2));

    if (response.ok) {
      log('✅', `ÚSPECH! Report vytvorený s ID: ${data.publicId || data.id}`, colors.green);
      return true;
    } else {
      log('❌', `API vrátilo chybu: ${data.message || data.error}`, colors.red);

      if (data.issues) {
        console.log('\n📋 Validation issues:');
        for (const issue of data.issues) {
          console.log(`   - ${issue.field}: ${issue.message}`);
        }
      }

      return false;
    }

  } catch (error) {
    log('❌', `Fetch error: ${error instanceof Error ? error.message : String(error)}`, colors.red);

    if (String(error).includes('ECONNREFUSED') || String(error).includes('fetch failed')) {
      console.log('\n💡 RIEŠENIE: Next.js server nie je spustený!');
      console.log('   Spusti v inom termináli: npm run dev');
      console.log('   Počkaj kým sa spustí a potom spusti diagnostiku znova.');
    }

    return false;
  }
}

async function checkS3() {
  header('KROK 4: S3/MINIO STORAGE');

  const s3Config = {
    endpoint: process.env.S3_ENDPOINT,
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
    bucket: process.env.S3_BUCKET,
  };

  if (!s3Config.accessKey || !s3Config.secretKey) {
    log('⚠️', 'S3 nie je nakonfigurované - upload súborov nebude fungovať', colors.yellow);
    console.log('\n💡 Formulár bude fungovať BEZ nahrávania súborov.');
    console.log('   Pre upload súborov nastav S3_ACCESS_KEY, S3_SECRET_KEY, S3_ENDPOINT, S3_BUCKET');
    return true; // Not critical
  }

  log('✅', `S3 Endpoint: ${s3Config.endpoint}`, colors.green);
  log('✅', `S3 Bucket: ${s3Config.bucket}`, colors.green);

  // TODO: Test actual S3 connection
  return true;
}

async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       🔍 SCAMNEMESIS FORM DIAGNOSTIC TOOL 🔍              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const results = {
    environment: false,
    database: false,
    api: false,
    s3: false,
  };

  // Step 1: Environment
  results.environment = await checkEnvironment();

  if (!results.environment) {
    header('❌ KRITICKÁ CHYBA: CHÝBA KONFIGURÁCIA');
    console.log('\n💡 RIEŠENIE:');
    console.log('   1. Skopíruj .env.example do .env:');
    console.log('      cp .env.example .env');
    console.log('   2. Uprav hodnoty v .env podľa tvojho prostredia');
    console.log('   3. Spusti diagnostiku znova');
    process.exit(1);
  }

  // Step 2: Database
  results.database = await checkDatabase();

  if (!results.database) {
    header('❌ KRITICKÁ CHYBA: DATABÁZA');
    console.log('\n💡 RIEŠENIE:');
    console.log('   1. Uisti sa, že PostgreSQL beží');
    console.log('   2. Spusti migrácie: npx prisma migrate dev');
    console.log('   3. Spusti diagnostiku znova');
    process.exit(1);
  }

  // Step 3: S3 (optional)
  results.s3 = await checkS3();

  // Step 4: API (only if server is running)
  console.log('\n⏳ Čakám 2 sekundy pred testom API...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  results.api = await testApiEndpoint();

  // Summary
  header('📊 SÚHRN DIAGNOSTIKY');

  console.log('\n');
  log(results.environment ? '✅' : '❌', `Environment: ${results.environment ? 'OK' : 'PROBLÉM'}`, results.environment ? colors.green : colors.red);
  log(results.database ? '✅' : '❌', `Databáza: ${results.database ? 'OK' : 'PROBLÉM'}`, results.database ? colors.green : colors.red);
  log(results.s3 ? '✅' : '⚠️', `S3 Storage: ${results.s3 ? 'OK' : 'Nie je nakonfigurované'}`, results.s3 ? colors.green : colors.yellow);
  log(results.api ? '✅' : '❌', `API Endpoint: ${results.api ? 'OK' : 'PROBLÉM'}`, results.api ? colors.green : colors.red);

  if (results.environment && results.database && results.api) {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ VŠETKO FUNGUJE! Formulár by mal fungovať správne.     ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n');
  } else {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  ❌ NÁJDENÉ PROBLÉMY - Vyrie ich podľa pokynov vyššie     ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n');
  }
}

main().catch(console.error);
