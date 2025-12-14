# Debug Checklist: Next.js 404 Issue in Production

## Issue Summary

**Problem:** Deploy succeeds, health check passes, but pages return 404.

**Root Cause (Historical):** Next.js standalone mode misconfiguration - running `pnpm start` instead of `node server.js`, missing static files, or incorrect file structure.

**Status:** Fixed in commit `e379e96` (Dec 14, 2025)

This document provides a comprehensive checklist for debugging similar issues in the future.

---

## 1. Server-Side Verification

### 1.1 Container Status Checks

```bash
# Check all container statuses
docker compose -f docker-compose.prod.yml ps

# Check app container specifically
docker compose -f docker-compose.prod.yml ps app

# Expected output: Status should be "Up" and health should be "healthy"
```

### 1.2 Container Logs Analysis

```bash
# View real-time logs (last 100 lines, follow mode)
docker compose -f docker-compose.prod.yml logs app --tail=100 -f

# View logs from last 30 minutes
docker compose -f docker-compose.prod.yml logs app --since=30m

# Check for specific errors
docker compose -f docker-compose.prod.yml logs app | grep -i "error\|404\|not found"

# Check startup sequence
docker compose -f docker-compose.prod.yml logs app --tail=200 | grep -i "ready\|listening\|started"
```

**What to look for:**
- ✅ "Server started on http://0.0.0.0:3000"
- ✅ "ready - started server on 0.0.0.0:3000"
- ❌ "ENOENT: no such file or directory"
- ❌ "Cannot find module"
- ❌ "404" errors in logs

### 1.3 Docker Inspect

```bash
# Get detailed container configuration
docker inspect scamnemesis-app

# Check environment variables
docker inspect scamnemesis-app | jq '.[0].Config.Env'

# Check mounts and volumes
docker inspect scamnemesis-app | jq '.[0].Mounts'

# Check running command
docker inspect scamnemesis-app | jq '.[0].Config.Cmd'
# Expected: ["node", "server.js"]
```

### 1.4 Resource Usage

```bash
# Check CPU and memory usage
docker stats scamnemesis-app --no-stream

# Check disk space on host
df -h

# Check disk space in container
docker compose -f docker-compose.prod.yml exec app df -h
```

---

## 2. Files Inside Running Container

### 2.1 Container File System Structure

```bash
# Access container shell
docker compose -f docker-compose.prod.yml exec app sh

# Or if shell not available
docker compose -f docker-compose.prod.yml exec app /bin/sh
```

### 2.2 Verify Standalone Output Structure

```bash
# Inside container - check working directory
pwd
# Expected: /app

# List root files
ls -la /app
# Expected files:
# - server.js (CRITICAL - this is the standalone server)
# - package.json
# - node_modules/
# - .next/
# - public/
# - prisma/

# Verify server.js exists and is executable
ls -lh /app/server.js
# Should show: -rw-r--r-- with reasonable size (few KB)

# Check .next directory structure
ls -la /app/.next
# Expected:
# - static/ (CRITICAL - contains CSS, JS bundles)
# - server/ (contains server-side code)
# - standalone/ should NOT be here (it's already extracted to /app)

# Verify static files
ls -la /app/.next/static
# Should contain directories like: chunks/, css/, media/

# Check public directory
ls -la /app/public
# Should contain your static assets
```

### 2.3 Verify File Permissions

```bash
# Check ownership (should be nextjs:nodejs)
ls -la /app | grep -E "server.js|.next|public"

# Check current user
whoami
# Expected: nextjs (not root)

# Verify files are readable
cat /app/server.js | head -n 5
# Should show Node.js code, not "Permission denied"
```

### 2.4 Check Environment Variables

```bash
# Inside container
env | grep -E "NODE_ENV|PORT|HOSTNAME|DATABASE_URL"

# Expected values:
# NODE_ENV=production
# PORT=3000
# HOSTNAME=0.0.0.0
```

### 2.5 Process Inspection

```bash
# Check running processes
ps aux

# Expected output should show:
# node server.js (NOT pnpm or npm)

# If you see pnpm/npm instead of node, that's the bug!
```

---

## 3. Network & Routing Tests

### 3.1 Health Check (Inside Container)

```bash
# From inside the container
curl -v http://localhost:3000/api/v1/health

# Expected response:
# HTTP/1.1 200 OK
# {"status":"healthy","timestamp":"...","version":"..."}
```

### 3.2 Test Routes (Inside Container)

```bash
# Test homepage
curl -I http://localhost:3000/

# Test API endpoint
curl http://localhost:3000/api/v1/health

# Test static files
curl -I http://localhost:3000/_next/static/css/...
# (Use actual path from browser network tab)
```

### 3.3 From Host Machine

```bash
# Test via Traefik (external)
curl -I https://demo.scamnemesis.com

# Test via container network
docker compose -f docker-compose.prod.yml exec app curl -I http://localhost:3000/

# Test DNS resolution
nslookup demo.scamnemesis.com

# Test Traefik routing
docker compose -f docker-compose.prod.yml logs traefik | grep -i "app"
```

### 3.4 Traefik Debug

```bash
# Check Traefik container logs
docker compose -f docker-compose.prod.yml logs traefik --tail=100

# Check Traefik configuration
docker compose -f docker-compose.prod.yml exec traefik cat /etc/traefik/traefik.yml

# Test backend connectivity from Traefik
docker compose -f docker-compose.prod.yml exec traefik wget -O- http://app:3000/api/v1/health
```

---

## 4. Debugging Commands Reference

### 4.1 Quick Diagnostics

```bash
#!/bin/bash
# Save as: debug-404.sh

echo "=== Container Status ==="
docker compose -f docker-compose.prod.yml ps app

echo -e "\n=== App Logs (last 50 lines) ==="
docker compose -f docker-compose.prod.yml logs app --tail=50

echo -e "\n=== Health Check (Internal) ==="
docker compose -f docker-compose.prod.yml exec -T app curl -f http://localhost:3000/api/v1/health

echo -e "\n=== File Structure ==="
docker compose -f docker-compose.prod.yml exec app ls -la /app

echo -e "\n=== Server.js Check ==="
docker compose -f docker-compose.prod.yml exec app ls -lh /app/server.js

echo -e "\n=== Static Files Check ==="
docker compose -f docker-compose.prod.yml exec app ls -la /app/.next/static | head -10

echo -e "\n=== Running Process ==="
docker compose -f docker-compose.prod.yml exec app ps aux | grep node

echo -e "\n=== Environment Variables ==="
docker compose -f docker-compose.prod.yml exec app env | grep -E "NODE_ENV|PORT|HOSTNAME"

echo -e "\n=== Resource Usage ==="
docker stats scamnemesis-app --no-stream
```

### 4.2 Deep Dive Commands

```bash
# Compare running container with Dockerfile expectations
docker compose -f docker-compose.prod.yml exec app sh -c '
  echo "=== Checking standalone structure ==="
  [ -f /app/server.js ] && echo "✅ server.js exists" || echo "❌ server.js missing"
  [ -d /app/.next/static ] && echo "✅ .next/static exists" || echo "❌ .next/static missing"
  [ -d /app/public ] && echo "✅ public exists" || echo "❌ public missing"

  echo -e "\n=== Checking CMD ==="
  ps aux | grep -v grep | grep server.js && echo "✅ Running node server.js" || echo "❌ Not running server.js"
'

# Check for common issues
docker compose -f docker-compose.prod.yml exec app sh -c '
  echo "=== Common Issues Check ==="

  # Check if .next/standalone is incorrectly copied
  [ -d /app/.next/standalone ] && echo "❌ BUG: .next/standalone should not exist here" || echo "✅ Correct structure"

  # Check if static files are in wrong location
  [ -d /app/.next/standalone/static ] && echo "❌ BUG: Static files in wrong location" || echo "✅ Static files correctly placed"

  # Check user
  [ "$(whoami)" = "nextjs" ] && echo "✅ Running as nextjs user" || echo "❌ Running as $(whoami)"
'
```

---

## 5. Common Root Causes & Solutions

### 5.1 Standalone Mode Misconfiguration

**Symptom:** 404 on all pages, but health check passes

**Root Cause:**
- Running `pnpm start` instead of `node server.js`
- Missing `.next/static` directory
- Copying `.next` instead of `.next/standalone`

**Verification:**
```bash
# Check running command
docker inspect scamnemesis-app | jq '.[0].Config.Cmd'
# Should be: ["node", "server.js"]
# NOT: ["pnpm", "start"]

# Check for server.js
docker compose -f docker-compose.prod.yml exec app ls -lh /app/server.js
```

**Solution:** Ensure Dockerfile uses standalone mode correctly (see commit `e379e96`)

### 5.2 Missing Static Files

**Symptom:** Pages load but no CSS/JS, blank pages

**Root Cause:**
- `.next/static` not copied to production image
- Static files copied to wrong location

**Verification:**
```bash
# Check static directory
docker compose -f docker-compose.prod.yml exec app ls -la /app/.next/static
# Should show: chunks/, css/, media/, etc.
```

**Solution:**
```dockerfile
# In Dockerfile - MUST copy static files separately
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
```

### 5.3 Wrong File Paths

**Symptom:** "Cannot find module" errors in logs

**Root Cause:**
- Standalone output not extracted properly
- Files copied to wrong location

**Verification:**
```bash
# Check if standalone was incorrectly nested
docker compose -f docker-compose.prod.yml exec app find /app -name "server.js"
# Should ONLY show: /app/server.js
# NOT: /app/.next/standalone/server.js
```

**Solution:**
```dockerfile
# Correct: Copy standalone content to /app root
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
```

### 5.4 Permission Issues

**Symptom:** "Permission denied" errors

**Verification:**
```bash
# Check file ownership
docker compose -f docker-compose.prod.yml exec app ls -la /app | head -20

# All files should be owned by: nextjs:nodejs
```

**Solution:**
```dockerfile
# Use --chown in COPY commands
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
```

### 5.5 Environment Variable Issues

**Symptom:** App starts but behaves incorrectly

**Verification:**
```bash
# Check critical env vars
docker compose -f docker-compose.prod.yml exec app env | grep -E "NODE_ENV|HOSTNAME|PORT|DATABASE_URL"
```

**Solution:** Verify .env file and docker-compose.prod.yml environment section

### 5.6 Build Cache Issues

**Symptom:** Old code running despite new deployment

**Verification:**
```bash
# Check image build date
docker images | grep scamnemesis-app

# Check git commit in container
docker compose -f docker-compose.prod.yml exec app cat /app/.git/HEAD 2>/dev/null || echo "No git info"
```

**Solution:**
```bash
# Rebuild with no cache
docker compose -f docker-compose.prod.yml build --no-cache --pull app
docker compose -f docker-compose.prod.yml up -d --force-recreate app
```

---

## 6. Next.js Standalone Mode Best Practices

### 6.1 Required Configuration

**next.config.js:**
```javascript
module.exports = {
  output: 'standalone',  // REQUIRED for Docker deployments
  // ... other config
};
```

### 6.2 Dockerfile Structure (Correct Pattern)

```dockerfile
# BUILDER STAGE
FROM node:20-slim AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build  # Creates .next/standalone

# PRODUCTION STAGE
FROM node:20-slim AS production
WORKDIR /app

# 1. Copy standalone output (includes server.js + minimal node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 2. Copy static files (CRITICAL - must be separate)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 3. Copy public directory
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 4. Run standalone server
CMD ["node", "server.js"]  # NOT pnpm start
```

### 6.3 Common Mistakes to Avoid

❌ **Don't do this:**
```dockerfile
# WRONG: Copying entire .next directory
COPY --from=builder /app/.next ./.next

# WRONG: Using pnpm/npm start
CMD ["pnpm", "start"]

# WRONG: Not copying static files
# (Missing: COPY .next/static)

# WRONG: Copying standalone as subdirectory
COPY --from=builder /app/.next/standalone ./.next/standalone
```

✅ **Do this:**
```dockerfile
# CORRECT: Copy standalone to root
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# CORRECT: Copy static separately
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# CORRECT: Use node directly
CMD ["node", "server.js"]
```

### 6.4 File Structure Reference

**After build (builder stage):**
```
/app/
├── .next/
│   ├── standalone/          # Minimal production server
│   │   ├── server.js       # Standalone server entry point
│   │   ├── package.json
│   │   └── node_modules/   # Minimal dependencies
│   ├── static/             # Client-side assets
│   │   ├── chunks/
│   │   ├── css/
│   │   └── media/
│   └── ...
```

**Production image (/app):**
```
/app/
├── server.js              # From .next/standalone
├── package.json           # From .next/standalone
├── node_modules/          # From .next/standalone (minimal)
├── .next/
│   └── static/           # Copied separately (REQUIRED)
│       ├── chunks/
│       ├── css/
│       └── media/
└── public/               # Copied separately
```

---

## 7. Debug Logging & Endpoints

### 7.1 Add Debug Endpoint (Development)

Create `/home/user/Scamnemesis/src/app/api/debug/structure/route.ts`:

```typescript
/**
 * Debug endpoint - ONLY for development/troubleshooting
 * Remove or protect with authentication in production
 */

import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const workDir = process.cwd();

    // Check critical paths
    const checks = {
      workingDirectory: workDir,
      serverJs: await checkFile(join(workDir, 'server.js')),
      nextStatic: await checkDir(join(workDir, '.next', 'static')),
      publicDir: await checkDir(join(workDir, 'public')),
      nodeModules: await checkDir(join(workDir, 'node_modules')),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        HOSTNAME: process.env.HOSTNAME,
      },
      process: {
        version: process.version,
        platform: process.platform,
        pid: process.pid,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
    };

    return NextResponse.json(checks, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

async function checkFile(path: string) {
  try {
    const { statSync } = require('fs');
    const stats = statSync(path);
    return {
      exists: true,
      size: stats.size,
      isFile: stats.isFile(),
    };
  } catch {
    return { exists: false };
  }
}

async function checkDir(path: string) {
  try {
    const files = await readdir(path);
    return {
      exists: true,
      filesCount: files.length,
      sampleFiles: files.slice(0, 5),
    };
  } catch {
    return { exists: false };
  }
}
```

**Usage:**
```bash
# Inside container
curl http://localhost:3000/api/debug/structure

# From host (via Traefik)
curl https://demo.scamnemesis.com/api/debug/structure
```

### 7.2 Enhanced Health Check

Update `/home/user/Scamnemesis/src/app/api/v1/health/ready/route.ts`:

```typescript
/**
 * Readiness Check - Verifies app is ready to serve traffic
 * More comprehensive than basic health check
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks = {
    status: 'ready',
    timestamp: new Date().toISOString(),
    checks: {
      app: true,
      database: false,
      redis: false,
    },
  };

  try {
    // Check database
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = true;
    await prisma.$disconnect();
  } catch (error) {
    console.error('Database check failed:', error);
  }

  // Check Redis (if configured)
  // ... add Redis check here

  const allHealthy = Object.values(checks.checks).every(Boolean);

  return NextResponse.json(checks, {
    status: allHealthy ? 200 : 503,
  });
}
```

### 7.3 Enable Debug Logging

**In docker-compose.prod.yml:**
```yaml
app:
  environment:
    - DEBUG=*  # Enable all debug logs (temporary)
    # Or specific:
    - DEBUG=next:*
```

**Check logs:**
```bash
docker compose -f docker-compose.prod.yml logs app -f
```

---

## 8. Deployment Verification Checklist

Use this checklist after every deployment:

### Pre-Deployment
- [ ] Verify `next.config.js` has `output: 'standalone'`
- [ ] Verify Dockerfile copies `.next/standalone` to root
- [ ] Verify Dockerfile copies `.next/static` separately
- [ ] Verify Dockerfile CMD is `["node", "server.js"]`
- [ ] Environment variables configured in `.env`
- [ ] No sensitive data in docker-compose.yml (use .env)

### During Deployment
- [ ] Build completes without errors
- [ ] No "ENOENT" or "Cannot find module" errors
- [ ] Container starts successfully
- [ ] Health check passes within 90 seconds
- [ ] No permission denied errors

### Post-Deployment
- [ ] Homepage returns 200 OK (not 404)
- [ ] API endpoints respond correctly
- [ ] Static files load (CSS, JS, images)
- [ ] Database connection works
- [ ] Redis connection works (if applicable)
- [ ] Traefik routes traffic correctly
- [ ] SSL certificate is valid
- [ ] Monitoring/logging configured

### Verification Commands
```bash
# 1. Check container status
docker compose -f docker-compose.prod.yml ps app

# 2. Test health endpoint
docker compose -f docker-compose.prod.yml exec -T app curl -f http://localhost:3000/api/v1/health

# 3. Test homepage (internal)
docker compose -f docker-compose.prod.yml exec -T app curl -I http://localhost:3000/

# 4. Test via Traefik (external)
curl -I https://demo.scamnemesis.com

# 5. Check logs for errors
docker compose -f docker-compose.prod.yml logs app --tail=100 | grep -i error

# 6. Verify file structure
docker compose -f docker-compose.prod.yml exec app ls -la /app | grep -E "server.js|.next|public"
```

---

## 9. Emergency Rollback Procedure

If deployment fails and you need to rollback quickly:

```bash
# 1. Stop current deployment
docker compose -f docker-compose.prod.yml down

# 2. Checkout previous working commit
git log --oneline -10  # Find last working commit
git checkout <commit-hash>

# 3. Rebuild and deploy
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

# 4. Verify
docker compose -f docker-compose.prod.yml logs app --tail=100
curl https://demo.scamnemesis.com/api/v1/health

# 5. If successful, return to main branch and investigate
git checkout main
```

---

## 10. Monitoring & Alerts

### 10.1 Set Up External Monitoring

**Recommended tools:**
- UptimeRobot (free tier available)
- Better Uptime
- Pingdom
- Custom script with cron

**Monitor:**
- `https://demo.scamnemesis.com` - Homepage
- `https://demo.scamnemesis.com/api/v1/health` - Health endpoint

**Alert on:**
- HTTP status != 200
- Response time > 5s
- SSL certificate expiry < 30 days

### 10.2 Log Aggregation

```yaml
# Add to docker-compose.prod.yml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 10.3 Automated Health Checks

Create `/var/www/Scamnemesis/scripts/health-check.sh`:

```bash
#!/bin/bash
# Automated health check with notifications

DOMAIN="${1:-demo.scamnemesis.com}"
SLACK_WEBHOOK="${SLACK_WEBHOOK_URL}"  # Set via environment

# Check health endpoint
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://${DOMAIN}/api/v1/health")

if [ "$RESPONSE" != "200" ]; then
  echo "❌ Health check failed: HTTP $RESPONSE"

  # Send alert (example: Slack)
  if [ -n "$SLACK_WEBHOOK" ]; then
    curl -X POST "$SLACK_WEBHOOK" \
      -H 'Content-Type: application/json' \
      -d "{\"text\":\"🚨 Scamnemesis health check failed: HTTP $RESPONSE\"}"
  fi

  # Show logs
  docker compose -f /var/www/Scamnemesis/docker-compose.prod.yml logs app --tail=50

  exit 1
else
  echo "✅ Health check passed"
  exit 0
fi
```

**Set up cron job:**
```bash
# Run every 5 minutes
*/5 * * * * /var/www/Scamnemesis/scripts/health-check.sh demo.scamnemesis.com
```

---

## 11. References

### Related Documentation
- [DEPLOYMENT_WARNING_ANALYSIS.md](/home/user/Scamnemesis/docs/DEPLOYMENT_WARNING_ANALYSIS.md) - Deployment warning analysis
- [KUBERNETES_DEPLOYMENT.md](/home/user/Scamnemesis/docs/KUBERNETES_DEPLOYMENT.md) - Kubernetes deployment guide
- [CI-CD.md](/home/user/Scamnemesis/docs/CI-CD.md) - CI/CD pipeline documentation

### Key Commits
- `e379e96` - Fix 404 error - use Next.js standalone mode properly
- `becb2b3` - Fix deployment failure - curl inside container, fix Typesense healthcheck
- `bfdb1f8` - Fix deployment health check failure - create dedicated health endpoint

### External Resources
- [Next.js Standalone Output](https://nextjs.org/docs/app/api-reference/next-config-js/output)
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Next.js Deployment Best Practices](https://nextjs.org/docs/pages/building-your-application/deploying)

---

## 12. Quick Reference Card

**Most Common Issues:**

| Issue | Quick Check | Quick Fix |
|-------|-------------|-----------|
| 404 on all pages | `docker exec scamnemesis-app ps aux` | Ensure CMD is `node server.js` |
| Missing CSS/JS | `docker exec scamnemesis-app ls /app/.next/static` | Copy `.next/static` in Dockerfile |
| Container crash | `docker logs scamnemesis-app` | Check build errors, env vars |
| Health check fail | `docker exec scamnemesis-app curl localhost:3000/api/v1/health` | Verify endpoint exists |
| Traefik routing | `docker logs scamnemesis-traefik` | Check labels in docker-compose |

**Essential Commands:**
```bash
# Quick status
docker compose -f docker-compose.prod.yml ps

# Quick logs
docker compose -f docker-compose.prod.yml logs app --tail=50

# Quick test
docker compose -f docker-compose.prod.yml exec -T app curl http://localhost:3000/api/v1/health

# Quick restart
docker compose -f docker-compose.prod.yml restart app

# Full rebuild
docker compose -f docker-compose.prod.yml build --no-cache app && \
docker compose -f docker-compose.prod.yml up -d --force-recreate app
```

---

**Document Version:** 1.0
**Last Updated:** 2025-12-14
**Author:** Claude Code Analysis
**Status:** Production Ready
