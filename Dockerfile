# =============================================================================
# Scamnemesis Next.js Application Dockerfile
# =============================================================================

# ===========================================================================
# BASE STAGE - Common dependencies
# ===========================================================================
FROM node:20-slim AS base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    openssl \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# ===========================================================================
# DEPENDENCIES STAGE - Install all dependencies
# ===========================================================================
FROM base AS dependencies

# Install dependencies
RUN pnpm install --frozen-lockfile

# ===========================================================================
# DEVELOPMENT STAGE - Hot reload support
# ===========================================================================
FROM base AS development

# Copy dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application code
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=development
ENV PORT=3000

# Start development server
CMD ["pnpm", "dev"]

# ===========================================================================
# BUILDER STAGE - Build the application
# ===========================================================================
FROM base AS builder

# Sentry build args for source map upload
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_ORG=m0ne-sro
ARG SENTRY_PROJECT=scamnemesis

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application code
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build Next.js application with Sentry source maps
ENV NEXT_TELEMETRY_DISABLED=1
ENV SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}
ENV SENTRY_ORG=${SENTRY_ORG}
ENV SENTRY_PROJECT=${SENTRY_PROJECT}
RUN pnpm build

# ===========================================================================
# PRODUCTION STAGE - Minimal production image (Next.js Standalone)
# ===========================================================================
FROM node:20-slim AS production

# Install only essential system dependencies for runtime
RUN apt-get update && apt-get install -y \
    curl \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build output (includes server.js and minimal node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy static files (required for Next.js standalone mode)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy public assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy prisma schema and migrations
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy Prisma CLI and dependencies for migrations
# Note: Standalone mode has minimal node_modules, so we need to add Prisma
# With pnpm, the generated client is inside @prisma/client/.prisma/client/
# We copy the entire @prisma directory which includes the generated client
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma

# Create bin directory and proper prisma wrapper script for CLI access
# Note: symlink to .js file doesn't work - need wrapper script that uses node
RUN mkdir -p /app/node_modules/.bin && \
    printf '#!/bin/sh\nexec node /app/node_modules/prisma/build/index.js "$@"\n' > /app/node_modules/.bin/prisma && \
    chmod +x /app/node_modules/.bin/prisma

# Copy entrypoint script
COPY --chown=nextjs:nodejs docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Health check - uses dedicated lightweight health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
    CMD curl -f http://localhost:3000/api/v1/health || exit 1

# Use entrypoint to handle DATABASE_URL construction with proper URL encoding
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Start standalone server (NOT pnpm start - standalone uses node directly)
CMD ["node", "server.js"]
