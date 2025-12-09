# Resource Estimates & Cost Analysis - Scamnemesis

## 1. Traffic Analysis (160k visits/day)

### 1.1 Traffic Patterns

| Metric | Value | Calculation |
|--------|-------|-------------|
| Daily visits | 160,000 | Given |
| Peak hour multiplier | 2x | Typical pattern |
| Average session duration | 3 min | Estimate |
| Pages per session | 5 | Estimate |
| Search queries per session | 2 | Estimate |

### 1.2 RPS Calculations

```
Daily visits: 160,000
Hours of activity: 16 (accounting for time zones)
Average hourly visits: 160,000 / 16 = 10,000 visits/hour
Peak hour visits: 10,000 * 2 = 20,000 visits/hour
Peak RPS: 20,000 / 3600 = ~5.5 requests/second (page views)

With 5 pages per session:
Peak page RPS: 5.5 * 5 = ~28 RPS

API calls per page (avg 3):
Peak API RPS: 28 * 3 = ~84 RPS

Search queries:
Daily searches: 160,000 * 2 = 320,000
Peak search RPS: ~18 RPS
```

### 1.3 Concurrent Users

```
Peak hour visitors: 20,000
Session duration: 3 min = 0.05 hours
Concurrent users: 20,000 * 0.05 = ~1,000 concurrent users
```

## 2. Storage Estimates

### 2.1 Database Size

| Table | Records/Year | Avg Size | Annual Growth |
|-------|--------------|----------|---------------|
| reports | 50,000 | 5 KB | 250 MB |
| perpetrators | 30,000 | 2 KB | 60 MB |
| evidence | 100,000 | 1 KB | 100 MB |
| evidence_images | 100,000 | 500 B | 50 MB |
| crawl_results | 1,000,000 | 2 KB | 2 GB |
| sanctions_entries | 500,000 | 1 KB | 500 MB |
| audit_logs | 2,000,000 | 500 B | 1 GB |
| **Total DB** | - | - | **~4 GB/year** |

### 2.2 Object Storage (S3/MinIO)

| Content Type | Files/Year | Avg Size | Annual Growth |
|--------------|------------|----------|---------------|
| Original images | 100,000 | 2 MB | 200 GB |
| Thumbnails (3 sizes) | 300,000 | 50 KB | 15 GB |
| Documents | 20,000 | 1 MB | 20 GB |
| Face crops | 50,000 | 100 KB | 5 GB |
| **Total Storage** | - | - | **~240 GB/year** |

### 2.3 Search Index Size

| Index | Records | Size/Record | Total |
|-------|---------|-------------|-------|
| Typesense (reports) | 50,000 | 2 KB | 100 MB |
| Typesense (perpetrators) | 30,000 | 1 KB | 30 MB |
| Vector embeddings (512-dim) | 100,000 | 2 KB | 200 MB |
| **Total Index** | - | - | **~330 MB** |

## 3. Compute Requirements

### 3.1 Service Resource Matrix

| Service | CPU (cores) | RAM | Instances | Notes |
|---------|-------------|-----|-----------|-------|
| Frontend | 0.5-1 | 512MB-1GB | 2-3 | SSR + static |
| Backend API | 1-2 | 1-2GB | 3-5 | Main workload |
| ML Service | 2-4 | 4-8GB | 2 | Embeddings, NER |
| Image Worker | 1-2 | 1-2GB | 2-3 | pHash, thumbnails |
| Crawler Worker | 0.5-1 | 512MB-1GB | 2-3 | I/O bound |
| OCR Worker | 2 | 2GB | 2 | CPU intensive |
| Face Worker (GPU) | 2 | 4GB + GPU | 1 | Optional |

### 3.2 Data Service Requirements

| Service | CPU | RAM | Storage | Instances |
|---------|-----|-----|---------|-----------|
| PostgreSQL | 4-8 | 8-16GB | 50GB SSD | 1 (HA: 2) |
| Redis | 1-2 | 2-4GB | 10GB | 1 (HA: 3) |
| Typesense | 2-4 | 4-8GB | 20GB SSD | 1 (HA: 3) |
| MinIO | 2 | 4GB | 500GB | 1 (HA: 4) |

## 4. Cost Estimates

### 4.1 MVP Setup (Low-cost Start)

**Target:** <$200/month

| Component | Solution | Cost/Month |
|-----------|----------|------------|
| VPS (main) | Hetzner CX41 (4 vCPU, 16GB) | $18 |
| VPS (workers) | Hetzner CX21 (2 vCPU, 4GB) | $6 |
| Managed PostgreSQL | - (self-hosted on main) | $0 |
| Object Storage | Hetzner Storage Box 1TB | $4 |
| Domain + SSL | CloudFlare Free | $0 |
| Backups | Hetzner Snapshots | $3 |
| **Total** | | **~$31/month** |

**Alternative with managed DB:**

| Component | Solution | Cost/Month |
|-----------|----------|------------|
| VPS (app) | DigitalOcean Droplet 4GB | $24 |
| Managed PostgreSQL | DO Managed DB (Basic) | $15 |
| Spaces (S3) | 250GB | $5 |
| **Total** | | **~$44/month** |

### 4.2 Growth Setup ($500-1000/month)

**Target:** 50k-100k visits/day

| Component | Solution | Cost/Month |
|-----------|----------|------------|
| App servers (2x) | Hetzner CPX31 (4 vCPU, 8GB) | $26 |
| Worker server | Hetzner CPX21 (3 vCPU, 4GB) | $10 |
| PostgreSQL | Hetzner dedicated (8 vCPU, 32GB) | $60 |
| Redis | Self-hosted | $0 |
| Typesense | Self-hosted | $0 |
| MinIO | Hetzner Storage Box 2TB | $8 |
| Load Balancer | Hetzner LB | $6 |
| Backups | Off-site | $10 |
| **Total** | | **~$120/month** |

### 4.3 Scale Setup ($2000-5000/month)

**Target:** 160k+ visits/day, full features

**Option A: Self-hosted Kubernetes (Hetzner)**

| Component | Solution | Cost/Month |
|-----------|----------|------------|
| K8s nodes (3x) | Hetzner CCX32 (8 vCPU, 32GB) | $285 |
| Database node | Hetzner CCX42 (16 vCPU, 64GB) | $190 |
| GPU node (optional) | Hetzner GPU (RTX 4000) | $250 |
| Storage | 5TB across nodes | $40 |
| Load Balancer | Hetzner LB11 | $6 |
| Backup storage | 1TB S3-compatible | $20 |
| **Total** | | **~$791/month** |

**Option B: Managed Kubernetes (GKE)**

| Component | Solution | Cost/Month |
|-----------|----------|------------|
| GKE cluster | Standard (3x e2-standard-4) | $300 |
| Cloud SQL | PostgreSQL (db-standard-4) | $180 |
| Memorystore | Redis 5GB | $120 |
| Cloud Storage | 500GB | $15 |
| Cloud CDN | 1TB egress | $85 |
| GPU (optional) | 1x T4 preemptible | $150 |
| **Total** | | **~$850/month** |

**Option C: AWS**

| Component | Solution | Cost/Month |
|-----------|----------|------------|
| EKS | + 3x t3.xlarge | $450 |
| RDS PostgreSQL | db.r5.large | $250 |
| ElastiCache | cache.r5.large | $200 |
| S3 + CloudFront | 500GB + 1TB | $80 |
| **Total** | | **~$980/month** |

### 4.4 Cost Comparison Summary

| Setup | Monthly Cost | Daily Visitors | Cost/1k visitors |
|-------|--------------|----------------|------------------|
| MVP | $31-50 | 10k | $3-5 |
| Growth | $120-200 | 50k | $2.4-4 |
| Scale (self-hosted) | $800 | 160k | $5 |
| Scale (managed) | $850-1000 | 160k | $5.3-6.25 |

## 5. Performance Targets

### 5.1 Latency Targets

| Operation | Target (p50) | Target (p95) | Target (p99) |
|-----------|--------------|--------------|--------------|
| Page load | 500ms | 1s | 2s |
| API response | 100ms | 300ms | 500ms |
| Search query | 100ms | 200ms | 400ms |
| Image upload | 1s | 3s | 5s |
| Report submission | 500ms | 1s | 2s |
| Face search | 500ms | 1s | 2s |

### 5.2 Throughput Targets

| Operation | Target RPS | Burst |
|-----------|------------|-------|
| API (total) | 100 | 500 |
| Search | 50 | 200 |
| Report submission | 10 | 50 |
| Image upload | 20 | 100 |

### 5.3 Availability Targets

| Tier | Uptime | Downtime/month |
|------|--------|----------------|
| MVP | 99% | 7.2 hours |
| Growth | 99.5% | 3.6 hours |
| Scale | 99.9% | 43 minutes |

## 6. Scaling Recommendations

### 6.1 Horizontal Scaling Triggers

| Metric | Scale Up | Scale Down |
|--------|----------|------------|
| CPU utilization | > 70% | < 30% |
| Memory utilization | > 80% | < 40% |
| Request latency (p95) | > 300ms | - |
| Queue depth | > 1000 | < 100 |

### 6.2 Database Scaling Path

1. **MVP:** Single PostgreSQL instance (4 vCPU, 16GB)
2. **Growth:** Read replicas for search queries
3. **Scale:** PostgreSQL cluster with pgpool-II or Patroni
4. **Enterprise:** Dedicated write + multiple read replicas + connection pooling

### 6.3 Search Scaling Path

1. **MVP:** PostgreSQL pg_trgm + single Typesense node
2. **Growth:** Typesense 3-node cluster
3. **Scale:** OpenSearch 3+ node cluster with dedicated master nodes
