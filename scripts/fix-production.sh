#!/bin/bash
#
# SCAMNEMESIS PRODUCTION FIX SCRIPT v2
# Opraví databázové pripojenie a ZNOVU VYTVORÍ kontajnery
#
# KRITICKÉ: docker restart NERELOADNE environment premenné!
# Musíme použiť docker compose up --force-recreate
#
# Použitie: bash /root/Scamnemesis/scripts/fix-production.sh
#

set -e

echo "=========================================="
echo "SCAMNEMESIS PRODUCTION FIX v2"
echo "=========================================="

cd /root/Scamnemesis

# 1. Zisti aktuálne heslo postgres kontajnera
echo ""
echo "[1/9] Zisťujem heslo postgres kontajnera..."
CONTAINER_PASSWORD=$(docker exec scamnemesis-postgres printenv POSTGRES_PASSWORD 2>/dev/null || echo "")

if [ -z "$CONTAINER_PASSWORD" ]; then
    echo "ERROR: Postgres kontajner nebeží alebo nemá POSTGRES_PASSWORD"
    echo "Skúšam spustiť celý stack..."
    docker compose -f docker-compose.prod.yml up -d
    sleep 30
    CONTAINER_PASSWORD=$(docker exec scamnemesis-postgres printenv POSTGRES_PASSWORD 2>/dev/null || echo "")
    if [ -z "$CONTAINER_PASSWORD" ]; then
        echo "FATAL: Nemôžem zistiť heslo. Skontroluj manuálne."
        exit 1
    fi
fi

echo "Heslo v postgres kontajneri: $CONTAINER_PASSWORD"

# 2. Zisti čo má app kontajner
echo ""
echo "[2/9] Zisťujem heslo v app kontajneri..."
APP_PASSWORD=$(docker exec scamnemesis-app printenv POSTGRES_PASSWORD 2>/dev/null || echo "NEZISTENE")
echo "Heslo v app kontajneri: $APP_PASSWORD"

if [ "$CONTAINER_PASSWORD" != "$APP_PASSWORD" ]; then
    echo ""
    echo "!!! PROBLÉM NÁJDENÝ !!!"
    echo "Postgres kontajner: $CONTAINER_PASSWORD"
    echo "App kontajner:      $APP_PASSWORD"
    echo "Heslá sa NEZHODUJÚ - app sa nemôže pripojiť!"
fi

# 3. Záloha .env
echo ""
echo "[3/9] Zálohujem .env súbor..."
cp /root/Scamnemesis/.env /root/Scamnemesis/.env.backup.$(date +%Y%m%d_%H%M%S)

# 4. Oprav .env súbor
echo ""
echo "[4/9] Opravujem .env súbor..."

# Odstráň starý DATABASE_URL ak existuje (entrypoint si ho vytvorí sám)
sed -i '/^DATABASE_URL=/d' /root/Scamnemesis/.env

# Nastav správne POSTGRES_PASSWORD (to čo má postgres kontajner)
sed -i '/^POSTGRES_PASSWORD=/d' /root/Scamnemesis/.env
echo "POSTGRES_PASSWORD=$CONTAINER_PASSWORD" >> /root/Scamnemesis/.env

# Nastav POSTGRES_USER ak chýba
if ! grep -q "^POSTGRES_USER=" /root/Scamnemesis/.env; then
    echo "POSTGRES_USER=postgres" >> /root/Scamnemesis/.env
fi

# Nastav POSTGRES_DB ak chýba
if ! grep -q "^POSTGRES_DB=" /root/Scamnemesis/.env; then
    echo "POSTGRES_DB=scamnemesis" >> /root/Scamnemesis/.env
fi

echo "Aktuálne POSTGRES nastavenia v .env:"
grep -E "^POSTGRES_" /root/Scamnemesis/.env

# 5. Synchronizuj heslo v databáze (pre istotu)
echo ""
echo "[5/9] Synchronizujem heslo v PostgreSQL databáze..."
docker exec -i scamnemesis-postgres psql -U postgres -c "ALTER USER postgres PASSWORD '$CONTAINER_PASSWORD';" 2>/dev/null && echo "OK" || {
    echo "Warning: Štandardná cesta zlyhala, skúšam cez unix socket..."
    docker exec -i scamnemesis-postgres psql -h /var/run/postgresql -U postgres -c "ALTER USER postgres PASSWORD '$CONTAINER_PASSWORD';" 2>/dev/null && echo "OK" || echo "Warning: Nepodarilo sa"
}

# 6. Over že databáza má všetky potrebné stĺpce
echo ""
echo "[6/9] Kontrolujem a opravujem databázovú schému..."
docker exec -i scamnemesis-postgres psql -U postgres -d scamnemesis <<'EOSQL'
-- Pridaj chýbajúce stĺpce do users tabuľky
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'BASIC';

SELECT 'Schema OK - všetky stĺpce existujú' as status;
EOSQL

# 7. ZNOVU VYTVOR app kontajner (nie len restart!)
echo ""
echo "[7/9] ZNOVU VYTVÁRAM app kontajner (force-recreate)..."
echo "Toto je KRITICKÉ - docker restart NERELOADNE environment!"
docker compose -f docker-compose.prod.yml up -d --force-recreate app

# 8. Počkaj na zdravie kontajnera
echo ""
echo "[8/9] Čakám na štart aplikácie (max 90s)..."
for i in {1..18}; do
    sleep 5
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' scamnemesis-app 2>/dev/null || echo "starting")
    echo "  Stav: $STATUS ($((i*5))s)"
    if [ "$STATUS" = "healthy" ]; then
        echo "  App je zdravá!"
        break
    fi
done

# Over že app má správne heslo
echo ""
echo "Overujem environment v novom app kontajneri..."
NEW_APP_PASSWORD=$(docker exec scamnemesis-app printenv POSTGRES_PASSWORD 2>/dev/null || echo "NEZISTENE")
echo "Nové heslo v app kontajneri: $NEW_APP_PASSWORD"

if [ "$CONTAINER_PASSWORD" = "$NEW_APP_PASSWORD" ]; then
    echo "✓ Heslá sa ZHODUJÚ!"
else
    echo "✗ CHYBA: Heslá sa stále nezhodujú!"
    echo "  Postgres: $CONTAINER_PASSWORD"
    echo "  App:      $NEW_APP_PASSWORD"
fi

# 9. Testuj API
echo ""
echo "[9/9] Testujem API endpoint..."
sleep 5
RESPONSE=$(docker exec -i scamnemesis-app curl -s "http://localhost:3000/api/setup/admin?token=scamnemesis-setup-2024" 2>/dev/null || echo "CURL_FAILED")

echo ""
echo "=========================================="
echo "VÝSLEDOK:"
echo "=========================================="
echo "$RESPONSE" | head -c 1000

if echo "$RESPONSE" | grep -q '"success"'; then
    echo ""
    echo ""
    echo "✓✓✓ SUCCESS! Admin setup funguje! ✓✓✓"
elif echo "$RESPONSE" | grep -q 'Authentication failed'; then
    echo ""
    echo ""
    echo "✗ CHYBA: Stále je problém s autentifikáciou."
    echo ""
    echo "Debug info:"
    echo "  Postgres password: $CONTAINER_PASSWORD"
    echo "  App password:      $NEW_APP_PASSWORD"
    echo ""
    echo "Skús úplný reset:"
    echo "  docker compose -f docker-compose.prod.yml down"
    echo "  docker compose -f docker-compose.prod.yml up -d"
elif echo "$RESPONSE" | grep -q '"error"'; then
    echo ""
    echo ""
    echo "✗ Iná chyba. Pozri logy:"
    echo "  docker logs scamnemesis-app --tail 50"
else
    echo ""
    echo ""
    echo "? Neočakávaná odpoveď. Skontroluj manuálne."
fi

echo ""
echo "=========================================="
echo "HOTOVO"
echo "=========================================="
echo ""
echo "Ak stále nefunguje, skús ÚPLNÝ RESET:"
echo "  cd /root/Scamnemesis"
echo "  docker compose -f docker-compose.prod.yml down"
echo "  docker compose -f docker-compose.prod.yml up -d"
echo ""
