#!/bin/sh
# =============================================================================
# Scamnemesis Docker Entrypoint
# =============================================================================
# This script:
# 1. Constructs DATABASE_URL with URL-encoded password
# 2. Waits for database to be ready
# 3. Runs Prisma migrations automatically
# 4. Starts the application
# =============================================================================

set -e

# If individual DB components are provided, construct DATABASE_URL with proper encoding
if [ -n "$POSTGRES_PASSWORD" ] && [ -n "$POSTGRES_USER" ] && [ -n "$POSTGRES_HOST" ]; then
    # Use Node.js to URL-encode the password (handles all special chars safely)
    ENCODED_PASSWORD=$(node -e "console.log(encodeURIComponent(process.argv[1]))" "$POSTGRES_PASSWORD")

    # Set defaults
    POSTGRES_PORT="${POSTGRES_PORT:-5432}"
    POSTGRES_DB="${POSTGRES_DB:-scamnemesis}"

    # Construct the DATABASE_URL with encoded password
    export DATABASE_URL="postgresql://${POSTGRES_USER}:${ENCODED_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"

    echo "[entrypoint] DATABASE_URL constructed with URL-encoded password"
    echo "[entrypoint] Host: ${POSTGRES_HOST}:${POSTGRES_PORT}, DB: ${POSTGRES_DB}"
fi

# Log startup info (without exposing secrets)
echo "[entrypoint] Starting Scamnemesis..."
echo "[entrypoint] NODE_ENV: ${NODE_ENV:-development}"
echo "[entrypoint] PORT: ${PORT:-3000}"

# =============================================================================
# Wait for database to be ready
# =============================================================================
wait_for_db() {
    echo "[entrypoint] Waiting for database to be ready..."

    max_attempts=30
    attempt=0

    while [ $attempt -lt $max_attempts ]; do
        # Try to connect to database using Node.js
        if node -e "
            const { Client } = require('pg');
            const client = new Client({ connectionString: process.env.DATABASE_URL });
            client.connect()
                .then(() => { client.end(); process.exit(0); })
                .catch(() => process.exit(1));
        " 2>/dev/null; then
            echo "[entrypoint] Database is ready!"
            return 0
        fi

        attempt=$((attempt + 1))
        echo "[entrypoint] Database not ready (attempt $attempt/$max_attempts)..."
        sleep 2
    done

    echo "[entrypoint] WARNING: Could not verify database connection after $max_attempts attempts"
    return 1
}

# =============================================================================
# Run Prisma migrations (idempotent - safe to run multiple times)
# =============================================================================
run_migrations() {
    echo "[entrypoint] Running database migrations..."

    # Check if prisma binary exists
    if [ -f "/app/node_modules/.bin/prisma" ]; then
        PRISMA_BIN="/app/node_modules/.bin/prisma"
    elif command -v npx >/dev/null 2>&1; then
        PRISMA_BIN="npx prisma"
    else
        echo "[entrypoint] WARNING: Prisma CLI not found, skipping migrations"
        return 0
    fi

    # Try prisma migrate deploy first (production-safe)
    if $PRISMA_BIN migrate deploy 2>/dev/null; then
        echo "[entrypoint] Prisma migrations applied successfully!"
        return 0
    fi

    # Fallback: Use db push if migrate deploy fails (for fresh setups)
    echo "[entrypoint] migrate deploy failed, trying db push..."
    if $PRISMA_BIN db push --skip-generate 2>&1; then
        echo "[entrypoint] Database schema synchronized with db push!"
        return 0
    fi

    echo "[entrypoint] WARNING: Migration commands failed, application may not work correctly"
    return 1
}

# =============================================================================
# Main execution
# =============================================================================

# Only run migrations if DATABASE_URL is set and we're in production
if [ -n "$DATABASE_URL" ]; then
    # Wait for database
    wait_for_db || true

    # Run migrations (don't fail startup if migrations fail)
    run_migrations || echo "[entrypoint] Continuing despite migration issues..."
fi

# Execute the main command (start the app)
exec "$@"
