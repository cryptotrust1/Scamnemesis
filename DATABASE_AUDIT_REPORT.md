# DATABASE AUDIT REPORT: ScamNemesis

**Date:** 2025-12-26
**Verzia schémy:** 20251226_add_performance_indexes
**Auditor:** Claude Code Database Audit
**Režim:** READ-ONLY Analysis

---

## EXECUTIVE SUMMARY

- **Celkové hodnotenie stability:** 8.5/10
- **Kritických problémov:** 1
- **Vysoká priorita:** 3
- **Stredná priorita:** 4
- **Odporúčaní na zlepšenie:** 8

### Hlavné zistenia

1. **Pozitívne:** Schéma je dobre navrhnutá s konzistentným používaním indexov na FK stĺpcoch
2. **Pozitívne:** Transakcie sú správne použité pre atomické operácie
3. **Problém:** Race condition v registrácii používateľov (check-then-create pattern)
4. **Problém:** Chýba `onUpdate` definícia v niektorých reláciách
5. **Pozitívne:** Duplicate detection systém je robustný a efektívny

---

## STAV DATABÁZOVEJ SCHÉMY

### Modely a tabuľky

| Model | Stĺpcov | Indexov | Relácií | onDelete | Stav |
|-------|---------|---------|---------|----------|------|
| User | 18 | 1 (email) | 14 | N/A | ✅ |
| ApiKey | 10 | 2 | 1 | Cascade | ✅ |
| RefreshToken | 5 | 2 | 1 | Cascade | ✅ |
| Account | 13 | 2 | 1 | Cascade | ✅ |
| Session | 4 | 1 | 1 | Cascade | ✅ |
| VerificationToken | 3 | 2 | 0 | N/A | ✅ |
| Report | 35+ | 11 | 12 | Restrict/SetNull | ✅ |
| Perpetrator | 22 | 4 | 2 | Cascade | ✅ |
| DigitalFootprint | 16 | 2 | 1 | Cascade | ✅ |
| FinancialInfo | 14 | 2 | 1 | Cascade | ✅ |
| CryptoInfo | 8 | 1 | 1 | Cascade | ✅ |
| CompanyInfo | 8 | 1 | 1 | Cascade | ✅ |
| VehicleInfo | 8 | 2 | 1 | Cascade | ✅ |
| Evidence | 18 | 3 | 2 | Cascade | ✅ |
| FaceData | 6 | 1 | 1 | Cascade | ✅ |
| Comment | 14 | 7 | 4 | Cascade/SetNull | ✅ |
| CommentAttachment | 7 | 1 | 1 | Cascade | ✅ |
| DuplicateCluster | 10 | 4 | 2 | SetNull | ✅ |
| DuplicateClusterReport | 4 | 0 (composite PK) | 2 | Cascade | ✅ |
| Enrichment | 13 | 4 | 2 | SetNull | ✅ |
| CrawlResult | 11 | 3 | 0 | N/A | ✅ |
| SanctionEntry | 13 | 2 | 0 | N/A | ✅ |
| AuditLog | 12 | 4 | 1 | SetNull | ✅ |
| ReportView | 5 | 3 | 1 | Cascade | ✅ |
| SearchIndex | 4 | 1 | 0 | N/A | ✅ |
| RateLimit | 5 | 1 | 0 | N/A | ✅ |
| Media | 24 | 5 | 2 | Restrict | ✅ |
| SeoMeta | 18 | 1 | 0 | N/A | ✅ |
| SeoRedirect | 8 | 1 | 0 | N/A | ✅ |
| Page | 17 | 6 | 4 | SetNull/Restrict | ✅ |
| PageRevision | 8 | 3 | 2 | Cascade/Restrict | ✅ |
| PageMedia | 4 | 1 | 2 | Cascade | ✅ |
| SystemSetting | 10 | 3 | 1 | SetNull | ✅ |

**Celkový počet modelov:** 33
**Celkový počet indexov:** ~80+
**Celkový počet enum typov:** 13

### Indexy na FK stĺpcoch - Analýza

| Tabuľka | FK Stĺpec | Index existuje | Stav |
|---------|-----------|----------------|------|
| api_keys | user_id | ✅ | ✅ |
| refresh_tokens | user_id | ✅ | ✅ |
| accounts | user_id | ✅ | ✅ |
| sessions | user_id | ✅ | ✅ |
| reports | reporter_id | ✅ | ✅ |
| reports | moderated_by_id | ✅ | ✅ |
| reports | merged_into_id | ✅ | ✅ |
| perpetrators | report_id | ✅ | ✅ |
| digital_footprints | report_id | ✅ (unique) | ✅ |
| financial_info | report_id | ✅ (unique) | ✅ |
| crypto_info | report_id | ✅ (unique) | ✅ |
| company_info | report_id | ✅ (unique) | ✅ |
| vehicle_info | report_id | ✅ (unique) | ✅ |
| evidence | report_id | ✅ | ✅ |
| face_data | evidence_id | ✅ | ✅ |
| comments | report_id | ✅ | ✅ |
| comments | user_id | ✅ | ✅ |
| comments | moderated_by_id | ✅ | ✅ |
| comment_attachments | comment_id | ✅ | ✅ |
| duplicate_clusters | resolved_by_id | ✅ | ✅ |
| duplicate_clusters | primary_report_id | ✅ | ✅ |
| duplicate_cluster_reports | cluster_id | ✅ (composite PK) | ✅ |
| duplicate_cluster_reports | report_id | ✅ (composite PK) | ✅ |
| enrichments | perpetrator_id | ✅ | ✅ |
| enrichments | reviewed_by_id | ✅ | ✅ |
| audit_logs | user_id | ✅ | ✅ |
| report_views | report_id | ✅ | ✅ |
| media | uploaded_by_id | ✅ | ✅ |
| pages | parent_id | ✅ | ✅ |
| pages | author_id | ✅ | ✅ |
| pages | featured_image_id | ✅ | ✅ |
| page_revisions | page_id | ✅ | ✅ |
| page_revisions | author_id | ✅ | ✅ |
| page_media | page_id | ✅ (unique) | ✅ |
| page_media | media_id | ✅ | ✅ |
| system_settings | updated_by_id | ✅ | ✅ |

**Výsledok:** Všetky FK stĺpce majú správne definované indexy.

---

## ANALÝZA REFERENČNEJ INTEGRITY

### Relácie s CASCADE delete

| Rodič → Dieťa | onDelete | onUpdate | Riziko | Komentár |
|---------------|----------|----------|--------|----------|
| User → ApiKey | Cascade | CASCADE | ✅ Bezpečné | Pri zmazaní usera sa zmažú jeho API kľúče |
| User → RefreshToken | Cascade | CASCADE | ✅ Bezpečné | Pri zmazaní usera sa zmažú jeho tokeny |
| User → Account | Cascade | CASCADE | ✅ Bezpečné | Pri zmazaní usera sa zmažú OAuth účty |
| User → Session | Cascade | CASCADE | ✅ Bezpečné | Pri zmazaní usera sa zmažú sessions |
| Report → Perpetrator | Cascade | CASCADE | ✅ Zámer | Report obsahuje perpetrators |
| Report → DigitalFootprint | Cascade | CASCADE | ✅ Zámer | 1:1 relácia |
| Report → FinancialInfo | Cascade | CASCADE | ✅ Zámer | 1:1 relácia |
| Report → CryptoInfo | Cascade | CASCADE | ✅ Zámer | 1:1 relácia |
| Report → CompanyInfo | Cascade | CASCADE | ✅ Zámer | 1:1 relácia |
| Report → VehicleInfo | Cascade | CASCADE | ✅ Zámer | 1:1 relácia |
| Report → Evidence | Cascade | CASCADE | ⚠️ Over | S3 súbory zostanú orphaned |
| Report → Comment | Cascade | CASCADE | ✅ Zámer | Komentáre patria reportu |
| Report → ReportView | Cascade | CASCADE | ✅ Bezpečné | Štatistiky |
| Evidence → FaceData | Cascade | CASCADE | ✅ Zámer | Face data patria evidence |
| Comment → CommentAttachment | Cascade | CASCADE | ⚠️ Over | S3 súbory zostanú orphaned |
| DuplicateCluster → DuplicateClusterReport | Cascade | CASCADE | ✅ Bezpečné | Junction table |
| Report → DuplicateClusterReport | Cascade | CASCADE | ✅ Bezpečné | Junction table |
| Page → PageRevision | Cascade | CASCADE | ✅ Zámer | Revízie patria stránke |
| Page → PageMedia | Cascade | CASCADE | ✅ Bezpečné | Junction table |
| Media → PageMedia | Cascade | CASCADE | ✅ Bezpečné | Junction table |

### Relácie s RESTRICT/SetNull

| Rodič → Dieťa | onDelete | Hodnotenie |
|---------------|----------|------------|
| User → Report (reporter) | Restrict | ✅ Správne - nelze zmazať usera s reportami |
| User → Report (moderator) | SetNull | ✅ Správne - moderátor môže byť zmazaný |
| Report → Report (merged) | SetNull | ✅ Správne - merged report môže byť zmazaný |
| User → Comment (moderator) | SetNull | ✅ Správne |
| User → DuplicateCluster (resolver) | SetNull | ✅ Správne |
| User → Enrichment (reviewer) | SetNull | ✅ Správne |
| Perpetrator → Enrichment | SetNull | ✅ Správne |
| User → AuditLog | SetNull | ✅ Správne - zachová audit trail |
| User → Media | Restrict | ✅ Správne - nelze zmazať usera s médiami |
| Page → Page (parent) | SetNull | ✅ Správne |
| User → Page | Restrict | ✅ Správne |
| User → PageRevision | Restrict | ✅ Správne |
| User → SystemSetting | SetNull | ✅ Správne |

### Potenciálne orphaned records

1. **Evidence S3 súbory** - Pri CASCADE delete reportu zostanú súbory v S3
   - **Riziko:** 🟠 Stredné
   - **Odporúčanie:** Implementovať S3 cleanup hook alebo scheduled job

2. **CommentAttachment S3 súbory** - Pri CASCADE delete komentára zostanú súbory v S3
   - **Riziko:** 🟠 Stredné
   - **Odporúčanie:** Implementovať S3 cleanup hook

3. **Media thumbnails** - Pri delete media zostanú thumbnail v S3
   - **Riziko:** 🟡 Nízke
   - **Odporúčanie:** Cleanup job

---

## PREVENCIA DUPLICÍT

### Unique Constrainty - Analýza

| Tabuľka | Existujúce Unique | Stav |
|---------|-------------------|------|
| users | email | ✅ |
| api_keys | key | ✅ |
| refresh_tokens | token | ✅ |
| accounts | (provider, providerAccountId) | ✅ |
| sessions | sessionToken | ✅ |
| verification_tokens | token, (identifier, token) | ✅ |
| reports | publicId, trackingToken, caseNumber | ✅ |
| digital_footprints | reportId | ✅ (1:1) |
| financial_info | reportId | ✅ (1:1) |
| crypto_info | reportId | ✅ (1:1) |
| company_info | reportId | ✅ (1:1) |
| vehicle_info | reportId | ✅ (1:1) |
| crawl_results | contentHash | ✅ |
| sanctions_entries | (sourceId, externalId) | ✅ |
| report_views | (reportId, ipHash) | ✅ |
| search_index | reportId | ✅ (1:1) |
| rate_limits | identifier | ✅ |
| seo_meta | (entityType, entityId) | ✅ |
| seo_redirects | fromPath | ✅ |
| pages | slug, path | ✅ |
| page_media | (pageId, mediaId) | ✅ |
| system_settings | key | ✅ |

**Výsledok:** Všetky potrebné unique constrainty sú definované.

### Race Condition Analýza

| Endpoint | Pattern | Riziko | Odporúčanie |
|----------|---------|--------|-------------|
| POST /auth/register | check-then-create | 🔴 | Použiť upsert alebo transakciu s SELECT FOR UPDATE |
| POST /reports (anon user) | check-then-create | 🔴 | Použiť upsert pre anonymného usera |
| GET /reports/[id] (view) | check-then-create v tx | ✅ | Správne použitá transakcia |
| POST /admin/settings | upsert | ✅ | Správne |

### Duplicate Detection Systém

- **Stav:** ✅ Funkčný a robustný
- **Normalizers:** Implementované pre phone, email, IBAN, crypto wallet
- **Fuzzy matching:** Implementovaný pre mená
- **Prahy (thresholds):** Konfigurovateľné (default/strict/relaxed)
- **Výkon:** Optimalizované queries s includom report status

---

## STABILITA A VÝKON

### Connection Management

```typescript
// src/lib/db.ts
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

| Aspekt | Stav | Komentár |
|--------|------|----------|
| Singleton pattern | ✅ | Správne implementovaný |
| Hot reload protection | ✅ | globalThis pattern |
| Pool size | ⚠️ | Nie je explicitne nastavený (default) |
| Timeout konfigurácia | ⚠️ | Nie je nastavená |
| Shutdown cleanup | ❌ | Chýba graceful shutdown handler |

### Transakcie

| Aspekt | Stav |
|--------|------|
| Isolation level | Default (Read Committed) |
| Použitie transakcií | ✅ Rozsiahle (~26 súborov) |
| Retry logika | ❌ Nie je implementovaná |
| Riziko deadlockov | 🟡 Nízke |

Príklady správneho použitia transakcií:
- Report creation s related records
- View tracking (atomic create + increment)
- User registration (token + audit log)
- Admin merge operations

---

## DETAILNÉ ZISTENIA

### [DB-001] Race Condition v User Registration

- **Závažnosť:** 🔴 Kritická
- **Kategória:** Integrita / Race Condition
- **Lokácia:** `src/app/api/v1/auth/register/route.ts:108-142`
- **Popis:** Check-then-create pattern bez transakcie umožňuje race condition
- **Dopad:** Pri súčasnej registrácii s rovnakým emailom môže byť jeden pokus úspešný (unique constraint error) alebo oba môžu prejsť check a jeden zlyhá pri create
- **Odporúčané riešenie:**
  ```typescript
  // Použiť try-catch s unique constraint handling
  try {
    const user = await prisma.user.create({
      data: { email: email.toLowerCase(), ... }
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'email_exists' }, { status: 409 });
    }
    throw error;
  }
  ```

### [DB-002] Race Condition v Anonymous User Creation

- **Závažnosť:** 🟠 Vysoká
- **Kategória:** Integrita / Race Condition
- **Lokácia:** `src/app/api/v1/reports/route.ts:365-391`
- **Popis:** Pri vytváraní anonymného usera je check-then-create pattern
- **Dopad:** Potenciálne duplicate users alebo failed requests
- **Odporúčané riešenie:**
  ```typescript
  const user = await prisma.user.upsert({
    where: { email: reporterEmail },
    create: { email: reporterEmail, ... },
    update: {}
  });
  ```

### [DB-003] Chýba Connection Pool konfigurácia

- **Závažnosť:** 🟠 Vysoká
- **Kategória:** Stabilita
- **Lokácia:** `src/lib/db.ts`
- **Popis:** Pool size a timeouty nie sú explicitne nastavené
- **Dopad:** Pod vysokou záťažou môže dôjsť k vyčerpaniu spojení
- **Odporúčané riešenie:**
  ```typescript
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL + '?connection_limit=20&pool_timeout=30'
      }
    }
  })
  ```

### [DB-004] Chýba Graceful Shutdown Handler

- **Závažnosť:** 🟠 Vysoká
- **Kategória:** Stabilita
- **Lokácia:** `src/lib/db.ts`
- **Popis:** Pri reštarte servera nie je cleanup DB spojení
- **Dopad:** Zombie connections, resource leaks
- **Odporúčané riešenie:**
  ```typescript
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
  ```

### [DB-005] Chýba Retry Logika pre Transakcie

- **Závažnosť:** 🟡 Stredná
- **Kategória:** Stabilita
- **Lokácia:** Všetky súbory s `$transaction`
- **Popis:** Transakcie nemajú retry logiku pre transient errors
- **Dopad:** Intermittentné zlyhania pod záťažou
- **Odporúčané riešenie:** Implementovať retry wrapper

### [DB-006] S3 Orphaned Files pri CASCADE Delete

- **Závažnosť:** 🟡 Stredná
- **Kategória:** Integrita
- **Lokácia:** Evidence, CommentAttachment, Media modely
- **Popis:** Pri CASCADE delete zostávajú súbory v S3
- **Dopad:** Storage bloat, zbytočné náklady
- **Odporúčané riešenie:**
  - Prisma middleware pre beforeDelete hook
  - Scheduled cleanup job

### [DB-007] Chýba Index Maintenance

- **Závažnosť:** 🟡 Stredná
- **Kategória:** Výkon
- **Popis:** Nie je nastavená pravidelná reindexácia
- **Odporúčané riešenie:**
  - REINDEX CONCURRENTLY cron job
  - VACUUM ANALYZE scheduling

### [DB-008] Chýba onUpdate v reláciách

- **Závažnosť:** 🟢 Nízka
- **Kategória:** Best Practice
- **Popis:** Niektoré relácie nemajú explicitný onUpdate
- **Dopad:** Prisma používa CASCADE ako default, čo je OK
- **Stav:** Akceptovateľné

---

## MIGRÁCIE - ANALÝZA

### Prehľad migrácií

| Migrácia | Dátum | Obsah | Stav |
|----------|-------|-------|------|
| 0_baseline | 24.12.2024 | Kompletná schéma | ✅ Idempotentná |
| 20251225_add_bio_column | 25.12.2024 | Bio stĺpec | ✅ |
| 20251226_add_comment_attachments | 26.12.2024 | Comment attachments | ✅ |
| 20251226_add_totp_2fa | 26.12.2024 | TOTP 2FA polia | ✅ |
| 20251226_add_performance_indexes | 26.12.2024 | Performance indexy | ✅ Idempotentná |

### Kvalita migrácií

| Aspekt | Stav | Komentár |
|--------|------|----------|
| Idempotentnosť | ✅ | `IF NOT EXISTS` / `DO $$ EXCEPTION WHEN` |
| Konzistencia poradí | ✅ | Správne timestamp prefixes |
| Rollback stratégia | ⚠️ | Nie je explicitne dokumentovaná |
| Data loss ochrana | ✅ | Žiadne DROP COLUMN bez backup |

---

## PRIORITIZOVANÝ ZOZNAM OPRÁV

### 🔴 Kritické (okamžite)

1. **[DB-001]** Opraviť race condition v registrácii - použiť try-catch s P2002 handling

### 🟠 Vysoká priorita (tento týždeň)

1. **[DB-002]** Opraviť race condition v anonymous user creation - použiť upsert
2. **[DB-003]** Pridať connection pool konfiguráciu
3. **[DB-004]** Implementovať graceful shutdown handler

### 🟡 Stredná priorita (tento mesiac)

1. **[DB-005]** Implementovať retry logiku pre transakcie
2. **[DB-006]** Implementovať S3 cleanup pre orphaned files
3. **[DB-007]** Nastaviť index maintenance cron jobs
4. Dokumentovať rollback stratégiu pre migrácie

### 🟢 Nice-to-have

1. **[DB-008]** Explicitne definovať onUpdate pre všetky relácie
2. Pridať database monitoring (query performance)
3. Implementovať read replicas pre reporting queries

---

## ŠTATISTIKY

| Metrika | Hodnota |
|---------|---------|
| Celkový počet modelov | 33 |
| Celkový počet tabuliek | 33 |
| Celkový počet indexov | ~80+ |
| Celkový počet unique constraintov | ~25 |
| Celkový počet enum typov | 13 |
| Celkový počet FK relácií | ~45 |
| Modely s CASCADE delete | 18 |
| Modely s RESTRICT | 4 |
| Modely s SetNull | 8 |
| Súbory s transakciami | 26 |

---

## ZÁVER

Databázová schéma ScamNemesis je **dobre navrhnutá** s niekoľkými oblasťami na zlepšenie:

**Silné stránky:**
- Konzistentné indexovanie FK stĺpcov
- Správne použitie onDelete stratégií
- Robustný duplicate detection systém
- Rozsiahle použitie transakcií

**Oblasti na zlepšenie:**
- Race conditions v user creation
- Connection pool a shutdown handling
- S3 orphaned files cleanup

Celkové hodnotenie: **8.5/10** - Produkčne pripravená schéma s malými nedostatkami v error handling a connection management.

---

*Report vygenerovaný: 2025-12-26*
*Audit mode: READ-ONLY (žiadne zmeny vykonané)*
