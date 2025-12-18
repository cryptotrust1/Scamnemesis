# Scamnemesis Debugging Guide

Tento dokument obsahuje všetky debugging techniky a nástroje pre rýchle diagnostikovanie problémov.

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
