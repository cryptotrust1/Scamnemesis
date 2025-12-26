# ScamNemesis API Audit Report

**Dátum auditu:** 2024-12-26
**Verzia:** 1.0.0
**Auditor:** Claude AI (Opus 4.5)
**Rozsah:** Kompletný API audit (Phase 1 - bez zmeny kódu)

---

## Executive Summary

ScamNemesis API je dobre navrhnuté REST API pre platformu na hlásenie podvodov. Celkovo je implementácia na vysokej úrovni s niekoľkými oblasťami na zlepšenie.

### Celkové hodnotenie

| Kategória | Skóre | Popis |
|-----------|-------|-------|
| **Bezpečnosť** | 8/10 | Silná autentifikácia, dobrý RBAC, timing-safe TOTP |
| **Stabilita** | 7/10 | Dobré error handling, chýba circuit breaker |
| **Výkon** | 7/10 | Kvalitné indexy, chýba caching layer |
| **i18n** | 8/10 | Kompletné preklady, štruktúrované JSON |
| **DX (Developer Experience)** | 7/10 | Chýba OpenAPI dokumentácia (teraz doplnená) |

---

## 1. API Inventory

### 1.1 Prehľad endpointov

| Kategória | Počet | Autentifikácia | Rate Limit |
|-----------|-------|----------------|------------|
| Health | 2 | Žiadna | Nie |
| Auth | 12 | Zmiešaná | 20/15min |
| 2FA | 6 | JWT | 100/hod |
| Reports | 5 | Zmiešaná | 10-100/hod |
| Search | 1 | Voliteľná | 100/hod |
| Admin | 20 | JWT + admin scope | 600/hod |
| Evidence | 2 | JWT | 100/hod |
| Media | 4 | JWT | 100/hod |
| Other | 8 | Rôzne | 100/hod |

**Celkom: 60 API endpointov**

### 1.2 Kompletný zoznam endpointov

#### Health Endpoints
| Method | Path | Auth | Scopes | Rate Limit |
|--------|------|------|--------|------------|
| GET | /api/v1/health | - | - | - |
| GET | /api/v1/health/detailed | - | - | - |

#### Authentication Endpoints
| Method | Path | Auth | Scopes | Rate Limit |
|--------|------|------|--------|------------|
| POST | /api/v1/auth/token | - | - | 20/15min |
| POST | /api/v1/auth/register | - | - | 20/15min |
| POST | /api/v1/auth/refresh | - | - | 100/hod |
| POST | /api/v1/auth/logout | JWT | - | 100/hod |
| GET | /api/v1/auth/me | JWT | - | 100/hod |
| PATCH | /api/v1/auth/me | JWT | - | 100/hod |
| PATCH | /api/v1/auth/me/password | JWT | - | 100/hod |
| POST | /api/v1/auth/forgot-password | - | - | 20/15min |
| POST | /api/v1/auth/reset-password | - | - | 20/15min |
| POST | /api/v1/auth/verify-email | - | - | 100/hod |

#### 2FA Endpoints
| Method | Path | Auth | Scopes | Rate Limit |
|--------|------|------|--------|------------|
| POST | /api/v1/auth/2fa/setup | JWT | - | 100/hod |
| POST | /api/v1/auth/2fa/verify | JWT | - | 100/hod |
| POST | /api/v1/auth/2fa/verify-login | temp_token | - | 100/hod |
| POST | /api/v1/auth/2fa/disable | JWT | - | 100/hod |
| GET | /api/v1/auth/2fa/status | JWT | - | 100/hod |
| POST | /api/v1/auth/2fa/backup-codes | JWT | - | 100/hod |

#### Reports Endpoints
| Method | Path | Auth | Scopes | Rate Limit |
|--------|------|------|--------|------------|
| GET | /api/v1/reports | JWT | reports:read | 100/hod |
| POST | /api/v1/reports | Voliteľná | - | 10/hod |
| GET | /api/v1/reports/{id} | JWT | reports:read | 100/hod |
| GET | /api/v1/reports/{id}/comments | Voliteľná | - | 100/hod |
| POST | /api/v1/reports/{id}/comments | JWT | - | 100/hod |
| GET | /api/v1/reports/{id}/export | JWT | reports:read | 100/hod |

#### Search Endpoints
| Method | Path | Auth | Scopes | Rate Limit |
|--------|------|------|--------|------------|
| GET | /api/v1/search | Voliteľná | - | 100/hod |

#### Admin Endpoints
| Method | Path | Auth | Scopes | Rate Limit |
|--------|------|------|--------|------------|
| GET | /api/v1/admin/reports | JWT | admin:read | 600/hod |
| GET | /api/v1/admin/reports/{id} | JWT | admin:read | 600/hod |
| POST | /api/v1/admin/reports/{id}/approve | JWT | admin:write | 600/hod |
| POST | /api/v1/admin/reports/{id}/reject | JWT | admin:write | 600/hod |
| DELETE | /api/v1/admin/reports/{id}/delete | JWT | admin:delete | 600/hod |
| GET | /api/v1/admin/users | JWT | admin:read | 600/hod |
| GET | /api/v1/admin/users/{id} | JWT | admin:read | 600/hod |
| PATCH | /api/v1/admin/users/{id}/role | JWT | admin:write | 600/hod |
| POST | /api/v1/admin/users/{id}/ban | JWT | admin:write | 600/hod |
| POST | /api/v1/admin/users/{id}/unban | JWT | admin:write | 600/hod |
| GET | /api/v1/admin/comments | JWT | admin:read | 600/hod |
| POST | /api/v1/admin/comments/{id}/approve | JWT | admin:write | 600/hod |
| POST | /api/v1/admin/comments/{id}/reject | JWT | admin:write | 600/hod |
| GET | /api/v1/admin/duplicates | JWT | admin:read | 600/hod |
| POST | /api/v1/admin/duplicates/{id}/merge | JWT | admin:write | 600/hod |
| POST | /api/v1/admin/duplicates/{id}/dismiss | JWT | admin:write | 600/hod |
| GET | /api/v1/admin/stats | JWT | admin:read | 600/hod |
| GET | /api/v1/admin/audit | JWT | admin:read | 600/hod |
| GET | /api/v1/admin/settings | JWT | admin:read | 600/hod |
| PATCH | /api/v1/admin/settings | JWT | admin:write | 600/hod |
| POST | /api/v1/admin/email/test | JWT | admin:write | 600/hod |

---

## 2. Security Audit

### 2.1 Authentication & Authorization

#### Silné stránky
- **JWT implementácia**: Správne použitie jose knižnice s RS256/HS256
- **HttpOnly cookies**: Tokeny uložené v secure HttpOnly cookies
- **API Key podpora**: Alternatívna autentifikácia pre programatický prístup
- **Scope-based RBAC**: Granulárne oprávnenia (reports:read, admin:write, atď.)
- **Brute force ochrana**: Uzamknutie účtu po 5 neúspešných pokusoch
- **2FA implementácia**: TOTP s timing-safe porovnaním

#### Nálezy

| ID | Závažnosť | Nález | Odporúčanie |
|----|-----------|-------|-------------|
| SEC-001 | ✅ FIXED | 2FA token timing attack | Opravené v predchádzajúcom audite |
| SEC-002 | ✅ FIXED | 2FA temp token predvídateľnosť | Opravené - teraz používa signed JWT |
| SEC-003 | MEDIUM | Chýba refresh token rotation | Implementovať single-use refresh tokens |
| SEC-004 | LOW | API key bez rate limit per key | Pridať per-key rate limiting |

### 2.2 IDOR (Insecure Direct Object Reference)

| ID | Závažnosť | Nález | Odporúčanie |
|----|-----------|-------|-------------|
| IDOR-001 | ✅ OK | Report prístup cez publicId | Správne - používa UUID, nie sekvenčné ID |
| IDOR-002 | ✅ OK | User prístup cez ID | Chránené scope kontrolou |
| IDOR-003 | INFO | Tracking token entropy | 256-bit (32 bytes) - dostatočné |

### 2.3 CSRF Protection

| ID | Závažnosť | Nález | Odporúčanie |
|----|-----------|-------|-------------|
| CSRF-001 | ✅ OK | SameSite cookies | Nastavené na 'Lax' |
| CSRF-002 | INFO | Chýba CSRF token pre formuláre | Zvážiť pre extra ochranu |

### 2.4 CORS Configuration

```javascript
// next.config.js
headers: [
  { key: 'Access-Control-Allow-Origin', value: process.env.CORS_ORIGIN || '*' }
]
```

| ID | Závažnosť | Nález | Odporúčanie |
|----|-----------|-------|-------------|
| CORS-001 | MEDIUM | Wildcard CORS v development | Zabezpečiť explicitný origin v produkcii |

### 2.5 XSS Prevention

| ID | Závažnosť | Nález | Odporúčanie |
|----|-----------|-------|-------------|
| XSS-001 | ✅ OK | Content-Security-Policy | Nastavené v next.config.js |
| XSS-002 | ✅ OK | X-Content-Type-Options | nosniff nastavené |
| XSS-003 | ✅ OK | Input validation | Zod validácia na všetkých vstupoch |

### 2.6 SQL Injection

| ID | Závažnosť | Nález | Odporúčanie |
|----|-----------|-------|-------------|
| SQLI-001 | ✅ OK | Prisma ORM | Parameterizované queries |
| SQLI-002 | ✅ OK | Raw SQL v semantic search | Správne použitie tagged template literals |

**Príklad bezpečného raw SQL (search/route.ts:463-484):**
```typescript
const results = await prisma.$queryRaw<SemanticResult[]>`
  SELECT r.id, r.public_id, ...
  FROM reports r
  WHERE r.status = 'APPROVED'
    AND (${validCountry}::text IS NULL OR r.location_country = ${validCountry})
  ...
`;
```

### 2.7 SSRF Prevention

| ID | Závažnosť | Nález | Odporúčanie |
|----|-----------|-------|-------------|
| SSRF-001 | ✅ OK | URL validácia | laxUrl schema vyžaduje http/https |
| SSRF-002 | INFO | External URL v evidence | Zvážiť URL whitelist pre externé zdroje |

### 2.8 File Upload Security

| ID | Závažnosť | Nález | Odporúčanie |
|----|-----------|-------|-------------|
| UPLOAD-001 | ✅ OK | Max 10MB limit | Vhodné pre evidence |
| UPLOAD-002 | ✅ OK | Type validácia | Enum SCREENSHOT, DOCUMENT, atď. |
| UPLOAD-003 | INFO | Content-type validation | Zvážiť magic bytes kontrolu |

### 2.9 Rate Limiting

| ID | Závažnosť | Nález | Odporúčanie |
|----|-----------|-------|-------------|
| RATE-001 | ✅ OK | Brute force ochrana | 5 pokusov / 15 min lockout |
| RATE-002 | ✅ OK | Admin rate limit boost | 10x pre admin scope |
| RATE-003 | INFO | Redis caching | Zvážiť Redis pre distribuovaný rate limiting |

### 2.10 Secrets Management

| ID | Závažnosť | Nález | Odporúčanie |
|----|-----------|-------|-------------|
| SECRET-001 | ✅ OK | Env variables | Použitie process.env |
| SECRET-002 | INFO | JWT secret rotation | Implementovať key rotation strategy |

### 2.11 Logging & PII

| ID | Závažnosť | Nález | Odporúčanie |
|----|-----------|-------|-------------|
| LOG-001 | ✅ OK | Request ID tracking | generateRequestId() pre koreláciu |
| LOG-002 | ✅ OK | Sanitized logging | Neloguje citlivé dáta |
| LOG-003 | INFO | Audit logs | Kompletný AuditLog model |

### 2.12 Security Headers

```javascript
// next.config.js - Security Headers
{
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; ..."
}
```

| ID | Závažnosť | Nález | Odporúčanie |
|----|-----------|-------|-------------|
| HDR-001 | ✅ OK | HSTS | 1 rok s includeSubDomains |
| HDR-002 | ✅ OK | X-Frame-Options | DENY |
| HDR-003 | ✅ OK | CSP | Komplexná politika |

---

## 3. Reliability & Stability Audit

### 3.1 Timeouts

| Komponent | Timeout | Zdroj |
|-----------|---------|-------|
| BaseConnector.fetchWithRetry | 30s | AbortSignal.timeout(30000) |
| Database queries | Default (no explicit) | Prisma default |
| HTTP requests | 30s | BaseConnector |

| ID | Závažnosť | Nález | Odporúčanie |
|----|-----------|-------|-------------|
| TIME-001 | MEDIUM | Chýba global request timeout | Pridať middleware pre max request time |
| TIME-002 | INFO | DB query timeout | Zvážiť Prisma timeout configuration |

### 3.2 Retry Logic & Backoff

**BaseConnector.ts implementácia:**
```typescript
async fetchWithRetry(url, options, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(30000),
      });
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`HTTP ${response.status}`);
      }
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000;
        await this.sleep(delay);
      }
    } catch (error) {
      if (attempt === retries) throw error;
      const delay = Math.pow(2, attempt) * 1000;
      await this.sleep(delay);
    }
  }
}
```

| ID | Závažnosť | Nález | Odporúčanie |
|----|-----------|-------|-------------|
| RETRY-001 | ✅ OK | Exponential backoff | 2^n * 1000ms |
| RETRY-002 | ✅ OK | Max 3 retries | Vhodné pre external APIs |
| RETRY-003 | INFO | No jitter | Zvážiť pridanie random jitter |

### 3.3 Circuit Breaker

| ID | Závažnosť | Nález | Odporúčanie |
|----|-----------|-------|-------------|
| CB-001 | MEDIUM | Chýba circuit breaker | Implementovať pre external services |

### 3.4 Error Boundaries

| ID | Závažnosť | Nález | Odporúčanie |
|----|-----------|-------|-------------|
| ERR-001 | ✅ OK | Sentry integration | Kompletný error tracking |
| ERR-002 | ✅ OK | Graceful degradation | Rate limit fail-open |
| ERR-003 | ✅ OK | Structured errors | Konzistentný error format |

### 3.5 Database Transactions

```typescript
// reports/route.ts - Transaction example
const report = await prisma.$transaction(async (tx) => {
  const newReport = await tx.report.create({...});
  await tx.perpetrator.create({...});
  await tx.digitalFootprint.create({...});
  await tx.auditLog.create({...});
  return newReport;
});
```

| ID | Závažnosť | Nález | Odporúčanie |
|----|-----------|-------|-------------|
| TX-001 | ✅ OK | Atomic operations | $transaction pre multi-table writes |
| TX-002 | INFO | Transaction timeout | Zvážiť explicit timeout |

### 3.6 N+1 Query Prevention

| ID | Závažnosť | Nález | Odporúčanie |
|----|-----------|-------|-------------|
| N+1-001 | ✅ OK | Prisma includes | Správne použitie include pre relations |
| N+1-002 | INFO | Admin list queries | Monitorovať pri veľkom objeme |

### 3.7 Background Jobs

| ID | Závažnosť | Nález | Odporúčanie |
|----|-----------|-------|-------------|
| BG-001 | ✅ OK | Non-blocking email | Fire and forget pattern |
| BG-002 | ✅ OK | Duplicate detection | Async, non-critical |
| BG-003 | INFO | Job queue | Zvážiť BullMQ pre robustné background jobs |

### 3.8 Idempotency

| ID | Závažnosť | Nález | Odporúčanie |
|----|-----------|-------|-------------|
| IDEM-001 | INFO | Chýba idempotency key | Zvážiť pre POST /reports |

---

## 4. Performance Audit

### 4.1 Database Indexes

**Analýza schema.prisma:**

| Model | Indexy | Status |
|-------|--------|--------|
| Report | 12 indexov | ✅ Kompletné |
| Perpetrator | 5 indexov | ✅ Kompletné |
| FinancialInfo | 2 indexy | ✅ Kompletné |
| CryptoInfo | 2 indexy | ✅ Kompletné |
| User | 3 indexy | ✅ Kompletné |
| ApiKey | 2 indexy | ✅ Kompletné |
| AuditLog | 4 indexy | ✅ Kompletné |

**Príklad dobre navrhnutých indexov:**
```prisma
model Report {
  @@index([status])
  @@index([fraudType])
  @@index([createdAt])
  @@index([locationCountry])
  @@index([reporterId])
  @@index([status, createdAt])
  @@index([status, fraudType])
  @@index([publicId])
  @@index([caseNumber])
  @@index([trackingToken])
  @@index([reporterEmail])
  @@index([publishedAt])
}
```

| ID | Závažnosť | Nález | Odporúčanie |
|----|-----------|-------|-------------|
| IDX-001 | ✅ OK | Composite indexes | Správne pre common queries |
| IDX-002 | ✅ OK | FK indexes | Všetky foreign keys indexované |
| IDX-003 | INFO | Vector index | Zvážiť IVFFlat pre scale |

### 4.2 Caching

| ID | Závažnosť | Nález | Odporúčanie |
|----|-----------|-------|-------------|
| CACHE-001 | MEDIUM | Chýba Redis cache | Implementovať pre stats, search results |
| CACHE-002 | INFO | Static data caching | Fraud types, countries - cacheable |

### 4.3 Pagination

| ID | Závažnosť | Nález | Odporúčanie |
|----|-----------|-------|-------------|
| PAGE-001 | ✅ OK | Limit/offset | Max 100 items per page |
| PAGE-002 | INFO | Cursor pagination | Zvážiť pre veľké datasety |

### 4.4 Slow Endpoints (Potenciálne)

| Endpoint | Riziko | Dôvod |
|----------|--------|-------|
| GET /search (semantic) | HIGH | Vector similarity search |
| GET /admin/reports | MEDIUM | Full-text search + joins |
| POST /reports | LOW | Transaction s 7+ inserts |

### 4.5 Payload Size

| ID | Závažnosť | Nález | Odporúčanie |
|----|-----------|-------|-------------|
| PAYLOAD-001 | ✅ OK | Evidence limit | Max 10 items |
| PAYLOAD-002 | ✅ OK | String limits | Summary 500, description 10000 |

---

## 5. i18n Audit

### 5.1 Prehľad lokalizácie

| Jazyk | Súbor | Pokrytie |
|-------|-------|----------|
| English | en.json | 100% (1452 riadkov) |
| Slovak | sk.json | ~95% |
| Czech | cs.json | ~90% |
| German | de.json | ~85% |

### 5.2 Štruktúra prekladov

```json
{
  "common": { "loading", "error", "success", ... },
  "nav": { "home", "search", "report", ... },
  "auth": { "login", "register", "logout", ... },
  "report": { "form", "validation", ... },
  "admin": { "dashboard", "reports", ... },
  "errors": { "not_found", "unauthorized", ... }
}
```

### 5.3 Nálezy

| ID | Závažnosť | Nález | Odporúčanie |
|----|-----------|-------|-------------|
| I18N-001 | ✅ OK | Fallback logic | Správne - en ako fallback |
| I18N-002 | INFO | Missing keys | Niekoľko chýbajúcich v de.json |
| I18N-003 | ✅ OK | Date formatting | Intl.DateTimeFormat |
| I18N-004 | ✅ FIXED | Default locale | Opravené na 'sk' |

### 5.4 Email Templates

| Template | Lokalizácia |
|----------|-------------|
| Welcome | ✅ sk, en |
| Report Confirmation | ✅ sk, en |
| Password Reset | ✅ sk, en |
| Email Verification | ✅ sk, en |
| Admin Notification | EN only |

---

## 6. Top 10 Priority Risks

| # | ID | Kategória | Závažnosť | Riziko | Dopad | Odporúčanie |
|---|-----|-----------|-----------|--------|-------|-------------|
| 1 | SEC-003 | Security | MEDIUM | Refresh token nie je single-use | Session hijacking | Implementovať token rotation |
| 2 | CACHE-001 | Performance | MEDIUM | Chýba Redis cache | Pomalé search queries | Pridať Redis pre hot paths |
| 3 | CB-001 | Stability | MEDIUM | Chýba circuit breaker | Cascade failures | Implementovať pre external APIs |
| 4 | TIME-001 | Stability | MEDIUM | Chýba global timeout | Resource exhaustion | Pridať request timeout middleware |
| 5 | CORS-001 | Security | MEDIUM | Wildcard CORS | CSRF v produkcii | Explicitný origin config |
| 6 | SEC-004 | Security | LOW | Per-key rate limiting | API key abuse | Rate limit per API key |
| 7 | IDEM-001 | Reliability | LOW | Chýba idempotency | Duplicate submissions | Idempotency key header |
| 8 | UPLOAD-003 | Security | INFO | Magic bytes check | File type spoofing | Content-type validation |
| 9 | I18N-002 | i18n | INFO | Missing translations | UX v DE | Doplniť de.json |
| 10 | BG-003 | Reliability | INFO | In-process jobs | Job loss on crash | Implementovať job queue |

---

## 7. API Request/Response Examples

### 7.1 Authentication

**Request:**
```http
POST /api/v1/auth/token
Content-Type: application/json

{
  "grant_type": "password",
  "email": "user@example.com",
  "password": "SecureP@ss123"
}
```

**Response (200):**
```json
{
  "token_type": "Bearer",
  "expires_in": 3600,
  "scopes": ["reports:read", "reports:write"],
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "role": "STANDARD"
  },
  "access_token": "eyJhbG...",
  "refresh_token": "eyJhbG..."
}
```

### 7.2 Create Report

**Request:**
```http
POST /api/v1/reports
Content-Type: application/json

{
  "incident": {
    "fraud_type": "PHISHING",
    "summary": "Phishing email claiming to be from bank",
    "financial_loss": {
      "amount": 500,
      "currency": "EUR"
    }
  },
  "perpetrator": {
    "email": "scammer@fake.com"
  },
  "reporter": {
    "email": "victim@example.com",
    "preferred_language": "sk"
  }
}
```

**Response (201):**
```json
{
  "id": "clx...",
  "publicId": "abc123",
  "case_number": "SN-20241226-A1B2",
  "status": "pending",
  "created_at": "2024-12-26T10:00:00Z",
  "duplicate_check": {
    "has_duplicates": false,
    "cluster_id": null,
    "match_count": 0
  },
  "email_sent": true
}
```

### 7.3 Search

**Request:**
```http
GET /api/v1/search?q=scammer@fake.com&mode=auto&limit=10
Authorization: Bearer eyJhbG...
```

**Response (200):**
```json
{
  "total": 3,
  "results": [
    {
      "id": "abc123",
      "score": 1.0,
      "source": "exact",
      "perpetrator": {
        "name": "J. D.",
        "email": "sc***@fake.com"
      },
      "fraud_type": "phishing",
      "country": "SK"
    }
  ],
  "facets": {
    "country": { "SK": 2, "CZ": 1 },
    "fraud_type": { "phishing": 3 }
  },
  "pagination": {
    "page": 1,
    "pages": 1,
    "total": 3,
    "limit": 10
  }
}
```

---

## 8. OpenAPI Specification

Kompletná OpenAPI 3.1 špecifikácia bola vygenerovaná a uložená v súbore `openapi.yaml`.

### Ako bola špecifikácia odvodená:

1. **Analýza route súborov**: Prečítanie všetkých 60+ API route súborov
2. **Extrakcia Zod schemas**: Konverzia validačných schém na OpenAPI schemas
3. **Middleware analýza**: Identifikácia auth requirements a rate limits
4. **Response mapping**: Analýza return statements pre response schemas
5. **Error patterns**: Štandardizácia error responses

### Pokrytie:

| Sekcia | Status |
|--------|--------|
| Paths | 60 endpointov |
| Schemas | 45+ schém |
| Security Schemes | 4 (Bearer, Cookie, API Key, Webhook) |
| Parameters | 12 reusable |
| Responses | 4 reusable |
| Examples | Vybrané endpointy |

---

## 9. Záver

ScamNemesis API je dobre navrhnuté a implementované s dôrazom na bezpečnosť. Hlavné odporúčania pre ďalší vývoj:

### Kritické (Implementovať ASAP)
1. Refresh token rotation
2. Redis cache layer
3. Circuit breaker pre external services

### Dôležité (Plánovať do Q1)
4. Global request timeout
5. Idempotency keys
6. Job queue (BullMQ)

### Nice-to-have
7. Cursor-based pagination
8. Per-API-key rate limiting
9. Complete German translations

---

## Prílohy

- **openapi.yaml**: Kompletná OpenAPI 3.1 špecifikácia
- **SWAGGER_DEPLOYMENT.md**: Plán nasadenia Swagger UI (viď nižšie)
- **DATABASE_AUDIT_REPORT.md**: Predchádzajúci databázový audit
