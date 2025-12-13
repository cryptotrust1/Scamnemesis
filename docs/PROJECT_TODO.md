# Project TODO List - Scamnemesis

> **Posledná aktualizácia:** 13. December 2024
> **Produkčná URL:** https://scamnemesis.com

## ⚠️ IGNOROVANÉ KOMPONENTY

Tieto komponenty **NERIEŠIME**:
- ❌ WordPress (wp.scamnemesis.com)
- ❌ scamnemesis.sk doména
- ❌ WordPress plugin

---

## Phase Overview

| Phase | Duration | Focus | Status |
|-------|----------|-------|--------|
| **MVP** | 6-8 weeks | Core functionality | 🔄 ~70% |
| **v2** | 4-6 weeks | Enhanced features | ⬜ 0% |
| **v3** | 4-6 weeks | Scale & ML | ⬜ 0% |

---

## Phase 1: MVP (6-8 weeks)

### 1.1 Infrastructure Setup (Week 1)
| Task | Status | Notes |
|------|--------|-------|
| Setup Git repository structure | ✅ | cryptotrust1/Scamnemesis |
| Create Docker Compose for dev | ✅ | docker-compose.yml |
| Setup PostgreSQL with pgvector | ✅ | pgvector/pgvector:pg16 |
| Setup Redis | ✅ | redis:7-alpine |
| Setup MinIO for S3 storage | ✅ | minio/minio:latest |
| Setup Typesense | ✅ | typesense/typesense:0.25.2 |
| Configure Traefik reverse proxy | ✅ | traefik:v3.0 |
| Create .env.example | ✅ | 40+ premenných |
| Setup CI pipeline (GitHub Actions) | ✅ | .github/workflows/ci.yml |

### 1.2 Database & Backend Foundation (Week 1-2)
| Task | Status | Notes |
|------|--------|-------|
| Create DB migrations - core tables | ✅ | Prisma schema |
| Create DB migrations - users & roles | ✅ | 18+ modelov |
| Create DB migrations - audit & comments | ✅ | |
| Setup Next.js project structure | ✅ | App Router |
| Implement database connection pool | ✅ | Prisma client |
| Create base entity models | ✅ | |
| Implement repository pattern | ✅ | |

### 1.3 Authentication & Authorization (Week 2)
| Task | Status | Notes |
|------|--------|-------|
| Implement JWT authentication | ✅ | src/lib/auth/jwt.ts |
| Implement refresh token flow | ✅ | |
| Create RBAC middleware | ✅ | BASIC, STANDARD, GOLD, ADMIN, SUPER_ADMIN |
| Implement API key authentication | ✅ | X-API-Key header |
| Create user registration flow | ✅ | /api/v1/auth |
| Implement password reset | ❌ | **CHÝBA** |
| Add rate limiting middleware | ✅ | RateLimit model |
| Unit tests for auth | ✅ | auth.test.ts |

### 1.4 Report Submission API (Week 2-3)
| Task | Status | Notes |
|------|--------|-------|
| POST /reports endpoint | ✅ | |
| Input sanitization | ✅ | Zod validation |
| CAPTCHA verification | ❌ | **CHÝBA** - reCAPTCHA |
| File upload handling | ✅ | |
| S3 presigned URL generation | ✅ | |
| Virus scanning integration | ✅ | ClamAV |
| Report status workflow | ✅ | PENDING→APPROVED/REJECTED |
| Duplicate exact check (sync) | ✅ | phone, email, IBAN |
| GET /reports/:id endpoint | ✅ | |
| Integration tests | ✅ | reports.test.ts |

### 1.5 Masking Module (Week 3)
| Task | Status | Notes |
|------|--------|-------|
| Implement masking service | ✅ | src/masking/ |
| Name masking algorithm | ✅ | |
| Phone masking algorithm | ✅ | |
| Email masking algorithm | ✅ | |
| IBAN masking algorithm | ✅ | |
| IP masking algorithm | ✅ | |
| Wallet masking algorithm | ✅ | |
| Role-based masking config | ✅ | |
| Deterministic hashing | ✅ | |
| Unit tests for masking | ✅ | functions.test.ts |

### 1.6 Basic Search (Week 3-4)
| Task | Status | Notes |
|------|--------|-------|
| Setup Typesense schema | ✅ | |
| Index synchronization service | ✅ | src/lib/services/typesense.ts |
| GET /search endpoint | ✅ | |
| Exact search (phone, email, IBAN) | ✅ | |
| Basic fuzzy search (names) | ✅ | |
| Search filters implementation | ✅ | country, date, type |
| Search result masking | ✅ | |
| Search caching (Redis) | ✅ | |
| Integration tests | ✅ | search.test.ts |

### 1.7 Admin API (Week 4-5)
| Task | Status | Notes |
|------|--------|-------|
| GET /admin/reports/pending | ✅ | |
| POST /admin/reports/:id/approve | ✅ | |
| POST /admin/reports/:id/reject | ✅ | |
| PATCH /admin/reports/:id | ✅ | |
| GET /admin/duplicates | ✅ | |
| POST /admin/duplicates/:id/merge | ✅ | |
| Comment moderation endpoints | ✅ | |
| Audit logging middleware | ✅ | |
| Export PDF endpoint | ✅ | HTML/PDF/JSON |

### 1.8 Frontend - Public Pages (Week 4-5)
| Task | Status | Notes |
|------|--------|-------|
| Setup Next.js project | ✅ | App Router |
| Homepage with search bar | ✅ | src/app/page.tsx |
| Search results page | ✅ | src/app/search/ |
| Report detail page | ✅ | src/app/reports/[id]/ |
| Report submission form | ✅ | Multi-step wizard |
| Form validation (client-side) | ✅ | Zod + react-hook-form |
| File upload component | ✅ | |
| Responsive design | ✅ | Tailwind CSS |
| i18n setup (SK, EN, CS, DE) | ✅ | src/lib/i18n/ |

### 1.9 Frontend - Admin Dashboard (Week 5-6)
| Task | Status | Notes |
|------|--------|-------|
| Admin login page | ✅ | |
| Dashboard overview | ✅ | Stats, charts |
| Pending reports queue | ✅ | |
| Report detail/edit view | ✅ | |
| Masking toggle per field | ✅ | |
| Duplicate cluster view | ✅ | |
| Comment moderation view | ✅ | |
| User management | ✅ | |
| Audit log viewer | ✅ | |

### 1.10 WordPress Plugin (Week 6)
| Task | Status | Notes |
|------|--------|-------|
| ~~Plugin boilerplate~~ | ❌ | **IGNOROVANÉ** |
| ~~Admin settings page~~ | ❌ | **IGNOROVANÉ** |
| ~~Shortcodes~~ | ❌ | **IGNOROVANÉ** |
| ~~Gutenberg blocks~~ | ❌ | **IGNOROVANÉ** |

### 1.11 Basic Crawlers (Week 6-7)
| Task | Status | Notes |
|------|--------|-------|
| Crawler worker architecture | ✅ | BullMQ queue |
| RSS connector base class | ✅ | BaseConnector |
| OFAC sanctions connector | ✅ | |
| EU sanctions connector | ✅ | |
| Interpol connector | ✅ | |
| 10 news source connectors | ✅ | SK, CZ, DE, EN, RU, UK |
| Language detection | ✅ | |
| Entity extraction (basic) | ✅ | regex patterns |
| Deduplication | ✅ | |
| Scheduler configuration | ⬜ | Potrebuje konfiguráciu |

### 1.12 Testing & Documentation (Week 7-8)
| Task | Status | Notes |
|------|--------|-------|
| Unit tests (80% coverage) | 🔄 | ~60% aktuálne |
| Integration tests | ✅ | |
| E2E tests (critical paths) | ✅ | Playwright |
| API documentation | ✅ | docs/openapi.yaml |
| Deployment documentation | ✅ | NAVOD_PRE_AMATEROV.md |
| User guide | ⬜ | Potrebuje dopísať |

### 1.13 MVP Deployment (Week 8)
| Task | Status | Notes |
|------|--------|-------|
| Production environment setup | ✅ | Hetzner VPS |
| SSL certificates | ✅ | Let's Encrypt via Traefik |
| DNS configuration | ✅ | scamnemesis.com |
| Backup configuration | ⬜ | **CHÝBA** |
| Monitoring setup (basic) | ⬜ | Prometheus/Grafana config needed |
| Production deployment | ✅ | https://scamnemesis.com |
| Smoke tests | ⬜ | Potrebuje testovanie |

---

## 🔴 KRITICKÉ CHÝBAJÚCE FUNKCIE

| # | Funkcia | Popis | Effort |
|---|---------|-------|--------|
| 1 | **Database Seeding** | Databáza je úplne prázdna (0 reportov) | 2-4h |
| 2 | **API integrácia vo Frontende** | Frontend používa mock dáta | 4-8h |
| 3 | **CAPTCHA** | reCAPTCHA v3 na formulároch | 2-4h |
| 4 | **Password Reset** | Zabudnuté heslo flow | 4-6h |
| 5 | **Email verifikácia** | Overenie registrácie | 4-6h |
| 6 | **Backup konfigurácia** | Automatické zálohy DB | 2-4h |

---

## 🟠 DÔLEŽITÉ PRE V1

| # | Funkcia | Popis | Effort |
|---|---------|-------|--------|
| 1 | Image Pipeline | Thumbnails, pHash | 8-16h |
| 2 | Face Detection | CPU-based face-api.js | 16-24h |
| 3 | OCR Pipeline | Tesseract integration | 8-16h |
| 4 | Background Workers | Duplicate detection worker | 8-12h |
| 5 | Real-time Notifications | WebSocket | 8-12h |

---

## Phase 2 & 3: Odložené na neskôr

Tieto fázy začneme až po dokončení MVP:
- Advanced Search (OpenSearch, semantic)
- GPU Workers
- Kubernetes deployment
- Multi-region infrastructure
- Advanced ML features

---

## Acceptance Criteria

### MVP Release Criteria (aktuálny stav)
- [x] Report submission works end-to-end
- [x] Basic search returns relevant results
- [x] Admin can approve/reject reports
- [x] Masking works correctly per role
- [x] Exact duplicate detection flags matches
- [x] Files upload and store correctly
- [x] ~~WordPress plugin functional~~ (IGNOROVANÉ)
- [x] Basic crawlers running
- [x] Documentation complete
- [ ] **No critical bugs** - potrebuje testovanie
- [ ] **Database seeded** - **KRITICKÉ**
- [ ] **Frontend napojený na API** - **KRITICKÉ**

---

## Status Legend
- ⬜ Pending
- 🔄 In Progress
- ✅ Completed
- ❌ Not Planned / Ignored

---

**Aktualizované:** 13. December 2024, Claude Opus 4
