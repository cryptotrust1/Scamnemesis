# Data Masking Module

Comprehensive data masking and anonymization system for the Scamnemesis fraud report platform.

## Overview

This module provides role-based data masking capabilities to protect personally identifiable information (PII) while maintaining data utility for fraud analysis. It implements deterministic masking, audit logging, and supports multiple user privilege levels.

## Features

- **Role-Based Access Control**: Four privilege levels (Basic, Standard, Gold, Admin)
- **Deterministic Masking**: Same input always produces same masked output
- **Format Preservation**: Masked data maintains original format/structure
- **Comprehensive Data Types**: Names, emails, phones, IBANs, IPs, crypto wallets, vehicles, addresses, dates, amounts
- **Audit Logging**: Track all data access with user context
- **Database Integration**: SQL views for database-level enforcement
- **Configurable**: JSON-based configuration with runtime updates
- **Type-Safe**: Full TypeScript support

## Quick Start

```typescript
import { createDataMasker, Role } from './masking';
import { DEFAULT_MASKING_CONFIG } from './masking/config/masking-config';

// Create masker instance
const masker = createDataMasker(DEFAULT_MASKING_CONFIG);

// Apply masking to a report
const maskedReport = masker.applyMasking(report, Role.BASIC);
```

## Installation

```bash
npm install
```

## Module Structure

```
src/masking/
├── index.ts                  # Main masking module
├── functions.ts              # Core masking functions
├── types/
│   └── index.ts             # TypeScript type definitions
├── utils/
│   └── hash.ts              # Deterministic hashing utilities
├── config/
│   └── masking-config.ts    # Configuration management
├── __tests__/
│   └── functions.test.ts    # Unit tests
└── README.md                # This file

database/views/
└── role-based-views.sql     # Database views for role-based access

docs/masking/
├── DATA_MASKING_SPECIFICATION.md  # Complete specification
└── USAGE_EXAMPLES.md              # Usage examples
```

## Usage Examples

### Basic Usage

```typescript
import { maskEmail, maskPhone, maskName, Role } from './masking';

const options = { role: Role.BASIC };

maskName('Vladimir Gala', options);
// → "Vlxxxxr Gxa"

maskEmail('john.doe@example.com', options);
// → "j*****@example.com"

maskPhone('+421 912 345 678', options);
// → "+421 9xx xxx 678"
```

### Masking Complete Reports

```typescript
const report = {
  reportId: 'RPT-12345',
  reporterName: 'Vladimir Gala',
  reporterEmail: 'vladimir.gala@example.com',
  scammerWallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f5a3',
  amountLost: 5432.18,
  currency: 'EUR',
};

// Different views for different roles
const basicView = masker.applyMasking(report, Role.BASIC);
const goldView = masker.applyMasking(report, Role.GOLD);
const adminView = masker.applyMasking(report, Role.ADMIN);
```

### Deterministic Masking

```typescript
const masker = createDataMasker({
  ...DEFAULT_MASKING_CONFIG,
  enableDeterministicMasking: true,
});

// Same email in different reports = same masked value
const report1 = { scammerEmail: 'scammer@evil.com' };
const report2 = { scammerEmail: 'scammer@evil.com' };

const masked1 = masker.applyMasking(report1, Role.BASIC);
const masked2 = masker.applyMasking(report2, Role.BASIC);

// masked1.scammerEmail === masked2.scammerEmail (true)
```

### Audit Logging

```typescript
const masker = createDataMasker({
  ...DEFAULT_MASKING_CONFIG,
  enableAuditLogging: true,
});

masker.applyMasking(
  report,
  Role.GOLD,
  'user-123',
  '192.168.1.100',
  'Mozilla/5.0...'
);

// Get audit logs
const logs = masker.getAuditLogs({ userId: 'user-123' });
```

## Masking Rules

### Names
- **Rule**: First 2 chars + 'x' * (length-3) + last char
- **Example**: `Vladimir Gala` → `Vlxxxxr Gxa`

### Emails
- **Rule**: First char + '*****' + @domain
- **Example**: `john.doe@example.com` → `j*****@example.com`

### Phone Numbers
- **Rule**: Mask middle 60% of digits
- **Example**: `+421 912 345 678` → `+421 9xx xxx 678`

### IBANs
- **Rule**: First 4 chars + masked middle + last 2
- **Example**: `SK89 1100 0000 0029 4912 9426` → `SK89 **** **** **** **** **26`

### IP Addresses
- **IPv4**: Mask last octet → `192.168.1.xxx`
- **IPv6**: Mask last 80% → `2001:0db8:****:****:****:****:****:****`

### Crypto Wallets
- **Rule**: First 6 + '...' + last 4
- **Example**: `0x742d35Cc6634C0532925a3b844Bc9e7595f5a3` → `0x742d...f5a3`

### Vehicle IDs
- **SPZ**: First 2 + '***' + last 1 → `BA123CD` → `BA***D`
- **VIN**: First 3 + '***' + last 2 → `1HGBH41JXMN109186` → `1HG***86`

## Role Definitions

### Basic User (Level 0)
- View public fraud trends
- All PII fully masked
- Amount shown as range
- Date shown as month only

### Standard User (Level 1)
- View detailed statistics
- Partial names visible
- City/region visible
- Amount rounded to nearest hundred
- Full date (no time)

### Gold User (Level 2)
- View full scammer details
- API access
- Export capabilities
- Exact amounts
- Reporter email still masked

### Admin (Level 3)
- Full access to all data
- No masking applied
- System administration
- Audit log access

## Configuration

### Default Configuration

```typescript
import { DEFAULT_MASKING_CONFIG } from './masking/config/masking-config';
```

### Load from File

```typescript
import { MaskingConfigLoader } from './masking/config/masking-config';

const loader = await MaskingConfigLoader.loadFromFile('./config/masking.json');
const config = loader.getConfig();
```

### Environment Variables

```typescript
const loader = MaskingConfigLoader.fromEnvironment();
// Reads from process.env:
// - NODE_ENV
// - MASKING_SALT
// - ENABLE_DETERMINISTIC_MASKING
// - ENABLE_AUDIT_LOGGING
// - DEBUG_MODE
```

### Custom Configuration

```typescript
const customConfig: MaskingConfig = {
  version: '1.0.0',
  environment: 'production',
  salt: 'your-secure-salt-here',
  enableDeterministicMasking: true,
  enableAuditLogging: true,
  debugMode: false,
  roles: { /* ... */ },
  fields: { /* ... */ },
  customRules: [],
};

const masker = createDataMasker(customConfig);
```

## Database Integration

### Using SQL Views

```sql
-- Basic user view (most restricted)
SELECT * FROM fraud_reports_basic_view;

-- Standard user view (more details)
SELECT * FROM fraud_reports_standard_view;

-- Gold user view (almost everything)
SELECT * FROM fraud_reports_gold_view;

-- Admin view (full access)
SELECT * FROM fraud_reports_admin_view;
```

### Row Level Security

The database views include Row Level Security (RLS) policies to enforce access control at the database level.

## Testing

### Run Tests

```bash
npm test
```

### Test Individual Functions

```typescript
import { createDataMasker, DataType, Role } from './masking';

const masker = createDataMasker(DEFAULT_MASKING_CONFIG);

// Test a specific field and role
const result = masker.testMasking(
  'john.doe@example.com',
  DataType.EMAIL,
  Role.BASIC
);

console.log(result); // "j*****@example.com"
```

## API Reference

### DataMasker Class

#### Constructor
```typescript
new DataMasker(config: MaskingConfig)
```

#### Methods

**applyMasking**
```typescript
applyMasking(
  report: FraudReport,
  userRole: Role,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
): MaskedReport
```

**applyMaskingBatch**
```typescript
applyMaskingBatch(
  reports: FraudReport[],
  userRole: Role,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
): MaskedReport[]
```

**testMasking**
```typescript
testMasking(
  value: string,
  dataType: DataType,
  role: Role
): string
```

**getAuditLogs**
```typescript
getAuditLogs(filters?: Partial<AuditLog>): AuditLog[]
```

**updateConfig**
```typescript
updateConfig(newConfig: Partial<MaskingConfig>): void
```

**getStats**
```typescript
getStats(): {
  totalReportsProcessed: number;
  mappingTableStats: any;
  auditLogCount: number;
}
```

### Standalone Functions

```typescript
// Name masking
maskName(name: string, options: MaskingOptions): string
maskNamePartial(name: string, options: MaskingOptions): string

// Email masking
maskEmail(email: string, options: MaskingOptions): string
maskEmailPartial(email: string, options: MaskingOptions): string

// Phone masking
maskPhone(phone: string, options: MaskingOptions): string
maskPhonePartial(phone: string, options: MaskingOptions): string

// Financial masking
maskIBAN(iban: string, options: MaskingOptions): string
maskAmount(amount: number, currency: string, options: MaskingOptions): string

// Network masking
maskIP(ip: string, options: MaskingOptions): string
maskIPv4(ip: string, options: MaskingOptions): string
maskIPv6(ip: string, options: MaskingOptions): string

// Crypto masking
maskWallet(wallet: string, options: MaskingOptions): string

// Vehicle masking
maskSPZ(spz: string, options: MaskingOptions): string
maskVIN(vin: string, options: MaskingOptions): string

// Complex masking
maskAddress(address: Address, options: MaskingOptions): Address
maskDate(date: Date | string, options: MaskingOptions): string
```

## Security Considerations

1. **Salt Management**
   - Use cryptographically secure salt (minimum 32 bytes)
   - Rotate salt every 90 days
   - Store salt securely (environment variables, secrets manager)
   - Never commit salt to version control

2. **Audit Logging**
   - Enable in production
   - Monitor for unusual access patterns
   - Store logs securely
   - Implement log retention policy

3. **Database Views**
   - Use as defense in depth
   - Enable Row Level Security (RLS)
   - Grant minimum necessary privileges
   - Regular security audits

4. **Performance**
   - Cache masked results
   - Use database views for complex queries
   - Monitor mapping table size
   - Implement rate limiting

## Performance Optimization

### Caching

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 });

function getCachedMaskedReport(reportId: string, role: Role) {
  const key = `${reportId}:${role}`;
  return cache.get(key) || cache.set(key, masker.applyMasking(...));
}
```

### Batch Processing

```typescript
// More efficient than individual calls
const maskedReports = masker.applyMaskingBatch(reports, role);
```

## Troubleshooting

### Debug Mode

```typescript
const masker = createDataMasker({
  ...DEFAULT_MASKING_CONFIG,
  debugMode: true,
});
```

### Common Issues

**Issue**: Salt validation errors
**Solution**: Ensure salt is at least 32 characters (hexadecimal)

**Issue**: Inconsistent masking
**Solution**: Enable `deterministicHash: true` in configuration

**Issue**: Performance degradation
**Solution**: Implement caching, use database views, optimize batch operations

## Contributing

See project-level CONTRIBUTING.md for guidelines.

## License

See project-level LICENSE file.

## Support

For issues and questions:
- GitHub Issues: https://github.com/your-org/scamnemesis
- Documentation: /docs/masking/
- Security: security@scamnemesis.org

---

**Version:** 1.0.0
**Last Updated:** 2025-12-09
**Maintained by:** Security Engineering Team
