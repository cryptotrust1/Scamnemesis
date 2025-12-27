# Scamnemesis Debugging Guide

Tento dokument obsahuje všetky debugging techniky a nástroje pre rýchle diagnostikovanie problémov.

---

## 🚨 PRVÝ KROK PRI KAŽDOM PROBLÉME

```bash
curl https://scamnemesis.com/api/v1/health/detailed
```

Toto ti povie okamžite či je problém s databázou, tabuľkami, alebo Redis.

---

## Vyriešené incidenty (učíme sa z chýb)

### Incident: P2021 - Chýbajúce databázové tabuľky (December 2024)

**Symptómy:**
- Report form vracia 500 error
- V browser console: `error_code: "P2021"`
- `/api/auth/session` vracia 500

**Príčina:**
1. Migračný SQL (`prisma/migrations/0_baseline/migration.sql`) neobsahoval Auth.js tabuľky (`accounts`, `sessions`, `verification_tokens`)
2. Migračný kontajner exitoval s `exit 0` aj pri chybe (tichý fail)
3. Kontajner bežal ako non-root user a nemohol spustiť `apt-get install`

**Riešenie:**
1. Pridané chýbajúce tabuľky do `migration.sql`
2. Opravený `docker-compose.prod.yml` - `exit 1` pri chybe
3. Pridaný `user: root` do migrations služby
4. Pridaný SQL fallback keď Prisma zlyhá

**Prevencia (checklist nižšie):** Vždy synchronizovať Prisma schému s SQL migráciou.

---

## ⚠️ CHECKLIST: Pridávanie nových tabuliek/stĺpcov

**VŽDY keď meníš `prisma/schema.prisma`:**

### 1. Updatuj SQL migráciu
```bash
# Otvor oba súbory vedľa seba:
# - prisma/schema.prisma
# - prisma/migrations/0_baseline/migration.sql

# Skontroluj že KAŽDÁ tabuľka v schéme má CREATE TABLE v SQL
```

### 2. Skontroluj typy stĺpcov
| Prisma typ | SQL typ |
|------------|---------|
| `String` | `TEXT` |
| `String?` | `TEXT` (nullable) |
| `Int` | `INTEGER` |
| `DateTime` | `TIMESTAMP(3)` |
| `DateTime?` | `TIMESTAMP(3)` (nullable) |
| `Boolean` | `BOOLEAN` |
| `Json` | `JSONB` |

### 3. Auth.js tabuľky (POVINNÉ)
Tieto tabuľky MUSIA existovať pre Auth.js:
- `users` - s `email_verified` ako `TIMESTAMP(3)`, nie `BOOLEAN`!
- `accounts` - OAuth providers
- `sessions` - session storage
- `verification_tokens` - email verification

### 4. Otestuj lokálne
```bash
# Spusti migrácie lokálne
docker compose -f docker-compose.prod.yml up -d postgres
docker compose -f docker-compose.prod.yml up migrations

# Skontroluj logy
docker compose -f docker-compose.prod.yml logs migrations
```

### 5. Po deployi skontroluj
```bash
curl https://scamnemesis.com/api/v1/health/detailed
```

---

## Quick Health Check

```bash
# Rýchla kontrola stavu systému
curl https://scamnemesis.com/api/v1/health/detailed
```

**Očakávaná odpoveď:**
```json
{
  "status": "healthy",
  "checks": {
    "database": { "status": "ok", "latencyMs": 12 },
    "tables": {
      "status": "ok",
      "details": { "users": true, "accounts": true, "sessions": true, "reports": true }
    },
    "redis": { "status": "ok" }
  }
}
```

**Ak `status: "unhealthy"`** - pozri `checks` pre konkrétny problém.

---

## Docker Logy

### Všetky kontajnery
```bash
docker compose -f docker-compose.prod.yml logs -f --tail=100
```

### Konkrétny kontajner
```bash
# App logy
docker compose -f docker-compose.prod.yml logs -f app

# Migration logy (ak zlyhali)
docker compose -f docker-compose.prod.yml logs migrations

# Database logy
docker compose -f docker-compose.prod.yml logs postgres
```

### Status kontajnerov
```bash
docker compose -f docker-compose.prod.yml ps
```

---

## Databázové problémy

### P2021 - Table does not exist
**Príčina:** Migrácie neboli spustené.

**Riešenie:**
```bash
# Manuálne spustenie migrácií
./scripts/run-migrations.sh

# Alebo reštart migrations kontajnera
docker compose -f docker-compose.prod.yml up -d --force-recreate migrations
docker compose -f docker-compose.prod.yml restart app
```

### Kontrola tabuliek v databáze
```bash
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U postgres -d scamnemesis -c "\dt"
```

### Priame SQL query
```bash
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U postgres -d scamnemesis -c "SELECT COUNT(*) FROM users;"
```

---

## API Debugging

### Test API s debug výstupom
```bash
# Health check
curl -v https://scamnemesis.com/api/v1/health

# Session check (Auth.js)
curl -v https://scamnemesis.com/api/auth/session

# Reports endpoint
curl -v -X POST https://scamnemesis.com/api/v1/reports \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Browser Console
Pri chybách v prehliadači otvor DevTools (F12) → Console a hľadaj:
- `[ScamNemesis Debug]` - naše custom logy
- `error_type` - typ Prisma/JS chyby
- `error_code` - Prisma error kód (napr. P2021)
- `request_id` - ID pre trackovanie v logoch

---

## Časté chyby a riešenia

| Chyba | Príčina | Riešenie |
|-------|---------|----------|
| P2021 | Tabuľka neexistuje | Spustiť migrácie |
| P2002 | Duplicitný záznam | Skontrolovať unique constraints |
| ECONNREFUSED | DB/Redis nedostupné | Skontrolovať kontajnery |
| AUTH_SECRET missing | Chýba env variable | Pridať do .env |
| 500 na /api/auth/session | Auth.js config problém | Skontrolovať AUTH_SECRET |

---

## React Hydration Errors (#418, #423)

**Symptómy v browser console:**
```
Minified React error #418
Minified React error #423
```

**Čo to znamená:**
- #418: Server HTML sa nezhoduje s client-side renderom
- #423: React musel znovu vytvoriť celý DOM strom

**Príčiny:**
1. Dátumy/časy renderované rôzne na serveri vs klientovi
2. Browser extensions menia DOM
3. Chýbajúce alebo nesprávne `use client` direktívy
4. Podmienený rendering based na `typeof window`

**Riešenie:**
```tsx
// ❌ ZLE - spôsobuje hydration mismatch
{typeof window !== 'undefined' && <Component />}

// ✅ DOBRE - použiť useEffect
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

**Pre dátumy:**
```tsx
// ❌ ZLE
<span>{new Date().toLocaleString()}</span>

// ✅ DOBRE - formátovať na klientovi
const [date, setDate] = useState<string>();
useEffect(() => setDate(new Date().toLocaleString()), []);
```

---

## SSL Certificate Problems

**Symptóm:**
```
curl: (60) SSL certificate problem: unable to get local issuer certificate
```

**Riešenie:**
```bash
# Skúsiť s -k flag (ignoruje SSL verification - len na testovanie)
curl -k https://scamnemesis.com/api/v1/health/detailed

# Alebo na serveri priamo:
docker compose -f docker-compose.prod.yml exec app curl http://localhost:3000/api/v1/health/detailed
```

**Let's Encrypt rate limiting:**
Ak certifikáty nefungujú, môže byť rate limit. Počkaj 1 hodinu a reštartuj traefik:
```bash
docker compose -f docker-compose.prod.yml restart traefik
```

---

## Environment Variables Check

```bash
# Na serveri
docker compose -f docker-compose.prod.yml exec app env | grep -E "(DATABASE|REDIS|AUTH)"
```

**Povinné premenné:**
- `POSTGRES_PASSWORD` - heslo do DB
- `AUTH_SECRET` - pre Auth.js (min 32 znakov)
- `REDIS_PASSWORD` - heslo do Redis

---

## Reštart služieb

```bash
# Reštart všetkého
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

# Reštart len app
docker compose -f docker-compose.prod.yml restart app

# Force recreate (nový kontajner)
docker compose -f docker-compose.prod.yml up -d --force-recreate app
```

---

## Monitoring URLs

- Health: `https://scamnemesis.com/api/v1/health`
- Detailed Health: `https://scamnemesis.com/api/v1/health/detailed`
- Metrics: `https://scamnemesis.com/api/metrics` (ak je povolené)

---

*Posledná aktualizácia: December 2024*
