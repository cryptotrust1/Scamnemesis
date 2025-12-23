# ScamNemesis API Reference

**Base URL:** `https://api.scamnemesis.com/api/v1`
**Version:** 1.0.0
**Last Updated:** December 2024

---

## Table of Contents

1. [Authentication](#authentication)
2. [Reports](#reports)
3. [Search](#search)
4. [Verification](#verification)
5. [Admin Operations](#admin-operations)
6. [Media & Evidence](#media--evidence)
7. [Error Codes](#error-codes)
8. [Rate Limiting](#rate-limiting)

---

## Authentication

All authenticated endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### POST /auth/register

Create a new user account.

**Rate Limit:** 5 requests/hour

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "acceptedTerms": true,
  "captchaToken": "cf-turnstile-token"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "BASIC",
    "emailVerified": false,
    "createdAt": "2024-12-23T10:00:00Z"
  },
  "message": "Registration successful. Please verify your email."
}
```

**Errors:**
| Code | Description |
|------|-------------|
| 400 | Invalid input (validation failed) |
| 409 | Email already registered |
| 429 | Rate limit exceeded |

---

### POST /auth/token

Login and obtain access tokens.

**Rate Limit:** 10 requests/hour

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 900,
  "tokenType": "Bearer",
  "user": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "STANDARD"
  }
}
```

**Note:** A refresh token is set as an HTTP-only cookie.

**Errors:**
| Code | Description |
|------|-------------|
| 400 | Invalid credentials |
| 401 | Email not verified |
| 403 | Account banned |
| 429 | Rate limit exceeded |

---

### POST /auth/refresh

Refresh access token using refresh token cookie.

**Rate Limit:** 5 requests/hour

**Request:** No body required (uses HTTP-only cookie)

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 900,
  "tokenType": "Bearer"
}
```

---

### GET /auth/me

Get current authenticated user information.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "id": "clxxx...",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "STANDARD",
  "emailVerified": true,
  "createdAt": "2024-12-23T10:00:00Z",
  "updatedAt": "2024-12-23T12:00:00Z"
}
```

---

### POST /auth/logout

Logout and invalidate tokens.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

### POST /auth/verify-email

Verify email address or resend verification email.

**Rate Limit:** 20 requests/hour

**Request Body (Verify):**
```json
{
  "token": "verification-token-from-email"
}
```

**Request Body (Resend):**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Email verified successfully"
}
```

---

### POST /auth/forgot-password

Request password reset email.

**Rate Limit:** 10 requests/hour

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "If the email exists, a reset link has been sent"
}
```

---

## Reports

### POST /reports

Create a new fraud report.

**Authentication:** Optional (anonymous allowed)
**Rate Limit:** 10 requests/hour

**Request Body:**
```json
{
  "title": "Investment Scam Report",
  "description": "Detailed description of the fraud incident...",
  "fraudType": "INVESTMENT_FRAUD",
  "severity": "HIGH",
  "perpetrator": {
    "name": "John Scammer",
    "email": "scammer@fake.com",
    "phone": "+421900123456",
    "websites": ["https://fake-investment.com"],
    "socialMedia": {
      "facebook": "https://facebook.com/fakescammer"
    },
    "cryptoWallets": ["0x1234..."],
    "bankAccounts": ["SK1234567890"]
  },
  "financialDetails": {
    "amountLost": 5000,
    "currency": "EUR",
    "paymentMethods": ["BANK_TRANSFER", "CRYPTO"]
  },
  "victimContact": {
    "email": "victim@example.com",
    "phone": "+421900111222",
    "preferredLanguage": "sk"
  },
  "isAnonymous": false,
  "consentToShare": true
}
```

**Response (201 Created):**
```json
{
  "id": "clxxx...",
  "publicId": "SCM-2024-001234",
  "status": "PENDING",
  "duplicateScore": 0.15,
  "createdAt": "2024-12-23T10:00:00Z"
}
```

**Fraud Types:**
```
ROMANCE_SCAM, INVESTMENT_FRAUD, CRYPTO_SCAM, JOB_SCAM,
PHISHING, IDENTITY_THEFT, TECH_SUPPORT, SHOPPING_SCAM,
LOAN_SCAM, LOTTERY_SCAM, CHARITY_SCAM, OTHER
```

---

### GET /reports

List reports with pagination and filtering.

**Authentication:** Optional (affects data visibility)
**Rate Limit:** 100 requests/hour

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 1 | Page number |
| limit | int | 20 | Items per page (max 100) |
| status | string | - | Filter by status |
| fraudType | string | - | Filter by fraud type |
| country | string | - | Filter by country |
| sortBy | string | createdAt | Sort field |
| sortOrder | string | desc | asc or desc |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "clxxx...",
      "publicId": "SCM-2024-001234",
      "title": "Investment Scam Report",
      "fraudType": "INVESTMENT_FRAUD",
      "status": "APPROVED",
      "severity": "HIGH",
      "perpetrator": {
        "name": "J*** S***",
        "email": "sc***@***.com"
      },
      "financialDetails": {
        "amountLost": 5000,
        "currency": "EUR"
      },
      "createdAt": "2024-12-23T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Note:** Sensitive fields are masked based on user role.

---

### GET /reports/{id}

Get single report details.

**Authentication:** Optional (affects data visibility)

**Response (200 OK):**
```json
{
  "id": "clxxx...",
  "publicId": "SCM-2024-001234",
  "title": "Investment Scam Report",
  "description": "Detailed description...",
  "fraudType": "INVESTMENT_FRAUD",
  "status": "APPROVED",
  "severity": "HIGH",
  "perpetrator": {...},
  "financialDetails": {...},
  "evidence": [...],
  "comments": [...],
  "linkedReports": [...],
  "createdAt": "2024-12-23T10:00:00Z",
  "updatedAt": "2024-12-23T12:00:00Z"
}
```

---

### POST /reports/{id}/comments

Add a comment to a report.

**Authentication:** Required
**Rate Limit:** 30 requests/hour

**Request Body:**
```json
{
  "content": "I was also scammed by this person...",
  "isVictim": true
}
```

**Response (201 Created):**
```json
{
  "id": "clxxx...",
  "content": "I was also scammed by this person...",
  "status": "PENDING",
  "createdAt": "2024-12-23T10:00:00Z"
}
```

---

## Search

### GET /search

Search reports by various identifiers.

**Authentication:** Optional (affects result visibility)
**Rate Limit:** 100 requests/hour

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| q | string | Search query |
| type | string | Search type (see below) |
| page | int | Page number |
| limit | int | Results per page |
| country | string | Filter by country |
| dateFrom | date | From date (YYYY-MM-DD) |
| dateTo | date | To date (YYYY-MM-DD) |

**Search Types:**
```
all, name, email, phone, website, domain,
crypto_wallet, bank_account, social_media,
vehicle, company
```

**Response (200 OK):**
```json
{
  "results": [
    {
      "id": "clxxx...",
      "publicId": "SCM-2024-001234",
      "title": "Investment Scam Report",
      "matchScore": 0.95,
      "matchedFields": ["email", "phone"],
      "fraudType": "INVESTMENT_FRAUD",
      "createdAt": "2024-12-23T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5
  },
  "metadata": {
    "searchTime": 45,
    "searchType": "email"
  }
}
```

---

## Verification

### GET /verify

Verify an identifier against the database.

**Authentication:** Optional
**Rate Limit:** 200 requests/hour

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| identifier | string | Value to verify |
| type | string | Identifier type |

**Identifier Types:**
```
email, phone, website, domain, crypto_wallet,
bank_account, name, social_media
```

**Response (200 OK):**
```json
{
  "identifier": "scammer@fake.com",
  "type": "email",
  "found": true,
  "riskScore": 0.85,
  "reportCount": 5,
  "firstReported": "2024-01-15T10:00:00Z",
  "lastReported": "2024-12-23T10:00:00Z",
  "fraudTypes": ["INVESTMENT_FRAUD", "ROMANCE_SCAM"],
  "countries": ["SK", "CZ", "DE"]
}
```

---

## Admin Operations

All admin endpoints require `ADMIN` or `SUPER_ADMIN` role.

### GET /admin/reports

List all reports with full details.

**Authentication:** Required (ADMIN)
**Rate Limit:** 60 requests/hour

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status |
| page | int | Page number |
| limit | int | Results per page |

**Response (200 OK):**
```json
{
  "data": [...],
  "pagination": {...},
  "stats": {
    "pending": 45,
    "approved": 1200,
    "rejected": 50
  }
}
```

---

### POST /admin/reports/{id}/approve

Approve a pending report.

**Authentication:** Required (ADMIN)
**Rate Limit:** 60 requests/hour

**Request Body:**
```json
{
  "note": "Verified with external sources"
}
```

**Response (200 OK):**
```json
{
  "id": "clxxx...",
  "status": "APPROVED",
  "approvedBy": "admin@example.com",
  "approvedAt": "2024-12-23T10:00:00Z"
}
```

---

### POST /admin/reports/{id}/reject

Reject a report.

**Authentication:** Required (ADMIN)

**Request Body:**
```json
{
  "reason": "INSUFFICIENT_EVIDENCE",
  "note": "Missing documentation"
}
```

**Rejection Reasons:**
```
INSUFFICIENT_EVIDENCE, DUPLICATE, FALSE_REPORT,
SPAM, POLICY_VIOLATION, OTHER
```

---

### GET /admin/duplicates

List potential duplicate report clusters.

**Authentication:** Required (ADMIN)

**Response (200 OK):**
```json
{
  "clusters": [
    {
      "id": "cluster-1",
      "reports": ["clxxx...", "clyyy..."],
      "similarity": 0.92,
      "matchedFields": ["email", "name"],
      "createdAt": "2024-12-23T10:00:00Z"
    }
  ]
}
```

---

### POST /admin/duplicates/{id}/merge

Merge duplicate reports.

**Authentication:** Required (ADMIN)

**Request Body:**
```json
{
  "primaryReportId": "clxxx...",
  "mergeComments": true
}
```

---

### GET /admin/users

List all users.

**Authentication:** Required (ADMIN)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| role | string | Filter by role |
| status | string | active, banned |
| page | int | Page number |

---

### POST /admin/users/{id}/ban

Ban a user.

**Authentication:** Required (SUPER_ADMIN)

**Request Body:**
```json
{
  "reason": "Policy violation",
  "duration": "permanent"
}
```

---

### PATCH /admin/users/{id}/role

Change user role.

**Authentication:** Required (SUPER_ADMIN)

**Request Body:**
```json
{
  "role": "GOLD"
}
```

**User Roles:**
```
BASIC     - Limited access, heavy masking
STANDARD  - Normal access, moderate masking
GOLD      - Enhanced access, light masking
ADMIN     - Administrative access
SUPER_ADMIN - Full system access
```

---

## Media & Evidence

### POST /evidence/upload

Upload evidence file.

**Authentication:** Required
**Rate Limit:** 30 requests/hour
**Max File Size:** 50MB

**Request:** multipart/form-data

| Field | Type | Description |
|-------|------|-------------|
| file | file | Evidence file |
| reportId | string | Associated report |
| description | string | File description |

**Response (201 Created):**
```json
{
  "id": "clxxx...",
  "filename": "screenshot.png",
  "size": 1024000,
  "mimeType": "image/png",
  "url": "/api/v1/evidence/files/abc123",
  "scanStatus": "CLEAN"
}
```

---

### POST /images/upload/presigned

Get presigned URL for direct S3 upload.

**Authentication:** Required

**Request Body:**
```json
{
  "filename": "screenshot.png",
  "contentType": "image/png",
  "size": 1024000
}
```

**Response (200 OK):**
```json
{
  "uploadUrl": "https://s3.../presigned-url",
  "fileKey": "uploads/abc123/screenshot.png",
  "expiresAt": "2024-12-23T11:00:00Z"
}
```

---

## Error Codes

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/expired token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "error": "error_code",
  "message": "Human readable message",
  "details": {
    "field": ["Validation error message"]
  },
  "timestamp": "2024-12-23T10:00:00Z"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `validation_error` | Request body validation failed |
| `unauthorized` | Authentication required |
| `forbidden` | Insufficient permissions |
| `not_found` | Resource not found |
| `duplicate` | Resource already exists |
| `rate_limited` | Too many requests |
| `internal_error` | Server error |

---

## Rate Limiting

All endpoints are rate-limited. Limits vary by endpoint sensitivity.

### Response Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1703322000
Retry-After: 3600
```

### Rate Limit Exceeded Response

```json
{
  "error": "rate_limited",
  "message": "Rate limit exceeded. Try again later.",
  "retryAfter": 3600
}
```

### Default Limits

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| Auth (register) | 5 | 1 hour |
| Auth (login) | 10 | 1 hour |
| Reports (create) | 10 | 1 hour |
| Search | 100 | 1 hour |
| Verify | 200 | 1 hour |
| Admin | 60 | 1 hour |

---

## Data Masking

Sensitive data is masked based on user role:

### Masking Levels by Role

| Role | Name | Email | Phone |
|------|------|-------|-------|
| ANONYMOUS | J*** | ***@*** | ***-***-78 |
| BASIC | J*** D*** | j***@*** | ***-***-78 |
| STANDARD | J. D. | jo***@example.com | 091-***-678 |
| GOLD | John D. | john***@example.com | 0912-***-678 |
| ADMIN | John Doe | john@example.com | 0912345678 |

---

## Webhooks

### Enrichment Webhook

Receive enriched data for reports.

**URL:** POST /webhooks/enrichment

**Headers:**
```
Content-Type: application/json
X-Webhook-Secret: your-secret-key
```

**Payload:**
```json
{
  "reportId": "clxxx...",
  "enrichmentType": "DOMAIN_INFO",
  "data": {
    "domain": "fake-investment.com",
    "registrationDate": "2024-01-01",
    "registrar": "NameCheap",
    "isPhishing": true
  }
}
```

---

## SDKs & Client Libraries

- **JavaScript/TypeScript:** `npm install @scamnemesis/sdk`
- **Python:** `pip install scamnemesis`
- **PHP:** `composer require scamnemesis/php-sdk`

---

*Documentation Version: 1.0.0*
*Last Updated: December 2024*
