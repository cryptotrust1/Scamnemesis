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

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application code
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
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

# Copy prisma schema for potential migrations
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

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
