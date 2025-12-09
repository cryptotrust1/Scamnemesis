# Scamnemesis - Setup Guide

Complete installation and deployment guide for the duplicate detection system.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Development Setup](#development-setup)
4. [Production Deployment](#production-deployment)
5. [Configuration](#configuration)
6. [Testing](#testing)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Docker** >= 20.10 and **Docker Compose** >= 2.0
- **Node.js** >= 18.x (for local development)
- **Python** >= 3.10 (for ML service development)
- **PostgreSQL** >= 14 with pgvector extension
- **Redis** >= 7.0

### System Requirements

- **RAM**: Minimum 8GB, recommended 16GB
- **Storage**: Minimum 20GB free space
- **CPU**: Multi-core processor recommended for ML workloads

---

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/yourorg/scamnemesis.git
cd scamnemesis
```

### 2. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit configuration (use your preferred editor)
nano .env
```

### 3. Start Services with Docker Compose

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Initialize Database

```bash
# Run migrations
docker-compose exec postgres psql -U postgres -d scamnemesis -f /docker-entrypoint-initdb.d/001_duplicate_detection.sql

# Or if running locally:
npm run db:migrate
```

### 5. Verify ML Service

```bash
# Check ML service health
curl http://localhost:8000/health

# Test embedding generation
curl -X POST http://localhost:8000/api/v1/embeddings/generate-from-text \
  -H "Content-Type: application/json" \
  -d '{"text": "Test report about Jan Novak"}'
```

### 6. Access Services

- **ML Service API**: http://localhost:8000
- **ML Service Docs**: http://localhost:8000/docs
- **pgAdmin** (optional): http://localhost:5050
- **Redis Commander** (optional): http://localhost:8081

---

## Development Setup

### Frontend/API (Node.js/TypeScript)

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
```

### ML Service (Python)

```bash
cd services/ml

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server (with auto-reload)
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

### Background Worker

```bash
# Run duplicate detection worker
npm run worker:duplicate-detection
```

---

## Production Deployment

### 1. Prepare Environment

```bash
# Create production .env
cp .env.example .env.production

# Set production values
nano .env.production
```

**Important production settings:**

```bash
# Use strong passwords
POSTGRES_PASSWORD=<strong-random-password>
JWT_SECRET=<strong-random-secret>
SESSION_SECRET=<strong-random-secret>

# Restrict CORS
ALLOWED_ORIGINS=https://yourdomain.com

# Production ML service
ML_SERVICE_URL=http://ml-service:8000

# Enable production logging
LOG_LEVEL=WARNING
```

### 2. Build Images

```bash
# Build ML service
docker-compose build ml-service

# Or build all services
docker-compose build
```

### 3. Deploy with Docker Compose

```bash
# Start in production mode
docker-compose --env-file .env.production up -d

# Scale workers if needed
docker-compose up -d --scale worker=3
```

### 4. Setup Reverse Proxy (Nginx)

```nginx
# /etc/nginx/sites-available/scamnemesis

upstream ml_service {
    server localhost:8000;
}

server {
    listen 443 ssl http2;
    server_name api.scamnemesis.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location /ml/ {
        proxy_pass http://ml_service/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeout for ML operations
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }
}
```

### 5. Setup Process Manager (PM2)

If not using Docker:

```bash
# Install PM2
npm install -g pm2

# Start services
pm2 start ecosystem.config.js

# Save configuration
pm2 save

# Setup auto-start
pm2 startup
```

**ecosystem.config.js:**

```javascript
module.exports = {
  apps: [
    {
      name: 'scamnemesis-api',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'duplicate-worker',
      script: 'npm',
      args: 'run worker:duplicate-detection',
      instances: 2,
      exec_mode: 'cluster'
    }
  ]
};
```

---

## Configuration

### Duplicate Detection Thresholds

Edit thresholds in database or via admin UI:

```sql
-- Update default thresholds
UPDATE duplicate_thresholds
SET
  jaro_winkler_min = 0.90,
  vector_similarity_min = 0.88,
  overall_confidence_min = 0.80
WHERE name = 'default';

-- Create custom threshold profile
INSERT INTO duplicate_thresholds (name, description, is_active)
VALUES ('custom', 'Custom profile for testing', true);
```

### Performance Tuning

**PostgreSQL (`postgresql.conf`):**

```ini
# Connection settings
max_connections = 100
shared_buffers = 2GB
effective_cache_size = 6GB

# Vector search optimization
maintenance_work_mem = 1GB
work_mem = 64MB

# Checkpoint settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB
```

**Redis (`redis.conf`):**

```ini
maxmemory 2gb
maxmemory-policy allkeys-lru
save 60 1000
```

**ML Service (Gunicorn in production):**

```bash
# services/ml/gunicorn.conf.py
workers = 4
worker_class = "uvicorn.workers.UvicornWorker"
bind = "0.0.0.0:8000"
timeout = 120
keepalive = 5
```

---

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm test -- --coverage
```

### Integration Tests

```bash
# Test duplicate detection pipeline
npm run test:integration

# Test specific scenario
npm test -- duplicate-detection.test.ts
```

### Load Testing

```bash
# Install k6 (load testing tool)
brew install k6  # macOS
# or download from https://k6.io

# Run load test
k6 run tests/load/duplicate-detection.js
```

**Example load test (`tests/load/duplicate-detection.js`):**

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 10 },  // Ramp-up
    { duration: '5m', target: 50 },  // Stay at 50 users
    { duration: '2m', target: 0 },   // Ramp-down
  ],
};

export default function () {
  const payload = JSON.stringify({
    scammer_name: 'Test User',
    description: 'Test fraud report',
    phone: '+421911123456',
  });

  const res = http.post('http://localhost:3000/api/reports', payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'status is 201': (r) => r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

---

## Monitoring

### Health Checks

```bash
# Check all services
curl http://localhost:8000/health  # ML Service
curl http://localhost:3000/health  # API (if implemented)

# Check database
docker-compose exec postgres pg_isready -U postgres

# Check Redis
docker-compose exec redis redis-cli ping
```

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f ml-service
docker-compose logs -f postgres

# Export logs
docker-compose logs --no-color > logs.txt
```

### Metrics Dashboard

**Prometheus + Grafana (optional):**

```yaml
# docker-compose.monitoring.yml
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

### Database Monitoring

```sql
-- Check duplicate detection statistics
SELECT
  COUNT(*) as total_reports,
  SUM(CASE WHEN has_duplicates THEN 1 ELSE 0 END) as with_duplicates,
  ROUND(SUM(CASE WHEN has_duplicates THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as duplicate_rate_pct
FROM fraud_reports;

-- Check cluster statistics
SELECT
  merge_status,
  COUNT(*) as cluster_count,
  AVG(total_reports) as avg_reports_per_cluster,
  AVG(avg_confidence) as avg_confidence
FROM duplicate_clusters
GROUP BY merge_status;

-- Check detection job status
SELECT
  status,
  COUNT(*) as job_count,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration_sec
FROM duplicate_detection_jobs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status;
```

---

## Troubleshooting

### Common Issues

#### 1. ML Service Out of Memory

**Symptoms:** ML service crashes or becomes unresponsive

**Solution:**

```bash
# Increase Docker memory limit
docker update --memory 4g --memory-swap 4g scamnemesis-ml

# Or in docker-compose.yml
services:
  ml-service:
    deploy:
      resources:
        limits:
          memory: 4G
```

#### 2. Slow Vector Search

**Symptoms:** Vector similarity queries take >5 seconds

**Solution:**

```sql
-- Rebuild HNSW index with better parameters
DROP INDEX idx_fraud_reports_embedding;

CREATE INDEX idx_fraud_reports_embedding ON fraud_reports
USING hnsw (embedding vector_cosine_ops)
WITH (m = 32, ef_construction = 128);  -- Higher values = better accuracy, slower build

-- Vacuum and analyze
VACUUM ANALYZE fraud_reports;
```

#### 3. Background Jobs Not Processing

**Symptoms:** Duplicate detection jobs stuck in "pending"

**Solution:**

```bash
# Check Redis connection
docker-compose exec redis redis-cli ping

# Check worker logs
docker-compose logs -f worker

# Restart worker
docker-compose restart worker

# Check job queue
docker-compose exec redis redis-cli LLEN bullmq:duplicate-detection
```

#### 4. High False Positive Rate

**Symptoms:** Too many non-duplicates flagged

**Solution:**

```sql
-- Switch to strict thresholds
UPDATE duplicate_thresholds
SET is_active = false
WHERE name = 'default';

UPDATE duplicate_thresholds
SET is_active = true
WHERE name = 'strict';
```

#### 5. Image Hashing Fails

**Symptoms:** Error computing image hashes

**Solution:**

```bash
# Check PIL/Pillow installation
docker-compose exec ml-service python -c "from PIL import Image; print('OK')"

# Reinstall imagehash
docker-compose exec ml-service pip install --force-reinstall imagehash
```

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=DEBUG

# Run ML service with debug
docker-compose run --rm ml-service python -m pdb api.py

# Check database connections
docker-compose exec postgres psql -U postgres -d scamnemesis -c "SELECT COUNT(*) FROM pg_stat_activity;"
```

### Performance Profiling

```python
# Add to ML service for profiling
import cProfile
import pstats

profiler = cProfile.Profile()
profiler.enable()

# Your code here
service.generate_embedding(text)

profiler.disable()
stats = pstats.Stats(profiler)
stats.sort_stats('cumulative')
stats.print_stats(20)
```

---

## Backup and Recovery

### Database Backup

```bash
# Full backup
docker-compose exec postgres pg_dump -U postgres scamnemesis > backup_$(date +%Y%m%d).sql

# Backup with compression
docker-compose exec postgres pg_dump -U postgres scamnemesis | gzip > backup_$(date +%Y%m%d).sql.gz

# Automated daily backup
crontab -e
# Add: 0 2 * * * /path/to/backup-script.sh
```

### Restore from Backup

```bash
# Restore full database
docker-compose exec -T postgres psql -U postgres scamnemesis < backup.sql

# Restore compressed backup
gunzip -c backup.sql.gz | docker-compose exec -T postgres psql -U postgres scamnemesis
```

---

## Security Best Practices

1. **Change default passwords** in production
2. **Enable SSL/TLS** for all connections
3. **Restrict network access** using firewalls
4. **Regularly update** dependencies
5. **Implement rate limiting** on API endpoints
6. **Sanitize user inputs** to prevent SQL injection
7. **Use secrets management** (e.g., HashiCorp Vault)
8. **Enable audit logging** for admin actions
9. **Implement RBAC** (Role-Based Access Control)
10. **Regular security audits** and penetration testing

---

## Support

For issues and questions:

- GitHub Issues: https://github.com/yourorg/scamnemesis/issues
- Documentation: https://docs.scamnemesis.com
- Email: support@scamnemesis.com

---

## License

MIT License - See LICENSE file for details
