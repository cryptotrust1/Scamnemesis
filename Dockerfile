# =============================================================================
# Scamnemesis Next.js Application Dockerfile
# =============================================================================

# ===========================================================================
# BASE STAGE - Common dependencies
# ===========================================================================
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    libc6-compat \
    curl \
    bash

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# ===========================================================================
# DEPENDENCIES STAGE - Install all dependencies
# ===========================================================================
FROM base AS dependencies

# Install dependencies
RUN npm ci

# ===========================================================================
# DEVELOPMENT STAGE - Hot reload support
# ===========================================================================
FROM base AS development

# Copy dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=development
ENV PORT=3000

# Start development server
CMD ["npm", "run", "dev"]

# ===========================================================================
# BUILDER STAGE - Build the application
# ===========================================================================
FROM base AS builder

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ===========================================================================
# PRODUCTION STAGE - Minimal production image
# ===========================================================================
FROM node:20-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    libc6-compat \
    curl \
    bash

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

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
CMD ["npm", "start"]
