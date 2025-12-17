#!/bin/bash
#
# SCAMNEMESIS PRODUCTION FIX SCRIPT
# Opraví databázové pripojenie a reštartuje všetky služby
#
# Použitie: bash /root/Scamnemesis/scripts/fix-production.sh
#

set -e

echo "=========================================="
echo "SCAMNEMESIS PRODUCTION FIX"
echo "=========================================="

cd /root/Scamnemesis

# 1. Zisti aktuálne heslo postgres kontajnera
echo ""
echo "[1/8] Zisťujem heslo postgres kontajnera..."
CONTAINER_PASSWORD=$(docker exec scamnemesis-postgres printenv POSTGRES_PASSWORD 2>/dev/null || echo "")

if [ -z "$CONTAINER_PASSWORD" ]; then
    echo "ERROR: Postgres kontajner nebeží alebo nemá POSTGRES_PASSWORD"
    exit 1
fi

echo "Heslo v kontajneri: $CONTAINER_PASSWORD"

# 2. URL-enkóduj heslo (nahradí / za %2F)
ENCODED_PASSWORD=$(echo -n "$CONTAINER_PASSWORD" | sed 's/\//%2F/g; s/@/%40/g; s/#/%23/g; s/:/%3A/g; s/?/%3F/g; s/&/%26/g')
echo "URL-enkódované heslo: $ENCODED_PASSWORD"

# 3. Záloha .env
echo ""
echo "[2/8] Zálohujem .env súbor..."
cp /root/Scamnemesis/.env /root/Scamnemesis/.env.backup.$(date +%Y%m%d_%H%M%S)

# 4. Oprav .env súbor - ODSTRÁŇ DATABASE_URL (nech ho konštruuje entrypoint)
echo ""
echo "[3/8] Opravujem .env súbor..."

# Odstráň starý DATABASE_URL ak existuje
sed -i '/^DATABASE_URL=/d' /root/Scamnemesis/.env

# Nastav správne POSTGRES_PASSWORD
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

echo "Aktuálne nastavenia v .env:"
grep -E "^POSTGRES_" /root/Scamnemesis/.env

# 5. Synchronizuj heslo v databáze (pre istotu)
echo ""
echo "[4/8] Synchronizujem heslo v PostgreSQL..."
docker exec -i scamnemesis-postgres psql -U postgres -c "ALTER USER postgres PASSWORD '$CONTAINER_PASSWORD';" 2>/dev/null || {
    echo "Warning: Nepodarilo sa zmeniť heslo, skúšam cez unix socket..."
    docker exec -i scamnemesis-postgres psql -h /var/run/postgresql -U postgres -c "ALTER USER postgres PASSWORD '$CONTAINER_PASSWORD';"
}
echo "Heslo synchronizované."

# 6. Over že databáza má všetky potrebné stĺpce
echo ""
echo "[5/8] Kontrolujem databázovú schému..."
docker exec -i scamnemesis-postgres psql -U postgres -d scamnemesis <<'EOSQL'
-- Pridaj chýbajúce stĺpce do users tabuľky
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'BASIC';

-- Zobraz výsledok
SELECT 'Stĺpce v users tabuľke:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position;
EOSQL

# 7. Reštartuj iba app kontajner (nie celý stack)
echo ""
echo "[6/8] Reštartujem app kontajner..."
docker restart scamnemesis-app

# 8. Počkaj na zdravie kontajnera
echo ""
echo "[7/8] Čakám na štart aplikácie (max 60s)..."
for i in {1..12}; do
    sleep 5
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' scamnemesis-app 2>/dev/null || echo "unknown")
    echo "  Stav: $STATUS ($((i*5))s)"
    if [ "$STATUS" = "healthy" ]; then
        break
    fi
done

# 9. Testuj API
echo ""
echo "[8/8] Testujem API endpoint..."
RESPONSE=$(docker exec -i scamnemesis-app curl -s "http://localhost:3000/api/setup/admin?token=scamnemesis-setup-2024" 2>/dev/null || echo "CURL_FAILED")

echo ""
echo "=========================================="
echo "VÝSLEDOK:"
echo "=========================================="
echo "$RESPONSE" | head -c 500

if echo "$RESPONSE" | grep -q '"success"'; then
    echo ""
    echo ""
    echo "SUCCESS! Admin setup funguje!"
elif echo "$RESPONSE" | grep -q '"error"'; then
    echo ""
    echo ""
    echo "ERROR: Stále je problém. Pozri logy:"
    echo "  docker logs scamnemesis-app --tail 30"
else
    echo ""
    echo ""
    echo "UNKNOWN: Neočakávaná odpoveď. Skontroluj manuálne."
fi

echo ""
echo "=========================================="
echo "HOTOVO"
echo "=========================================="
