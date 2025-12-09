# Data Masking Specification - Scamnemesis Fraud Report System

**Version:** 1.0
**Date:** 2025-12-09
**Author:** Security Engineering Team
**Classification:** Internal - Security Critical

---

## Table of Contents

1. [Overview](#overview)
2. [Masking Rules by Data Type](#masking-rules-by-data-type)
3. [Role-Based Access Control](#role-based-access-control)
4. [Admin Configuration](#admin-configuration)
5. [Deterministic Masking](#deterministic-masking)
6. [Implementation Reference](#implementation-reference)
7. [Database Views](#database-views)
8. [Security Considerations](#security-considerations)

---

## Overview

This specification defines the data masking and anonymization strategy for the Scamnemesis fraud report system. The goal is to protect sensitive personally identifiable information (PII) while maintaining data utility for fraud analysis across different user privilege levels.

### Core Principles

- **Privacy by Default**: All sensitive data is masked unless user has explicit privileges
- **Deterministic Masking**: Same input always produces same masked output (with salt)
- **Format Preservation**: Masked data maintains original format/structure
- **Reversibility**: Original data is never modified, only presentation layer is masked
- **Auditability**: All data access is logged with user role context

---

## Masking Rules by Data Type

### 1. Names (Full Name, Nickname, Company Name)

**Rule**: Preserve first 2 characters and last character per token, mask middle with 'x'

**Algorithm**:
```
- Split on whitespace
- For each token:
  - If length <= 3: show first char + 'x' * (length-1)
  - If length > 3: show first 2 chars + 'x' * (length-3) + last char
- Join with spaces
```

**Examples**:
| Original | Masked | Notes |
|----------|--------|-------|
| `Vladimir Gala` | `Vlxxxxr Gxa` | Multi-word handling |
| `John` | `Joxn` | Short name (4 chars) |
| `Al` | `Ax` | Very short name (2 chars) |
| `Anna-Maria Schmidt` | `Anxx-Maxa Scxxxxt` | Hyphenated names preserved |
| `Crypto Scammers Ltd.` | `Crxxo Scxxxxrs Lxx.` | Company names |

**Edge Cases**:
- Single character names: Return as-is
- Special characters: Preserved in position
- Unicode/Accents: Treated as regular characters
- Empty/null: Return empty string

---

### 2. Phone Numbers

**Rule**: Mask middle 60% of digits, preserve country code and last 3 digits

**Algorithm**:
```
- Extract all digits from input
- Preserve country code (first 1-4 digits based on pattern)
- Calculate middle 60% of remaining digits
- Replace middle digits with 'x'
- Reconstruct with original formatting characters
```

**Examples**:
| Original | Masked | Notes |
|----------|--------|-------|
| `+421 912 345 678` | `+421 9xx xxx 678` | Slovak format |
| `+1 (555) 123-4567` | `+1 (5xx) xxx-567` | US format |
| `00420777888999` | `0042077xxxx999` | International prefix |
| `0912345678` | `091xxxx678` | Local format |
| `+86 138 0013 8000` | `+86 138 xxxx x000` | Chinese format |

**Edge Cases**:
- Too short (<6 digits): Mask all except last 2
- Extension numbers: Preserve with 'ext' marker
- Invalid formats: Return original with warning flag

---

### 3. Email Addresses

**Rule**: Show first character + ***** + @domain

**Algorithm**:
```
- Split on '@'
- Local part: first char + '*****'
- Domain: fully visible
- Special: If local part contains '.', show first char of first token only
```

**Examples**:
| Original | Masked | Notes |
|----------|--------|-------|
| `john.doe@example.com` | `j*****@example.com` | Standard email |
| `admin@company.co.uk` | `a*****@company.co.uk` | Multi-level TLD |
| `user+tag@gmail.com` | `u*****@gmail.com` | Plus addressing |
| `firstname.lastname@corporate.com` | `f*****@corporate.com` | Dotted local part |
| `a@test.com` | `a*****@test.com` | Single char local |

**Edge Cases**:
- Invalid format: Return original
- No @ symbol: Treat as invalid, mask entire string
- Multiple @ symbols: Mask first segment, show last domain

---

### 4. IBAN / Bank Accounts

**Rule**: Show first 4 characters (country + check) + masked middle + last 2 digits

**Algorithm**:
```
- Remove all spaces/formatting
- Preserve first 4 chars (country code + check digits)
- Mask middle characters with '*'
- Preserve last 2 chars
- Reformat in groups of 4 with spaces
```

**Examples**:
| Original | Masked | Notes |
|----------|--------|-------|
| `SK89 1100 0000 0029 4912 9426` | `SK89 **** **** **** **** **26` | Slovak IBAN |
| `GB82 WEST 1234 5698 7654 32` | `GB82 **** **** **** **** **32` | UK IBAN |
| `DE89 3704 0044 0532 0130 00` | `DE89 **** **** **** **** **00` | German IBAN |
| `1234567890` | `1234******90` | Generic account number |

**Edge Cases**:
- Non-IBAN accounts: Preserve first 4 + last 2 digits
- Too short (<8 chars): Show first 2 + '****' + last 1
- Invalid checksum: Still mask, add validation warning

---

### 5. IP Addresses

**Rule IPv4**: Mask last octet completely
**Rule IPv6**: Mask last 80% of address

**Algorithm IPv4**:
```
- Split on '.'
- Keep first 3 octets visible
- Replace last octet with 'xxx'
```

**Algorithm IPv6**:
```
- Expand compressed notation
- Keep first 20% of hextets
- Mask remaining with '****'
- Compress result
```

**Examples**:
| Original | Masked | Notes |
|----------|--------|-------|
| `192.168.1.100` | `192.168.1.xxx` | Private IPv4 |
| `8.8.8.8` | `8.8.8.xxx` | Public IPv4 |
| `2001:0db8:85a3:0000:0000:8a2e:0370:7334` | `2001:0db8:****:****:****:****:****:****` | Full IPv6 |
| `::1` | `::x` | Loopback IPv6 |
| `fe80::1` | `fe80:****` | Link-local IPv6 |

**Edge Cases**:
- Invalid format: Return original with warning
- CIDR notation: Preserve /XX suffix, mask IP
- IPv6 compressed: Expand first, then mask

---

### 6. Cryptocurrency Wallets

**Rule**: Show first 6 characters + '...' + last 4 characters

**Algorithm**:
```
- Validate address format (BTC, ETH, etc.)
- Extract first 6 chars (including prefix)
- Extract last 4 chars
- Connect with '...'
```

**Examples**:
| Original | Masked | Notes |
|----------|--------|-------|
| `0x742d35Cc6634C0532925a3b844Bc9e7595f5a3` | `0x742d...f5a3` | Ethereum address |
| `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa` | `1A1zP1...vfNa` | Bitcoin address |
| `bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh` | `bc1qxy...x0wlh` | Bitcoin SegWit |
| `rDsbeomae4FXwgQTJp9Rs64Qg9vDiTCdBv` | `rDsbeo...CdBv` | Ripple address |

**Edge Cases**:
- Too short (<12 chars): Show first 4 + '...' + last 2
- Invalid checksum: Still mask, flag for review
- ENS domains: Mask middle part of domain name

---

### 7. Vehicle Registration (SPZ) / VIN

**Rule SPZ**: Show first 2 chars + '***' + last char
**Rule VIN**: Show first 3 chars + '***' + last 2 chars

**Algorithm SPZ**:
```
- Remove spaces/special chars
- Preserve first 2 chars
- Mask middle with '***'
- Preserve last char
```

**Algorithm VIN**:
```
- Validate 17-character format
- Show first 3 (WMI - World Manufacturer ID)
- Mask middle 12 with '***'
- Show last 2
```

**Examples**:
| Original | Masked | Type | Notes |
|----------|--------|------|-------|
| `BA123CD` | `BA***D` | SPZ | Slovak format |
| `KE-987-AB` | `KE***B` | SPZ | Hungarian format |
| `1HGBH41JXMN109186` | `1HG***86` | VIN | Honda VIN |
| `JM1BL1S55A1234567` | `JM1***67` | VIN | Mazda VIN |

**Edge Cases**:
- Invalid VIN length: Apply generic rule (first 3, last 2)
- Special plates (diplomatic, etc.): Mask entire middle section

---

### 8. Physical Addresses

**Rule**: Tiered masking based on user role

**Levels**:
- **Country**: Always visible
- **Region/State**: Visible for Standard+ users
- **City**: Visible for Standard+ users
- **Street Address**: Visible only for Gold+ users
- **Postal Code**: First 3 digits visible for Standard+, full for Gold+

**Examples**:
| Role | Input | Output |
|------|-------|--------|
| Basic | `Hlavná 123, 841 01 Bratislava, Slovakia` | `******, Slovakia` |
| Standard | `Hlavná 123, 841 01 Bratislava, Slovakia` | `Bratislava 841**, Slovakia` |
| Gold | `Hlavná 123, 841 01 Bratislava, Slovakia` | `Hlavná 123, 841 01 Bratislava, Slovakia` |
| Admin | `Hlavná 123, 841 01 Bratislava, Slovakia` | `Hlavná 123, 841 01 Bratislava, Slovakia` |

---

### 9. Dates and Timestamps

**Rule**: Granularity based on role

**Levels**:
- **Basic**: Year + Month only (`2025-12-XX XX:XX:XX`)
- **Standard**: Full date, no time (`2025-12-09`)
- **Gold+**: Full timestamp

**Examples**:
| Role | Input | Output |
|------|-------|--------|
| Basic | `2025-12-09 14:35:22` | `2025-12-XX` |
| Standard | `2025-12-09 14:35:22` | `2025-12-09` |
| Gold | `2025-12-09 14:35:22` | `2025-12-09 14:35:22` |

---

### 10. Monetary Amounts

**Rule**: Range-based masking for privacy

**Levels**:
- **Basic**: Order of magnitude only (`$1,000 - $10,000`)
- **Standard**: Rounded to nearest hundred (`$5,400`)
- **Gold+**: Exact amount

**Examples**:
| Role | Input | Output |
|------|-------|--------|
| Basic | `$5,432.18` | `$1,000 - $10,000` |
| Standard | `$5,432.18` | `$5,400` |
| Gold | `$5,432.18` | `$5,432.18` |

---

## Role-Based Access Control

### Role Hierarchy

```
Basic User (Level 0)
    ↓
Standard User (Level 1)
    ↓
Gold User (Level 2)
    ↓
Admin (Level 3)
```

### Field Visibility Matrix

| Field Type | Basic | Standard | Gold | Admin |
|------------|-------|----------|------|-------|
| **Report Metadata** |
| Report ID | ✓ | ✓ | ✓ | ✓ |
| Fraud Type | ✓ | ✓ | ✓ | ✓ |
| Country | ✓ | ✓ | ✓ | ✓ |
| Submission Date | Partial | Full Date | Full Time | Full Time |
| Status | ✓ | ✓ | ✓ | ✓ |
| **Reporter Information** |
| Reporter Name | Masked | Masked | Partial | Full |
| Reporter Email | Masked | Masked | Masked | Full |
| Reporter Phone | Masked | Masked | Masked | Full |
| Reporter Address | Country | City | Full | Full |
| Reporter IP | Masked | Masked | Masked | Full |
| **Scammer Information** |
| Scammer Name | Masked | Partial | Full | Full |
| Scammer Email | Masked | Masked | Partial | Full |
| Scammer Phone | Masked | Masked | Partial | Full |
| Scammer Address | Country | City | Full | Full |
| Scammer Wallet | Masked | Masked | Partial | Full |
| Scammer IP | Masked | Masked | Partial | Full |
| **Financial Data** |
| Amount Lost | Range | Rounded | Exact | Exact |
| IBAN/Account | Masked | Masked | Partial | Full |
| Transaction ID | Masked | Masked | Partial | Full |
| **Evidence** |
| Attachments | Count | Count | Preview | Full Access |
| Screenshots | Count | Count | Preview | Full Access |
| Chat Logs | Summary | Summary | Partial | Full |

### Role Definitions

#### Basic User (Free Tier)
```yaml
permissions:
  view_reports: true
  view_statistics: true
  submit_reports: true

visibility:
  - fraud_type
  - country
  - general_description
  - date_month_year
  - masked_all_pii

use_cases:
  - Browse general fraud trends
  - Check if similar scam reported
  - Submit own fraud reports
  - Educational purposes
```

#### Standard User (Paid Tier)
```yaml
permissions:
  view_reports: true
  view_detailed_statistics: true
  submit_reports: true
  export_data: limited

visibility:
  - fraud_type_detailed
  - country_city
  - partial_names
  - full_dates
  - masked_contact_details
  - masked_financial_details

use_cases:
  - Professional fraud research
  - Business risk assessment
  - Pattern analysis
  - Regional fraud monitoring
```

#### Gold User (Premium Tier)
```yaml
permissions:
  view_reports: true
  view_all_statistics: true
  submit_reports: true
  export_data: full
  api_access: true

visibility:
  - all_fraud_details
  - partial_contact_details
  - full_financial_details
  - full_addresses
  - unmasked_scammer_details
  - masked_reporter_email_only

use_cases:
  - Law enforcement cooperation
  - Financial institution fraud prevention
  - Advanced pattern analysis
  - Cross-border fraud tracking
  - API integrations
```

#### Admin (System Level)
```yaml
permissions:
  view_reports: true
  edit_reports: true
  delete_reports: true
  manage_users: true
  configure_masking: true
  audit_access: true

visibility:
  - everything_unmasked
  - original_data
  - system_metadata
  - audit_logs

use_cases:
  - System administration
  - Legal compliance
  - Data quality management
  - User support
  - Security investigations
```

---

## Admin Configuration

### Configuration Interface

#### JSON Schema for Masking Rules

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Masking Configuration Schema",
  "type": "object",
  "properties": {
    "version": {
      "type": "string",
      "description": "Configuration version"
    },
    "environment": {
      "type": "string",
      "enum": ["development", "staging", "production"]
    },
    "salt": {
      "type": "string",
      "description": "Deployment-specific salt for deterministic masking",
      "minLength": 32
    },
    "roles": {
      "type": "object",
      "properties": {
        "basic": { "$ref": "#/definitions/roleConfig" },
        "standard": { "$ref": "#/definitions/roleConfig" },
        "gold": { "$ref": "#/definitions/roleConfig" },
        "admin": { "$ref": "#/definitions/roleConfig" }
      }
    },
    "fields": {
      "type": "object",
      "additionalProperties": {
        "$ref": "#/definitions/fieldConfig"
      }
    },
    "customRules": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/customRule"
      }
    }
  },
  "definitions": {
    "roleConfig": {
      "type": "object",
      "properties": {
        "level": {
          "type": "integer",
          "minimum": 0,
          "maximum": 3
        },
        "permissions": {
          "type": "array",
          "items": { "type": "string" }
        },
        "fieldOverrides": {
          "type": "object",
          "additionalProperties": {
            "type": "object",
            "properties": {
              "maskingStrategy": { "type": "string" },
              "visible": { "type": "boolean" }
            }
          }
        }
      }
    },
    "fieldConfig": {
      "type": "object",
      "properties": {
        "dataType": {
          "type": "string",
          "enum": [
            "name", "email", "phone", "iban",
            "ip", "wallet", "spz", "vin",
            "address", "date", "amount"
          ]
        },
        "maskingStrategy": {
          "type": "string",
          "enum": [
            "name_standard", "email_standard", "phone_standard",
            "iban_standard", "ip_v4", "ip_v6", "wallet_standard",
            "spz_standard", "vin_standard", "address_tiered",
            "date_tiered", "amount_tiered", "custom"
          ]
        },
        "customMaskingFn": {
          "type": "string",
          "description": "Name of custom masking function"
        },
        "minRoleLevel": {
          "type": "integer",
          "description": "Minimum role level to see unmasked data"
        },
        "deterministicHash": {
          "type": "boolean",
          "default": true
        }
      },
      "required": ["dataType", "maskingStrategy"]
    },
    "customRule": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "name": { "type": "string" },
        "description": { "type": "string" },
        "pattern": {
          "type": "string",
          "description": "Regex pattern to match"
        },
        "maskingFunction": { "type": "string" },
        "priority": {
          "type": "integer",
          "description": "Higher priority rules are applied first"
        }
      },
      "required": ["id", "name", "pattern", "maskingFunction"]
    }
  }
}
```

#### Example Configuration

```json
{
  "version": "1.0.0",
  "environment": "production",
  "salt": "a7f8d9e6c4b2a1f3e5d7c9b8a6f4e2d1c3b5a7f9e8d6c4b2a0f1e3d5c7b9a8f6",
  "roles": {
    "basic": {
      "level": 0,
      "permissions": ["view_public_reports", "submit_reports"],
      "fieldOverrides": {}
    },
    "standard": {
      "level": 1,
      "permissions": ["view_detailed_reports", "export_limited", "submit_reports"],
      "fieldOverrides": {
        "scammer_name": {
          "maskingStrategy": "name_partial",
          "visible": true
        }
      }
    },
    "gold": {
      "level": 2,
      "permissions": ["view_all_reports", "export_full", "api_access"],
      "fieldOverrides": {
        "scammer_email": {
          "maskingStrategy": "email_partial",
          "visible": true
        },
        "scammer_phone": {
          "maskingStrategy": "phone_partial",
          "visible": true
        }
      }
    },
    "admin": {
      "level": 3,
      "permissions": ["all"],
      "fieldOverrides": {}
    }
  },
  "fields": {
    "reporter_name": {
      "dataType": "name",
      "maskingStrategy": "name_standard",
      "minRoleLevel": 3,
      "deterministicHash": true
    },
    "reporter_email": {
      "dataType": "email",
      "maskingStrategy": "email_standard",
      "minRoleLevel": 3,
      "deterministicHash": true
    },
    "reporter_phone": {
      "dataType": "phone",
      "maskingStrategy": "phone_standard",
      "minRoleLevel": 3,
      "deterministicHash": true
    },
    "scammer_wallet": {
      "dataType": "wallet",
      "maskingStrategy": "wallet_standard",
      "minRoleLevel": 2,
      "deterministicHash": false
    },
    "transaction_iban": {
      "dataType": "iban",
      "maskingStrategy": "iban_standard",
      "minRoleLevel": 2,
      "deterministicHash": true
    }
  },
  "customRules": [
    {
      "id": "custom_passport",
      "name": "Passport Number Masking",
      "description": "Mask passport numbers",
      "pattern": "^[A-Z]{2}[0-9]{7}$",
      "maskingFunction": "maskPassport",
      "priority": 100
    }
  ]
}
```

### Admin UI Wireframe

```
┌─────────────────────────────────────────────────────────────────┐
│  SCAMNEMESIS - Data Masking Configuration                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Global Settings] [Field Configuration] [Role Management]     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Global Settings                                         │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │                                                         │  │
│  │  Environment: [Production ▼]                           │  │
│  │                                                         │  │
│  │  Deployment Salt:                                       │  │
│  │  [a7f8d9e6c4b2a1f3...] [Regenerate] ⚠ Warning         │  │
│  │                                                         │  │
│  │  ☑ Enable deterministic masking                        │  │
│  │  ☑ Log all data access                                 │  │
│  │  ☐ Debug mode (show masking process)                   │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Field-Level Masking Configuration                      │  │
│  ├──────────────┬──────────────┬──────────────┬──────────┤  │
│  │ Field Name   │ Data Type    │ Strategy     │ Min Role │  │
│  ├──────────────┼──────────────┼──────────────┼──────────┤  │
│  │ reporter_name│ Name         │ [Standard ▼] │ [Admin▼] │  │
│  │ reporter_email│ Email       │ [Standard ▼] │ [Admin▼] │  │
│  │ reporter_phone│ Phone       │ [Standard ▼] │ [Admin▼] │  │
│  │ scammer_name │ Name         │ [Partial  ▼] │ [Gold ▼] │  │
│  │ scammer_email│ Email        │ [Partial  ▼] │ [Gold ▼] │  │
│  │ scammer_wallet│ Wallet      │ [Standard ▼] │ [Gold ▼] │  │
│  │ ...          │ ...          │ ...          │ ...      │  │
│  ├──────────────┴──────────────┴──────────────┴──────────┤  │
│  │ [+ Add Field] [Import Config] [Export Config]         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Masking Preview                                         │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │                                                         │  │
│  │  Test Input: [john.doe@example.com]                    │  │
│  │                                                         │  │
│  │  As Basic User:    j*****@example.com                  │  │
│  │  As Standard User: j*****@example.com                  │  │
│  │  As Gold User:     j*****@example.com                  │  │
│  │  As Admin:         john.doe@example.com                │  │
│  │                                                         │  │
│  │  [Test Another Value]                                   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [Save Configuration] [Reset to Defaults] [View Audit Log]    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Per-Field Masking Toggle

```
┌───────────────────────────────────────────────────────────┐
│  Configure Field: reporter_email                          │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  Field Name: [reporter_email]                            │
│  Data Type:  [Email ▼]                                   │
│                                                           │
│  Masking Strategy:                                        │
│  ○ None (Always visible)                                 │
│  ● Standard Email Masking                                │
│  ○ Partial Email Masking (show domain)                   │
│  ○ Full Masking (hide everything)                        │
│  ○ Custom Function: [selectCustomFn ▼]                   │
│                                                           │
│  Role-Based Access:                                       │
│  ┌─────────────┬──────────────────┬────────────────┐    │
│  │ Role        │ Masking Applied  │ Example Output │    │
│  ├─────────────┼──────────────────┼────────────────┤    │
│  │ Basic       │ ☑ Standard       │ j*****@ex...   │    │
│  │ Standard    │ ☑ Standard       │ j*****@ex...   │    │
│  │ Gold        │ ☑ Standard       │ j*****@ex...   │    │
│  │ Admin       │ ☐ No Masking     │ john.doe@e...  │    │
│  └─────────────┴──────────────────┴────────────────┘    │
│                                                           │
│  Additional Options:                                      │
│  ☑ Use deterministic hashing                             │
│  ☐ Allow export in unmasked form                         │
│  ☑ Log access to this field                              │
│                                                           │
│  [Save] [Cancel] [Test Masking]                          │
└───────────────────────────────────────────────────────────┘
```

---

## Deterministic Masking

### Concept

Deterministic masking ensures that the same input value always produces the same masked output. This is crucial for:

1. **Data Consistency**: Same scammer email appears same across all reports
2. **Pattern Analysis**: Analysts can identify recurring entities
3. **Deduplication**: Detect duplicate reports from same reporter
4. **Referential Integrity**: Maintain relationships between masked data

### Implementation Strategy

#### Hash-Based Mapping

```
Original Value → HMAC-SHA256(value, salt) → Deterministic Hash → Masked Value
```

**Algorithm**:
```typescript
function deterministicMask(
  value: string,
  maskingFn: (val: string) => string,
  salt: string
): string {
  // Generate deterministic hash
  const hash = crypto
    .createHmac('sha256', salt)
    .update(value)
    .digest('hex');

  // Use first 8 chars of hash as seed
  const seed = parseInt(hash.substring(0, 8), 16);

  // Apply masking with seeded randomness
  return maskingFn(value, seed);
}
```

### Salt Management

#### Salt Requirements

- **Length**: Minimum 32 bytes (256 bits)
- **Uniqueness**: Different per deployment environment
- **Rotation**: Should be rotatable without breaking historical data
- **Storage**: Encrypted in configuration, never in code

#### Salt Rotation Strategy

```yaml
salt_rotation:
  current_salt: "a7f8d9e6c4b2a1f3e5d7c9b8a6f4e2d1..."
  previous_salt: "b8e9f7d5c3a2b0f4e6d8c0b9a7f5e3d2..."
  rotation_date: "2025-12-01T00:00:00Z"

  migration_strategy:
    - Use current_salt for new data
    - Keep previous_salt for historical lookups
    - Re-mask old data in background job
    - Deprecate previous_salt after 90 days
```

### Consistency Examples

**Same Email Across Reports**:
```
Report #1234: scammer@evil.com → s*****@evil.com (hash: a7f8d9e6)
Report #5678: scammer@evil.com → s*****@evil.com (hash: a7f8d9e6) ✓ SAME
Report #9012: scammer@evil.com → s*****@evil.com (hash: a7f8d9e6) ✓ SAME
```

**Different Emails**:
```
Report #1111: scammer1@evil.com → s*****@evil.com (hash: a7f8d9e6)
Report #2222: scammer2@evil.com → s*****@evil.com (hash: b8e9f7d5) ✗ DIFFERENT HASH
```

### Hash Collision Handling

```typescript
// If collision detected, append hash suffix
function handleCollision(
  maskedValue: string,
  hash: string,
  existingMappings: Map<string, string>
): string {
  if (existingMappings.has(maskedValue)) {
    // Append first 4 chars of hash
    return `${maskedValue}#${hash.substring(0, 4)}`;
  }
  return maskedValue;
}
```

---

## Implementation Reference

See separate implementation files:
- `/src/masking/index.ts` - Main masking module
- `/src/masking/config/masking-config.ts` - Configuration management
- `/src/masking/utils/hash.ts` - Deterministic hashing utilities
- `/database/views/role-based-views.sql` - Database views

---

## Database Views

Database views provide role-based data access at the database level, ensuring masking is enforced even if application layer is bypassed.

See: `/database/views/role-based-views.sql`

---

## Security Considerations

### Threat Model

1. **Unauthorized Data Access**: Users trying to access data above their privilege level
2. **Re-identification Attacks**: Combining masked data to identify individuals
3. **SQL Injection**: Bypassing application masking via direct DB access
4. **API Abuse**: Scraping multiple records to build de-anonymization dataset
5. **Insider Threats**: Admins misusing full data access

### Mitigations

1. **Defense in Depth**:
   - Application-level masking
   - Database views for role-based access
   - Audit logging of all data access
   - Rate limiting on queries

2. **Audit Logging**:
   ```typescript
   logDataAccess({
     userId: string,
     userRole: Role,
     reportId: string,
     fieldsAccessed: string[],
     timestamp: Date,
     ipAddress: string,
     userAgent: string
   });
   ```

3. **Access Monitoring**:
   - Alert on unusual access patterns
   - Daily reports of admin data access
   - Automated detection of potential scraping
   - GDPR compliance tracking

4. **Data Minimization**:
   - Only store necessary PII
   - Auto-delete old reports (configurable retention)
   - Anonymize data older than X months

### Compliance

- **GDPR**: Right to erasure, data minimization, purpose limitation
- **CCPA**: Consumer data access and deletion rights
- **PCI DSS**: If handling payment card data
- **SOC 2**: Access controls and audit logging

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-09 | Initial specification |

---

**Document Classification**: Internal - Security Critical
**Review Cycle**: Quarterly
**Next Review**: 2025-03-09
