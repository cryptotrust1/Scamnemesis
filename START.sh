#!/bin/bash
# =============================================================================
# SCAMNEMESIS - PRODUKČNÝ ŠTART pre scamnemesis.com
# =============================================================================
# Spustite: chmod +x START.sh && ./START.sh
# =============================================================================

set -e

echo "🚀 SCAMNEMESIS - Štartujem produkciu..."
echo ""

# Farby
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# -----------------------------------------------------------------------------
# 1. Kontrola či existuje .env
# -----------------------------------------------------------------------------
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Súbor .env neexistuje, vytváram pre scamnemesis.com...${NC}"

    # Generovanie secrets
    JWT_SECRET=$(openssl rand -base64 32)
    AUTH_SECRET=$(openssl rand -base64 32)

    cat > .env << EOF
# SCAMNEMESIS - PRODUKČNÁ KONFIGURÁCIA
NODE_ENV=production
DOMAIN=scamnemesis.com
ACME_EMAIL=admin@scamnemesis.com
AUTH_TRUST_HOST=true

# Databáza
POSTGRES_DB=scamnemesis
POSTGRES_USER=postgres
POSTGRES_PASSWORD=ScamNemesis$(openssl rand -hex 8)

# Redis
REDIS_PASSWORD=redis$(openssl rand -hex 8)

# MinIO
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minio$(openssl rand -hex 8)

# Auth
JWT_SECRET=$JWT_SECRET
AUTH_SECRET=$AUTH_SECRET

# OAuth (voliteľné)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Vypnuté služby
TYPESENSE_API_KEY=
ML_SERVICE_URL=
CLAMAV_HOST=
EOF
    echo -e "${GREEN}✅ .env vytvorený pre scamnemesis.com${NC}"
fi

# -----------------------------------------------------------------------------
# 2. Zastavenie starých kontajnerov
# -----------------------------------------------------------------------------
echo "🧹 Čistím staré kontajnery..."
docker compose down --remove-orphans 2>/dev/null || true
docker compose -f docker-compose.simple.yml down --remove-orphans 2>/dev/null || true
docker compose -f docker-compose.local.yml down --remove-orphans 2>/dev/null || true

# -----------------------------------------------------------------------------
# 3. Spustenie s Traefik (SSL)
# -----------------------------------------------------------------------------
echo ""
echo "🔨 Budujem a spúšťam (môže trvať 2-5 minút)..."
echo ""

docker compose -f docker-compose.simple.yml up -d --build

# -----------------------------------------------------------------------------
# 4. Čakanie na zdravé kontajnery
# -----------------------------------------------------------------------------
echo ""
echo "⏳ Čakám na štart služieb..."

# Čakaj max 5 minút
for i in {1..60}; do
    # Skontroluj či app beží
    if docker compose -f docker-compose.simple.yml ps | grep -q "scamnemesis-app.*healthy"; then
        echo ""
        echo -e "${GREEN}✅ HOTOVO! Aplikácia beží.${NC}"
        echo ""
        echo "=========================================="
        echo "🌐 Otvorte v prehliadači:"
        echo "   https://scamnemesis.com"
        echo "=========================================="
        echo ""
        exit 0
    fi

    # Kontrola či app beží (aj keď ešte nie healthy)
    if docker compose -f docker-compose.simple.yml ps | grep -q "scamnemesis-app.*Up"; then
        echo "⏳ App beží, čakám na health check... ($i/60)"
    else
        echo "⏳ Čakám na štart... ($i/60)"
    fi

    sleep 5
done

# -----------------------------------------------------------------------------
# 5. Ak sa nepodarilo
# -----------------------------------------------------------------------------
echo ""
echo -e "${YELLOW}⚠️  App ešte neprešla health checkom. Kontrolujem logy...${NC}"
echo ""
docker compose -f docker-compose.simple.yml logs --tail=50 app

echo ""
echo "Skúste:"
echo "  docker compose -f docker-compose.simple.yml logs -f app"
