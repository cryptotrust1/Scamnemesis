#!/bin/bash
# =============================================================================
# Scamnemesis - Manual Database Migration Script
# =============================================================================
# Run this script if migrations failed during deployment.
# It will apply the baseline migration SQL directly to PostgreSQL.
#
# Usage:
#   ./scripts/run-migrations.sh
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Scamnemesis Database Migration ===${NC}"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
MIGRATION_FILE="$PROJECT_DIR/prisma/migrations/0_baseline/migration.sql"

# Load environment variables from .env if present
if [ -f "$PROJECT_DIR/.env" ]; then
    echo "Loading environment variables from .env..."
    set -a
    source "$PROJECT_DIR/.env"
    set +a
fi

# Check required variables
if [ -z "$POSTGRES_PASSWORD" ]; then
    echo -e "${RED}ERROR: POSTGRES_PASSWORD is not set${NC}"
    echo "Please ensure .env file exists with POSTGRES_PASSWORD variable"
    exit 1
fi

POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-scamnemesis}"

echo "Database user: $POSTGRES_USER"
echo "Database name: $POSTGRES_DB"
echo ""

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}ERROR: Migration file not found: $MIGRATION_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}Running migration via docker exec...${NC}"

# Run migration via docker exec
docker compose -f "$PROJECT_DIR/docker-compose.prod.yml" exec -T postgres \
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f - < "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}=== Migration completed successfully! ===${NC}"
    echo ""
    echo "Now restart the app container to pick up the changes:"
    echo "  docker compose -f docker-compose.prod.yml restart app"
else
    echo -e "${RED}=== Migration failed! ===${NC}"
    echo "Check the error messages above and fix any issues."
    exit 1
fi
