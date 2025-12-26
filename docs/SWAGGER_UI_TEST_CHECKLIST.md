# Swagger UI - Test Checklist

## Environment Setup

Add the following environment variables:

```bash
# .env.local (development)
ENABLE_SWAGGER_UI=true
SWAGGER_REQUIRE_AUTH=true

# .env.production
ENABLE_SWAGGER_UI=true
SWAGGER_REQUIRE_AUTH=true
```

## Manual Test Cases

### 1. Feature Flag - Disabled

**Condition:** `ENABLE_SWAGGER_UI=false` (or not set)

| Test | Expected Result | Status |
|------|-----------------|--------|
| GET `/docs` | 404 Not Found | ☐ |
| GET `/api/docs/openapi` | 404 Not Found | ☐ |
| GET `/api/docs/openapi.yaml` | 404 Not Found | ☐ |

### 2. Feature Flag - Enabled, Auth Required (Default)

**Condition:** `ENABLE_SWAGGER_UI=true`, `SWAGGER_REQUIRE_AUTH=true`

| Test | Expected Result | Status |
|------|-----------------|--------|
| GET `/docs` (not logged in) | Redirect to `/admin/login?callbackUrl=/docs` | ☐ |
| GET `/api/docs/openapi` (not logged in) | 401 Unauthorized | ☐ |
| GET `/api/docs/openapi.yaml` (not logged in) | 401 Unauthorized | ☐ |

### 3. Authenticated Non-Admin User

**Condition:** Logged in as BASIC/STANDARD/GOLD user

| Test | Expected Result | Status |
|------|-----------------|--------|
| GET `/docs` | 403 Forbidden page | ☐ |
| GET `/api/docs/openapi` | 403 Forbidden | ☐ |
| GET `/api/docs/openapi.yaml` | 403 Forbidden | ☐ |

### 4. Authenticated Admin User

**Condition:** Logged in as ADMIN or SUPER_ADMIN

| Test | Expected Result | Status |
|------|-----------------|--------|
| GET `/docs` | Swagger UI renders | ☐ |
| GET `/api/docs/openapi` | Returns JSON with `openapi: "3.1.0"` | ☐ |
| GET `/api/docs/openapi.yaml` | Returns YAML content | ☐ |
| Swagger UI loads spec | All endpoints visible | ☐ |

### 5. Production Behavior

**Condition:** `NODE_ENV=production`

| Test | Expected Result | Status |
|------|-----------------|--------|
| "Try it out" button | Not visible / disabled | ☐ |
| `X-Robots-Tag` header on `/docs` | `noindex, nofollow` | ☐ |
| `X-Robots-Tag` header on `/api/docs/*` | `noindex, nofollow` | ☐ |
| `Cache-Control` on `/docs` | `private, no-store` | ☐ |

### 6. Development Behavior

**Condition:** `NODE_ENV=development`

| Test | Expected Result | Status |
|------|-----------------|--------|
| "Try it out" button | Visible and functional | ☐ |
| API calls work from Swagger UI | Returns expected responses | ☐ |

### 7. Security Headers

| Test | Expected Result | Status |
|------|-----------------|--------|
| `/docs` has `X-Robots-Tag` | `noindex, nofollow` | ☐ |
| `/api/docs/openapi` has `X-Robots-Tag` | `noindex, nofollow` | ☐ |
| robots.txt disallows `/docs` | Contains `Disallow: /docs` | ☐ |
| robots.txt disallows `/api/docs` | Contains `Disallow: /api/docs` | ☐ |

### 8. Build Verification

| Test | Expected Result | Status |
|------|-----------------|--------|
| `npm run build` completes | No errors | ☐ |
| `npm run type-check` passes | No TypeScript errors | ☐ |
| `npm run lint` passes | No ESLint errors | ☐ |

## Verification Commands

```bash
# Type check
npm run type-check

# Build test
npm run build

# Lint check
npm run lint

# Test headers (requires running server)
curl -I http://localhost:3000/docs
curl -I http://localhost:3000/api/docs/openapi

# Test robots.txt
curl http://localhost:3000/robots.txt
```

## Post-Deployment Checklist

1. ☐ Set `ENABLE_SWAGGER_UI=true` in production environment
2. ☐ Set `SWAGGER_REQUIRE_AUTH=true` in production environment
3. ☐ Test `/docs` access as admin user
4. ☐ Test `/docs` access as non-admin user (should show 403)
5. ☐ Test `/docs` access when not logged in (should redirect to login)
6. ☐ Verify "Try it out" is disabled in production
7. ☐ Verify Google Search Console shows noindex for `/docs`
