#!/bin/sh
# =============================================================================
# Scamnemesis Docker Entrypoint
# =============================================================================
# This script properly constructs DATABASE_URL with URL-encoded password
# to handle special characters like @, #, :, /, etc.
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

# Execute the main command
exec "$@"
