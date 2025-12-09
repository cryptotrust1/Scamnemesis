# Data Masking Module - Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT APPLICATION                              │
│  (Web App / Mobile App / API Client)                                   │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             │ HTTP/REST Request
                             │ + Auth Token (JWT)
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY / LOAD BALANCER                     │
│  - Authentication                                                       │
│  - Rate Limiting                                                        │
│  - Request Routing                                                      │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION SERVER (Node.js/Express)               │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  AUTHENTICATION MIDDLEWARE                                        │ │
│  │  - Extract user role from JWT                                     │ │
│  │  - Validate permissions                                           │ │
│  └─────────────────────────────┬─────────────────────────────────────┘ │
│                                │                                       │
│  ┌─────────────────────────────▼─────────────────────────────────────┐ │
│  │  CONTROLLER LAYER                                                 │ │
│  │  - Route handlers                                                 │ │
│  │  - Request validation                                             │ │
│  │  - Response formatting                                            │ │
│  └─────────────────────────────┬─────────────────────────────────────┘ │
│                                │                                       │
│  ┌─────────────────────────────▼─────────────────────────────────────┐ │
│  │  SERVICE LAYER                                                    │ │
│  │  - Business logic                                                 │ │
│  │  - Data retrieval                                                 │ │
│  │  - Report processing                                              │ │
│  └─────────────────────────────┬─────────────────────────────────────┘ │
│                                │                                       │
│  ┌─────────────────────────────▼─────────────────────────────────────┐ │
│  │  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │ │
│  │  ┃         DATA MASKING MODULE                                 ┃ │ │
│  │  ┃                                                              ┃ │ │
│  │  ┃  ┌────────────────────────────────────────────────────┐    ┃ │ │
│  │  ┃  │  DataMasker Class                                  │    ┃ │ │
│  │  ┃  │  - applyMasking()                                  │    ┃ │ │
│  │  ┃  │  - applyMaskingBatch()                             │    ┃ │ │
│  │  ┃  │  - testMasking()                                   │    ┃ │ │
│  │  ┃  └───────────────────┬────────────────────────────────┘    ┃ │ │
│  │  ┃                      │                                      ┃ │ │
│  │  ┃  ┌───────────────────▼────────────────────────────────┐    ┃ │ │
│  │  ┃  │  Masking Functions                                 │    ┃ │ │
│  │  ┃  │  - maskName()      - maskEmail()    - maskPhone()  │    ┃ │ │
│  │  ┃  │  - maskIBAN()      - maskIP()       - maskWallet() │    ┃ │ │
│  │  ┃  │  - maskSPZ()       - maskVIN()      - maskAddress()│    ┃ │ │
│  │  ┃  │  - maskDate()      - maskAmount()                  │    ┃ │ │
│  │  ┃  └───────────────────┬────────────────────────────────┘    ┃ │ │
│  │  ┃                      │                                      ┃ │ │
│  │  ┃  ┌───────────────────▼────────────────────────────────┐    ┃ │ │
│  │  ┃  │  Hash Utils                                        │    ┃ │ │
│  │  ┃  │  - generateDeterministicHash()                     │    ┃ │ │
│  │  ┃  │  - deterministicMask()                             │    ┃ │ │
│  │  ┃  │  - MaskingMappingTable                             │    ┃ │ │
│  │  ┃  │  - SaltManager                                     │    ┃ │ │
│  │  ┃  └───────────────────┬────────────────────────────────┘    ┃ │ │
│  │  ┃                      │                                      ┃ │ │
│  │  ┃  ┌───────────────────▼────────────────────────────────┐    ┃ │ │
│  │  ┃  │  Configuration Manager                             │    ┃ │ │
│  │  ┃  │  - MaskingConfigLoader                             │    ┃ │ │
│  │  ┃  │  - Load from file/env                              │    ┃ │ │
│  │  ┃  │  - Validate config                                 │    ┃ │ │
│  │  ┃  └────────────────────────────────────────────────────┘    ┃ │ │
│  │  ┃                                                              ┃ │ │
│  │  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │ │
│  │                                                                   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                │                                       │
│  ┌─────────────────────────────▼─────────────────────────────────────┐ │
│  │  AUDIT LOGGING SERVICE                                            │ │
│  │  - Log all data access                                            │ │
│  │  - Store user context                                             │ │
│  │  - Anomaly detection                                              │ │
│  └─────────────────────────────┬─────────────────────────────────────┘ │
│                                │                                       │
└────────────────────────────────┼───────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER (PostgreSQL)                     │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  fraud_reports (Base Table)                                       │ │
│  │  - All original data stored here                                  │ │
│  │  - Row Level Security enabled                                     │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  Role-Based Views (Database Level Masking)                        │ │
│  │                                                                    │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │ fraud_reports_basic_view                                    │ │ │
│  │  │ - mask_name(), mask_email(), mask_phone()                   │ │ │
│  │  │ - Country only, no PII                                      │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  │                                                                    │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │ fraud_reports_standard_view                                 │ │ │
│  │  │ - Partial masking                                           │ │ │
│  │  │ - City visible, partial postal code                         │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  │                                                                    │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │ fraud_reports_gold_view                                     │ │ │
│  │  │ - Almost full access                                        │ │ │
│  │  │ - Reporter email still masked                               │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  │                                                                    │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │ fraud_reports_admin_view                                    │ │ │
│  │  │ - Full access, no masking                                   │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  data_access_audit_log                                            │ │
│  │  - Timestamp, user_id, report_id, fields_accessed                │ │
│  │  - IP address, user agent, action                                │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Data Masking Module (Core)

**Location**: `/src/masking/`

**Responsibilities**:
- Apply role-based masking to fraud reports
- Maintain deterministic hash mappings
- Handle configuration management
- Audit data access
- Provide test utilities

**Key Classes**:
- `DataMasker`: Main masking orchestrator
- `MaskingConfigLoader`: Configuration management
- `MaskingMappingTable`: Hash-to-masked-value mappings
- `SaltManager`: Salt rotation and management

---

### 2. Masking Functions

**Location**: `/src/masking/functions.ts`

**Responsibilities**:
- Pure functions for masking specific data types
- Format preservation
- Edge case handling

**Functions**:
```typescript
// Identity data
maskName, maskNamePartial
maskEmail, maskEmailPartial
maskPhone, maskPhonePartial

// Financial data
maskIBAN
maskAmount

// Network data
maskIP, maskIPv4, maskIPv6

// Crypto data
maskWallet

// Vehicle data
maskSPZ, maskVIN

// Complex data
maskAddress
maskDate
```

---

### 3. Hash Utilities

**Location**: `/src/masking/utils/hash.ts`

**Responsibilities**:
- Generate deterministic hashes using HMAC-SHA256
- Manage salt lifecycle
- Handle hash collisions
- Maintain mapping tables

**Key Functions**:
- `generateDeterministicHash()`: Create consistent hash for value
- `deterministicMask()`: Apply masking with hash-based consistency
- `validateSalt()`: Ensure salt meets security requirements
- `generateSalt()`: Create cryptographically secure salt

---

### 4. Configuration System

**Location**: `/src/masking/config/masking-config.ts`

**Responsibilities**:
- Load configuration from multiple sources
- Validate configuration integrity
- Support runtime updates
- Provide environment-specific configs

**Configuration Sources**:
1. JSON files
2. Environment variables
3. Default constants
4. Runtime updates

---

### 5. Database Views

**Location**: `/database/views/role-based-views.sql`

**Responsibilities**:
- Enforce masking at database level
- Provide role-specific data access
- Implement Row Level Security (RLS)
- Audit database access

**Views**:
- `fraud_reports_basic_view`: Most restrictive
- `fraud_reports_standard_view`: Moderate access
- `fraud_reports_gold_view`: Extensive access
- `fraud_reports_admin_view`: Full access

---

### 6. Audit Logging

**Location**: Integrated in `DataMasker` class

**Responsibilities**:
- Log all data access events
- Capture user context
- Enable security monitoring
- Support compliance requirements

**Logged Information**:
- Timestamp
- User ID and role
- Report ID
- Fields accessed
- IP address
- User agent
- Action type

---

## Data Flow

### Request Processing Flow

```
1. User Request
   ↓
2. API Gateway (Authentication)
   ↓
3. Extract User Role from JWT
   ↓
4. Controller receives request
   ↓
5. Service Layer fetches data from DB
   │
   ├─→ Option A: Direct DB Query
   │   - Use role-specific view
   │   - Masking applied at DB level
   │
   └─→ Option B: Application Layer
       ↓
6. DataMasker.applyMasking(report, role, userId, ip, ua)
   ↓
7. For each field:
   │
   ├─→ Check field config
   ├─→ Determine masking strategy based on role
   ├─→ Apply appropriate masking function
   └─→ Use deterministic hash if enabled
   ↓
8. Log access to audit log
   ↓
9. Return masked report
   ↓
10. Response sent to client
```

---

## Security Layers

### Defense in Depth Strategy

```
┌────────────────────────────────────────────────────────────┐
│  Layer 1: API Gateway                                      │
│  - Rate limiting                                           │
│  - Basic authentication                                    │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│  Layer 2: Application Auth Middleware                      │
│  - JWT validation                                          │
│  - Role extraction                                         │
│  - Permission checks                                       │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│  Layer 3: Application Masking Module                       │
│  - Role-based data masking                                 │
│  - Audit logging                                           │
│  - Field-level access control                              │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│  Layer 4: Database Views                                   │
│  - SQL-level masking                                       │
│  - Row Level Security                                      │
│  - View-based access control                               │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│  Layer 5: Database Permissions                             │
│  - Role-based grants                                       │
│  - Table-level permissions                                 │
│  - Audit triggers                                          │
└────────────────────────────────────────────────────────────┘
```

---

## Deterministic Masking Architecture

### Hash-Based Consistency

```
┌─────────────────────────────────────────────────────────────┐
│  Input: "scammer@evil.com"                                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  HMAC-SHA256(input, deployment_salt)                        │
│  → "a7f8d9e6c4b2a1f3..."                                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Extract seed from hash: parseInt(hash.substr(0,8), 16)     │
│  → 2814749030                                               │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Apply masking function with seed                           │
│  maskEmail("scammer@evil.com", seed)                        │
│  → "s*****@evil.com"                                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Store mapping: "scammer@evil.com" → "s*****@evil.com"     │
│  (for consistency checking)                                 │
└─────────────────────────────────────────────────────────────┘
```

### Benefits:
1. **Consistency**: Same email always masked the same way
2. **Pattern Analysis**: Analysts can identify recurring scammers
3. **Deduplication**: Detect duplicate reports
4. **No Reverse Engineering**: Original value cannot be recovered from hash

---

## Deployment Architecture

### Production Deployment

```
┌──────────────────────────────────────────────────────────────┐
│  LOAD BALANCER (Nginx/HAProxy)                              │
└────────────────────┬─────────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
    ┌────────┐  ┌────────┐  ┌────────┐
    │ App    │  │ App    │  │ App    │
    │ Server │  │ Server │  │ Server │
    │ #1     │  │ #2     │  │ #3     │
    └────┬───┘  └────┬───┘  └────┬───┘
         │           │           │
         └───────────┼───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  Database Cluster     │
         │  (Primary + Replicas) │
         └───────────────────────┘
```

**Shared Configuration**:
- Salt stored in environment variables or secrets manager
- Config loaded from centralized config service
- Consistent masking across all app servers

---

## Performance Considerations

### Caching Strategy

```
┌─────────────────────────────────────────────────────────────┐
│  Request for Report #12345 (Standard User)                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
          ┌───────────────┐
          │ Check Cache   │
          │ Key: 12345:1  │  (reportId:roleLevel)
          └───────┬───────┘
                  │
         ┌────────┴────────┐
         │                 │
       Hit                Miss
         │                 │
         ▼                 ▼
  ┌──────────┐      ┌──────────────┐
  │ Return   │      │ Fetch from DB│
  │ Cached   │      │ Apply Masking│
  │ Result   │      │ Store in Cache│
  └──────────┘      └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Return Result│
                    └──────────────┘
```

**Cache TTL**: 10 minutes (configurable)
**Cache Invalidation**: On report update or role change

---

## Monitoring and Observability

### Key Metrics

```
┌─────────────────────────────────────────────────────────────┐
│  Application Metrics                                        │
│  - Masking operations per second                            │
│  - Average masking latency                                  │
│  - Cache hit rate                                           │
│  - Hash collision rate                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Security Metrics                                           │
│  - Failed authentication attempts                           │
│  - Unauthorized access attempts                             │
│  - Admin access frequency                                   │
│  - Unusual data access patterns                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Audit Metrics                                              │
│  - Total data accesses per role                             │
│  - Most accessed reports                                    │
│  - User access distribution                                 │
│  - Geographic access patterns                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Scalability Considerations

### Horizontal Scaling

- Stateless application servers
- Shared configuration via environment or config service
- Database read replicas for query performance
- Caching layer (Redis/Memcached) for masked results

### Vertical Scaling

- Optimize masking functions for performance
- Database indexes on frequently queried fields
- Batch processing for large exports
- Async processing for non-critical operations

---

## Disaster Recovery

### Salt Rotation Procedure

1. Generate new salt
2. Update configuration with both current and new salt
3. Deploy to all servers
4. Background job re-masks data with new salt
5. After completion, remove old salt from config
6. Monitor for issues

### Data Recovery

- Regular database backups (encrypted)
- Point-in-time recovery enabled
- Audit logs backed up separately
- Configuration versioned in Git

---

## Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5+
- **Database**: PostgreSQL 14+
- **Caching**: Redis (optional)
- **Testing**: Jest
- **Security**: crypto (Node.js built-in)
- **Logging**: Winston (recommended)
- **Monitoring**: Prometheus + Grafana (recommended)

---

**Document Version**: 1.0
**Last Updated**: 2025-12-09
**Maintained by**: Security Engineering Team
