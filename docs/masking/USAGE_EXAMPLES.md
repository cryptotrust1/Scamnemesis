# Data Masking Module - Usage Examples

This document provides practical examples of using the data masking module in the Scamnemesis fraud report system.

---

## Table of Contents

1. [Basic Setup](#basic-setup)
2. [Simple Usage Examples](#simple-usage-examples)
3. [Advanced Usage](#advanced-usage)
4. [Testing Masking Rules](#testing-masking-rules)
5. [Configuration Management](#configuration-management)
6. [Database Integration](#database-integration)

---

## Basic Setup

### Installation

```bash
# Install dependencies
npm install

# Copy default configuration
cp src/masking/config/masking-config.ts config/masking-config.local.ts
```

### Quick Start

```typescript
import { createDataMasker, Role } from './src/masking';
import { DEFAULT_MASKING_CONFIG } from './src/masking/config/masking-config';

// Create masker instance
const masker = createDataMasker(DEFAULT_MASKING_CONFIG);

// Your fraud report
const report = {
  reportId: 'RPT-12345',
  fraudType: 'crypto_scam',
  country: 'Slovakia',
  submissionDate: new Date('2025-12-09'),
  status: 'published',
  reporterName: 'Vladimir Gala',
  reporterEmail: 'vladimir.gala@example.com',
  reporterPhone: '+421 912 345 678',
  scammerName: 'John Doe',
  scammerEmail: 'scammer@evil.com',
  scammerWallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f5a3',
  amountLost: 5432.18,
  currency: 'EUR',
};

// Apply masking for different roles
const basicView = masker.applyMasking(report, Role.BASIC);
const standardView = masker.applyMasking(report, Role.STANDARD);
const goldView = masker.applyMasking(report, Role.GOLD);
const adminView = masker.applyMasking(report, Role.ADMIN);

console.log('Basic User sees:', basicView.reporterEmail);
// Output: "v*****@example.com"

console.log('Admin sees:', adminView.reporterEmail);
// Output: "vladimir.gala@example.com"
```

---

## Simple Usage Examples

### Example 1: Masking Individual Fields

```typescript
import { maskName, maskEmail, maskPhone, Role } from './src/masking';

const options = {
  role: Role.BASIC,
  deterministicHash: true,
  salt: 'your-secure-salt-here',
};

// Mask name
const maskedName = maskName('Vladimir Gala', options);
console.log(maskedName);
// Output: "Vlxxxxr Gxa"

// Mask email
const maskedEmail = maskEmail('john.doe@example.com', options);
console.log(maskedEmail);
// Output: "j*****@example.com"

// Mask phone
const maskedPhone = maskPhone('+421 912 345 678', options);
console.log(maskedPhone);
// Output: "+421 9xx xxx 678"
```

### Example 2: Different Roles See Different Data

```typescript
import { createDataMasker, Role } from './src/masking';

const masker = createDataMasker(DEFAULT_MASKING_CONFIG);

const report = {
  reportId: 'RPT-001',
  scammerEmail: 'scammer@evil.com',
  scammerPhone: '+421 912 345 678',
  amountLost: 5432.18,
  currency: 'EUR',
};

// Basic User
const basicView = masker.applyMasking(report, Role.BASIC);
console.log('Basic - Email:', basicView.scammerEmail);
// "s*****@evil.com"
console.log('Basic - Amount:', basicView.amountLost);
// "EUR 1,000 - 10,000"

// Standard User
const standardView = masker.applyMasking(report, Role.STANDARD);
console.log('Standard - Email:', standardView.scammerEmail);
// "s*****@evil.com"
console.log('Standard - Amount:', standardView.amountLost);
// "EUR 5,400"

// Gold User
const goldView = masker.applyMasking(report, Role.GOLD);
console.log('Gold - Email:', goldView.scammerEmail);
// "sca*****@evil.com" (partial masking)
console.log('Gold - Amount:', goldView.amountLost);
// "EUR 5,432.18"

// Admin
const adminView = masker.applyMasking(report, Role.ADMIN);
console.log('Admin - Email:', adminView.scammerEmail);
// "scammer@evil.com" (no masking)
console.log('Admin - Amount:', adminView.amountLost);
// "EUR 5,432.18"
```

### Example 3: Batch Processing

```typescript
import { createDataMasker, Role } from './src/masking';

const masker = createDataMasker(DEFAULT_MASKING_CONFIG);

const reports = [
  { reportId: 'RPT-001', scammerEmail: 'scammer1@evil.com' },
  { reportId: 'RPT-002', scammerEmail: 'scammer2@evil.com' },
  { reportId: 'RPT-003', scammerEmail: 'scammer3@evil.com' },
];

// Mask all reports at once
const maskedReports = masker.applyMaskingBatch(
  reports,
  Role.BASIC,
  'user-123',
  '192.168.1.100',
  'Mozilla/5.0...'
);

console.log(maskedReports);
// All emails will be masked consistently
```

---

## Advanced Usage

### Example 4: Deterministic Masking (Consistency)

```typescript
import { createDataMasker, Role } from './src/masking';

const masker = createDataMasker({
  ...DEFAULT_MASKING_CONFIG,
  enableDeterministicMasking: true,
});

// Same email in different reports
const report1 = {
  reportId: 'RPT-001',
  scammerEmail: 'scammer@evil.com',
};

const report2 = {
  reportId: 'RPT-002',
  scammerEmail: 'scammer@evil.com',
};

const masked1 = masker.applyMasking(report1, Role.BASIC);
const masked2 = masker.applyMasking(report2, Role.BASIC);

console.log(masked1.scammerEmail === masked2.scammerEmail);
// Output: true (same masked value due to deterministic masking)

// Different email
const report3 = {
  reportId: 'RPT-003',
  scammerEmail: 'different@evil.com',
};

const masked3 = masker.applyMasking(report3, Role.BASIC);
console.log(masked1.scammerEmail === masked3.scammerEmail);
// Output: false (different email = different masked value)
```

### Example 5: Custom Configuration

```typescript
import { createDataMasker, Role, DataType, MaskingStrategy } from './src/masking';

const customConfig = {
  ...DEFAULT_MASKING_CONFIG,
  fields: {
    ...DEFAULT_MASKING_CONFIG.fields,
    // Make scammer email visible to Standard users
    scammerEmail: {
      dataType: DataType.EMAIL,
      maskingStrategy: MaskingStrategy.EMAIL_PARTIAL,
      minRoleLevel: Role.STANDARD, // Changed from GOLD
      deterministicHash: true,
    },
  },
};

const masker = createDataMasker(customConfig);

const report = {
  reportId: 'RPT-001',
  scammerEmail: 'scammer@evil.com',
};

// Now Standard users can see partial email
const standardView = masker.applyMasking(report, Role.STANDARD);
console.log(standardView.scammerEmail);
// Output: "sca*****@evil.com" (partial, not fully masked)
```

### Example 6: Audit Logging

```typescript
import { createDataMasker, Role } from './src/masking';

const masker = createDataMasker({
  ...DEFAULT_MASKING_CONFIG,
  enableAuditLogging: true,
});

// Apply masking with user context
const masked = masker.applyMasking(
  report,
  Role.GOLD,
  'user-123',
  '192.168.1.100',
  'Mozilla/5.0...'
);

// Get audit logs
const logs = masker.getAuditLogs();
console.log(logs);
// [
//   {
//     timestamp: 2025-12-09T10:30:00.000Z,
//     userId: 'user-123',
//     userRole: 2,
//     reportId: 'RPT-001',
//     fieldsAccessed: ['reportId', 'scammerEmail', ...],
//     ipAddress: '192.168.1.100',
//     userAgent: 'Mozilla/5.0...',
//     action: 'view'
//   }
// ]

// Filter audit logs
const userLogs = masker.getAuditLogs({ userId: 'user-123' });
const reportLogs = masker.getAuditLogs({ reportId: 'RPT-001' });
```

---

## Testing Masking Rules

### Example 7: Test Individual Field Masking

```typescript
import { createDataMasker, DataType, Role } from './src/masking';

const masker = createDataMasker(DEFAULT_MASKING_CONFIG);

// Test different data types
const testCases = [
  { value: 'Vladimir Gala', type: DataType.NAME },
  { value: 'john.doe@example.com', type: DataType.EMAIL },
  { value: '+421 912 345 678', type: DataType.PHONE },
  { value: 'SK89 1100 0000 0029 4912 9426', type: DataType.IBAN },
  { value: '192.168.1.100', type: DataType.IP },
  { value: '0x742d35Cc6634C0532925a3b844Bc9e7595f5a3', type: DataType.WALLET },
];

console.log('=== Masking Test Results ===\n');

testCases.forEach(({ value, type }) => {
  console.log(`Original: ${value}`);
  console.log(`Type: ${type}`);

  [Role.BASIC, Role.STANDARD, Role.GOLD, Role.ADMIN].forEach((role) => {
    const masked = masker.testMasking(value, type, role);
    console.log(`  ${Role[role]}: ${masked}`);
  });

  console.log('');
});
```

**Output:**
```
=== Masking Test Results ===

Original: Vladimir Gala
Type: name
  BASIC: Vlxxxxr Gxa
  STANDARD: Vlxxxxr Gxa
  GOLD: Vladimir G.
  ADMIN: Vladimir Gala

Original: john.doe@example.com
Type: email
  BASIC: j*****@example.com
  STANDARD: j*****@example.com
  GOLD: joh*****@example.com
  ADMIN: john.doe@example.com

Original: +421 912 345 678
Type: phone
  BASIC: +421 9xx xxx 678
  STANDARD: +421 9xx xxx 678
  GOLD: +421 xxx xxx 678
  ADMIN: +421 912 345 678
```

### Example 8: Comprehensive Test Suite

```typescript
import {
  maskName,
  maskEmail,
  maskPhone,
  maskIBAN,
  maskIP,
  maskWallet,
  Role
} from './src/masking';

const options = {
  role: Role.BASIC,
  deterministicHash: false,
};

const tests = [
  {
    category: 'Names',
    tests: [
      { input: 'Vladimir Gala', expected: 'Vlxxxxr Gxa' },
      { input: 'John', expected: 'Joxn' },
      { input: 'Al', expected: 'Ax' },
      { input: 'Anna-Maria Schmidt', expected: 'Anxx-Maxa Scxxxxt' },
    ],
    fn: maskName,
  },
  {
    category: 'Emails',
    tests: [
      { input: 'john.doe@example.com', expected: 'j*****@example.com' },
      { input: 'admin@company.co.uk', expected: 'a*****@company.co.uk' },
      { input: 'a@test.com', expected: 'a*****@test.com' },
    ],
    fn: maskEmail,
  },
  {
    category: 'Phones',
    tests: [
      { input: '+421 912 345 678', pattern: /\+421 9.. ... 678/ },
      { input: '+1 (555) 123-4567', pattern: /\+1 \(5..\) ...-567/ },
    ],
    fn: maskPhone,
  },
  {
    category: 'IBANs',
    tests: [
      { input: 'SK89 1100 0000 0029 4912 9426', pattern: /^SK89 \*\*\*\* .* \*\*26$/ },
      { input: 'GB82 WEST 1234 5698 7654 32', pattern: /^GB82 \*\*\*\* .* \*\*32$/ },
    ],
    fn: maskIBAN,
  },
];

console.log('=== Running Masking Tests ===\n');

tests.forEach(({ category, tests, fn }) => {
  console.log(`\n${category}:`);
  let passed = 0;
  let failed = 0;

  tests.forEach(({ input, expected, pattern }) => {
    const result = fn(input, options);

    let success = false;
    if (expected) {
      success = result === expected;
    } else if (pattern) {
      success = pattern.test(result);
    }

    if (success) {
      passed++;
      console.log(`  ✓ "${input}" → "${result}"`);
    } else {
      failed++;
      console.log(`  ✗ "${input}" → "${result}" (expected: ${expected || pattern})`);
    }
  });

  console.log(`  Summary: ${passed} passed, ${failed} failed`);
});
```

---

## Configuration Management

### Example 9: Load Configuration from File

```typescript
import { MaskingConfigLoader } from './src/masking/config/masking-config';

// Load from JSON file
const loader = await MaskingConfigLoader.loadFromFile('./config/masking.json');
const config = loader.getConfig();

// Create masker with loaded config
const masker = createDataMasker(config);
```

### Example 10: Environment-Based Configuration

```typescript
import { MaskingConfigLoader } from './src/masking/config/masking-config';

// Load from environment variables
const loader = MaskingConfigLoader.fromEnvironment();
const config = loader.getConfig();

console.log('Environment:', config.environment);
console.log('Debug mode:', config.debugMode);
```

### Example 11: Update Configuration at Runtime

```typescript
import { createDataMasker } from './src/masking';

const masker = createDataMasker(DEFAULT_MASKING_CONFIG);

// Update configuration
masker.updateConfig({
  debugMode: true,
  enableAuditLogging: false,
});

// Configuration is now updated
```

### Example 12: Export Configuration

```typescript
import { MaskingConfigLoader } from './src/masking/config/masking-config';

const loader = new MaskingConfigLoader(DEFAULT_MASKING_CONFIG);

// Export as JSON string
const jsonConfig = loader.toJSON();
console.log(jsonConfig);

// Save to file
await loader.saveToFile('./config/masking-exported.json');
```

---

## Database Integration

### Example 13: Using Database Views

```sql
-- Connect as basic user
SET ROLE basic_user_role;

-- Query using role-specific view
SELECT
  report_id,
  fraud_type,
  scammer_email,
  amount_lost
FROM fraud_reports_basic_view
WHERE country = 'Slovakia'
LIMIT 10;

-- Result: All sensitive data is automatically masked
```

### Example 14: Application + Database Integration

```typescript
import { Pool } from 'pg';
import { createDataMasker, Role } from './src/masking';

const pool = new Pool({
  user: 'app_user',
  database: 'scamnemesis',
});

async function getReport(reportId: string, userRole: Role) {
  // Determine which view to use based on role
  const viewName = {
    [Role.BASIC]: 'fraud_reports_basic_view',
    [Role.STANDARD]: 'fraud_reports_standard_view',
    [Role.GOLD]: 'fraud_reports_gold_view',
    [Role.ADMIN]: 'fraud_reports_admin_view',
  }[userRole];

  // Query appropriate view
  const result = await pool.query(
    `SELECT * FROM ${viewName} WHERE report_id = $1`,
    [reportId]
  );

  return result.rows[0];
}

// Usage
const report = await getReport('RPT-12345', Role.STANDARD);
console.log(report.scammer_email); // Already masked by database view
```

### Example 15: Audit Log Query

```sql
-- Get all access logs for a specific report
SELECT
  timestamp,
  user_id,
  user_role,
  action,
  ip_address
FROM data_access_audit_log
WHERE report_id = 'RPT-12345'
ORDER BY timestamp DESC;

-- Get user's access history
SELECT
  COUNT(*) as total_accesses,
  COUNT(DISTINCT report_id) as unique_reports,
  MAX(timestamp) as last_access
FROM data_access_audit_log
WHERE user_id = 'user-123'
AND timestamp > NOW() - INTERVAL '30 days';
```

---

## Integration with Express API

### Example 16: Express Middleware

```typescript
import express from 'express';
import { createDataMasker, Role } from './src/masking';

const app = express();
const masker = createDataMasker(DEFAULT_MASKING_CONFIG);

// Middleware to determine user role
app.use((req, res, next) => {
  // Extract role from JWT token or session
  req.userRole = determineUserRole(req);
  req.userId = extractUserId(req);
  next();
});

// API endpoint
app.get('/api/reports/:id', async (req, res) => {
  const report = await getReportFromDB(req.params.id);

  // Apply masking based on user role
  const maskedReport = masker.applyMasking(
    report,
    req.userRole,
    req.userId,
    req.ip,
    req.headers['user-agent']
  );

  res.json(maskedReport);
});

// Batch endpoint
app.get('/api/reports', async (req, res) => {
  const reports = await getReportsFromDB(req.query);

  const maskedReports = masker.applyMaskingBatch(
    reports,
    req.userRole,
    req.userId,
    req.ip,
    req.headers['user-agent']
  );

  res.json(maskedReports);
});
```

---

## Performance Considerations

### Example 17: Caching Masked Results

```typescript
import { createDataMasker, Role } from './src/masking';
import NodeCache from 'node-cache';

const masker = createDataMasker(DEFAULT_MASKING_CONFIG);
const cache = new NodeCache({ stdTTL: 600 }); // 10 minute TTL

function getCachedMaskedReport(reportId: string, userRole: Role) {
  const cacheKey = `${reportId}:${userRole}`;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Get and mask report
  const report = getReportFromDB(reportId);
  const masked = masker.applyMasking(report, userRole);

  // Store in cache
  cache.set(cacheKey, masked);

  return masked;
}
```

---

## Troubleshooting

### Example 18: Debug Mode

```typescript
import { createDataMasker, Role } from './src/masking';

const masker = createDataMasker({
  ...DEFAULT_MASKING_CONFIG,
  debugMode: true, // Enable debug logging
});

// Masking will log detailed information
const masked = masker.applyMasking(report, Role.BASIC);

// Check statistics
const stats = masker.getStats();
console.log('Masking Statistics:', stats);
```

---

## Best Practices

1. **Always use deterministic masking** for consistency
2. **Enable audit logging** in production
3. **Use database views** as additional security layer
4. **Cache masked results** for performance
5. **Rotate salts regularly** (90 days recommended)
6. **Monitor audit logs** for suspicious patterns
7. **Test masking rules** thoroughly before deployment
8. **Use environment variables** for sensitive configuration
9. **Grant minimum necessary privileges** to each role
10. **Document custom masking rules** clearly

---

**Last Updated:** 2025-12-09
**Version:** 1.0
