#!/bin/bash
# =============================================================================
# FIX-SSL.sh - Diagnostika a oprava SSL certifikátov (Let's Encrypt)
# =============================================================================
# Spustite na serveri: chmod +x FIX-SSL.sh && ./FIX-SSL.sh
# =============================================================================

set -e

# Farby
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}🔐 SCAMNEMESIS - SSL Diagnostika a Oprava${NC}"
echo "============================================="
echo ""

# -----------------------------------------------------------------------------
# 1. Kontrola Traefik kontajnera
# -----------------------------------------------------------------------------
echo -e "${YELLOW}[1/6] Kontrolujem Traefik kontajner...${NC}"

if docker ps | grep -q "scamnemesis-traefik"; then
    echo -e "${GREEN}✅ Traefik beží${NC}"
else
    echo -e "${RED}❌ Traefik nebeží! Spúšťam...${NC}"
    docker compose -f docker-compose.prod.yml up -d traefik
    sleep 5
fi

# -----------------------------------------------------------------------------
# 2. Kontrola .env súboru
# -----------------------------------------------------------------------------
echo ""
echo -e "${YELLOW}[2/6] Kontrolujem .env konfiguráciu...${NC}"

if [ -f .env ]; then
    # Kontrola DOMAIN
    if grep -q "^DOMAIN=scamnemesis.com" .env; then
        echo -e "${GREEN}✅ DOMAIN=scamnemesis.com${NC}"
    else
        echo -e "${RED}❌ DOMAIN nie je nastavená správne!${NC}"
        echo "   Pridávam DOMAIN=scamnemesis.com do .env..."
        grep -v "^DOMAIN=" .env > .env.tmp && mv .env.tmp .env
        echo "DOMAIN=scamnemesis.com" >> .env
    fi

    # Kontrola ACME_EMAIL
    if grep -q "^ACME_EMAIL=" .env && ! grep -q "^ACME_EMAIL=$" .env; then
        ACME_EMAIL=$(grep "^ACME_EMAIL=" .env | cut -d= -f2)
        echo -e "${GREEN}✅ ACME_EMAIL=${ACME_EMAIL}${NC}"
    else
        echo -e "${RED}❌ ACME_EMAIL nie je nastavený!${NC}"
        echo "   Pridávam ACME_EMAIL=admin@scamnemesis.com do .env..."
        grep -v "^ACME_EMAIL=" .env > .env.tmp && mv .env.tmp .env
        echo "ACME_EMAIL=admin@scamnemesis.com" >> .env
    fi
else
    echo -e "${RED}❌ .env súbor neexistuje!${NC}"
    echo "   Spustite najprv: cp .env.example .env"
    exit 1
fi

# -----------------------------------------------------------------------------
# 3. Kontrola acme.json permissions
# -----------------------------------------------------------------------------
echo ""
echo -e "${YELLOW}[3/6] Kontrolujem acme.json permissions...${NC}"

# Nájdi volume cestu
ACME_VOLUME=$(docker volume inspect scamnemesis_traefik_certs_prod 2>/dev/null | grep "Mountpoint" | cut -d'"' -f4) || true

if [ -z "$ACME_VOLUME" ]; then
    # Skús alternatívne meno
    ACME_VOLUME=$(docker volume inspect traefik_certs 2>/dev/null | grep "Mountpoint" | cut -d'"' -f4) || true
fi

if [ -n "$ACME_VOLUME" ] && [ -d "$ACME_VOLUME" ]; then
    ACME_FILE="$ACME_VOLUME/acme.json"

    if [ -f "$ACME_FILE" ]; then
        PERMS=$(stat -c "%a" "$ACME_FILE" 2>/dev/null || stat -f "%OLp" "$ACME_FILE" 2>/dev/null)

        if [ "$PERMS" = "600" ]; then
            echo -e "${GREEN}✅ acme.json má správne permissions (600)${NC}"
        else
            echo -e "${YELLOW}⚠️  acme.json má permissions $PERMS, opravujem na 600...${NC}"
            chmod 600 "$ACME_FILE"
            echo -e "${GREEN}✅ Opravené${NC}"
        fi

        # Kontrola či je prázdny
        SIZE=$(stat -c "%s" "$ACME_FILE" 2>/dev/null || stat -f "%z" "$ACME_FILE" 2>/dev/null)
        if [ "$SIZE" -lt 100 ]; then
            echo -e "${YELLOW}⚠️  acme.json je takmer prázdny ($SIZE bytes)${NC}"
            echo "   Let's Encrypt ešte nezískal certifikát"
        else
            echo -e "${GREEN}✅ acme.json obsahuje dáta ($SIZE bytes)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  acme.json neexistuje, vytváram...${NC}"
        touch "$ACME_FILE"
        chmod 600 "$ACME_FILE"
        echo "{}" > "$ACME_FILE"
        echo -e "${GREEN}✅ Vytvorený${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Nemôžem nájsť traefik volume, kontrolujem cez docker...${NC}"

    # Oprav permissions cez docker exec
    docker exec scamnemesis-traefik sh -c "touch /letsencrypt/acme.json && chmod 600 /letsencrypt/acme.json" 2>/dev/null || true
    echo -e "${GREEN}✅ Permissions nastavené cez docker${NC}"
fi

# -----------------------------------------------------------------------------
# 4. Kontrola DNS
# -----------------------------------------------------------------------------
echo ""
echo -e "${YELLOW}[4/6] Kontrolujem DNS...${NC}"

SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "unknown")
DOMAIN_IP=$(dig +short scamnemesis.com 2>/dev/null | tail -1 || nslookup scamnemesis.com 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}')

echo "   Server IP: $SERVER_IP"
echo "   Domain IP: $DOMAIN_IP"

if [ "$SERVER_IP" = "$DOMAIN_IP" ]; then
    echo -e "${GREEN}✅ DNS je správne nakonfigurované${NC}"
else
    echo -e "${YELLOW}⚠️  DNS nesúhlasí! Skontrolujte A záznam pre scamnemesis.com${NC}"
fi

# -----------------------------------------------------------------------------
# 5. Kontrola portov
# -----------------------------------------------------------------------------
echo ""
echo -e "${YELLOW}[5/6] Kontrolujem porty 80 a 443...${NC}"

if netstat -tlnp 2>/dev/null | grep -q ":80.*LISTEN" || ss -tlnp 2>/dev/null | grep -q ":80"; then
    echo -e "${GREEN}✅ Port 80 je otvorený${NC}"
else
    echo -e "${RED}❌ Port 80 nie je otvorený!${NC}"
fi

if netstat -tlnp 2>/dev/null | grep -q ":443.*LISTEN" || ss -tlnp 2>/dev/null | grep -q ":443"; then
    echo -e "${GREEN}✅ Port 443 je otvorený${NC}"
else
    echo -e "${RED}❌ Port 443 nie je otvorený!${NC}"
fi

# -----------------------------------------------------------------------------
# 6. Traefik logy
# -----------------------------------------------------------------------------
echo ""
echo -e "${YELLOW}[6/6] Traefik logy (posledných 30 riadkov)...${NC}"
echo "---------------------------------------------"
docker logs scamnemesis-traefik --tail=30 2>&1 | grep -i -E "(acme|letsencrypt|certificate|error|unable)" || echo "Žiadne relevantné logy"
echo "---------------------------------------------"

# -----------------------------------------------------------------------------
# 7. Reštart ak treba
# -----------------------------------------------------------------------------
echo ""
echo -e "${YELLOW}Chcete reštartovať Traefik pre aplikovanie zmien? (y/n)${NC}"
read -r RESTART

if [ "$RESTART" = "y" ] || [ "$RESTART" = "Y" ]; then
    echo "🔄 Reštartujem Traefik..."
    docker compose -f docker-compose.prod.yml restart traefik

    echo ""
    echo "⏳ Čakám 30 sekúnd na získanie certifikátu..."
    sleep 30

    echo ""
    echo "🔍 Testujem HTTPS..."
    if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 https://scamnemesis.com 2>/dev/null | grep -q "200\|301\|302"; then
        echo -e "${GREEN}✅ HTTPS funguje!${NC}"
    else
        echo -e "${YELLOW}⚠️  HTTPS ešte nefunguje, skúste za pár minút${NC}"
        echo ""
        echo "Traefik logy:"
        docker logs scamnemesis-traefik --tail=20 2>&1
    fi
fi

# -----------------------------------------------------------------------------
# 8. Manuálny reset (ak nič nepomáha)
# -----------------------------------------------------------------------------
echo ""
echo "============================================="
echo -e "${BLUE}📋 Ak SSL stále nefunguje, skúste manuálny reset:${NC}"
echo ""
echo "# 1. Zastavte všetko:"
echo "   docker compose -f docker-compose.prod.yml down"
echo ""
echo "# 2. Vymažte starý certifikát:"
echo "   docker volume rm scamnemesis_traefik_certs_prod"
echo ""
echo "# 3. Spustite znova:"
echo "   docker compose -f docker-compose.prod.yml up -d"
echo ""
echo "# 4. Sledujte logy:"
echo "   docker logs -f scamnemesis-traefik"
echo "============================================="
echo ""
