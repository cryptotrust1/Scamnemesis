# AI Programming Rules for ScamNemesis

> Pravidla a standardy pre AI asistentov pracujucich na projekte ScamNemesis.
> Last updated: 27. December 2024

---

## 1. Security Rules (KRITICKÉ)

### 1.1 Authentication
- **VŽDY** používaj HttpOnly cookies pre autentifikáciu
- **NIKDY** neukladaj JWT tokeny do localStorage (XSS vulnerability)
- Pri fetch volaniach **VŽDY** pridaj `credentials: 'include'`

```typescript
// SPRÁVNE ✅
const response = await fetch('/api/v1/auth/me', {
  credentials: 'include',
});

// ZLE ❌
const token = localStorage.getItem('token');
const response = await fetch('/api/v1/auth/me', {
  headers: { Authorization: `Bearer ${token}` },
});
```

### 1.2 Password Hashing
- **VŽDY** používaj `hashPassword` z `@/lib/auth/jwt.ts`
- **NIKDY** nevytváraj vlastnú hashovaciu funkciu
- Password requirements: 9+ znakov, uppercase, lowercase, číslo, špeciálny znak

```typescript
// SPRÁVNE ✅
import { hashPassword } from '@/lib/auth/jwt';
const passwordHash = await hashPassword(password);

// ZLE ❌
import crypto from 'crypto';
const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256');
```

### 1.3 Environment Variables
- **NIKDY** nevyhadzuj Error pri module load pre voliteľné env vars
- Runtime check namiesto build-time throw
- JWT_SECRET je povinný - môže vyhodiť Error

```typescript
// SPRÁVNE ✅ (voliteľná premenná)
const OPTIONAL_VAR = process.env.OPTIONAL_VAR;
function useIt() {
  if (!OPTIONAL_VAR && process.env.NODE_ENV === 'production') {
    console.warn('OPTIONAL_VAR not configured, feature disabled');
    return;
  }
}

// ZLE ❌ (build zlyhá)
const OPTIONAL_VAR = process.env.OPTIONAL_VAR;
if (!OPTIONAL_VAR) {
  throw new Error('OPTIONAL_VAR required');
}
```

### 1.4 Data Masking
- Používaj `maskField()` funkciu z route handlera alebo `@/lib/services/masking.ts`
- Rešpektuj user role: BASIC < STANDARD < GOLD < ADMIN/SUPER_ADMIN
- Nikdy neodhaľ plné údaje anonymným používateľom

---

## 2. Code Style Rules

### 2.1 TypeScript
- **VŽDY** definuj typy pre props a state
- **VŽDY** exportuj interface pre reusable typy
- Používaj `unknown` namiesto `any` kde je to možné

```typescript
// SPRÁVNE ✅
interface UserData {
  id: string;
  email: string;
  role: 'BASIC' | 'STANDARD' | 'GOLD' | 'ADMIN';
}

export async function getUser(id: string): Promise<UserData> { }

// ZLE ❌
export async function getUser(id: any): Promise<any> { }
```

### 2.2 React Hooks
- Pri useEffect s funkciou definovanou mimo - **VŽDY** použij `useCallback`
- Uveď všetky dependencies v dependency array

```typescript
// SPRÁVNE ✅
const fetchData = useCallback(async () => {
  // ...
}, [dependency1, dependency2]);

useEffect(() => {
  fetchData();
}, [fetchData]);

// ZLE ❌ (ESLint warning)
const fetchData = async () => { /* ... */ };
useEffect(() => {
  fetchData();
}, []); // missing dependency
```

### 2.3 Imports
- **ODSTRAŇ** nepoužité importy pred commitom
- Usporiadaj importy: React → Next → external → internal → types

```typescript
// SPRÁVNE ✅
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { UserData } from '@/types';
```

### 2.4 Error Handling
- **VŽDY** catchni async operácie
- Loguj errors do console pre debugging
- Zobraz user-friendly message

```typescript
try {
  const response = await fetch('/api/v1/data');
  if (!response.ok) throw new Error('Failed to fetch');
} catch (error) {
  console.error('[Component] Error:', error);
  toast.error('Nepodarilo sa načítať dáta');
}
```

---

## 3. API Rules

### 3.1 Endpoints
- **VŽDY** validuj input pomocou Zod schema
- **VŽDY** vráť konzistentný error format
- Rate limiting: použij `checkRateLimit()` z auth middleware

```typescript
// Error response format
return NextResponse.json({
  error: 'error_code',
  message: 'User-friendly message',
  details: { field: 'validation error' }, // optional
}, { status: 400 });
```

### 3.2 Response Format
```typescript
// Success response
return NextResponse.json({
  data: result,
  meta: { page, total, limit }, // optional pagination
});

// List response
return NextResponse.json({
  items: [...],
  pagination: {
    page: 1,
    pages: 10,
    total_pages: 10, // duplicate for frontend compatibility
    total: 100,
    limit: 10,
  },
});
```

### 3.3 Admin Routes
- **VŽDY** začínaj s `/api/v1/admin/`
- **VŽDY** vyžaduj ADMIN alebo SUPER_ADMIN scope
- Loguj akcie do AuditLog

---

## 4. Database Rules

### 4.1 Prisma
- **NIKDY** neuvádzaj `include` bez `select` pre veľké relačie
- Používaj transakcie pre multi-step operácie
- Vyhýbaj sa N+1 problémom

```typescript
// SPRÁVNE ✅ - single query
const reports = await prisma.report.findMany({
  include: { perpetrators: true },
});

// ZLE ❌ - N+1
const reports = await prisma.report.findMany();
for (const r of reports) {
  r.perpetrators = await prisma.perpetrator.findMany({
    where: { reportId: r.id }
  });
}
```

### 4.2 Enums
- **VŽDY** použi hodnoty z Prisma schema
- FraudType: INVESTMENT_FRAUD, ROMANCE_SCAM, PHISHING, IDENTITY_THEFT, ONLINE_SHOPPING_FRAUD, etc.
- ReportStatus: DRAFT, PENDING, UNDER_REVIEW, APPROVED, REJECTED, MERGED
- UserRole: BASIC, STANDARD, GOLD, ADMIN, SUPER_ADMIN

---

## 5. Frontend Rules

### 5.0 UI Styling Rules (KRITICKÉ)

#### ZAKÁZANÉ - Biely text na bielom pozadí
**NIKDY** nepoužívaj biely text alebo tlačidlá na bielom pozadí. Vždy zabezpeč dostatočný kontrast.

```jsx
// ZLE ❌ - biely text na svetlom pozadí
<Button className="text-white bg-white">Click</Button>
<button className="text-white hover:text-white">Click</button>

// ZLE ❌ - hover efekt, ktorý spôsobí biely na bielom
<Button className="hover:bg-white hover:text-white">Click</Button>

// SPRÁVNE ✅ - dostatočný kontrast
<Button className="bg-blue-600 text-white">Click</Button>
<Button className="bg-white text-blue-600">Click</Button>
<Button className="bg-transparent border-2 border-blue-600 text-blue-600">Click</Button>
```

#### Povolené farby textu na svetlom pozadí:
- Čierna: `text-black`, `text-slate-900`, `text-gray-900`
- Modrá: `text-blue-600`, `text-indigo-600`, `text-primary`
- Sivá: `text-slate-600`, `text-gray-600`, `text-muted-foreground`

#### Pravidlá pre tlačidlá:
1. Na svetlom pozadí použij tmavý text
2. Na tmavom pozadí môžeš použiť biely text
3. Pri hover efektoch zachovaj kontrast
4. **NEPOUŽÍVAJ hover** ak nie je nevyhnutný

#### CSS Variables (Tailwind):
```css
/* Používaj HSL format z globals.css */
.button {
  color: hsl(var(--foreground));       /* Tmavý text */
  background: hsl(var(--primary));     /* Modrá farba */
}
```

### 5.1 Language
- Default locale: **sk** (slovenčina)
- Supported: sk, en, cs, de
- UI text in Slovak unless user changes locale

### 5.2 Component Structure
```
src/components/
├── ui/           # Base components (Button, Card, Input)
├── layout/       # Layout components (Header, Footer)
├── report/       # Report-specific components
└── admin/        # Admin-specific components
```

### 5.3 Page Structure
```
src/app/
├── page.tsx              # Homepage
├── search/               # Search functionality
├── reports/[id]/         # Report detail
├── report/new/           # Report wizard
├── auth/                 # Login, Register, Reset
├── admin/                # Admin dashboard
└── dashboard/            # User dashboard
```

---

## 6. Git Rules

### 6.1 Commits
- Píš commit messages v angličtine
- Používaj imperative mood: "Fix bug" nie "Fixed bug"
- Začni s akciou: Add, Fix, Update, Remove, Refactor

```
✅ Fix XSS vulnerability in dashboard
✅ Add password reset functionality
✅ Remove unused imports from admin page

❌ Fixed the bug
❌ Some changes
❌ WIP
```

### 6.2 Pre-commit Checks
- Skontroluj unused imports
- Skontroluj TypeScript errors
- Skontroluj ESLint warnings (ak je nakonfigurovaný)

---

## 7. Testing Rules

### 7.1 Unit Tests
- Umiestnenie: `src/app/api/v1/__tests__/`
- Framework: Jest + Testing Library
- Mock external services (database, email)

### 7.2 E2E Tests
- Umiestnenie: `e2e/`
- Framework: Playwright
- Test kritické user flows

---

## 8. Known Issues & Workarounds

### 8.1 ESLint v9 Migration
ESLint v9 vyžaduje `eslint.config.js` namiesto `.eslintrc`. Ak lint zlyhá:
```bash
# Dočasné riešenie - ignoruj ESLint warnings
npm run build  # funguje aj bez lint
```

### 8.2 Environment Variables in CI
Pri GitHub Actions build, niektoré env vars môžu chýbať. Používaj runtime checks:
```typescript
// NIE module-level throw
if (!process.env.VAR && process.env.NODE_ENV === 'production') {
  console.warn('VAR not set');
  return; // graceful fallback
}
```

---

## 9. Quick Reference

| Čo | Ako |
|-----|-----|
| Auth fetch | `credentials: 'include'` |
| Password hash | `hashPassword()` from jwt.ts |
| Masking | `maskField(value, type, role)` |
| Validation | Zod schema |
| Translations | `src/i18n/` |
| Default locale | `sk` |
| API errors | `{ error, message, details? }` |
| Rate limiting | `checkRateLimit()` |
| Audit logging | `prisma.auditLog.create()` |

---

**Autor:** Claude Opus 4.5
**Verzia:** 1.0
