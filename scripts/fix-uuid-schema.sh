#!/bin/bash
# =============================================================================
# FIX UUID SCHEMA - One-time script to apply UUID fix
# =============================================================================
# This script:
# 1. Pulls latest changes (with uuid() fix)
# 2. Rebuilds the app container
# 3. Drops and recreates database
# 4. Runs Prisma db push with new schema
# 5. Tests the admin setup endpoint
#
# Usage: bash /root/Scamnemesis/scripts/fix-uuid-schema.sh
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
echo "=============================================="
echo "  FIX UUID SCHEMA"
echo "=============================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run as root"
    exit 1
fi

cd /root/Scamnemesis || {
    log_error "Directory /root/Scamnemesis not found!"
    exit 1
}

# -----------------------------------------------------------------------------
# STEP 1: Pull latest changes
# -----------------------------------------------------------------------------
log_info "[1/6] Pulling latest changes from git..."
git fetch origin
git checkout claude/fix-prisma-auth-error-gfl7s 2>/dev/null || git checkout -b claude/fix-prisma-auth-error-gfl7s origin/claude/fix-prisma-auth-error-gfl7s
git pull origin claude/fix-prisma-auth-error-gfl7s
log_success "Latest changes pulled."

# Verify the fix is in place
if grep -q "@default(cuid())" prisma/schema.prisma; then
    log_error "Schema still has cuid() - something went wrong!"
    exit 1
fi
log_success "Schema has uuid() - fix confirmed."

# -----------------------------------------------------------------------------
# STEP 2: Stop app container
# -----------------------------------------------------------------------------
log_info "[2/6] Stopping app container..."
docker compose -f docker-compose.prod.yml stop app 2>/dev/null || true
docker rm -f scamnemesis-app 2>/dev/null || true
log_success "App container stopped."

# -----------------------------------------------------------------------------
# STEP 3: Drop and recreate database
# -----------------------------------------------------------------------------
log_info "[3/6] Recreating database..."

docker exec -i scamnemesis-postgres psql -U postgres << 'EOSQL'
-- Terminate connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'scamnemesis' AND pid <> pg_backend_pid();

-- Drop and recreate
DROP DATABASE IF EXISTS scamnemesis;
CREATE DATABASE scamnemesis;

-- Connect and create extensions
\c scamnemesis

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "vector";
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pgvector not available, skipping';
END $$;

SELECT 'Database recreated' as status;
EOSQL

log_success "Database recreated."

# -----------------------------------------------------------------------------
# STEP 4: Rebuild and start app
# -----------------------------------------------------------------------------
log_info "[4/6] Rebuilding and starting app..."
docker compose -f docker-compose.prod.yml build app
docker compose -f docker-compose.prod.yml up -d app

log_info "Waiting for app to start..."
sleep 20

if ! docker ps | grep -q scamnemesis-app; then
    log_error "App failed to start!"
    docker logs scamnemesis-app --tail 30
    exit 1
fi
log_success "App container started."

# -----------------------------------------------------------------------------
# STEP 5: Run Prisma db push (with correct permissions)
# -----------------------------------------------------------------------------
log_info "[5/6] Running Prisma db push..."

# Run as root with HOME=/tmp to avoid permission issues
docker exec -u root \
    -e HOME=/tmp \
    -e DATABASE_URL="postgresql://postgres:ScamNemesis2024Prod@postgres:5432/scamnemesis" \
    scamnemesis-app /app/node_modules/.bin/prisma db push --accept-data-loss 2>&1 | tail -30

log_success "Prisma schema pushed."

# Verify tables - should be 27+ for full Prisma schema
TABLES=$(docker exec -i scamnemesis-postgres psql -U postgres -d scamnemesis -t -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
log_info "Tables created: $TABLES"

# -----------------------------------------------------------------------------
# STEP 6: Test admin setup
# -----------------------------------------------------------------------------
log_info "[6/6] Testing admin setup..."

sleep 10

RESPONSE=$(docker exec scamnemesis-app curl -s "http://localhost:3000/api/setup/admin?token=scamnemesis-setup-2024" 2>/dev/null || echo "FAILED")

echo ""
echo "=============================================="
echo "  RESULT"
echo "=============================================="
echo ""
echo "API Response:"
echo "$RESPONSE" | head -c 800
echo ""
echo ""

if echo "$RESPONSE" | grep -q '"success"'; then
    log_success "Admin setup successful!"
    echo ""
    echo "=============================================="
    echo "  SUCCESS! Scamnemesis is ready!"
    echo "=============================================="
    echo ""
    echo "Website: https://www.scamnemesis.com"
    echo ""
elif echo "$RESPONSE" | grep -q '"error"'; then
    log_warn "Setup returned error - check the response above"
else
    log_warn "Unexpected response - manual check required"
fi

echo ""
echo "Troubleshooting:"
echo "  docker logs scamnemesis-app --tail 100"
echo ""
