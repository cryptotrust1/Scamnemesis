#!/bin/sh
# =============================================================================
# Scamnemesis Docker Entrypoint - Production Ready
# =============================================================================
# This script:
# 1. Constructs DATABASE_URL with URL-encoded password
# 2. Waits for database to be ready (using curl to postgres)
# 3. Runs Prisma migrations automatically
# 4. Starts the application
# =============================================================================

set -e

# Set HOME for Prisma (required for cache directory)
export HOME=/tmp

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
# Wait for database to be ready (simple TCP check)
# =============================================================================
wait_for_db() {
    echo "[entrypoint] Waiting for database to be ready..."

    max_attempts=30
    attempt=0

    while [ $attempt -lt $max_attempts ]; do
        # Simple check: try to connect to postgres port using Node.js net module
        if node -e "
            const net = require('net');
            const socket = new net.Socket();
            socket.setTimeout(2000);
            socket.on('connect', () => { socket.destroy(); process.exit(0); });
            socket.on('error', () => process.exit(1));
            socket.on('timeout', () => { socket.destroy(); process.exit(1); });
            socket.connect(${POSTGRES_PORT:-5432}, '${POSTGRES_HOST:-postgres}');
        " 2>/dev/null; then
            echo "[entrypoint] Database port is accessible!"
            # Give PostgreSQL a moment to fully initialize
            sleep 2
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

    # Find Prisma CLI
    PRISMA_BIN=""
    if [ -f "/app/node_modules/.bin/prisma" ]; then
        PRISMA_BIN="/app/node_modules/.bin/prisma"
    elif [ -f "/app/node_modules/prisma/build/index.js" ]; then
        PRISMA_BIN="node /app/node_modules/prisma/build/index.js"
    fi

    if [ -z "$PRISMA_BIN" ]; then
        echo "[entrypoint] WARNING: Prisma CLI not found, using db push via npx..."
        # Fallback: Use prisma db push which syncs schema without migration history
        if npx --yes prisma db push --skip-generate 2>&1; then
            echo "[entrypoint] Schema synchronized with db push!"
            return 0
        fi
        echo "[entrypoint] WARNING: Could not run migrations"
        return 1
    fi

    # Try prisma migrate deploy first (production-safe, uses migration history)
    echo "[entrypoint] Trying prisma migrate deploy..."
    if $PRISMA_BIN migrate deploy 2>&1; then
        echo "[entrypoint] Prisma migrations applied successfully!"
        return 0
    fi

    # Fallback: Use db push if migrate deploy fails (for fresh setups or missing migration history)
    echo "[entrypoint] migrate deploy failed, trying db push..."
    if $PRISMA_BIN db push --skip-generate 2>&1; then
        echo "[entrypoint] Database schema synchronized with db push!"
        return 0
    fi

    echo "[entrypoint] WARNING: Migration commands failed"
    return 1
}

# =============================================================================
# Main execution
# =============================================================================

# Only run migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
    # Wait for database
    if wait_for_db; then
        # Run migrations (don't fail startup if migrations fail - app might recover)
        run_migrations || echo "[entrypoint] Continuing despite migration issues..."
    else
        echo "[entrypoint] Skipping migrations - database not accessible"
    fi
fi

echo "[entrypoint] Starting application..."

# Execute the main command (start the app)
exec "$@"
