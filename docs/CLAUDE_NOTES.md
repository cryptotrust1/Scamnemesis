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
| **Admin Dashboard** | ✅ Hotové | `src/app/admin/` | Layout, Dashboard, Reports, Users |

### ⏳ Potrebuje dokončiť:

| Komponent | Priorita | Popis |
|-----------|----------|-------|
| **Prepojenie s API** | 🔴 Vysoká | Nahradiť mock dáta reálnymi API volaniami |
| **Typesense Sync** | 🟡 Stredná | Index synchronization service |
| **Email Service** | 🟡 Stredná | Notification emails |
| **Unit Tests** | 🟡 Stredná | Jest tests for API routes |
| **CI/CD Pipeline** | 🟢 Nízka | GitHub Actions |

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

## 🔄 AKTUÁLNA PRÁCA (10. December 2024, večer)

### Čo som robil (Claude Opus 4) - Session 1:
1. Vytvoril kompletný deployment guide pre amatérov (`docs/NAVOD_PRE_AMATEROV.md`)
2. Analyzoval celý codebase
3. Identifikoval chýbajúce komponenty

### Čo som robil (Claude Opus 4) - Session 2:
1. **UI komponenty** - Button, Input, Card, Badge, Alert
2. **Layout komponenty** - Header (responsive nav), Footer
3. **Root Layout** - `src/app/layout.tsx` s metadata
4. **Homepage** - `src/app/page.tsx` - hero, features, recent reports
5. **Search page** - `src/app/search/page.tsx` - vyhľadávanie s filtrami
6. **Global CSS** - `src/styles/globals.css` - CSS variables, dark mode

### Čo TREBA SPRAVIŤ (nasledujúci Claude):

**PRIORITA 1 - Zostávajúce Frontend Pages:**
- [x] `src/app/page.tsx` - Homepage ✅ DONE
- [x] `src/app/layout.tsx` - Root layout ✅ DONE
- [x] `src/app/search/page.tsx` - Search results ✅ DONE
- [ ] `src/app/report/page.tsx` - Report form
- [ ] `src/app/report/[id]/page.tsx` - Report detail
- [ ] `src/app/auth/login/page.tsx` - Login
- [ ] `src/app/auth/register/page.tsx` - Register

**PRIORITA 2 - Admin Dashboard:**
- [ ] `src/app/admin/page.tsx` - Dashboard
- [ ] `src/app/admin/reports/page.tsx` - Reports management
- [ ] `src/app/admin/duplicates/page.tsx` - Duplicates

**PRIORITA 3 - Ďalšie Components:**
- [x] `src/components/ui/` - Button, Input, Card, Badge, Alert ✅ DONE
- [x] `src/components/layout/` - Header, Footer ✅ DONE
- [ ] `src/components/forms/` - ReportForm

### ⚠️ NEDOTÝKAJ SA:
- `src/app/api/` - API routes sú hotové
- `src/masking/` - Masking module je kompletný
- `src/lib/` - Utilities sú hotové
- `prisma/schema.prisma` - Schéma je finálna
- `src/components/ui/` - UI komponenty sú hotové (môžeš rozšíriť, nie prepisovať)
- `src/components/layout/` - Layout komponenty sú hotové

### 📁 VOĽNÉ PRIEČINKY (môžeš vytvárať):
- `src/app/report/` - Report form a detail pages
- `src/app/auth/` - Login a register pages
- `src/app/admin/` - Admin dashboard
- `src/components/forms/` - Form komponenty
- `src/hooks/` - Custom React hooks

---

**Posledný update:** Claude Opus 4, 10. December 2024 (Session 2)
