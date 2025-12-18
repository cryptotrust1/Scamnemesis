# Production Deployment Quick Reference

## Prerequisites

1. **Server Requirements**
   - Ubuntu 22.04 LTS or newer
   - Minimum 8GB RAM (16GB recommended)
   - Minimum 4 CPU cores
   - 100GB+ storage
   - Docker Engine 24.0+
   - Docker Compose v2.20+

2. **Domain Requirements**
   - Domain name configured and pointing to server IP
   - DNS A record: `yourdomain.com` → `SERVER_IP`
   - DNS A record: `www.yourdomain.com` → `SERVER_IP`
   - Wait for DNS propagation (use `dig yourdomain.com` to verify)

## Quick Deployment Steps

### 1. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your production values
nano .env
```

**CRITICAL - Set these values:**
```bash
ACME_EMAIL=your-email@example.com       # Required for Let's Encrypt
DOMAIN=yourdomain.com                   # Your production domain

# Generate secure secrets (run these commands):
POSTGRES_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
ADMIN_SETUP_TOKEN=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
TYPESENSE_API_KEY=$(openssl rand -base64 32)
S3_ACCESS_KEY=$(openssl rand -base64 16)
S3_SECRET_KEY=$(openssl rand -base64 32)
GRAFANA_ADMIN_PASSWORD=$(openssl rand -base64 16)
```

### 2. Validate Configuration

```bash
# Validate docker-compose syntax
docker compose -f docker-compose.prod.yml config --quiet

# Check for required environment variables
./scripts/validate-production.sh
```

### 3. Deploy Services

```bash
# Pull all images
docker compose -f docker-compose.prod.yml pull

# Start all services in background
docker compose -f docker-compose.prod.yml up -d

# Monitor startup logs
docker compose -f docker-compose.prod.yml logs -f
```

### 4. Verify Deployment

```bash
# Check service status (wait for all to be healthy)
docker compose -f docker-compose.prod.yml ps

# Verify Traefik health
docker exec scamnemesis-traefik traefik healthcheck --ping

# Check SSL certificate (wait 2-5 minutes for issuance)
docker exec scamnemesis-traefik cat /letsencrypt/acme.json | jq '.letsencrypt.Certificates'

# Test HTTPS endpoint
curl -I https://yourdomain.com
```

### 5. Initial Admin Setup

```bash
# The ADMIN_SETUP_TOKEN is required for first-time admin creation
# Use the value from your .env file to create the initial admin account
# Visit: https://yourdomain.com/admin/setup?token=YOUR_ADMIN_SETUP_TOKEN
```

## Troubleshooting

### SSL Certificates Not Working

**Symptoms:**
- Browser shows "Your connection is not private"
- Certificate issuer is "TRAEFIK DEFAULT CERT" instead of "Let's Encrypt"

**Solutions:**

1. **Verify ACME_EMAIL is set correctly:**
   ```bash
   grep ACME_EMAIL .env
   # Should NOT be empty or admin@example.com
   ```

2. **Check Traefik logs for ACME errors:**
   ```bash
   docker logs scamnemesis-traefik | grep -i "acme\|letsencrypt"
   ```

3. **Verify DNS is pointing to your server:**
   ```bash
   dig +short yourdomain.com
   # Should return your server's IP
   ```

4. **Ensure ports 80/443 are accessible:**
   ```bash
   # From external machine:
   telnet yourdomain.com 80
   telnet yourdomain.com 443
   ```

5. **Check acme.json permissions:**
   ```bash
   docker exec scamnemesis-traefik ls -la /letsencrypt/acme.json
   # Should be readable/writable
   ```

6. **Force certificate renewal:**
   ```bash
   # Stop Traefik
   docker stop scamnemesis-traefik

   # Remove old certificates
   docker volume rm scamnemesis_traefik_certs_prod

   # Restart stack
   docker compose -f docker-compose.prod.yml up -d
   ```

### Database Connection Errors

**Symptoms:**
- App logs show "connection refused" or "authentication failed"

**Solutions:**

1. **Verify Postgres is healthy:**
   ```bash
   docker exec scamnemesis-postgres pg_isready -U postgres
   ```

2. **Check password sync:**
   ```bash
   docker logs scamnemesis-password-sync
   ```

3. **Test database connection:**
   ```bash
   docker exec scamnemesis-postgres psql -U postgres -d scamnemesis -c "SELECT 1"
   ```

### Application Not Starting

**Symptoms:**
- App container keeps restarting
- Health check failing

**Solutions:**

1. **Check app logs:**
   ```bash
   docker logs scamnemesis-app --tail 100
   ```

2. **Verify migrations ran:**
   ```bash
   docker logs scamnemesis-migrations
   ```

3. **Check dependencies:**
   ```bash
   docker compose -f docker-compose.prod.yml ps
   # Postgres and Redis must be healthy
   ```

4. **Verify environment variables:**
   ```bash
   docker exec scamnemesis-app env | grep -E "DATABASE_URL|REDIS_URL"
   ```

## Monitoring & Maintenance

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker logs scamnemesis-app -f --tail 100

# Last 1 hour of logs
docker logs scamnemesis-app --since 1h
```

### Check Health Status

```bash
# All services
docker compose -f docker-compose.prod.yml ps

# Detailed health info
docker inspect scamnemesis-app --format='{{json .State.Health}}' | jq
```

### Access Monitoring

- **Grafana:** Not exposed externally by default (security)
- **Prometheus:** Not exposed externally by default (security)

To access monitoring (temporary):
```bash
# Forward Grafana to localhost
ssh -L 3001:localhost:3000 user@your-server

# Then access: http://localhost:3001
# Default credentials: admin / (your GRAFANA_ADMIN_PASSWORD)
```

### Backup Critical Data

```bash
# Backup database
docker exec scamnemesis-postgres pg_dump -U postgres scamnemesis > backup_$(date +%Y%m%d).sql

# Backup volumes
docker run --rm -v scamnemesis_postgres_data_prod:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres_data_$(date +%Y%m%d).tar.gz /data
docker run --rm -v scamnemesis_traefik_certs_prod:/data -v $(pwd):/backup ubuntu tar czf /backup/traefik_certs_$(date +%Y%m%d).tar.gz /data
```

### Update Services

```bash
# Pull latest images (based on pinned versions)
docker compose -f docker-compose.prod.yml pull

# Recreate containers with new images
docker compose -f docker-compose.prod.yml up -d --force-recreate

# Remove old images
docker image prune -a
```

## Security Checklist

- [ ] All default passwords changed
- [ ] ACME_EMAIL set to valid email
- [ ] JWT secrets are random and secure
- [ ] Firewall configured (allow only 22, 80, 443)
- [ ] SSH key-based authentication enabled
- [ ] Root login disabled
- [ ] Regular security updates enabled
- [ ] Backup strategy implemented
- [ ] Log monitoring configured
- [ ] SSL certificates auto-renewing

## Performance Optimization

### Resource Limits

Current limits in docker-compose.prod.yml:
- Traefik: 0.5 CPU, 256MB RAM
- App: 2 CPU, 2GB RAM
- Postgres: 2 CPU, 2GB RAM
- Redis: 1 CPU, 512MB RAM
- ML Service: 2 CPU, 4GB RAM

Adjust based on your server capacity and load.

### Scaling

To scale the application:
```bash
# Not currently supported in single-node setup
# Consider Kubernetes or Docker Swarm for multi-node scaling
```

## Emergency Procedures

### Complete Restart

```bash
# Stop all services
docker compose -f docker-compose.prod.yml down

# Start all services
docker compose -f docker-compose.prod.yml up -d
```

### Rollback to Previous Version

```bash
# Stop current version
docker compose -f docker-compose.prod.yml down

# Restore previous database backup
docker exec -i scamnemesis-postgres psql -U postgres scamnemesis < backup_YYYYMMDD.sql

# Start services
docker compose -f docker-compose.prod.yml up -d
```

### Nuclear Option (Full Reset)

```bash
# WARNING: This will delete ALL data!
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d
```

## Support & Documentation

- Full Audit Report: See `DOCKER_COMPOSE_AUDIT_REPORT.md`
- Environment Variables: See `.env.example`
- Architecture: See main `README.md`

## Quick Reference Commands

```bash
# Start services
docker compose -f docker-compose.prod.yml up -d

# Stop services
docker compose -f docker-compose.prod.yml down

# Restart a service
docker compose -f docker-compose.prod.yml restart app

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Check status
docker compose -f docker-compose.prod.yml ps

# Run validation
./scripts/validate-production.sh

# Database backup
docker exec scamnemesis-postgres pg_dump -U postgres scamnemesis > backup.sql

# Database restore
docker exec -i scamnemesis-postgres psql -U postgres scamnemesis < backup.sql
```
