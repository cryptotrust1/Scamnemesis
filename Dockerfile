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
# PRODUCTION STAGE - Minimal production image
# ===========================================================================
FROM node:20-slim AS production

# Install system dependencies including OpenSSL for Prisma
RUN apt-get update && apt-get install -y \
    curl \
    openssl \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client
RUN pnpm prisma generate

# Change ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/v1/verify || exit 1

# Start production server
CMD ["pnpm", "start"]
