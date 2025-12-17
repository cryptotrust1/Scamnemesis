#!/bin/bash
# =============================================================================
# Fix PostgreSQL Authentication for Scamnemesis
# =============================================================================
# This script fixes the database authentication issue by:
# 1. Reading the password from .env
# 2. Resetting postgres password via unix socket (bypasses password auth)
# 3. Restarting the app container
# =============================================================================

set -e

cd /root/scamnemesis

echo "=== Scamnemesis Database Authentication Fix ==="
echo ""

# Load .env file
if [ ! -f ".env" ]; then
    echo "ERROR: .env file not found!"
    exit 1
fi

# Source .env to get POSTGRES_PASSWORD
source .env

if [ -z "$POSTGRES_PASSWORD" ]; then
    echo "ERROR: POSTGRES_PASSWORD is empty in .env!"
    exit 1
fi

echo "[1/4] Current password from .env: ${POSTGRES_PASSWORD:0:4}...${POSTGRES_PASSWORD: -4}"
echo ""

# Stop the app first to avoid connection conflicts
echo "[2/4] Stopping app container..."
docker stop scamnemesis-app 2>/dev/null || true
echo "      App stopped."
echo ""

# Reset the postgres password via unix socket
echo "[3/4] Resetting postgres password via unix socket..."
docker exec -i scamnemesis-postgres psql -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-scamnemesis}" <<EOF
ALTER USER ${POSTGRES_USER:-postgres} PASSWORD '${POSTGRES_PASSWORD}';
\q
EOF

if [ $? -eq 0 ]; then
    echo "      Password reset successful!"
else
    echo "      ERROR: Failed to reset password!"
    exit 1
fi
echo ""

# Restart the app
echo "[4/4] Restarting app container..."
docker start scamnemesis-app
echo "      App container started."
echo ""

# Wait for app to become healthy
echo "Waiting for app to become healthy (this may take 60-90 seconds)..."
sleep 10

for i in {1..12}; do
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' scamnemesis-app 2>/dev/null || echo "unknown")
    if [ "$STATUS" = "healthy" ]; then
        echo ""
        echo "=== SUCCESS! App is healthy ==="
        echo ""
        echo "You can now access the admin setup at:"
        echo "  https://scamnemesis.com/api/setup/admin?token=scamnemesis-setup-2024"
        echo ""
        echo "Admin credentials:"
        echo "  Email: admin@scamnemesis.com"
        echo "  Password: Xk9#mP2\$vL5@nQ8!"
        echo ""
        exit 0
    fi
    echo "  Status: $STATUS (attempt $i/12)"
    sleep 10
done

echo ""
echo "App did not become healthy in time. Checking logs..."
docker logs scamnemesis-app --tail 30
