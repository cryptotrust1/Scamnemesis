# SSL/TLS Certificate Fix Deployment Guide

## Problem Summary
The website https://scamnemesis.com was showing **ERR_CERT_AUTHORITY_INVALID** with "TRAEFIK DEFAULT CERT" instead of a proper Let's Encrypt certificate.

## Root Causes Identified

### 1. Missing Explicit TLS Enable Flags
**Issue:** Traefik routers did not have explicit `tls=true` configuration, which could prevent TLS from being enabled properly.

**Fixed:** Added explicit TLS enable flags to all HTTPS routers:
```yaml
- "traefik.http.routers.app.tls=true"
- "traefik.http.routers.app-www.tls=true"
```

### 2. WWW Domain Certificate Request
**Issue:** The configuration was attempting to obtain separate certificates for both `scamnemesis.com` and `www.scamnemesis.com`. If the WWW subdomain's DNS is not properly configured or the ACME challenge fails, Traefik falls back to its default self-signed certificate.

**Fixed:** Added explicit TLS configuration for the WWW router and improved redirect middleware.

### 3. Incomplete Middleware Configuration
**Issue:** WWW HTTP redirect was using the same middleware as the main domain redirect, potentially causing redirect loops or ACME challenge failures.

**Fixed:** Created separate middleware for WWW HTTP to HTTPS redirect with direct redirect to non-WWW HTTPS.

### 4. Missing Access Logging
**Issue:** No access logs were enabled, making it difficult to troubleshoot SSL/certificate issues.

**Fixed:** Enabled Traefik access logging with `--accesslog=true`.

## Changes Made

### File: `/home/user/Scamnemesis/docker-compose.prod.yml`

#### Traefik Service Changes (lines 29-59):
- Reorganized command arguments with clear section headers
- Added access logging for better troubleshooting
- Added commented staging server option for testing
- Improved documentation

#### App Service Label Changes (lines 175-220):
- Added explicit `tls=true` to all HTTPS routers
- Reorganized labels with clear section headers
- Created separate middleware for WWW HTTP redirect
- Added `permanent=true` to all redirect middlewares

## Pre-Deployment Checklist

### 1. Verify DNS Configuration
Ensure both domains point to your server:
```bash
# Check main domain
dig +short scamnemesis.com
nslookup scamnemesis.com

# Check WWW subdomain
dig +short www.scamnemesis.com
nslookup www.scamnemesis.com
```

Both should return the same IP address as your server.

### 2. Verify .env File
Ensure your production `.env` file has the correct values:
```bash
# Check that .env exists and has correct values
grep "DOMAIN\|ACME_EMAIL" .env
```

Expected output:
```
DOMAIN=scamnemesis.com
ACME_EMAIL=info@scamnemesis.com
```

**CRITICAL:** If `.env` does not exist, create it from the template:
```bash
cp .env.production.template .env
# Then edit .env and fill in all CHANGE_ME values
```

### 3. Verify Ports are Open
Ensure ports 80 and 443 are open and accessible:
```bash
# Check if ports are listening
sudo netstat -tlnp | grep -E ':80|:443'

# Check firewall rules
sudo ufw status
# or
sudo iptables -L -n | grep -E '80|443'
```

### 4. Backup Existing Certificates (if any)
```bash
docker volume ls | grep traefik_certs
docker run --rm -v scamnemesis_traefik_certs_prod:/letsencrypt alpine tar czf - /letsencrypt > traefik-certs-backup-$(date +%Y%m%d-%H%M%S).tar.gz
```

## Deployment Steps

### Step 1: Pull Latest Code
```bash
cd /home/user/Scamnemesis
git pull origin main
```

### Step 2: Stop Running Services
```bash
docker compose -f docker-compose.prod.yml down
```

### Step 3: (Optional) Clear Old Certificates
If you want to start fresh and request new certificates:
```bash
# WARNING: This will delete existing certificates
docker volume rm scamnemesis_traefik_certs_prod
```

**Note:** Only do this if:
- You're certain the old certificates are invalid
- You haven't hit Let's Encrypt rate limits (5 per domain per week)
- OR you're using staging mode for testing

### Step 4: Deploy Updated Configuration
```bash
# Verify the configuration is valid
docker compose -f docker-compose.prod.yml config

# Start services
docker compose -f docker-compose.prod.yml up -d
```

### Step 5: Monitor Certificate Acquisition
```bash
# Watch Traefik logs for certificate acquisition
docker logs -f scamnemesis-traefik

# Look for these messages:
# - "Adding certificate for domain(s) scamnemesis.com"
# - "Adding certificate for domain(s) www.scamnemesis.com"
# - Should NOT see "acme: error" messages
```

Certificate acquisition typically takes 30-60 seconds.

### Step 6: Verify SSL Certificate
After 1-2 minutes, test the certificate:
```bash
# Check certificate details
curl -vI https://scamnemesis.com 2>&1 | grep -E "subject|issuer|SSL certificate"

# Or use openssl
echo | openssl s_client -servername scamnemesis.com -connect scamnemesis.com:443 2>/dev/null | openssl x509 -noout -issuer -subject -dates
```

Expected output should show:
- **Issuer:** Let's Encrypt (not "TRAEFIK DEFAULT CERT")
- **Subject:** scamnemesis.com
- **Valid dates:** Current date range

## Testing in Staging Mode (Recommended First)

To avoid hitting Let's Encrypt rate limits during testing:

### 1. Enable Staging Mode
Edit `docker-compose.prod.yml` and uncomment line 51:
```yaml
- "--certificatesresolvers.letsencrypt.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory"
```

### 2. Deploy and Test
```bash
docker compose -f docker-compose.prod.yml down
docker volume rm scamnemesis_traefik_certs_prod  # Clear old certs
docker compose -f docker-compose.prod.yml up -d
```

### 3. Verify Staging Certificate
```bash
curl -vI https://scamnemesis.com 2>&1 | grep "issuer"
# Should show: issuer=CN=Fake LE Intermediate X1
```

**Important:** Staging certificates will show as "Not Secure" in browsers (this is expected). Once you verify the ACME challenge works, switch back to production mode.

### 4. Switch to Production
Comment out line 51 again and redeploy:
```bash
docker compose -f docker-compose.prod.yml down
docker volume rm scamnemesis_traefik_certs_prod
docker compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Issue: Certificate Not Obtained After 5 Minutes

**Check 1: DNS Resolution**
```bash
# From the server
dig +short scamnemesis.com
dig +short www.scamnemesis.com
# Should both return the server's public IP
```

**Check 2: Traefik Logs**
```bash
docker logs scamnemesis-traefik 2>&1 | grep -i "acme\|certificate\|error"
```

Common error messages:
- `"acme: error: 400"` - Bad request, check ACME email format
- `"acme: error: 403"` - Forbidden, DNS not pointing to server
- `"acme: error: 429"` - Rate limited, wait or use staging
- `"timeout"` - Port 80 not accessible from internet

**Check 3: Port Accessibility**
```bash
# From OUTSIDE the server (use a different machine or online tool)
curl -I http://scamnemesis.com
curl -I http://www.scamnemesis.com

# Should return HTTP 301/302 redirect, not connection refused
```

**Check 4: ACME Challenge Path**
```bash
# From outside the server
curl -v http://scamnemesis.com/.well-known/acme-challenge/test
# Should return 404 (not connection refused or timeout)
```

### Issue: Still Showing Default Certificate

**Check 1: Verify Container is Using Updated Config**
```bash
docker inspect scamnemesis-app | grep -A 3 "traefik.http.routers.app.tls="
# Should show "traefik.http.routers.app.tls=true"
```

**Check 2: Verify ACME Email is Set**
```bash
docker inspect scamnemesis-traefik | grep ACME_EMAIL
# Should show valid email, not empty or "admin@example.com"
```

**Check 3: Check Certificate Storage**
```bash
# Check if acme.json exists and has content
docker exec scamnemesis-traefik ls -lh /letsencrypt/
docker exec scamnemesis-traefik cat /letsencrypt/acme.json | jq '.letsencrypt.Certificates'
```

### Issue: WWW Domain Shows Certificate Error

**Solution:** Ensure DNS for www.scamnemesis.com points to the same server.

If you don't want to use WWW subdomain at all, you can remove the WWW router configuration (lines 192-200 in docker-compose.prod.yml).

### Issue: Rate Limited by Let's Encrypt

**Error:** `"acme: error: 429"`

**Solution:**
1. Wait 1 week for rate limit to reset, OR
2. Use staging mode for testing (see above)

Let's Encrypt production limits:
- 5 certificates per registered domain per week
- 50 certificates per domain set per week

### Issue: Browser Cache Showing Old Certificate

**Solution:**
```bash
# Clear browser SSL cache
# Chrome: chrome://net-internals/#sockets → "Flush socket pools"
# Firefox: Close browser completely and reopen
# Or use incognito/private mode
```

## Verification Commands

### Check All Routers
```bash
docker exec scamnemesis-traefik wget -qO- http://localhost:8080/api/http/routers | jq '.[] | select(.name | contains("app")) | {name, rule, tls}'
```

### Check Certificate Resolver
```bash
docker exec scamnemesis-traefik cat /letsencrypt/acme.json | jq -r '.letsencrypt | {Account, Certificates: .Certificates | length}'
```

### Check Access Logs
```bash
docker logs scamnemesis-traefik | grep "GET /.well-known/acme-challenge/"
# Should show Let's Encrypt requests if ACME challenge is being attempted
```

## Success Indicators

✅ **Certificate Obtained Successfully:**
- Traefik logs show: "Adding certificate for domain(s) scamnemesis.com"
- Browser shows green lock icon
- Certificate issuer is "Let's Encrypt" (not "TRAEFIK DEFAULT CERT")
- `curl -vI https://scamnemesis.com` shows Let's Encrypt issuer

✅ **WWW Redirect Working:**
- https://www.scamnemesis.com redirects to https://scamnemesis.com
- No certificate errors during redirect

✅ **HTTP to HTTPS Redirect Working:**
- http://scamnemesis.com redirects to https://scamnemesis.com
- http://www.scamnemesis.com redirects to https://scamnemesis.com

## Rollback Procedure

If something goes wrong:

```bash
# Stop services
docker compose -f docker-compose.prod.yml down

# Restore from git (if needed)
git checkout HEAD -- docker-compose.prod.yml

# Restore old certificates (if backed up)
docker volume create scamnemesis_traefik_certs_prod
cat traefik-certs-backup-TIMESTAMP.tar.gz | docker run --rm -i -v scamnemesis_traefik_certs_prod:/letsencrypt alpine tar xzf - -C /

# Restart
docker compose -f docker-compose.prod.yml up -d
```

## Additional Resources

- **Let's Encrypt Rate Limits:** https://letsencrypt.org/docs/rate-limits/
- **Traefik ACME Documentation:** https://doc.traefik.io/traefik/https/acme/
- **SSL Labs Test:** https://www.ssllabs.com/ssltest/analyze.html?d=scamnemesis.com

## Support

If issues persist after following this guide:

1. Check all DNS records are correct and propagated
2. Verify firewall allows ports 80 and 443
3. Review Traefik logs for specific error messages
4. Consider using staging mode to test without rate limits
5. Check Let's Encrypt status page: https://letsencrypt.status.io/

## Next Steps After Successful Deployment

1. Test the website in multiple browsers
2. Run SSL Labs test: https://www.ssllabs.com/ssltest/analyze.html?d=scamnemesis.com
3. Set up monitoring for certificate expiration
4. Document any custom configurations in your wiki/docs

---

**Last Updated:** 2025-12-18
**Applied to:** docker-compose.prod.yml
