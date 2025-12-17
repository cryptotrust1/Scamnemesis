#!/bin/sh
# =============================================================================
# Scamnemesis Docker Entrypoint
# =============================================================================
# This script properly constructs DATABASE_URL with URL-encoded password
# to handle special characters like @, #, :, /, etc.
# =============================================================================

set -e

# Function to URL-encode a string
urlencode() {
    local string="$1"
    local encoded=""
    local i c o

    for i in $(seq 0 $((${#string} - 1))); do
        c="${string:$i:1}"
        case "$c" in
            [a-zA-Z0-9.~_-]) encoded="${encoded}$c" ;;
            *)
                # Get hex value of character
                o=$(printf '%%%02X' "'$c")
                encoded="${encoded}$o"
                ;;
        esac
    done

    echo "$encoded"
}

# If individual DB components are provided, construct DATABASE_URL with proper encoding
if [ -n "$POSTGRES_PASSWORD" ] && [ -n "$POSTGRES_USER" ] && [ -n "$POSTGRES_HOST" ]; then
    ENCODED_PASSWORD=$(urlencode "$POSTGRES_PASSWORD")

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
