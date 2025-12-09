# Monitoring, Security & Operations - Scamnemesis

## 1. Monitoring & Observability

### 1.1 Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     OBSERVABILITY STACK                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐    │
│  │  Backend    │   │  Workers    │   │  Frontend   │   │  Database   │    │
│  │  App        │   │             │   │             │   │             │    │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘    │
│         │                 │                 │                 │            │
│         │ metrics         │ metrics         │ traces          │ metrics    │
│         │ traces          │ logs            │                 │            │
│         │ logs            │                 │                 │            │
│         │                 │                 │                 │            │
│         └────────────┬────┴─────────┬───────┴────────┬────────┘            │
│                      │              │                │                      │
│                      ▼              ▼                ▼                      │
│              ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│              │ Prometheus  │ │   Loki      │ │   Jaeger    │               │
│              │ (Metrics)   │ │   (Logs)    │ │  (Traces)   │               │
│              └──────┬──────┘ └──────┬──────┘ └──────┬──────┘               │
│                     │              │                │                       │
│                     └──────────────┼────────────────┘                       │
│                                    │                                        │
│                                    ▼                                        │
│                           ┌─────────────────┐                               │
│                           │     Grafana     │                               │
│                           │   (Dashboards)  │                               │
│                           └────────┬────────┘                               │
│                                    │                                        │
│                                    ▼                                        │
│                           ┌─────────────────┐                               │
│                           │   AlertManager  │                               │
│                           │   (Alerts)      │                               │
│                           └─────────────────┘                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Prometheus Configuration

```yaml
# config/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - /etc/prometheus/rules/*.yml

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['backend:3000']
    metrics_path: /metrics

  - job_name: 'ml-service'
    static_configs:
      - targets: ['ml-service:8000']
    metrics_path: /metrics

  - job_name: 'workers'
    static_configs:
      - targets:
          - 'image-worker:3000'
          - 'crawler-worker:3000'
          - 'ocr-worker:3000'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'typesense'
    static_configs:
      - targets: ['typesense:8108']
    metrics_path: /metrics.json
```

### 1.3 Alert Rules

```yaml
# config/prometheus/rules/scamnemesis.yml
groups:
  - name: scamnemesis-alerts
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m])) /
          sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: High error rate detected
          description: "Error rate is {{ $value | humanizePercentage }}"

      # Slow API response
      - alert: SlowAPIResponse
        expr: |
          histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: API response time is slow
          description: "95th percentile latency is {{ $value }}s"

      # Pending queue backlog
      - alert: PendingQueueBacklog
        expr: scamnemesis_pending_reports_total > 100
        for: 30m
        labels:
          severity: warning
        annotations:
          summary: Large pending report backlog
          description: "{{ $value }} reports pending approval"

      # Search latency
      - alert: HighSearchLatency
        expr: |
          histogram_quantile(0.95, rate(search_duration_seconds_bucket[5m])) > 0.3
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: Search latency is high
          description: "95th percentile search latency is {{ $value }}s"

      # Worker queue depth
      - alert: WorkerQueueBacklog
        expr: bull_queue_waiting_total > 1000
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: Worker queue backlog
          description: "{{ $labels.queue }} has {{ $value }} waiting jobs"

      # Disk space
      - alert: LowDiskSpace
        expr: |
          (node_filesystem_avail_bytes / node_filesystem_size_bytes) < 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: Low disk space
          description: "Less than 10% disk space remaining"

      # Database connections
      - alert: HighDatabaseConnections
        expr: pg_stat_activity_count > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High database connection count
          description: "{{ $value }} active database connections"

      # Memory usage
      - alert: HighMemoryUsage
        expr: |
          (container_memory_usage_bytes / container_spec_memory_limit_bytes) > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High memory usage
          description: "Container {{ $labels.container }} using {{ $value | humanizePercentage }} memory"
```

### 1.4 Key Metrics to Track

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| `http_requests_total` | Total HTTP requests | - |
| `http_request_duration_seconds` | Request latency | p95 > 500ms |
| `search_requests_total` | Search queries | - |
| `search_duration_seconds` | Search latency | p95 > 300ms |
| `reports_submitted_total` | New reports | - |
| `reports_approved_total` | Approved reports | - |
| `reports_pending_total` | Pending queue size | > 100 |
| `duplicates_detected_total` | Duplicate detections | - |
| `face_matches_total` | Face search matches | - |
| `ocr_extractions_total` | OCR processed | - |
| `crawler_jobs_total` | Crawler executions | - |
| `enrichment_matches_total` | Enrichment matches | - |
| `cache_hit_ratio` | Redis cache hit rate | < 60% |
| `db_connection_pool_size` | Active DB connections | > 80 |
| `storage_used_bytes` | S3 storage usage | > 80% quota |

### 1.5 Grafana Dashboards

**Dashboard 1: Overview**
- Total reports (submitted, approved, rejected)
- Active users
- Search queries/minute
- Error rate
- System health status

**Dashboard 2: API Performance**
- Request latency (p50, p95, p99)
- Requests per second
- Error rate by endpoint
- Response codes distribution

**Dashboard 3: Search & Duplicates**
- Search latency
- Cache hit ratio
- Duplicate detection rate
- Index size and lag

**Dashboard 4: Workers**
- Queue depths
- Processing rates
- Job success/failure rates
- Worker resource usage

**Dashboard 5: Infrastructure**
- CPU/Memory usage
- Disk usage
- Network I/O
- Database metrics

### 1.6 Structured Logging

```typescript
// src/utils/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: 'scamnemesis-backend',
    version: process.env.APP_VERSION,
    environment: process.env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Usage
logger.info({ reportId, action: 'approve' }, 'Report approved');
logger.error({ err, userId }, 'Authentication failed');
```

```json
// Example log output
{
  "level": "info",
  "time": "2024-01-15T14:32:00.000Z",
  "service": "scamnemesis-backend",
  "version": "1.0.0",
  "environment": "production",
  "reportId": "rpt_abc123",
  "action": "approve",
  "msg": "Report approved"
}
```

## 2. Security

### 2.1 Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYERS                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 1: EDGE / CDN                                                 │   │
│  │  • CloudFlare WAF                                                    │   │
│  │  • DDoS protection                                                   │   │
│  │  • Bot management                                                    │   │
│  │  • Rate limiting (global)                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 2: INGRESS                                                    │   │
│  │  • TLS termination (Let's Encrypt)                                   │   │
│  │  • Request validation                                                │   │
│  │  • Rate limiting (per-IP)                                            │   │
│  │  • CORS enforcement                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 3: APPLICATION                                                │   │
│  │  • JWT authentication                                                │   │
│  │  • RBAC authorization                                                │   │
│  │  • Input sanitization                                                │   │
│  │  • CAPTCHA verification                                              │   │
│  │  • API key validation                                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 4: DATA                                                       │   │
│  │  • Encryption at rest (AES-256)                                      │   │
│  │  • Encryption in transit (TLS 1.3)                                   │   │
│  │  • Field-level encryption (sensitive data)                           │   │
│  │  • Data masking                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Authentication & Authorization

```typescript
// JWT Configuration
const jwtConfig = {
  algorithm: 'RS256',
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  issuer: 'scamnemesis.com',
  audience: 'api.scamnemesis.com'
};

// RBAC Scopes
const scopes = {
  // Reports
  'reports:read': ['basic', 'standard', 'gold', 'admin'],
  'reports:write': ['standard', 'gold', 'admin'],
  'reports:approve': ['admin'],
  'reports:delete': ['admin'],

  // Search
  'search:basic': ['basic', 'standard', 'gold', 'admin'],
  'search:advanced': ['standard', 'gold', 'admin'],
  'search:face': ['gold', 'admin'],

  // Admin
  'admin:users': ['admin'],
  'admin:config': ['admin'],
  'admin:audit': ['admin'],

  // API
  'api:internal': ['api', 'admin']
};

// Middleware
const authorize = (requiredScope: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userScopes = req.user.scopes;
    if (!userScopes.includes(requiredScope)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### 2.3 Rate Limiting

```typescript
// Rate limiting configuration
const rateLimits = {
  // Global limits
  global: {
    windowMs: 60 * 1000,  // 1 minute
    max: 100,              // 100 requests per minute
    message: 'Too many requests'
  },

  // Per-endpoint limits
  endpoints: {
    '/reports': {
      windowMs: 60 * 60 * 1000,  // 1 hour
      max: 10,                    // 10 reports per hour
      keyGenerator: (req) => req.ip
    },
    '/search': {
      windowMs: 60 * 1000,
      max: 30,                    // 30 searches per minute
      keyGenerator: (req) => req.user?.id || req.ip
    },
    '/auth/token': {
      windowMs: 15 * 60 * 1000,  // 15 minutes
      max: 5,                     // 5 login attempts
      keyGenerator: (req) => req.ip
    },
    '/images/search': {
      windowMs: 60 * 1000,
      max: 10,                    // 10 face searches per minute
      keyGenerator: (req) => req.user?.id || req.ip
    }
  },

  // Role-based limits
  roles: {
    basic: { multiplier: 1 },
    standard: { multiplier: 3 },
    gold: { multiplier: 10 },
    admin: { multiplier: 100 }
  }
};
```

### 2.4 Input Sanitization

```typescript
// Input sanitization middleware
import { escape } from 'lodash';
import validator from 'validator';

const sanitizeInput = (input: any, schema: SanitizationSchema): any => {
  const sanitized: any = {};

  for (const [key, rules] of Object.entries(schema)) {
    let value = input[key];
    if (value === undefined) continue;

    // String sanitization
    if (typeof value === 'string') {
      // Remove HTML tags
      value = validator.stripLow(value);
      value = escape(value);

      // Trim whitespace
      value = value.trim();

      // Max length
      if (rules.maxLength) {
        value = value.slice(0, rules.maxLength);
      }

      // Specific patterns
      if (rules.pattern && !rules.pattern.test(value)) {
        throw new ValidationError(`Invalid format for ${key}`);
      }
    }

    sanitized[key] = value;
  }

  return sanitized;
};

// Phone normalization
const normalizePhone = (phone: string): string => {
  return phone.replace(/[^\d+]/g, '');
};

// Email normalization
const normalizeEmail = (email: string): string => {
  return validator.normalizeEmail(email) || email.toLowerCase().trim();
};

// IBAN normalization
const normalizeIBAN = (iban: string): string => {
  return iban.replace(/\s/g, '').toUpperCase();
};
```

### 2.5 File Upload Security

```typescript
// File validation
const fileValidation = {
  images: {
    maxSize: 20 * 1024 * 1024,  // 20MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif'
    ],
    magicBytes: {
      'image/jpeg': [0xFF, 0xD8, 0xFF],
      'image/png': [0x89, 0x50, 0x4E, 0x47],
      'image/gif': [0x47, 0x49, 0x46],
      'image/webp': [0x52, 0x49, 0x46, 0x46]
    }
  },
  documents: {
    maxSize: 20 * 1024 * 1024,
    allowedMimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/tiff'
    ]
  }
};

// Validate file magic bytes
const validateMagicBytes = (buffer: Buffer, expectedMime: string): boolean => {
  const expected = fileValidation.images.magicBytes[expectedMime];
  if (!expected) return true;

  for (let i = 0; i < expected.length; i++) {
    if (buffer[i] !== expected[i]) return false;
  }
  return true;
};

// Virus scanning
const scanFile = async (buffer: Buffer): Promise<ScanResult> => {
  const clamav = new ClamAV({ host: 'clamav', port: 3310 });
  const result = await clamav.scanBuffer(buffer);
  return {
    clean: !result.infected,
    virus: result.virus
  };
};
```

### 2.6 CAPTCHA Integration

```typescript
// reCAPTCHA v3 verification
const verifyCaptcha = async (token: string, action: string): Promise<boolean> => {
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET_KEY,
      response: token
    })
  });

  const data = await response.json();

  return (
    data.success &&
    data.action === action &&
    data.score >= 0.5  // Minimum score threshold
  );
};

// Usage in report submission
router.post('/reports', async (req, res) => {
  const { captchaToken, ...reportData } = req.body;

  // Verify CAPTCHA
  const isHuman = await verifyCaptcha(captchaToken, 'submit_report');
  if (!isHuman) {
    return res.status(400).json({ error: 'CAPTCHA verification failed' });
  }

  // Continue with report submission...
});
```

### 2.7 Secrets Management

```yaml
# External Secrets Operator configuration
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: vault-backend
  namespace: scamnemesis
spec:
  provider:
    vault:
      server: "https://vault.internal:8200"
      path: "secret"
      version: "v2"
      auth:
        kubernetes:
          mountPath: "kubernetes"
          role: "scamnemesis"
```

```bash
# Environment variables (never commit to git)
# .env.example
DATABASE_URL=postgresql://user:password@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=<generated-secret>
JWT_PRIVATE_KEY_PATH=/secrets/jwt-private.pem
JWT_PUBLIC_KEY_PATH=/secrets/jwt-public.pem
S3_ACCESS_KEY=<access-key>
S3_SECRET_KEY=<secret-key>
TYPESENSE_API_KEY=<api-key>
RECAPTCHA_SECRET_KEY=<secret-key>
ENCRYPTION_KEY=<32-byte-hex-key>
MASKING_SALT=<random-salt>
```

### 2.8 Audit Logging

```typescript
// Audit log for admin actions
interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
}

type AuditAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE'
  | 'REJECT'
  | 'MERGE'
  | 'EXPORT'
  | 'CONFIG_CHANGE'
  | 'LOGIN'
  | 'LOGOUT';

const auditLog = async (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
  await db.query(`
    INSERT INTO audit_logs (
      user_id, user_email, action, resource_type, resource_id,
      changes, ip_address, user_agent, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [
    entry.userId,
    entry.userEmail,
    entry.action,
    entry.resourceType,
    entry.resourceId,
    JSON.stringify(entry.changes),
    entry.ipAddress,
    entry.userAgent,
    JSON.stringify(entry.metadata)
  ]);
};
```

## 3. Backup & Disaster Recovery

### 3.1 Backup Strategy

| Data | Frequency | Retention | Method |
|------|-----------|-----------|--------|
| PostgreSQL | Hourly | 7 days | pg_dump + WAL archiving |
| PostgreSQL | Daily | 30 days | Full backup to S3 |
| PostgreSQL | Weekly | 1 year | Full backup to S3 Glacier |
| Redis | Hourly | 24 hours | RDB snapshot |
| MinIO/S3 | Continuous | Forever | Cross-region replication |
| Typesense | Daily | 7 days | Snapshot to S3 |

### 3.2 Backup Scripts

```bash
#!/bin/bash
# scripts/backup-postgres.sh

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="scamnemesis_${TIMESTAMP}.sql.gz"
S3_BUCKET="scamnemesis-backups"

# Create backup
pg_dump -h $POSTGRES_HOST -U $POSTGRES_USER $POSTGRES_DB | gzip > /tmp/$BACKUP_FILE

# Upload to S3
aws s3 cp /tmp/$BACKUP_FILE s3://$S3_BUCKET/postgres/$BACKUP_FILE

# Cleanup local file
rm /tmp/$BACKUP_FILE

# Remove old backups (keep last 7 days)
aws s3 ls s3://$S3_BUCKET/postgres/ | while read -r line; do
  createDate=$(echo $line | awk '{print $1" "$2}')
  createDate=$(date -d "$createDate" +%s)
  olderThan=$(date -d "7 days ago" +%s)
  if [[ $createDate -lt $olderThan ]]; then
    fileName=$(echo $line | awk '{print $4}')
    aws s3 rm s3://$S3_BUCKET/postgres/$fileName
  fi
done

echo "Backup completed: $BACKUP_FILE"
```

### 3.3 Recovery Time Objectives

| Scenario | RTO | RPO |
|----------|-----|-----|
| Single service failure | 5 min | 0 |
| Database failure | 15 min | 1 hour |
| Full cluster failure | 1 hour | 1 hour |
| Region failure | 4 hours | 1 hour |
