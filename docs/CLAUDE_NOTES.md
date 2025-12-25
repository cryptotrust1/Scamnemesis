# 📝 POZNÁMKY PRE CLAUDE INŠTANCIE

> Tento súbor slúži na koordináciu medzi rôznymi Claude inštanciami pracujúcimi na projekte.

---

## 🗓️ Posledná aktualizácia: 10. December 2024

---

## 📊 AKTUÁLNY STAV PROJEKTU

### ✅ Hotové komponenty:

| Komponent | Stav | Súbory | Poznámky |
|-----------|------|--------|----------|
| **Prisma Schema** | ✅ Hotové | `prisma/schema.prisma` | Plná DB schéma s pgvector |
| **Auth API** | ✅ Hotové | `src/app/api/v1/auth/` | JWT + refresh tokens + API keys |
| **Reports API** | ✅ Hotové | `src/app/api/v1/reports/` | CRUD + komentáre |
| **Search API** | ✅ Hotové | `src/app/api/v1/search/` | Exact + fuzzy search |
| **Verify API** | ✅ Hotové | `src/app/api/v1/verify/` | Quick identifier check |
| **Stats API** | ✅ Hotové | `src/app/api/v1/stats/` | Global statistics |
| **Admin API** | ✅ Hotové | `src/app/api/v1/admin/` | Reports, duplicates, comments |
| **Images API** | ✅ Hotové | `src/app/api/v1/images/` | Upload presigned + face search |
| **Webhooks API** | ✅ Hotové | `src/app/api/v1/webhooks/` | Enrichment webhook |
| **Masking Module** | ✅ Hotové | `src/masking/` | Role-based data masking |
| **Masking Service** | ✅ Hotové | `src/lib/services/masking.ts` | API integration |
| **Auth Middleware** | ✅ Hotové | `src/lib/middleware/auth.ts` | JWT + API key + rate limiting |
| **WordPress Plugin** | ✅ Hotové | `plugins/scamnemesis-wp/` | Shortcodes, widgets, Gutenberg |
| **JavaScript SDK** | ✅ Hotové | `sdk/js/` | Embeddable widgets |
| **Docker Compose** | ✅ Hotové | `docker-compose.yml` | Dev environment |
| **UI Components** | ✅ Hotové | `src/components/ui/` | Button, Input, Card, Badge, Alert |
| **Layout Components** | ✅ Hotové | `src/components/layout/` | Header, Footer |
| **Homepage** | ✅ Hotové | `src/app/page.tsx` | Hero, features, CTA |
| **Search Page** | ✅ Hotové | `src/app/search/` | Search with filters |
| **Global Styles** | ✅ Hotové | `src/styles/globals.css` | CSS variables, dark mode |
| **Admin Dashboard** | ✅ Hotové | `src/app/admin/` | Layout, Dashboard, Reports, Users, Comments, Duplicates, Settings |
| **API Client** | ✅ Hotové | `src/lib/api/` | HTTP client, auth, reports, admin services |
| **React Hooks** | ✅ Hotové | `src/hooks/` | useAuth, useReports, useAdmin hooks |
| **Email Service** | ✅ Hotové | `src/lib/services/email.ts` | Resend integration, templates |
| **Typesense Service** | ✅ Hotové | `src/lib/services/typesense.ts` | Full-text search, sync |

| **Unit Tests** | ✅ Hotové | `src/app/api/v1/__tests__/` | Auth, Reports, Search tests |
| **Report Form Steps** | ✅ Hotové | `src/components/report/steps/` | Complete multi-step wizard |

### ⏳ Potrebuje dokončiť:

| Komponent | Priorita | Popis |
|-----------|----------|-------|
| **Production Deploy** | 🟢 Nízka | Deploy to production server |
| **Basic Crawlers** | 🟢 Nízka | OFAC, EU sanctions, Interpol, RSS |

### ✅ Nedávno dokončené (Session 5):
| **CI/CD Pipeline** | ✅ Hotové | GitHub Actions (.github/workflows/ci.yml) |
| **E2E Tests** | ✅ Hotové | Playwright (e2e/) |
| **i18n Setup** | ✅ Hotové | Multi-language support (src/lib/i18n/) |
| **Legal Pages** | ✅ Hotové | Terms, Privacy, Contact |

---

## 🏗️ ARCHITEKTÚRA

```
Scamnemesis/
├── prisma/
│   └── schema.prisma          # Databázová schéma (PostgreSQL + pgvector)
│
├── src/
│   ├── app/api/v1/            # Next.js API Routes
│   │   ├── auth/              # Autentifikácia
│   │   ├── reports/           # Fraud reports CRUD
│   │   ├── search/            # Vyhľadávanie
│   │   ├── verify/            # Rýchle overenie
│   │   ├── stats/             # Štatistiky
│   │   ├── admin/             # Admin operácie
│   │   ├── images/            # Upload a face search
│   │   └── webhooks/          # Enrichment webhooks
│   │
│   ├── lib/
│   │   ├── auth/jwt.ts        # JWT utilities
│   │   ├── db.ts              # Prisma client
│   │   ├── middleware/        # Auth + rate limiting
│   │   └── services/          # Business logic services
│   │
│   └── masking/               # Data masking module
│
├── plugins/scamnemesis-wp/    # WordPress plugin
├── sdk/js/                    # JavaScript SDK
└── docs/                      # Dokumentácia
```

---

## 🔑 DÔLEŽITÉ TECHNICKÉ DETAILY

### Prisma Schema zmeny (December 2024):
- Pridaný `Severity` enum (LOW, MEDIUM, HIGH, CRITICAL)
- Pridaný `UNDER_REVIEW` a `MERGED` status do `ReportStatus`
- Report model: pridané `severity`, `publishedAt`, `moderatedAt`, `moderatedById`, `mergedIntoId`, `mergeCount`, `metadata`
- Perpetrator: pridané `enrichedData`, zmenené na many-to-many s Report
- Comment: pridané `moderatedAt`, `moderatedById`, `rejectionReason`
- DuplicateCluster: pridané `confidence`, `matchType`
- Evidence: pridané `url`, `thumbnailUrl`, `hash`
- EvidenceType: pridané IMAGE, DOCUMENT, VIDEO, AUDIO
- User: pridané `displayName`

### Auth systém:
- JWT tokens s refresh flow
- API key autentifikácia (X-API-Key header)
- Role-based scopes: BASIC, STANDARD, GOLD, ADMIN, SUPER_ADMIN
- Rate limiting cez databázu (RateLimit model)

### Masking:
- Role-based visibility
- Deterministické hashovanie
- Podporované typy: email, phone, iban, name, wallet, ip, spz, vin

---

## ⚠️ NEROB TIETO VECI:

1. **NEMEŇ** Prisma schému bez koordinácie - iné Claude môžu mať rozpracované migrácie
2. **NEPREPISUJ** existujúce API routes - radšej rozšíruj
3. **NEZABUDNI** na TypeScript typy pri nových súboroch
4. **NEKOPÍRUJ** citlivé údaje do kódu (používaj .env)

---

## 📁 SÚBORY NA KTORÉ DÁVAJ POZOR:

| Súbor | Prečo |
|-------|-------|
| `prisma/schema.prisma` | Databázová schéma - zmeny vyžadujú migráciu |
| `.env.example` | Konfiguračná šablóna - pridávaj nové premenné |
| `docker-compose.yml` | Dev environment - udržuj aktuálny |
| `src/lib/middleware/auth.ts` | Auth middleware - kritické pre bezpečnosť |

---

## 🔄 GIT BRANCH

Aktuálny branch: `claude/scalable-system-design-01WirPsAYKpuTitzan7MD3VR`

Pri commitoch používaj jasné správy v angličtine.

---

## 📞 KONTAKT S POUŽÍVATEĽOM

Používateľ komunikuje **po slovensky**. Je **amatér** v programovaní, takže:
- Vysvetľuj jednoducho
- Dávaj konkrétne príkazy na kopírovanie
- Používaj veľa príkladov

---

---

## 🔄 AKTUÁLNA PRÁCA (10. December 2024)

### Session 1 (Claude Opus 4):
1. Vytvoril deployment guide (`docs/NAVOD_PRE_AMATEROV.md`)
2. Analyzoval codebase

### Session 2 (Claude Opus 4):
1. UI komponenty, Layout komponenty, Homepage, Search page
2. Merge konflikty s main branch

### Session 3 (Claude Opus 4):
1. **Admin Dashboard komplet** - layout, dashboard, reports, users, comments, duplicates, settings
2. **API Client** - `src/lib/api/` - client, auth, reports, admin services
3. **React Hooks** - `src/hooks/` - useAuth, useReports, useAdmin
4. **Email Service** - `src/lib/services/email.ts` - Resend, templates
5. **Typesense Service** - `src/lib/services/typesense.ts` - full-text search

### ✅ Kompletné Frontend Pages:
- [x] Homepage (`src/app/page.tsx`)
- [x] Search (`src/app/search/`)
- [x] Report form (`src/app/report/new/`)
- [x] Report detail (`src/app/reports/[id]/`)
- [x] Login (`src/app/auth/login/`)
- [x] Register (`src/app/auth/register/`)
- [x] Admin Dashboard komplet (`src/app/admin/*`)

### ⚠️ NEDOTÝKAJ SA:
- `src/app/api/` - API routes sú hotové
- `src/masking/` - Masking module je kompletný
- `prisma/schema.prisma` - Schéma je finálna
- `src/app/admin/` - Admin je kompletný

### Session 4 (Claude Opus 4, 11. December 2024):
1. **Unit Tests** - `src/app/api/v1/__tests__/` - auth.test.ts, reports.test.ts, search.test.ts
2. **Report Form Steps** - `src/components/report/steps/` - perpetrator, evidence, contact, review
3. **Updated /report/new page** - Complete multi-step wizard integration
4. **i18n Setup** - `src/lib/i18n/` - SK, EN, CS, DE translations, I18nProvider, LanguageSelector
5. **Success Page** - `src/app/report/success/` - Post-submission success page
6. **Audit Log** - `src/app/admin/audit/` - Admin audit log viewer with filters
7. **PDF Export** - `src/app/api/v1/reports/[id]/export/` - HTML/PDF/JSON export
8. **OpenAPI Documentation** - `docs/openapi.yaml` - Full API specification

### Session 5 (Claude Opus 4, 11. December 2024):
1. **CI/CD Pipeline** - `.github/workflows/ci.yml` - Complete GitHub Actions workflow
2. **E2E Tests** - `e2e/` - Playwright tests for homepage, search, report-form, auth
3. **Terms Page** - `src/app/terms/page.tsx` - Podmienky pouzivania
4. **Privacy Page** - `src/app/privacy/page.tsx` - Ochrana osobnych udajov (GDPR)
5. **Contact Page** - `src/app/contact/page.tsx` - Contact form with validation
6. **Crawler System** - `src/lib/crawlers/` - Complete crawler infrastructure:
   - Bull job queue system for async processing
   - BaseConnector class with rate limiting and entity extraction
   - OFAC SDN sanctions connector (US Treasury)
   - EU Financial Sanctions connector
   - Interpol Red Notices connector
   - RSS news connector (SK, CZ, DE, EN, RU, UK sources)

### 🔜 Čo zostáva (nízka priorita):
- Production Deployment
- Image Processing (thumbnails, pHash)
- Face Recognition (real implementation)
- OCR Pipeline (Tesseract)

### ✅ Všetky Frontend Pages:
- [x] Homepage (`src/app/page.tsx`)
- [x] Search (`src/app/search/`)
- [x] Report form (`src/app/report/new/`)
- [x] Report success (`src/app/report/success/`)
- [x] Report detail (`src/app/reports/[id]/`)
- [x] Login (`src/app/auth/login/`)
- [x] Register (`src/app/auth/register/`)
- [x] Admin Dashboard komplet (`src/app/admin/*`)
- [x] Terms of Service (`src/app/terms/`)
- [x] Privacy Policy (`src/app/privacy/`)
- [x] Contact (`src/app/contact/`)

---

## ⚠️ IGNOROVANÉ KOMPONENTY (13. December 2024)

**Tieto komponenty NERIEŠIME:**
- ❌ **WordPress (wp.scamnemesis.com)** - nebudeme nasadzovať
- ❌ **scamnemesis.sk doména** - používame len scamnemesis.com
- ❌ **WordPress plugin** - ignorovať

**Produkčná URL:** https://scamnemesis.com (funguje)

---

## 📋 CHÝBAJÚCE FUNKCIE (13. December 2024)

### 🔴 KRITICKÉ (potrebné pre MVP):

| Funkcia | Popis | Priorita |
|---------|-------|----------|
| **Database Seeding** | Databáza je prázdna, treba seed dáta | 🔴 Vysoká |
| **API integrácia** | Frontend používa mock dáta, treba napojiť na reálne API | 🔴 Vysoká |
| **CAPTCHA** | Ochrana formulárov pred botmi (reCAPTCHA v3) | 🔴 Vysoká |
| **Password Reset** | Zabudnuté heslo - resetovanie cez email | 🔴 Vysoká |
| **Email verifikácia** | Overenie emailovej adresy pri registrácii | 🔴 Vysoká |

### 🟠 DÔLEŽITÉ (potrebné pre v1):

| Funkcia | Popis | Priorita |
|---------|-------|----------|
| **Image Pipeline** | Thumbnail generovanie, pHash výpočet | 🟠 Stredná |
| **Face Detection** | Detekcia tvárí v obrázkoch (CPU) | 🟠 Stredná |
| **OCR Pipeline** | Extrakcia textu z obrázkov/PDF (Tesseract) | 🟠 Stredná |
| **Background Workers** | Async spracovanie (duplicate detection worker) | 🟠 Stredná |
| **Real-time Notifications** | WebSocket notifikácie | 🟠 Stredná |
| **PDF Export** | Generovanie PDF reportov (implementované ale neotestované) | 🟠 Stredná |

### 🟡 NÍZKA PRIORITA (pre v2):

| Funkcia | Popis | Priorita |
|---------|-------|----------|
| **Kubernetes** | Helm charty, autoscaling | 🟡 Nízka |
| **GPU Workers** | Face embedding, advanced ML | 🟡 Nízka |
| **Advanced Crawlers** | 50+ news sources, Yandex search | 🟡 Nízka |
| **Multi-region** | CDN, read replicas | 🟡 Nízka |
| **Mobile App** | React Native/Flutter aplikácia | 🟡 Nízka |

---

## 🔐 AUTH SYSTEM ARCHITECTURE (25. December 2024)

### Architektonický prehľad:

Systém používa **HYBRIDNÝ AUTH**:
1. **Custom JWT API** (`/api/v1/auth/*`) - pre password login a user management
2. **NextAuth v5** (`/api/auth/*`) - pre OAuth (Google, GitHub)

### Kľúčové súbory:

| Súbor | Účel |
|-------|------|
| `src/auth.ts` | NextAuth v5 konfigurácia (OAuth providers) |
| `src/lib/auth/jwt.ts` | JWT generation, verification, password hashing |
| `src/lib/auth/user-context.tsx` | React context pre user state (`useUser()`) |
| `src/lib/admin/auth-context.tsx` | Admin auth context (`useAdminAuth()`) |
| `src/app/api/v1/auth/*` | Custom auth endpoints |

### Auth Flow:

1. **Password Login**: `/auth/login` → `POST /api/v1/auth/token` → HttpOnly cookies
2. **Google OAuth**: `/auth/login` → `signIn('google')` → NextAuth → callback → session
3. **Registration**: `/auth/register` → `POST /api/v1/auth/register` → verification email
4. **Email Verification**: `/auth/verify-email?token=X` → `POST /api/v1/auth/verify-email`

### ⚠️ DÔLEŽITÉ:

1. **NEPOUŽÍVAJ** `useAuth()` z `src/hooks/use-auth.tsx` - je deprecated (mŕtvy kód)
2. **POUŽÍVAJ** `useUser()` z `src/lib/auth/user-context.tsx` pre user state
3. **JWT_SECRET** musí byť rovnaký pri build aj runtime
4. **RESEND_API_KEY** musí byť nastavený pre email verification

### Opravy z 25. December 2024 (Part 1 - Auth System):

- ✅ Pridaná `/auth/error` stránka pre OAuth chyby
- ✅ Opravený signIn callback - vracia redirect namiesto `false`
- ✅ Pridaná null check pre `payload.sub` v verify-email route
- ✅ Konvertovaná verify-email stránka na angličtinu
- ✅ Zjednodušený login - odstránený dual auth flow
- ✅ Pridaná migrácia pre chýbajúci `bio` stĺpec

### Opravy z 25. December 2024 (Part 2 - UI/UX Fixes):

- ✅ **Google OAuth 404 fix**: Odstránená `newUser: '/auth/welcome'` z NextAuth config (stránka neexistovala)
- ✅ **Settings redirect**: Vytvorená `/settings` stránka, ktorá redirectuje na `/profile`
- ✅ **Middleware update**: Pridané `/settings` a `/profile` do `rootRoutes` v middleware.ts
- ✅ **SDK null-check fix**: Pridané null checky pre `querySelector` v `scamnemesis.js` SDK (SearchWidget, ReportWidget, VerifyWidget)
- ✅ **Dashboard English**: Konvertované všetky Slovak stringy na English
- ✅ **Profile English**: Konvertované všetky Slovak stringy na English

### Súbory upravené (Part 2):

| Súbor | Zmena |
|-------|-------|
| `src/auth.ts` | Odstránená `newUser: '/auth/welcome'` |
| `src/middleware.ts` | Pridané `/settings`, `/profile` do rootRoutes |
| `src/app/settings/page.tsx` | NOVÝ - redirect na /profile |
| `sdk/js/src/scamnemesis.js` | Null checky v bindEvents() metódach |
| `src/app/dashboard/page.tsx` | Konvertované na English |
| `src/app/profile/page.tsx` | Konvertované na English |

---

## 🌐 LOCALE ROUTING (25. December 2024)

### Cesty ktoré NEPOUŽÍVAJÚ locale prefix:

Tieto cesty existujú na root úrovni a NEsú prefixované locale (`/en/`, `/sk/`):

```
/                       - Homepage
/about                  - About page
/contact                - Contact page
/contact-us             - Contact us page
/dashboard              - User dashboard
/profile                - User profile/settings
/settings               - Redirects to /profile
/search                 - Search page
/auth/*                 - Auth pages (login, register, verify-email, error)
/admin/*                - Admin pages
/report/*               - Report pages
```

### Cesty ktoré POUŽÍVAJÚ locale prefix:

```
/[locale]/about         - Localized about
/[locale]/search        - Localized search
/[locale]/report/new    - Localized report form
/[locale]/support-us    - Localized support page
```

### ⚠️ DÔLEŽITÉ pre nové stránky:

1. Ak stránka potrebuje byť na root level → pridaj ju do `rootRoutes` v `src/middleware.ts`
2. Ak stránka potrebuje preklady → daj ju do `/[locale]/` folder struktury
3. Dashboard/Profile/Auth pages nie sú v locale strukture - používajú hardcoded English strings

---

**Posledný update:** Claude Opus 4.5, 25. December 2024 (UI/UX Fixes & English Conversion)
