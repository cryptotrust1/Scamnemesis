# ScamNemesis Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. 404 Error After Deployment

**Symptoms:**
- Website returns 404 after successful GitHub Actions deploy
- Traefik logs show: `"scamnemesis.com\n" is not a valid hostname`

**Cause:**
GitHub Secrets containing trailing newline characters (`\n` or `\r`).

**Solution:**
1. Go to GitHub → Settings → Secrets and variables → Actions
2. Edit the `DOMAIN` secret
3. Delete all content and retype: `scamnemesis.com` (no spaces, no enter at end)
4. Save

**Immediate Server Fix:**
```bash
cd /var/www/Scamnemesis
sed -i 's/scamnemesis.com.*/scamnemesis.com/' .env
docker compose -f docker-compose.prod.yml up -d --force-recreate traefik
```

### 2. 503 Service Unavailable

**Symptoms:**
- Website returns 503
- App container shows as "unhealthy"

**Cause:**
App container failed to start or health check failing.

**Solution:**
```bash
# Check app logs
docker compose -f docker-compose.prod.yml logs app --tail=100

# Check if app is responding internally
docker compose -f docker-compose.prod.yml exec app curl http://localhost:3000/api/v1/health

# Restart app
docker compose -f docker-compose.prod.yml restart app
```

### 3. Database Connection Errors

**Symptoms:**
- App logs show "ECONNREFUSED" to postgres
- Migrations failing

**Solution:**
```bash
# Check postgres is running
docker compose -f docker-compose.prod.yml ps postgres

# Check postgres logs
docker compose -f docker-compose.prod.yml logs postgres --tail=50

# Verify DATABASE_URL in .env
grep DATABASE_URL .env
```

### 4. SSL Certificate Errors

**Symptoms:**
- Browser shows SSL warning
- Traefik logs show ACME errors

**Solution:**
```bash
# Check ACME_EMAIL is set correctly
grep ACME_EMAIL .env

# Check Traefik ACME logs
docker compose -f docker-compose.prod.yml logs traefik | grep -i acme

# Remove old certificates and restart
docker compose -f docker-compose.prod.yml down traefik
rm -rf letsencrypt/
docker compose -f docker-compose.prod.yml up -d traefik
```

---

## Deployment Verification Checklist

After every deployment, verify:

- [ ] `docker ps -a` shows all containers running
- [ ] `docker compose logs traefik --tail=20` has NO "invalid hostname" errors
- [ ] `curl -I https://scamnemesis.com` returns 200
- [ ] `curl -I https://www.scamnemesis.com` returns 200 or 301

---

## GitHub Secrets Checklist

When editing GitHub Secrets, ALWAYS:

1. **Copy value to text editor first** - check for hidden characters
2. **Delete entire secret content** before pasting new value
3. **No trailing spaces or newlines** - don't press Enter after the value
4. **Test locally first** if possible

### Required Secrets:
| Secret | Example | Notes |
|--------|---------|-------|
| `DOMAIN` | `scamnemesis.com` | NO trailing newline! |
| `ACME_EMAIL` | `admin@scamnemesis.com` | Valid email for Let's Encrypt |
| `SSH_HOST` | `77.42.44.140` | Server IP |
| `SSH_USER` | `root` | SSH username |
| `SSH_PRIVATE_KEY` | `-----BEGIN...` | Full private key |
| `POSTGRES_PASSWORD` | (random string) | Database password |
| `JWT_SECRET` | (random string) | For auth tokens |
| `JWT_REFRESH_SECRET` | (random string) | For refresh tokens |

---

## Quick Debug Commands

```bash
# Full status
docker compose -f docker-compose.prod.yml ps -a

# All logs (last 100 lines)
docker compose -f docker-compose.prod.yml logs --tail=100

# Traefik routing status
docker compose -f docker-compose.prod.yml logs traefik | grep -E "error|ERR|router"

# App health
docker compose -f docker-compose.prod.yml exec app curl http://localhost:3000/api/v1/health

# Check .env for newlines
cat .env | od -c | head -30

# Test external access
curl -I https://scamnemesis.com
```

---

## Emergency Recovery

If site is completely down:

```bash
cd /var/www/Scamnemesis

# Nuclear option - full restart
docker compose -f docker-compose.prod.yml down
docker system prune -f
docker compose -f docker-compose.prod.yml up -d --force-recreate

# Wait and check
sleep 60
docker compose -f docker-compose.prod.yml ps
curl -I https://scamnemesis.com
```
