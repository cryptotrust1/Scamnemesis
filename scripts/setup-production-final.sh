#!/bin/bash
# =============================================================================
# SCAMNEMESIS PRODUCTION SETUP - FINAL VERSION
# =============================================================================
# This is the ONE reliable script for production deployment.
#
# What it does:
# 1. Creates clean .env from environment or defaults
# 2. Starts PostgreSQL and Redis
# 3. Creates database with extensions
# 4. Builds and starts app (entrypoint auto-runs migrations)
# 5. Verifies deployment
#
# Usage:
#   cd /root/Scamnemesis
#   bash scripts/setup-production-final.sh
#
# This script is:
# - Idempotent (safe to run multiple times)
# - Error-resistant (continues on non-critical errors)
# - Professional (follows Docker/Prisma best practices)
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
echo "  SCAMNEMESIS PRODUCTION SETUP"
echo "  Final Version - Professional Deployment"
echo "=============================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run as root: sudo bash $0"
    exit 1
fi

# Find project directory
if [ -d "/root/Scamnemesis" ]; then
    PROJECT_DIR="/root/Scamnemesis"
elif [ -d "/home/user/Scamnemesis" ]; then
    PROJECT_DIR="/home/user/Scamnemesis"
else
    log_error "Cannot find Scamnemesis directory"
    exit 1
fi

cd "$PROJECT_DIR"
log_info "Working directory: $PROJECT_DIR"

# =============================================================================
# Configuration - Read from existing .env or use defaults
# =============================================================================
if [ -f ".env" ]; then
    source .env
fi

# Set defaults if not provided
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-scamnemesis}"
POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"

# Generate secure password if not set
if [ -z "$POSTGRES_PASSWORD" ]; then
    POSTGRES_PASSWORD="ScamNemesis$(date +%Y)Prod$(openssl rand -hex 4)"
    log_info "Generated new database password"
fi

DOMAIN="${DOMAIN:-www.scamnemesis.com}"
NEXTAUTH_URL="${NEXTAUTH_URL:-https://$DOMAIN}"

# Generate secrets if not set
JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-$(openssl rand -hex 32)}"

# =============================================================================
# Step 1: Create/Update .env file
# =============================================================================
log_info "[1/6] Creating .env file..."

cat > .env << ENVEOF
# =============================================================================
# Scamnemesis Production Environment
# Generated: $(date)
# =============================================================================

# Database
POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=${POSTGRES_DB}
POSTGRES_HOST=${POSTGRES_HOST}
POSTGRES_PORT=${POSTGRES_PORT}

# Application
NODE_ENV=production
DOMAIN=${DOMAIN}
NEXTAUTH_URL=${NEXTAUTH_URL}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
JWT_SECRET=${JWT_SECRET}

# Redis
REDIS_URL=redis://redis:6379

# MinIO (S3-compatible storage)
MINIO_ROOT_USER=scamnemesis
MINIO_ROOT_PASSWORD=ScamNemesisMinio2024
MINIO_ENDPOINT=minio:9000
MINIO_BUCKET=scamnemesis

# Monitoring
GRAFANA_ADMIN_PASSWORD=ScamNemesisGrafana2024

# Setup token
SETUP_TOKEN=scamnemesis-setup-2024
ENVEOF

log_success ".env file created"

# =============================================================================
# Step 2: Stop existing containers
# =============================================================================
log_info "[2/6] Stopping existing containers..."
docker compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
log_success "Containers stopped"

# =============================================================================
# Step 3: Start PostgreSQL and Redis
# =============================================================================
log_info "[3/6] Starting PostgreSQL and Redis..."

docker compose -f docker-compose.prod.yml up -d postgres redis

# Wait for PostgreSQL to be healthy
log_info "Waiting for PostgreSQL..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker exec scamnemesis-postgres pg_isready -U postgres >/dev/null 2>&1; then
        log_success "PostgreSQL is ready"
        break
    fi
    attempt=$((attempt + 1))
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    log_error "PostgreSQL failed to start"
    exit 1
fi

# =============================================================================
# Step 4: Initialize database
# =============================================================================
log_info "[4/6] Initializing database..."

docker exec -i scamnemesis-postgres psql -U postgres << 'EOSQL'
-- Create database if not exists
SELECT 'CREATE DATABASE scamnemesis'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'scamnemesis')\gexec

-- Connect to scamnemesis
\c scamnemesis

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Try pgvector
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "vector";
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pgvector not available';
END $$;

-- Verify
SELECT 'Database initialized successfully' as status;
EOSQL

log_success "Database initialized with extensions"

# =============================================================================
# Step 5: Build and start application
# =============================================================================
log_info "[5/6] Building and starting application..."

# Build with latest code
docker compose -f docker-compose.prod.yml build app

# Start all services (app entrypoint will run migrations automatically)
docker compose -f docker-compose.prod.yml up -d

log_info "Waiting for application to start (migrations running)..."
sleep 30

# Check if app is running
if docker ps | grep -q scamnemesis-app; then
    log_success "Application container started"
else
    log_error "Application failed to start"
    docker logs scamnemesis-app --tail 50
    exit 1
fi

# =============================================================================
# Step 6: Verify deployment
# =============================================================================
log_info "[6/6] Verifying deployment..."

# Check table count
TABLES=$(docker exec -i scamnemesis-postgres psql -U postgres -d scamnemesis -t -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';" 2>/dev/null | tr -d ' ')

if [ "$TABLES" -ge 20 ]; then
    log_success "Database has $TABLES tables (expected 27+)"
else
    log_warn "Database has only $TABLES tables. Checking migrations..."

    # Try running migrations manually
    docker exec -u root -e HOME=/tmp \
        -e DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}" \
        scamnemesis-app /app/node_modules/.bin/prisma db push --skip-generate 2>&1 | tail -10

    TABLES=$(docker exec -i scamnemesis-postgres psql -U postgres -d scamnemesis -t -c \
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';" 2>/dev/null | tr -d ' ')
    log_info "After manual migration: $TABLES tables"
fi

# Test API endpoint
sleep 10
RESPONSE=$(docker exec scamnemesis-app curl -s "http://localhost:3000/api/setup/admin?token=scamnemesis-setup-2024" 2>/dev/null || echo "FAILED")

echo ""
echo "=============================================="
echo "  DEPLOYMENT RESULT"
echo "=============================================="
echo ""

if echo "$RESPONSE" | grep -q '"success"'; then
    log_success "Admin setup successful!"
    echo ""
    echo "=============================================="
    echo "  SCAMNEMESIS IS READY!"
    echo "=============================================="
    echo ""
    echo "  Website:  https://${DOMAIN}"
    echo "  Admin:    https://${DOMAIN}/admin"
    echo ""
elif echo "$RESPONSE" | grep -q '"error"'; then
    log_warn "Admin setup returned error"
    echo "Response: $RESPONSE" | head -c 500
    echo ""
else
    log_warn "Could not verify admin setup"
fi

echo ""
echo "=============================================="
echo "  SERVICE STATUS"
echo "=============================================="
docker compose -f docker-compose.prod.yml ps --format "table {{.Name}}\t{{.Status}}"
echo ""
echo "=============================================="
echo "  TROUBLESHOOTING"
echo "=============================================="
echo "  View logs:    docker logs scamnemesis-app --tail 100"
echo "  Check DB:     docker exec -it scamnemesis-postgres psql -U postgres -d scamnemesis"
echo "  Restart:      docker compose -f docker-compose.prod.yml restart app"
echo ""
