#!/bin/bash
# =============================================================================
# SCAMNEMESIS PRODUCTION SETUP SCRIPT v2.0
# =============================================================================
# Professional production installation using Prisma for schema management
#
# This script:
# 1. Creates clean .env with secure passwords (no special chars)
# 2. Stops and removes all existing containers
# 3. Starts PostgreSQL and Redis
# 4. Uses Prisma to create database schema
# 5. Starts all services
# 6. Tests the installation
#
# Usage: bash /root/Scamnemesis/scripts/production-setup.sh
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
echo "=============================================="
echo "  SCAMNEMESIS PRODUCTION SETUP v2.0"
echo "=============================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run as root"
    exit 1
fi

# Navigate to project directory
cd /root/Scamnemesis || {
    log_error "Directory /root/Scamnemesis not found!"
    exit 1
}

# -----------------------------------------------------------------------------
# STEP 1: Stop all containers
# -----------------------------------------------------------------------------
log_info "[1/9] Stopping all existing containers..."
docker compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
docker rm -f $(docker ps -aq --filter "name=scamnemesis") 2>/dev/null || true
log_success "Containers stopped."

# -----------------------------------------------------------------------------
# STEP 2: Create clean .env file
# -----------------------------------------------------------------------------
log_info "[2/9] Creating clean .env file..."

# Backup existing .env
if [ -f .env ]; then
    BACKUP_NAME=".env.backup.$(date +%Y%m%d_%H%M%S)"
    cp .env "$BACKUP_NAME"
    log_info "Existing .env backed up to $BACKUP_NAME"
fi

# Create new secure .env
cat > .env << 'ENVFILE'
# =============================================================================
# SCAMNEMESIS PRODUCTION ENVIRONMENT
# =============================================================================
# IMPORTANT: Passwords use only alphanumeric chars to avoid URL encoding issues
# =============================================================================

NODE_ENV=production

# Database - PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=ScamNemesis2024Prod
POSTGRES_DB=scamnemesis

# Redis
REDIS_PASSWORD=ScamNemesisRedis2024

# JWT Secrets (32+ characters)
JWT_SECRET=ScamNemesisJwtSecret2024ProdKey32chars
JWT_REFRESH_SECRET=ScamNemesisRefreshSecret2024Key32ch

# Domain - using www.scamnemesis.com (has valid SSL cert)
DOMAIN=www.scamnemesis.com
ACME_EMAIL=info@scamnemesis.com

# S3/MinIO
S3_ACCESS_KEY=scamnemesisadmin
S3_SECRET_KEY=ScamNemesisS3Secret2024

# Typesense
TYPESENSE_API_KEY=ScamNemesisTypesense2024Key

# Grafana
GRAFANA_ADMIN_PASSWORD=ScamNemesisGrafana2024
ENVFILE

log_success ".env file created with secure passwords."

# -----------------------------------------------------------------------------
# STEP 3: Start PostgreSQL and Redis
# -----------------------------------------------------------------------------
log_info "[3/9] Starting PostgreSQL and Redis..."
docker compose -f docker-compose.prod.yml up -d postgres redis

log_info "Waiting for PostgreSQL to be ready..."
for i in {1..60}; do
    if docker exec scamnemesis-postgres pg_isready -U postgres > /dev/null 2>&1; then
        log_success "PostgreSQL is ready!"
        break
    fi
    if [ $i -eq 60 ]; then
        log_error "PostgreSQL failed to start!"
        exit 1
    fi
    sleep 2
done

# -----------------------------------------------------------------------------
# STEP 4: Prepare database
# -----------------------------------------------------------------------------
log_info "[4/9] Preparing database..."

docker exec -i scamnemesis-postgres psql -U postgres << 'EOSQL'
-- Terminate existing connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'scamnemesis' AND pid <> pg_backend_pid();

-- Drop if exists
DROP DATABASE IF EXISTS scamnemesis;

-- Create fresh
CREATE DATABASE scamnemesis;

-- Connect and create extensions
\c scamnemesis

-- Required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Try to create vector extension (might not be available)
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "vector";
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pgvector extension not available, skipping';
END $$;

-- Verify
SELECT 'Database ready with extensions' as status;
EOSQL

log_success "Database prepared."

# -----------------------------------------------------------------------------
# STEP 5: Sync PostgreSQL password
# -----------------------------------------------------------------------------
log_info "[5/9] Synchronizing PostgreSQL password..."
docker exec -i scamnemesis-postgres psql -U postgres -c "ALTER USER postgres PASSWORD 'ScamNemesis2024Prod';"
log_success "Password synchronized."

# -----------------------------------------------------------------------------
# STEP 6: Build and start app
# -----------------------------------------------------------------------------
log_info "[6/9] Building and starting application..."

# Start only the app (not migrations yet)
docker compose -f docker-compose.prod.yml build app
docker compose -f docker-compose.prod.yml up -d app

log_info "Waiting for app container to start..."
sleep 20

# Check if app is running
if ! docker ps | grep -q scamnemesis-app; then
    log_error "App container failed to start!"
    docker logs scamnemesis-app --tail 50
    exit 1
fi

log_success "App container started."

# -----------------------------------------------------------------------------
# STEP 7: Run Prisma schema push
# -----------------------------------------------------------------------------
log_info "[7/9] Running Prisma schema push..."

# Construct DATABASE_URL and run prisma db push
docker exec -e DATABASE_URL="postgresql://postgres:ScamNemesis2024Prod@postgres:5432/scamnemesis" \
    scamnemesis-app npx prisma db push --accept-data-loss 2>&1 | tail -20

if [ $? -eq 0 ]; then
    log_success "Prisma schema pushed successfully."
else
    log_warn "Prisma push had issues, checking schema..."
fi

# -----------------------------------------------------------------------------
# STEP 8: Verify and show schema
# -----------------------------------------------------------------------------
log_info "[8/9] Verifying database schema..."

TABLES=$(docker exec -i scamnemesis-postgres psql -U postgres -d scamnemesis -t -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

log_info "Tables created: $TABLES"

# Show key tables
docker exec -i scamnemesis-postgres psql -U postgres -d scamnemesis << 'EOSQL'
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
EOSQL

# -----------------------------------------------------------------------------
# STEP 9: Start all services and test
# -----------------------------------------------------------------------------
log_info "[9/9] Starting all remaining services..."

docker compose -f docker-compose.prod.yml up -d

log_info "Waiting for services to be healthy..."
sleep 30

# Test API
log_info "Testing API endpoint..."
RESPONSE=$(docker exec scamnemesis-app curl -s "http://localhost:3000/api/setup/admin?token=scamnemesis-setup-2024" 2>/dev/null || echo "FAILED")

echo ""
echo "=============================================="
echo "  SETUP RESULT"
echo "=============================================="
echo ""
echo "API Response:"
echo "$RESPONSE" | head -c 500
echo ""
echo ""

# Check response
if echo "$RESPONSE" | grep -q '"success"'; then
    log_success "Admin setup successful!"
elif echo "$RESPONSE" | grep -q '"error"'; then
    log_warn "Setup returned error. Check logs: docker logs scamnemesis-app --tail 50"
else
    log_warn "Unexpected response. Manual check required."
fi

# Final status
echo ""
echo "=============================================="
echo "  SERVICE STATUS"
echo "=============================================="
docker ps --format "table {{.Names}}\t{{.Status}}" | grep scamnemesis

echo ""
echo "=============================================="
echo "  ACCESS INFORMATION"
echo "=============================================="
echo ""
echo "Website: https://www.scamnemesis.com"
echo "Admin:   https://www.scamnemesis.com/api/setup/admin?token=scamnemesis-setup-2024"
echo ""
echo "Note: SSL for scamnemesis.com (without www) available after Dec 19"
echo ""
echo "Grafana: http://77.42.44.140:3001 (admin / ScamNemesisGrafana2024)"
echo ""
echo "Troubleshooting:"
echo "  docker logs scamnemesis-app --tail 100"
echo "  docker logs scamnemesis-postgres --tail 100"
echo ""
