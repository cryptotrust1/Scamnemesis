# Scamnemesis - Technická Architektúra a Stack Analýza

## 1. ARCHITEKTÚRA OVERVIEW

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            USERS / CLIENTS                               │
│                    (Web Browser, Mobile, API Clients)                    │
└────────────┬────────────────────────────────────────┬───────────────────┘
             │                                        │
             │                                        │
┌────────────▼────────────────┐          ┌───────────▼──────────────────┐
│   WordPress Frontend        │          │    Admin Dashboard           │
│   ┌──────────────────────┐  │          │    (React/Vue SPA)           │
│   │ WP Plugin UI         │  │          │                              │
│   │ - Search Widget      │  │          └──────────┬───────────────────┘
│   │ - Report Form        │  │                     │
│   │ - Results Display    │  │                     │
│   └──────────┬───────────┘  │                     │
└──────────────┼──────────────┘                     │
               │                                     │
               │                                     │
┌──────────────▼─────────────────────────────────────▼───────────────────┐
│                         API GATEWAY                                     │
│                    (Kong / Nginx / Traefik)                            │
│   - Rate Limiting    - Authentication    - Load Balancing              │
│   - SSL Termination  - Request Routing   - Circuit Breaking            │
└────────────┬────────────────────────────────────────────────────────────┘
             │
             │
┌────────────▼────────────────────────────────────────────────────────────┐
│                      BACKEND MICROSERVICES                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   Report     │  │    Search    │  │  Enrichment  │  │   Auth     │ │
│  │   Service    │  │   Service    │  │   Service    │  │  Service   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬─────┘ │
│         │                 │                 │                 │        │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼─────┐ │
│  │   Analysis   │  │  Notification│  │   Crawling   │  │   Admin    │ │
│  │   Service    │  │   Service    │  │   Service    │  │  Service   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬─────┘ │
└─────────┼──────────────────┼──────────────────┼──────────────────┼──────┘
          │                  │                  │                  │
          │                  │                  │                  │
┌─────────▼──────────────────▼──────────────────▼──────────────────▼──────┐
│                        MESSAGE QUEUE                                    │
│                  (RabbitMQ / Redis Streams / Kafka)                     │
│   Queues: ocr-processing, face-detection, web-crawling,                │
│           risk-analysis, notifications, data-enrichment                 │
└────────────┬─────────────────────────────────────────────────────────────┘
             │
             │
┌────────────▼────────────────────────────────────────────────────────────┐
│                        WORKER PROCESSES                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  OCR Worker  │  │     Face     │  │   Crawler    │  │  Enrichment│ │
│  │  (Tesseract) │  │   Detection  │  │   Worker     │  │   Worker   │ │
│  │              │  │   (MTCNN/    │  │  (Puppeteer) │  │            │ │
│  │              │  │   FaceNet)   │  │              │  │            │ │
│  └──────────────┘  └──────┬───────┘  └──────────────┘  └────────────┘ │
│                           │ (GPU)                                       │
└───────────────────────────┼─────────────────────────────────────────────┘
                            │
                            │
┌───────────────────────────▼─────────────────────────────────────────────┐
│                       DATA LAYER                                        │
│                                                                          │
│  ┌──────────────────┐   ┌──────────────────┐   ┌────────────────────┐  │
│  │   PRIMARY DB     │   │   SEARCH ENGINE  │   │    VECTOR DB       │  │
│  │   PostgreSQL     │   │   OpenSearch/    │   │   Weaviate/Milvus/ │  │
│  │   (or MongoDB)   │   │   Meilisearch/   │   │   Pinecone/        │  │
│  │                  │   │   Typesense      │   │   pgvector         │  │
│  │  - Reports       │   │                  │   │                    │  │
│  │  - Users         │   │  - Fuzzy Search  │   │  - Face Embeddings │  │
│  │  - Comments      │   │  - Full-Text     │   │  - Semantic Search │  │
│  │  - Analytics     │   │  - Faceted       │   │  - Similar Faces   │  │
│  └──────────────────┘   └──────────────────┘   └────────────────────┘  │
│                                                                          │
│  ┌──────────────────┐   ┌──────────────────┐   ┌────────────────────┐  │
│  │  CACHE LAYER     │   │  OBJECT STORAGE  │   │   REDIS            │  │
│  │  Redis           │   │  MinIO / S3      │   │   (Sessions)       │  │
│  │  - Query Cache   │   │                  │   │   - Rate Limiting  │  │
│  │  - Session Store │   │  - Images        │   │   - Pub/Sub        │  │
│  │  - Pub/Sub       │   │  - Documents     │   │   - Temp Data      │  │
│  └──────────────────┘   │  - Screenshots   │   └────────────────────┘  │
│                         └──────────────────┘                            │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                    │
│  - Email (SendGrid/Mailgun)   - SMS (Twilio)                           │
│  - Payment Gateway            - reCAPTCHA                               │
│  - Cloud CDN                  - Monitoring (Prometheus/Grafana)         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Komponenty Popis

#### 1. **WordPress Plugin (Frontend Layer)**
- Vlastný plugin integrovaný do WordPress
- Shortcodes pre report form a search widget
- REST API wrapper komunikujúci s backend services
- Admin settings page pre konfiguráciu

#### 2. **API Gateway**
- Centrálny vstupný bod pre všetky requesty
- Rate limiting, authentication, SSL termination
- Load balancing medzi backend services

#### 3. **Backend Microservices**
- **Report Service**: Správa fraud reportov (CRUD)
- **Search Service**: Vyhľadávanie reportov, fuzzy search
- **Enrichment Service**: Automatické obohacovanie dát (OSINT, social media)
- **Analysis Service**: Risk scoring, pattern detection, ML models
- **Crawling Service**: Web scraping pre URLs v reportoch
- **Notification Service**: Email, SMS, push notifikácie
- **Auth Service**: Autentifikácia, autorizácia, JWT tokeny
- **Admin Service**: Admin dashboard backend

#### 4. **Message Queue**
- Asynchrónne spracovanie úloh
- Decoupling medzi services a workers
- Retry mechanism, dead letter queues

#### 5. **Worker Processes**
- **OCR Worker**: Extrakcia textu z obrázkov (Tesseract)
- **Face Detection Worker**: Detekcia a embedding tvárí (GPU required)
- **Crawler Worker**: Automatický web scraping (Puppeteer/Playwright)
- **Enrichment Worker**: OSINT enrichment, social media scraping

#### 6. **Data Layer**
- **Primary DB**: Hlavná databáza pre štruktúrované dáta
- **Search Engine**: Full-text a fuzzy search
- **Vector DB**: Face embeddings pre similarity search
- **Object Storage**: Súbory, obrázky, dokumenty
- **Cache**: Redis pre performance optimization

---

## 2. TECH STACK POROVNANIE

### 2.1 Frontend Options

#### **Option 1: React + Next.js**

**Výhody:**
- ✅ Server-Side Rendering (SSR) + Static Site Generation (SSG)
- ✅ Najväčší ekosystém a komunita
- ✅ Vynikajúca podpora TypeScript
- ✅ Built-in API routes pre lightweight backend
- ✅ Automatic code splitting a optimalizácia
- ✅ React 18+ Server Components (RSC)
- ✅ Vynikajúce SEO možnosti
- ✅ Vercel deployment (seamless CI/CD)
- ✅ Image optimization out-of-the-box

**Nevýhody:**
- ❌ Komplexnejšia learning curve
- ❌ Väčší bundle size ako Vanilla JS
- ❌ Overkill pre jednoduché WordPress widgety
- ❌ Vyžaduje Node.js runtime pre SSR
- ❌ Môže byť náročnejšie integrovať do WordPress ekosystému

**Kedy použiť:**
- Standalone admin dashboard oddelený od WordPress
- Potreba SSR pre SEO a performance
- Komplexné interaktívne UI (dashboards, analytics)
- Team má React expertise

**Konfigurácia:**
```bash
# Production build size: ~80-120KB (gzipped)
# Development server: Node.js 18+
# Build time: 30-60s pre medium app
```

---

#### **Option 2: Vue.js + Nuxt**

**Výhody:**
- ✅ Jednoduchší a intuitívnejší než React
- ✅ SSR/SSG cez Nuxt 3
- ✅ Lepší performance than React (lightweight runtime)
- ✅ Auto-imports, file-based routing
- ✅ Vynikajúce DevTools
- ✅ Composables a modularita
- ✅ TypeScript support (Nuxt 3)
- ✅ Menší bundle size

**Nevýhody:**
- ❌ Menší ekosystém než React
- ❌ Menej third-party libraries
- ❌ Nuxt 3 je relatívne nový (breaking changes)
- ❌ Menšia komunita v porovnaní s React
- ❌ Hiring pool je menší

**Kedy použiť:**
- Team preferuje Vue syntax
- Potreba rýchleho vývoja s menším boilerplate
- Admin dashboard s dobrým DX (Developer Experience)
- Startup s potrebou rýchleho MVP

**Konfigurácia:**
```bash
# Production build size: ~60-90KB (gzipped)
# Development server: Node.js 18+
# Build time: 20-40s pre medium app
```

---

#### **Option 3: Vanilla JS + Alpine.js (WordPress Native)**

**Výhody:**
- ✅ Minimálny bundle size (~15KB gzipped)
- ✅ Perfektná integrácia s WordPress
- ✅ Žiadny build step (môže byť)
- ✅ Progressive enhancement friendly
- ✅ Rýchle načítavanie a rendering
- ✅ Jednoduchá learning curve
- ✅ SEO-friendly (server-rendered HTML)
- ✅ Nízke náklady na hosting

**Nevýhody:**
- ❌ Obmedzené možnosti pre komplexné UI
- ❌ Manuálne state management
- ❌ Slabší tooling než modern frameworks
- ❌ TypeScript podpora slabšia
- ❌ Náročnejšie testovanie
- ❌ Nie je vhodné pre veľké SPAs

**Kedy použiť:**
- WordPress plugin s jednoduchými widgetmi
- Potreba minimálneho JS footprint
- SEO je kritické
- Team nemá frontend framework expertise
- Budget constraints

**Konfigurácia:**
```bash
# Production build size: ~15-30KB (gzipped)
# No build step required (optional Vite/esbuild)
# Instant rendering (no hydration needed)
```

---

### **FRONTEND ODPORÚČANIE:**

```
┌─────────────────────────────────────────────────────────────┐
│  MVP (WordPress Integration): Vanilla JS + Alpine.js        │
│  Dôvod: Minimálne náklady, perfektná WP integrácia,         │
│         SEO-friendly, rýchly development                    │
│                                                              │
│  Admin Dashboard (Standalone): React + Next.js              │
│  Dôvod: Komplexné UI, SSR pre performance, veľký ekosystém, │
│         TypeScript, reusable components                     │
│                                                              │
│  Hybrid Approach: Alpine.js pre WP plugin widgets           │
│                   + Next.js pre admin dashboard             │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.2 Backend Options

#### **Option 1: Node.js + TypeScript + NestJS**

**Výhody:**
- ✅ Full-stack JavaScript (frontend + backend tá istá reč)
- ✅ NestJS = Angular-like architecture (modularita, DI)
- ✅ Vynikajúci TypeScript support
- ✅ Dekoratéry, middleware, guards out-of-the-box
- ✅ Built-in GraphQL, WebSocket support
- ✅ Microservices-ready (TCP, Redis, NATS transporters)
- ✅ Obrovský NPM ekosystém
- ✅ Async I/O (excellent pre I/O-bound tasks)
- ✅ Jednoduchá integrácia s MongoDB, PostgreSQL

**Nevýhody:**
- ❌ Single-threaded (CPU-intensive tasks sú problém)
- ❌ Vyššia memory consumption než Go
- ❌ Pomalší než Go/Rust pre high-throughput
- ❌ Callback hell / Promise chains (ak nie async/await)
- ❌ NestJS má steep learning curve

**Performance:**
```
Throughput: ~15,000-20,000 req/s (single instance)
Latency: ~10-20ms (median)
Memory: ~100-200MB base + ~50MB per million requests
CPU: Medium (single core utilization)
```

**Kedy použiť:**
- Full-stack JavaScript team
- Potreba rýchleho vývoja s TypeScript
- I/O-bound workloads (API calls, DB queries)
- Microservices s GraphQL/WebSockets

**Konfigurácia:**
```yaml
# Docker container
Runtime: Node.js 20 LTS
Framework: NestJS 10+
CPU: 2 cores
RAM: 512MB-1GB (per instance)
Scaling: Horizontal (PM2 cluster mode / K8s replicas)
```

---

#### **Option 2: Python + FastAPI**

**Výhody:**
- ✅ Najrýchlejší Python framework (async via Starlette)
- ✅ Automatická OpenAPI/Swagger dokumentácia
- ✅ Pydantic validácia (type safety)
- ✅ Vynikajúci pre ML/AI integráciu (TensorFlow, PyTorch)
- ✅ Jednoduchá syntax, rýchly development
- ✅ Async/await support
- ✅ Obrovský ekosystém pre data science
- ✅ Perfektný pre GPU-based workers (face detection, OCR)

**Nevýhody:**
- ❌ Pomalší než Go (ale rýchlejší než Django/Flask)
- ❌ GIL (Global Interpreter Lock) limituje CPU parallelism
- ❌ Vyššia memory consumption
- ❌ Menej vhodný pre real-time low-latency apps
- ❌ Dependency management môže byť problém (Poetry/pip)

**Performance:**
```
Throughput: ~10,000-15,000 req/s (single instance)
Latency: ~15-30ms (median)
Memory: ~50-100MB base + ~30MB per million requests
CPU: Medium-High (GIL je bottleneck)
```

**Kedy použiť:**
- ML/AI workloads (face detection, NLP, OCR)
- Data processing pipelines
- Team má Python expertise
- Potreba rýchleho prototypovania

**Konfigurácia:**
```yaml
# Docker container
Runtime: Python 3.11+ (uvicorn)
Framework: FastAPI 0.104+
CPU: 2-4 cores
RAM: 512MB-2GB (závisí na ML models)
Scaling: Horizontal (Gunicorn workers + uvicorn)
```

---

#### **Option 3: Go + Gin**

**Výhody:**
- ✅ Najrýchlejší z týchto troch options
- ✅ Low memory footprint
- ✅ Built-in concurrency (goroutines)
- ✅ Staticky kompilovaný binárka (malá Docker image)
- ✅ Vynikajúci pre high-throughput APIs
- ✅ Fast compilation
- ✅ Strong typing (type safety)
- ✅ Perfektný pre crawling workers (parallel scraping)

**Nevýhody:**
- ❌ Menší ekosystém než Node.js/Python
- ❌ Verbose syntax (viac boilerplate)
- ❌ Error handling môže byť tedious (if err != nil)
- ❌ Menej third-party libraries
- ❌ Generics sú nové (Go 1.18+)
- ❌ Ťažšie integrovať ML/AI

**Performance:**
```
Throughput: ~30,000-50,000 req/s (single instance)
Latency: ~5-10ms (median)
Memory: ~10-30MB base + ~10MB per million requests
CPU: Low (efficient goroutines)
```

**Kedy použiť:**
- High-performance APIs (search, indexing)
- Crawling workers (parallel web scraping)
- Real-time systems (WebSocket servers)
- Potreba nízkych nákladov (malá memory footprint)

**Konfigurácia:**
```yaml
# Docker container
Runtime: Go 1.21+
Framework: Gin 1.9+
CPU: 1-2 cores
RAM: 128-512MB (per instance)
Scaling: Horizontal (goroutines handle concurrency)
```

---

### **BACKEND ODPORÚČANIE:**

```
┌──────────────────────────────────────────────────────────────┐
│  HYBRID APPROACH (best of all worlds):                        │
│                                                               │
│  1. API Services: Go + Gin                                   │
│     - Report Service, Search Service, Auth Service           │
│     - Dôvod: High performance, low cost, horizontal scaling  │
│                                                               │
│  2. ML Workers: Python + FastAPI                             │
│     - Face Detection, OCR, Analysis Service                  │
│     - Dôvod: ML ecosystem, GPU support, numpy/pandas         │
│                                                               │
│  3. Admin Dashboard Backend: Node.js + NestJS (optional)     │
│     - Ak frontend je Next.js, môže zdieľať kód               │
│     - Dôvod: TypeScript, full-stack consistency              │
│                                                               │
│  MVP Single Stack: Python + FastAPI                          │
│  Dôvod: Rýchly development, ML-ready, jedna reč pre všetko  │
│                                                               │
│  Production Scale: Go (core APIs) + Python (ML workers)      │
│  Dôvod: Performance + ML capabilities                        │
└──────────────────────────────────────────────────────────────┘
```

---

### 2.3 Database Options

#### **Option 1: PostgreSQL (Relational)**

**Výhody:**
- ✅ ACID compliance (data integrity)
- ✅ Komplexné queries (JOINs, subqueries, CTEs)
- ✅ JSON/JSONB support (hybrid approach)
- ✅ Full-text search (built-in)
- ✅ **pgvector extension** (Vector DB v jednom!)
- ✅ Partitioning, indexing, performance tuning
- ✅ Mature ecosystem, veľká komunita
- ✅ PostGIS pre geolocation data
- ✅ Triggers, stored procedures
- ✅ Vynikajúce backup/restore tools

**Nevýhody:**
- ❌ Rigidná schéma (migrations potrebné)
- ❌ Horizontálne škálovanie ťažšie než MongoDB
- ❌ Pomalší writes než NoSQL (ACID overhead)
- ❌ Komplexnejšia konfigurácia pre high-performance

**Use Case Fit pre Fraud Reports:**
```
✅ Štruktúrované dáta (users, reports, comments)
✅ Relačné prepojenia (report -> user -> comments)
✅ ACID je kritické (financial fraud data)
✅ Komplexné analytické queries
✅ pgvector = Vector DB + Relational DB v jednom
```

**Konfigurácia:**
```yaml
# Production setup
Version: PostgreSQL 16
Extensions: pgvector, pg_trgm (fuzzy search), uuid-ossp
RAM: 4-8GB (shared_buffers: 25% RAM)
Storage: SSD (IOPS-critical)
Connections: max_connections = 200
Indexes: B-tree (primary), GiST (fuzzy), HNSW (vectors)
```

---

#### **Option 2: MongoDB (Document-Oriented)**

**Výhody:**
- ✅ Flexibilná schéma (schemaless/dynamic)
- ✅ Jednoduchšie horizontálne škálovanie (sharding)
- ✅ Rýchle writes (eventual consistency)
- ✅ Nested documents (no JOINs needed)
- ✅ Atlas Search (built-in full-text search)
- ✅ Change streams (real-time updates)
- ✅ Vynikajúca podpora pre JSON data
- ✅ MongoDB Atlas (managed cloud service)

**Nevýhody:**
- ❌ Žiadne JOINs (aggregation pipelines sú komplexné)
- ❌ Eventual consistency (not ACID by default)
- ❌ Duplicácia dát (denormalization required)
- ❌ Väčšia storage footprint
- ❌ Slabší support pre transactions než PostgreSQL
- ❌ Vector search cez Atlas Search (nie native ako pgvector)

**Use Case Fit pre Fraud Reports:**
```
⚠️ Flexibilná schéma môže byť risk (fraud data = critical)
✅ Rýchle writes pre high-volume reports
⚠️ Žiadne native JOINs = komplexné queries
❌ Vector search nie je tak efektívny ako pgvector
```

**Konfigurácia:**
```yaml
# Production setup
Version: MongoDB 7.0
RAM: 4-8GB (WiredTiger cache: 50% RAM)
Storage: SSD
Replica Set: 3 nodes (high availability)
Sharding: Enabled pre 100M+ documents
Indexes: Compound, text, 2dsphere (geo)
```

---

### **DATABASE ODPORÚČANIE:**

```
┌──────────────────────────────────────────────────────────────┐
│  PRIMARY CHOICE: PostgreSQL 16 + pgvector                     │
│                                                               │
│  Dôvody:                                                      │
│  1. ACID compliance = kritické pre fraud data integrity      │
│  2. pgvector = Vector DB + Relational v jednom               │
│     → Žiadna potreba separátnej Vector DB pre MVP            │
│  3. Komplexné analytické queries (JOINs, aggregations)       │
│  4. pg_trgm extension = fuzzy search (fallback pre MVP)      │
│  5. Mature ecosystem, backups, point-in-time recovery        │
│  6. Cost-effective (jeden DB namiesto dvoch)                 │
│                                                               │
│  MongoDB Use Case:                                            │
│  - Ak máte extrémne vysokú write throughput (100k+/sec)      │
│  - Ak schéma je naozaj neznáma a dynamická                   │
│  - Ak team má MongoDB expertise                              │
│                                                               │
│  Hybrid Approach (Large Scale):                              │
│  - PostgreSQL: Transactional data (users, reports, payments) │
│  - MongoDB: Logs, analytics events, crawled data             │
└──────────────────────────────────────────────────────────────┘
```

---

### 2.4 Search Engine Options

#### **Option 1: OpenSearch / Elasticsearch**

**Výhody:**
- ✅ Industry standard pre full-text search
- ✅ Najbohatšie features (analyzers, tokenizers, filters)
- ✅ Fuzzy search, phonetic search, synonym support
- ✅ Aggregations a analytics (Kibana dashboards)
- ✅ Distributed architecture (horizontal scaling)
- ✅ Multi-language support (Slovak included)
- ✅ RESTful API + JSON
- ✅ Percolator queries (real-time alerting)

**Nevýhody:**
- ❌ Vysoká resource consumption (RAM-heavy)
- ❌ Komplexná konfigurácia a tuning
- ❌ Elasticsearch je teraz komerčný (OpenSearch je fork)
- ❌ Steep learning curve
- ❌ Vysoké náklady na hosting (minimum 2-4GB RAM)

**Resource Requirements:**
```yaml
# Minimum production cluster
Nodes: 3 (HA setup)
RAM per node: 4-8GB (heap: 50% RAM, max 32GB)
CPU: 2-4 cores per node
Storage: SSD, 50-100GB per node
Cost: ~$150-300/month (managed cloud)
```

**Fuzzy Search Quality:**
```
Score: 10/10
- Levenshtein distance
- Phonetic matching (Metaphone, Soundex)
- Synonym graphs
- Custom analyzers
```

---

#### **Option 2: Meilisearch**

**Výhody:**
- ✅ Najrýchlejšia search (sub-50ms latency)
- ✅ Typo-tolerant out-of-the-box
- ✅ Jednoduchá setup (single binary)
- ✅ Moderná API (RESTful, intuitive)
- ✅ Auto-indexing, no schema needed
- ✅ Faceted search, filters
- ✅ Nižšie resource requirements než Elasticsearch
- ✅ Open-source a free

**Nevýhody:**
- ❌ Mladší projekt (menej mature)
- ❌ Limitované analytics capabilities
- ❌ Žiadna built-in cluster support (single-node)
- ❌ Menej advanced features než Elasticsearch
- ❌ Slovak language support nie je perfektný
- ❌ Škálovanie je obmedzené

**Resource Requirements:**
```yaml
# Production single instance
Nodes: 1 (vertikálne škálovanie)
RAM: 1-2GB
CPU: 1-2 cores
Storage: SSD, 10-20GB
Cost: ~$20-50/month (VPS)
```

**Fuzzy Search Quality:**
```
Score: 8/10
- Typo tolerance (automatic)
- Prefix search
- Ranking algorithm (velmi dobrý)
- Limitované custom analyzers
```

---

#### **Option 3: Typesense**

**Výhody:**
- ✅ Rýchla search (podobná ako Meilisearch)
- ✅ Typo-tolerant a fuzzy search
- ✅ Jednoduchá setup (single binary)
- ✅ HA cluster support (výhoda nad Meilisearch!)
- ✅ Geosearch built-in
- ✅ Faceted search, grouping
- ✅ Nižšie náklady než Elasticsearch
- ✅ Vector search support (beta)

**Nevýhody:**
- ❌ Menší ekosystém než Elasticsearch
- ❌ Menej third-party integrations
- ❌ Dokumentácia nie je tak bohatá
- ❌ Slovak language support basic

**Resource Requirements:**
```yaml
# Production cluster (3 nodes)
Nodes: 3 (HA)
RAM per node: 2-4GB
CPU: 2 cores per node
Storage: SSD, 20-30GB per node
Cost: ~$60-120/month (VPS cluster)
```

**Fuzzy Search Quality:**
```
Score: 9/10
- Typo tolerance (configurable)
- Phonetic search
- Prefix/infix search
- Custom ranking
```

---

### **SEARCH ENGINE ODPORÚČANIE:**

```
┌──────────────────────────────────────────────────────────────┐
│  MVP (Low Budget): Typesense                                  │
│  Dôvod: Best balance (performance + features + cost)         │
│         - HA cluster support (unlike Meilisearch)            │
│         - Nižšie náklady než Elasticsearch                   │
│         - Fuzzy search out-of-the-box                        │
│         - Vector search (beta) = bonus                       │
│  Cost: ~$60-80/month (3-node VPS cluster)                    │
│                                                               │
│  Mid-Scale: Meilisearch                                       │
│  Dôvod: Ak nepotrebujete HA cluster, najrýchlejšia option   │
│  Cost: ~$20-40/month (single VPS)                            │
│                                                               │
│  Enterprise Scale: OpenSearch                                 │
│  Dôvod: Potrebujete advanced analytics, Kibana dashboards,   │
│         multi-language support, complex queries              │
│  Cost: ~$200-500/month (managed cluster)                     │
│                                                               │
│  Fallback for MVP: PostgreSQL pg_trgm                        │
│  Dôvod: Ak budget je extrémne nízky, použite built-in       │
│         fuzzy search v PostgreSQL (stačí pre < 100k docs)    │
│  Cost: $0 (už máte PostgreSQL)                               │
└──────────────────────────────────────────────────────────────┘
```

---

### 2.5 Vector Database Options

#### **Option 1: Weaviate**

**Výhody:**
- ✅ Purpose-built Vector DB
- ✅ GraphQL API (moderná)
- ✅ Built-in ML models (transformers)
- ✅ Hybrid search (vector + keyword)
- ✅ Multi-modal support (text, images)
- ✅ Horizontal scaling (sharding)
- ✅ Cloud-native (Kubernetes-ready)
- ✅ Generative search (RAG ready)

**Nevýhody:**
- ❌ Komplexnejšia setup než Pinecone
- ❌ Vyššie resource requirements
- ❌ GraphQL môže byť overkill
- ❌ Menší ekosystém než Pinecone

**Resource Requirements:**
```yaml
# Production cluster
Nodes: 3
RAM per node: 4-8GB
CPU: 2-4 cores
Storage: SSD, 50-100GB
Cost: ~$200-400/month (self-hosted)
```

**Face Embedding Performance:**
```
Latency: ~10-20ms (1M vectors)
Throughput: ~1000 QPS
Accuracy: ANN (HNSW algorithm)
```

---

#### **Option 2: Milvus**

**Výhody:**
- ✅ Najrýchlejší open-source Vector DB
- ✅ GPU acceleration support
- ✅ Horizontálne škálovanie (distributed)
- ✅ Viacero indexov (HNSW, IVF, FLAT)
- ✅ Cloud-managed version (Zilliz Cloud)
- ✅ Attu UI (visual management)
- ✅ Hybrid search (dense + sparse vectors)

**Nevýhody:**
- ❌ Komplexná architektúra (microservices)
- ❌ Vyššie resource requirements
- ❌ Steep learning curve
- ❌ Setup je náročný (etcd, MinIO, Pulsar)

**Resource Requirements:**
```yaml
# Production cluster (standalone mode)
Nodes: 1 (Milvus standalone)
Dependencies: etcd, MinIO, Pulsar
RAM: 8-16GB
CPU: 4-8 cores
Storage: SSD, 100GB+
Cost: ~$150-300/month (VPS + dependencies)
```

**Face Embedding Performance:**
```
Latency: ~5-10ms (1M vectors)
Throughput: ~2000 QPS
Accuracy: Best (GPU-accelerated)
```

---

#### **Option 3: Pinecone**

**Výhody:**
- ✅ Fully managed (serverless)
- ✅ Žiadna infraštruktúra setup
- ✅ Auto-scaling
- ✅ Jednoduchá API (RESTful)
- ✅ Metadata filtering
- ✅ Hybrid search
- ✅ Najjednoduchší onboarding

**Nevýhody:**
- ❌ **Najdrahšia option** (vendor lock-in)
- ❌ Žiadna self-hosted option
- ❌ Pricing môže byť nepredvídateľný
- ❌ Menej kontroly než self-hosted

**Pricing:**
```
Free tier: 1M vectors, 100 queries/day
Starter: $70/month (5M vectors, 1 pod)
Standard: $300-1000/month (scaling)
Enterprise: Custom pricing
```

**Face Embedding Performance:**
```
Latency: ~20-50ms (managed service overhead)
Throughput: ~500 QPS (free tier)
Accuracy: High (managed HNSW)
```

---

#### **Option 4: pgvector (PostgreSQL Extension)**

**Výhody:**
- ✅ **Žiadne extra náklady** (už máte PostgreSQL!)
- ✅ ACID compliance (consistency)
- ✅ Jednoduché JOINy s relational data
- ✅ Single database (vector + relational)
- ✅ Jednoduché backups (PostgreSQL tools)
- ✅ No vendor lock-in
- ✅ HNSW index support (od PG 16)

**Nevýhody:**
- ❌ Pomalší než dedicated Vector DBs (pri 10M+ vectors)
- ❌ Limitované škálovanie (PostgreSQL scaling limits)
- ❌ Žiadne GPU acceleration
- ❌ Menej advanced features než Weaviate/Milvus

**Resource Requirements:**
```yaml
# Same PostgreSQL instance
Extension: pgvector
No extra cost
RAM: +2GB pre vector indexing
Storage: +20-50% pre HNSW indexes
Cost: $0 (already using PostgreSQL)
```

**Face Embedding Performance:**
```
Latency: ~20-50ms (1M vectors, HNSW)
Throughput: ~200-500 QPS
Accuracy: Good (HNSW index)
Scale limit: ~5-10M vectors (practical)
```

---

### **VECTOR DB ODPORÚČANIE:**

```
┌──────────────────────────────────────────────────────────────┐
│  MVP (0-100K reports): pgvector (PostgreSQL extension)       │
│  Dôvod: ŽIADNE extra náklady, single DB, ACID compliance     │
│         - Perfektné pre MVP a low-scale                      │
│         - HNSW index je dostatočný pre < 1M vectors          │
│         - Jednoduchý deployment (už máte PostgreSQL)         │
│  Cost: $0                                                     │
│                                                               │
│  Mid-Scale (100K-1M reports): Weaviate                        │
│  Dôvod: Purpose-built, hybrid search, ML-ready               │
│  Cost: ~$100-200/month (single node)                         │
│                                                               │
│  Large-Scale (1M+ reports): Milvus                            │
│  Dôvod: Najrýchlejší, GPU support, horizontal scaling        │
│  Cost: ~$200-400/month (self-hosted cluster)                 │
│                                                               │
│  Managed/Serverless: Pinecone                                 │
│  Dôvod: Zero ops, auto-scaling, ak máte budget               │
│  Cost: $70-300+/month                                         │
│                                                               │
│  FINAL RECOMMENDATION: pgvector pre MVP, migrate to Milvus   │
│  pri škálovaní nad 500K reports                              │
└──────────────────────────────────────────────────────────────┘
```

---

### 2.6 Message Queue Options

#### **Option 1: RabbitMQ**

**Výhody:**
- ✅ Mature a battle-tested (od 2007)
- ✅ Routing flexibility (exchanges, bindings)
- ✅ Multiple protocols (AMQP, STOMP, MQTT)
- ✅ Prioritizácia messages
- ✅ Dead letter queues (DLQ)
- ✅ Publisher confirms, consumer acknowledgments
- ✅ Management UI (built-in)
- ✅ Plugins (federation, shovel, delayed messages)

**Nevýhody:**
- ❌ Pomalší než Redis/Kafka pri high-throughput
- ❌ Komplexnejšia setup než Redis
- ❌ Vyššie resource consumption
- ❌ Erlang runtime dependency

**Resource Requirements:**
```yaml
# Production cluster
Nodes: 3 (HA cluster)
RAM per node: 2-4GB
CPU: 2 cores
Storage: SSD, 10-20GB
Throughput: ~20,000 msg/sec
Cost: ~$60-120/month (VPS cluster)
```

**Use Case Fit:**
```
✅ Komplexný routing (OCR queue → priority queue)
✅ Dead letter queues (failed jobs)
✅ Publisher confirms (critical jobs)
⚠️ Overhead môže byť veľký pre simple use cases
```

---

#### **Option 2: Redis Streams**

**Výhody:**
- ✅ Najrýchlejší (in-memory)
- ✅ Jednoduchá setup (už používate Redis pre cache!)
- ✅ Consumer groups (Kafka-like)
- ✅ XREAD, XACK commands (ACKs)
- ✅ Nízke náklady (reuse existing Redis)
- ✅ Pub/Sub + Streams v jednom
- ✅ Minimálna latencia (~1-2ms)

**Nevýhody:**
- ❌ Žiadne advanced routing ako RabbitMQ
- ❌ Persistence nie je primárna feature (AOF/RDB)
- ❌ Limitovaná retention (memory-bound)
- ❌ Žiadne dead letter queues (manual implementation)
- ❌ Menej features než dedicated MQs

**Resource Requirements:**
```yaml
# Production Redis instance
Nodes: 1 (master) + 2 replicas
RAM: 4-8GB
CPU: 2 cores
Storage: SSD, 10GB (persistence)
Throughput: ~100,000 msg/sec
Cost: ~$40-80/month (reuse cache Redis)
```

**Use Case Fit:**
```
✅ High-speed job processing
✅ Real-time notifications
✅ Simple queue patterns
❌ Komplexný routing je problém
```

---

#### **Option 3: Apache Kafka**

**Výhody:**
- ✅ Najvyššia throughput (millions msg/sec)
- ✅ Event streaming (log-based)
- ✅ Retention policies (replay events)
- ✅ Horizontálne škálovanie (partitions)
- ✅ Exactly-once semantics
- ✅ Stream processing (Kafka Streams, ksqlDB)
- ✅ Industry standard pre big data

**Nevýhody:**
- ❌ **Overkill pre malé projekty**
- ❌ Komplexná setup (Zookeeper/KRaft, brokers)
- ❌ Vysoké resource requirements
- ❌ Steep learning curve
- ❌ Vysoké náklady (minimum 3 brokers)

**Resource Requirements:**
```yaml
# Production cluster
Brokers: 3
Zookeeper nodes: 3 (or KRaft mode)
RAM per broker: 8-16GB
CPU: 4-8 cores
Storage: SSD, 100GB+ per broker
Throughput: ~1,000,000 msg/sec
Cost: ~$400-800/month (VPS cluster)
```

**Use Case Fit:**
```
❌ Overkill pre fraud-report MVP
✅ Ak plánujete streaming analytics
✅ Ak máte 100k+ messages/sec
```

---

### **MESSAGE QUEUE ODPORÚČANIE:**

```
┌──────────────────────────────────────────────────────────────┐
│  MVP (Low Budget): Redis Streams                              │
│  Dôvod: Už používate Redis pre cache, žiadne extra náklady   │
│         - Najrýchlejší                                        │
│         - Consumer groups support                            │
│         - Stačí pre < 10,000 jobs/sec                        │
│  Cost: $0 (reuse existing Redis)                             │
│                                                               │
│  Mid-Scale: RabbitMQ                                          │
│  Dôvod: Komplexný routing, DLQ, priority queues              │
│         - Potrebujete reliability (OCR, crawling)            │
│         - Dead letter queues pre failed jobs                 │
│  Cost: ~$60-100/month (3-node cluster)                       │
│                                                               │
│  Large-Scale / Event Streaming: Apache Kafka                  │
│  Dôvod: Ak máte 100k+ events/sec, streaming analytics       │
│  Cost: ~$400-800/month                                        │
│                                                               │
│  FINAL RECOMMENDATION: Redis Streams pre MVP                  │
│  → Upgrade to RabbitMQ pri škálovaní (complex routing needs) │
└──────────────────────────────────────────────────────────────┘
```

---

### 2.7 Object Storage Options

#### **Option 1: MinIO (Self-Hosted)**

**Výhody:**
- ✅ S3-compatible API (drop-in replacement)
- ✅ Self-hosted (plná kontrola)
- ✅ Žiadne vendor lock-in
- ✅ Erasure coding (data protection)
- ✅ Versioning, lifecycle policies
- ✅ Encryption (at-rest, in-transit)
- ✅ High performance (multi-threaded)
- ✅ Kubernetes-native

**Nevýhody:**
- ❌ Musíte spravovať infraštruktúru
- ❌ Backups sú vaša zodpovednosť
- ❌ Scaling vyžaduje viac diskov/nodes
- ❌ Žiadny CDN built-in (musíte pridať CloudFlare/Fastly)

**Resource Requirements:**
```yaml
# Production cluster (distributed mode)
Nodes: 4 (minimum pre erasure coding)
Disks per node: 4-8 (JBOD)
RAM: 4-8GB per node
Storage: 500GB-2TB per node
Cost: ~$100-200/month (VPS + storage)
```

**Pricing Comparison:**
```
1TB storage: ~$10-20/month (VPS block storage)
1TB bandwidth: $0 (no egress fees!)
Total: ~$15-30/month (1TB storage + transfers)
```

---

#### **Option 2: AWS S3**

**Výhody:**
- ✅ Fully managed (zero ops)
- ✅ 99.999999999% durability (11 nines)
- ✅ Global CDN (CloudFront integration)
- ✅ Lifecycle policies, versioning
- ✅ Event notifications (Lambda triggers)
- ✅ Storage classes (Standard, IA, Glacier)
- ✅ Massive ecosystem (integrácie)

**Nevýhody:**
- ❌ **Vysoké náklady** (egress fees!)
- ❌ Vendor lock-in (AWS ecosystem)
- ❌ Pricing môže byť nepredvídateľný
- ❌ Request fees (GET, PUT charges)

**Pricing:**
```
1TB storage: ~$23/month (S3 Standard)
1TB egress: ~$90/month (data transfer out!)
1M PUT requests: ~$5/month
1M GET requests: ~$0.40/month

Total: ~$120-150/month (1TB storage + transfers)
```

**When to Use:**
```
✅ Ak potrebujete global CDN
✅ Ak používate AWS ecosystem (Lambda, CloudFront)
✅ Ak máte budget na managed services
❌ Ak chcete nízke náklady (egress fees sú vysoké)
```

---

### **OBJECT STORAGE ODPORÚČANIE:**

```
┌──────────────────────────────────────────────────────────────┐
│  MVP (Low Budget): MinIO (Self-Hosted)                       │
│  Dôvod: S3-compatible, žiadne egress fees, kontrola          │
│         - 10x lacnejší než S3 pri vysokom trafficu           │
│         - Self-hosted VPS (4 nodes, 1TB storage)             │
│         - CloudFlare CDN (free tier) pred MinIO              │
│  Cost: ~$100-150/month (4-node cluster + storage)            │
│                                                               │
│  Scale (CDN Required): AWS S3 + CloudFront                    │
│  Dôvod: Global CDN, 99.999999999% durability, managed        │
│  Cost: ~$150-300/month (1TB storage + CDN)                   │
│                                                               │
│  Hybrid Approach:                                             │
│  - MinIO: Hot storage (recent uploads, 3 months)             │
│  - S3 Glacier: Cold storage (archival, > 6 months)           │
│  Dôvod: Optimalizácia nákladov (hot vs cold data)            │
│                                                               │
│  FINAL RECOMMENDATION: MinIO pre MVP + CloudFlare CDN         │
│  → Migrate to S3 ak potrebujete global infra alebo AWS lock-in│
└──────────────────────────────────────────────────────────────┘
```

---

## 3. MVP STACK (Najnižšie Náklady)

### 3.1 MVP Tech Stack

```yaml
┌──────────────────────────────────────────────────────────────┐
│  GOAL: < $200/month total infrastructure cost                 │
│  Scale: 0-10,000 reports, 1,000 searches/day                 │
└──────────────────────────────────────────────────────────────┘

Frontend:
  WordPress Plugin: Vanilla JS + Alpine.js (15KB)
    - Search widget (shortcode)
    - Report submission form
    - Results display
  Admin Dashboard: React + Next.js (optional, can skip for MVP)
    - Self-host na Vercel free tier

Backend:
  Framework: Python + FastAPI
    - Reason: Rýchly development, ML-ready, single language
    - Services: Monolith (všetky services v jednej app)
      → report, search, auth, enrichment, analysis
    - Deployment: Single VPS (4 cores, 8GB RAM)

  Workers:
    - OCR: Tesseract (CPU-based, no GPU needed pre MVP)
    - Face Detection: Lightweight model (MobileNet-SSD, CPU)
    - Crawler: Playwright (headless browser)
    - Deployment: Same VPS (background workers)

Database:
  Primary: PostgreSQL 16
    - Extensions: pgvector (face embeddings), pg_trgm (fuzzy search)
    - Reason: Single DB pre relational + vector + fuzzy search
    - Storage: 50GB SSD

  Cache: Redis 7
    - Usage: Session store, rate limiting, pub/sub
    - Memory: 512MB

Search Engine:
  Option 1: PostgreSQL pg_trgm (built-in fuzzy search)
    - Reason: Žiadne extra náklady, stačí pre < 100K reports
  Option 2: Typesense (single node)
    - Reason: Ak potrebujete lepší search UX
    - Cost: +$20/month (1 VPS)

Vector Database:
  pgvector (PostgreSQL extension)
    - Reason: Žiadne extra náklady, HNSW index
    - Scale: < 1M face embeddings

Message Queue:
  Redis Streams
    - Reason: Reuse existing Redis, najrýchlejší, stačí pre MVP
    - Queues: ocr-jobs, face-jobs, crawl-jobs, notifications

Object Storage:
  MinIO (single node)
    - Reason: S3-compatible, žiadne egress fees
    - Storage: 100GB block storage
    - CDN: CloudFlare free tier (caching)

Reverse Proxy / Load Balancer:
  Nginx
    - SSL: Let's Encrypt (free)
    - Rate limiting, gzip compression

Monitoring:
  - Grafana + Prometheus (self-hosted)
  - Uptime monitoring: UptimeRobot (free tier)
  - Logs: Loki (lightweight)
```

---

### 3.2 MVP Infrastructure Configuration

#### **Single VPS Configuration:**

```yaml
Provider: Hetzner / DigitalOcean / Vultr
Instance Type: CPX41 (Hetzner) / 8GB Droplet (DO)

Specifications:
  CPU: 4 vCPU cores
  RAM: 8GB
  Storage: 160GB NVMe SSD
  Bandwidth: 20TB/month
  Cost: ~$20-30/month

Services Running:
  1. FastAPI backend (port 8000)
     - Gunicorn workers: 4 (1 per CPU core)
     - Memory per worker: ~200MB
     - Total: ~800MB

  2. PostgreSQL 16 (port 5432)
     - shared_buffers: 2GB (25% RAM)
     - effective_cache_size: 6GB
     - work_mem: 64MB
     - Total memory: ~2-3GB

  3. Redis 7 (port 6379)
     - maxmemory: 512MB
     - persistence: AOF (append-only file)

  4. MinIO (port 9000)
     - Memory: ~512MB
     - Storage: 100GB block storage (attached volume)

  5. Nginx (port 80/443)
     - Memory: ~50MB

  6. Worker processes (background)
     - OCR worker: 2 instances (~200MB each)
     - Face worker: 1 instance (~300MB, CPU-based model)
     - Crawler worker: 1 instance (~300MB)
     - Total: ~1GB

  7. Monitoring (Prometheus + Grafana)
     - Memory: ~500MB

Total Memory Usage: ~7GB / 8GB (88% utilization)
```

---

#### **Additional Services (Separate VPS or Managed):**

```yaml
# Option 1: Separate VPS pre Typesense (ak používate)
Typesense VPS:
  Provider: Hetzner
  Type: CX21 (2 vCPU, 4GB RAM, 40GB SSD)
  Cost: ~$5-10/month

# Option 2: Managed Services (reduce ops burden)
Database: DigitalOcean Managed PostgreSQL
  - 1GB RAM, 10GB storage
  - Cost: ~$15/month
  - Pro: Automated backups, HA
  - Con: Vyššie náklady než self-hosted

Redis: Upstash (serverless Redis)
  - Free tier: 10,000 commands/day
  - Paid: Pay-per-request
  - Pro: Zero ops
```

---

### 3.3 MVP Cost Breakdown

```yaml
┌─────────────────────────────────────────────────────────────┐
│  TOTAL MVP MONTHLY COST: $100-150/month                      │
└─────────────────────────────────────────────────────────────┘

Infrastructure:
  Main VPS (8GB RAM, 4 cores):              $25/month
  Block Storage (100GB MinIO):              $10/month
  Backup Storage (50GB):                    $5/month
  Domain + SSL:                             $1/month (Let's Encrypt free)
  CDN (CloudFlare free tier):               $0/month

Optional:
  Typesense VPS (if used):                  +$10/month
  Email service (SendGrid free tier):       $0 (100 emails/day)

External Services:
  reCAPTCHA (Google):                       $0/month
  Uptime monitoring (UptimeRobot):          $0/month (50 monitors)

Development:
  Version control (GitHub):                 $0/month
  CI/CD (GitHub Actions):                   $0/month (2000 min/month free)

Total (Self-Hosted):                        ~$50/month
Total (with Typesense):                     ~$60/month
Total (with Managed DB):                    ~$90/month

Budget Reserve (scaling, testing):          +$50/month

GRAND TOTAL:                                $100-150/month
```

---

### 3.4 MVP Deployment Architecture

```yaml
┌──────────────────────────────────────────────────────────────┐
│  Deployment Strategy: Docker Compose (single VPS)             │
└──────────────────────────────────────────────────────────────┘

docker-compose.yml:
  services:
    nginx:
      image: nginx:alpine
      ports: [80, 443]
      volumes:
        - ./nginx.conf:/etc/nginx/nginx.conf
        - ./ssl:/etc/nginx/ssl

    backend:
      build: ./backend
      image: scamnemesis/api:latest
      environment:
        - DATABASE_URL=postgresql://...
        - REDIS_URL=redis://redis:6379
        - MINIO_URL=http://minio:9000
      depends_on: [postgres, redis, minio]
      deploy:
        replicas: 4

    postgres:
      image: pgvector/pgvector:pg16
      volumes:
        - postgres_data:/var/lib/postgresql/data
      environment:
        - POSTGRES_PASSWORD=${DB_PASSWORD}

    redis:
      image: redis:7-alpine
      command: redis-server --maxmemory 512mb --appendonly yes
      volumes:
        - redis_data:/data

    minio:
      image: minio/minio:latest
      command: server /data --console-address ":9001"
      volumes:
        - minio_data:/data
      environment:
        - MINIO_ROOT_USER=${MINIO_USER}
        - MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}

    ocr-worker:
      build: ./workers/ocr
      environment:
        - REDIS_URL=redis://redis:6379
      deploy:
        replicas: 2

    face-worker:
      build: ./workers/face
      environment:
        - REDIS_URL=redis://redis:6379
        - MODEL_PATH=/models/mobilenet_ssd
      volumes:
        - ./models:/models

    crawler-worker:
      build: ./workers/crawler
      environment:
        - REDIS_URL=redis://redis:6379

    prometheus:
      image: prom/prometheus:latest
      volumes:
        - ./prometheus.yml:/etc/prometheus/prometheus.yml

    grafana:
      image: grafana/grafana:latest
      ports: [3000]
      volumes:
        - grafana_data:/var/lib/grafana

volumes:
  postgres_data:
  redis_data:
  minio_data:
  grafana_data:
```

---

### 3.5 MVP Limitations & Trade-offs

```yaml
Limitations:
  1. Single VPS = Single Point of Failure
     - Mitigation: Automated backups (daily), monitoring alerts

  2. No High Availability
     - Acceptable pre MVP (99% uptime je OK)
     - Upgrade to multi-node cluster pri scale

  3. CPU-based ML models (slower než GPU)
     - Face detection: ~500ms per image (vs 50ms s GPU)
     - OCR: ~2-3s per image (vs 500ms s GPU)
     - Acceptable pre low volume (< 100 uploads/day)

  4. PostgreSQL fuzzy search (ak nepoužijete Typesense)
     - Stačí pre < 100K reports
     - Latencia: ~100-200ms (vs 20ms s Typesense)

  5. Redis Streams namiesto RabbitMQ
     - Žiadne dead letter queues (manual implementation)
     - Žiadny advanced routing
     - Stačí pre simple job queues

Trade-offs:
  ✅ Cost: $50-100/month (vs $500+ pre full stack)
  ✅ Development speed: Monolith = rýchlejší development
  ✅ Ops complexity: Docker Compose = jednoduchý deployment
  ⚠️ Scaling: Musíte refaktorovať na microservices neskôr
  ⚠️ Performance: CPU-based ML = pomalšie, ale stačí pre MVP
```

---

## 4. SCALE STACK (Produkčné Kubernetes, 160k návštev/deň)

### 4.1 Scale Requirements

```yaml
┌──────────────────────────────────────────────────────────────┐
│  TARGET SCALE: 160,000 visits/day (~2,000 active users/hour) │
│  Reports: ~1,000 submissions/day                             │
│  Searches: ~10,000 queries/day                               │
│  Storage: 500GB-1TB (images, documents)                      │
│  Availability: 99.9% uptime (< 8.7 hours downtime/year)      │
└──────────────────────────────────────────────────────────────┘
```

---

### 4.2 Scale Tech Stack

```yaml
Frontend:
  WordPress Plugin: Vanilla JS + Alpine.js
    - CDN: CloudFlare Pro ($20/month)
    - Static assets: Cached at edge

  Admin Dashboard: React + Next.js
    - Deployment: Vercel Pro ($20/month) alebo Kubernetes
    - SSR pre performance
    - Redis cache pre API responses

Backend:
  Architecture: Microservices (Go + Python hybrid)

  Core API Services (Go + Gin):
    - Report Service (CRUD)
    - Search Service
    - Auth Service
    - Notification Service
    - Reason: High performance, low memory footprint
    - Deployment: Kubernetes (3-5 replicas per service)

  ML Services (Python + FastAPI):
    - Analysis Service (risk scoring)
    - Enrichment Service
    - Reason: ML ecosystem, GPU support
    - Deployment: Kubernetes (GPU nodes)

  Workers (Go + Python):
    - OCR Worker: Python + Tesseract (GPU-accelerated)
    - Face Worker: Python + MTCNN/FaceNet (GPU required)
    - Crawler Worker: Go + Chromium (parallel scraping)
    - Enrichment Worker: Python (OSINT APIs)

API Gateway:
  Kong Gateway (Kubernetes-native)
    - Rate limiting: Redis-backed
    - Authentication: JWT validation
    - Load balancing: Round-robin, least connections
    - Circuit breaking: Hystrix pattern
    - Deployment: 3 replicas (HA)

Database:
  Primary: PostgreSQL 16 (High Availability)
    - Deployment: Patroni cluster (1 primary + 2 replicas)
    - Extensions: pgvector, pg_trgm, uuid-ossp
    - Connection pooling: PgBouncer (100-500 connections)
    - RAM: 16GB (shared_buffers: 4GB)
    - Storage: 500GB SSD (IOPS: 10,000+)
    - Backups: WAL archiving (Point-in-Time Recovery)

  Read Replicas: 2x PostgreSQL (read-only)
    - For analytics queries, reports
    - Streaming replication (async)

Search Engine:
  OpenSearch (3-node cluster)
    - Reason: Advanced analytics, Kibana dashboards
    - RAM per node: 8GB (heap: 4GB)
    - Storage per node: 100GB SSD
    - Indexes: reports, users, search_logs
    - Shards: 3 primary, 1 replica

Vector Database:
  Milvus (distributed mode)
    - Reason: GPU-accelerated, high performance
    - Components:
      → Query nodes: 2 (search)
      → Data nodes: 2 (indexing)
      → Index nodes: 2 (HNSW building)
    - Dependencies: etcd (3 nodes), MinIO, Pulsar
    - GPU: 1x NVIDIA T4 (face embedding generation)
    - RAM: 16GB per node
    - Storage: 200GB SSD

Message Queue:
  RabbitMQ (3-node cluster)
    - Reason: Complex routing, DLQ, priority queues
    - RAM per node: 4GB
    - Queues: ocr, face-detection, crawling, enrichment, notifications
    - Federation: Multi-region support

Object Storage:
  MinIO (distributed mode)
    - Nodes: 4 (erasure coding 4+2)
    - Disks per node: 4x 500GB SSD
    - Total storage: 8TB raw (5TB usable)
    - CDN: CloudFlare R2 alebo CloudFront

  Alternative: AWS S3 + CloudFront CDN
    - Pre global distribution
    - Storage class: S3 Standard-IA (infrequent access)

Cache:
  Redis Cluster (6 nodes)
    - 3 masters + 3 replicas (HA)
    - RAM per node: 4GB
    - Total cache: 12GB
    - Persistence: RDB snapshots + AOF
    - Usage: Session store, query cache, rate limiting

Kubernetes:
  Cluster: 3 control plane + N worker nodes

  Node Pools:
    1. General workload pool:
       - 5x nodes (4 vCPU, 16GB RAM)
       - Services: API services, workers (non-GPU)

    2. GPU pool:
       - 2x nodes (8 vCPU, 32GB RAM, 1x NVIDIA T4)
       - Services: Face detection, OCR (GPU-accelerated)

    3. Database pool:
       - 3x nodes (8 vCPU, 32GB RAM, local SSD)
       - Services: PostgreSQL, Redis, OpenSearch

  Ingress: Nginx Ingress Controller
    - SSL: cert-manager + Let's Encrypt
    - Rate limiting: nginx.ingress.kubernetes.io/limit-rps

  Service Mesh: Istio (optional)
    - Traffic management, observability
    - mTLS (service-to-service encryption)

Monitoring & Observability:
  Metrics: Prometheus + Grafana
    - Scrape interval: 15s
    - Retention: 30 days
    - Alertmanager: PagerDuty integration

  Logging: ELK Stack (Elasticsearch, Logstash, Kibana)
    - Alternative: Loki + Promtail (lightweight)
    - Retention: 7 days (hot), 90 days (warm)

  Tracing: Jaeger (distributed tracing)
    - For debugging latency issues

  APM: Sentry (error tracking)
    - Frontend + Backend errors

CI/CD:
  GitLab CI / GitHub Actions
    - Docker image builds
    - Kubernetes deployments (Helm charts)
    - Automated testing (pytest, go test)

  GitOps: ArgoCD
    - Declarative deployments
    - Rollback capabilities

Security:
  Secrets: HashiCorp Vault
    - Database credentials, API keys

  Network Policies: Calico
    - Pod-to-pod communication restrictions

  Image Scanning: Trivy (vulnerability scanning)

  WAF: CloudFlare WAF alebo AWS WAF
    - DDoS protection, SQL injection prevention
```

---

### 4.3 Scale Infrastructure Configuration

#### **Kubernetes Cluster Specifications:**

```yaml
Cloud Provider: AWS EKS / GCP GKE / Self-hosted (Hetzner Cloud)

Control Plane:
  Nodes: 3 (managed by cloud provider)
  Type: m5.large (2 vCPU, 8GB RAM)
  Cost: ~$150/month (managed)

Worker Node Pools:

1. General Workload Pool:
   Nodes: 5
   Type: m5.xlarge (4 vCPU, 16GB RAM)
   Total: 20 vCPU, 80GB RAM
   Autoscaling: 3-10 nodes (HPA)
   Cost: ~$400/month

2. GPU Pool:
   Nodes: 2
   Type: g4dn.xlarge (4 vCPU, 16GB RAM, 1x NVIDIA T4)
   Total: 8 vCPU, 32GB RAM, 2x GPU
   Cost: ~$600/month

3. Database/Stateful Pool:
   Nodes: 3
   Type: m5.2xlarge (8 vCPU, 32GB RAM) + 500GB local SSD
   Total: 24 vCPU, 96GB RAM, 1.5TB SSD
   Cost: ~$600/month

Total Cluster Cost: ~$1,750/month (AWS EKS)
Alternative (Self-hosted K8s on Hetzner): ~$800/month
```

---

#### **Database Configuration (HA PostgreSQL):**

```yaml
Patroni Cluster (High Availability):
  Nodes: 3 (1 primary, 2 replicas)
  Type: m5.2xlarge (8 vCPU, 32GB RAM)
  Storage: 500GB SSD per node (EBS gp3, 10,000 IOPS)

PostgreSQL 16 Configuration:
  shared_buffers: 8GB (25% RAM)
  effective_cache_size: 24GB (75% RAM)
  work_mem: 128MB
  max_connections: 500
  max_wal_size: 4GB
  checkpoint_timeout: 10min
  random_page_cost: 1.1 (SSD)

Extensions:
  - pgvector (face embeddings)
  - pg_trgm (fuzzy search fallback)
  - uuid-ossp (UUID generation)
  - pg_stat_statements (query performance)

Connection Pooler (PgBouncer):
  Pool mode: transaction
  Max client connections: 1000
  Default pool size: 25 per database
  Deployment: Sidecar container (same pod)

Backups:
  WAL archiving: Continuous (S3)
  Full backup: Daily (pg_basebackup)
  Retention: 30 days
  Point-in-Time Recovery: Yes

Cost: ~$600/month (3 nodes + storage + backups)
```

---

#### **OpenSearch Cluster Configuration:**

```yaml
Nodes: 3 (1 master-eligible + 2 data nodes)
Type: r5.xlarge (4 vCPU, 32GB RAM)
Storage: 100GB SSD per node (gp3)

OpenSearch Configuration:
  Heap size: 16GB (50% RAM)
  Shards: 3 primary, 1 replica per index
  Refresh interval: 30s (reduce indexing load)
  Indices:
    - reports (1M documents, 50GB)
    - users (100K documents, 5GB)
    - search_logs (10M documents, 20GB)

Index Templates:
  reports:
    mappings:
      - scammer_name (text, keyword)
      - description (text, Slovak analyzer)
      - phone (keyword)
      - email (keyword)
      - amount_lost (float)
      - created_at (date)
    analyzers:
      - Slovak stemmer, lowercase, asciifolding

Kibana:
  Dashboards: Analytics, search metrics
  Alerts: Anomaly detection (spike in reports)

Cost: ~$400/month (3 nodes + storage)
```

---

#### **Milvus Vector DB Configuration:**

```yaml
Deployment Mode: Distributed (Kubernetes)

Components:
  Query Nodes: 2 (search queries)
    - Type: m5.2xlarge (8 vCPU, 32GB RAM)

  Data Nodes: 2 (data management)
    - Type: m5.xlarge (4 vCPU, 16GB RAM)

  Index Nodes: 2 (HNSW index building)
    - Type: c5.2xlarge (8 vCPU, 16GB RAM)

  Coordinator: 1 (master)
    - Type: m5.large (2 vCPU, 8GB RAM)

Dependencies:
  etcd: 3 nodes (metadata storage)
    - Type: m5.large (2 vCPU, 8GB RAM)

  MinIO: 4 nodes (object storage)
    - Type: m5.large (2 vCPU, 8GB RAM) + 200GB SSD

  Pulsar: 3 nodes (message queue)
    - Type: m5.xlarge (4 vCPU, 16GB RAM)

Face Embeddings:
  Model: FaceNet (512-dim vectors)
  Index: HNSW (M=16, efConstruction=200)
  Total vectors: 5M (5 million faces)
  Storage: ~150GB (vectors + index)

Performance:
  Search latency: <10ms (p95)
  Throughput: 2000 QPS
  GPU: NVIDIA T4 (embedding generation)

Cost: ~$800/month (all components)
```

---

#### **RabbitMQ Cluster Configuration:**

```yaml
Nodes: 3 (HA cluster)
Type: m5.large (2 vCPU, 8GB RAM)
Storage: 20GB SSD per node

Configuration:
  vm_memory_high_watermark: 0.6 (6GB)
  disk_free_limit: 5GB
  Clustering: Mirrored queues (ha-mode: all)

Queues:
  ocr-jobs:
    - Priority: 0-10 (higher = sooner)
    - TTL: 1 hour (message expiration)
    - DLQ: ocr-jobs-dead-letter

  face-detection-jobs:
    - Priority: 0-10
    - TTL: 30 minutes
    - DLQ: face-jobs-dead-letter

  crawling-jobs:
    - Priority: 0-5
    - TTL: 2 hours
    - DLQ: crawling-dead-letter

  notifications:
    - Priority: 0-10 (urgent notifications)
    - TTL: 5 minutes

Monitoring:
  Management UI: Enabled
  Prometheus exporter: rabbitmq_exporter

Cost: ~$150/month (3 nodes)
```

---

#### **Redis Cluster Configuration:**

```yaml
Deployment: Redis Cluster (Kubernetes)
Nodes: 6 (3 masters + 3 replicas)
Type: r5.large (2 vCPU, 16GB RAM)

Configuration:
  maxmemory: 12GB per node
  maxmemory-policy: allkeys-lru
  Persistence: RDB (hourly) + AOF (every second)
  Cluster slots: 16384 (distributed across 3 masters)

Usage:
  Session store: 2GB (user sessions)
  Query cache: 6GB (API responses, search results)
  Rate limiting: 1GB (token buckets)
  Pub/Sub: Real-time notifications

Performance:
  Latency: <1ms (p95)
  Throughput: 100,000 ops/sec

Cost: ~$300/month (6 nodes)
```

---

#### **MinIO Object Storage Configuration:**

```yaml
Deployment Mode: Distributed (Kubernetes)
Nodes: 4
Type: m5.large (2 vCPU, 8GB RAM)
Disks per node: 4x 500GB SSD
Erasure Coding: EC:2 (4 data + 2 parity)

Total Storage:
  Raw: 8TB (4 nodes × 4 disks × 500GB)
  Usable: ~5TB (after erasure coding overhead)

Buckets:
  scam-reports-images: 2TB (screenshots, profile photos)
  scam-reports-documents: 500GB (PDFs, evidence files)
  user-uploads: 1TB
  backups: 500GB (database backups)

Lifecycle Policies:
  - Delete objects > 2 years old (GDPR compliance)
  - Transition to cold storage > 6 months (S3 Glacier)

CDN:
  CloudFlare R2 (free egress) alebo CloudFront
  Cache TTL: 24 hours (images)

Cost: ~$200/month (4 nodes + storage)
```

---

### 4.4 Scale Cost Breakdown

```yaml
┌─────────────────────────────────────────────────────────────┐
│  TOTAL SCALE MONTHLY COST: $4,000-5,000/month (AWS)         │
│  ALTERNATIVE (Self-hosted K8s): $2,000-2,500/month          │
└─────────────────────────────────────────────────────────────┘

Kubernetes Cluster:
  Control plane (EKS):                      $150/month
  General workload pool (5 nodes):          $400/month
  GPU pool (2 nodes):                       $600/month
  Database pool (3 nodes):                  $600/month
  Total K8s:                                $1,750/month

Databases & Storage:
  PostgreSQL HA (3 nodes + storage):        $600/month
  OpenSearch (3 nodes):                     $400/month
  Milvus + dependencies:                    $800/month
  Redis Cluster (6 nodes):                  $300/month
  RabbitMQ (3 nodes):                       $150/month
  MinIO (4 nodes):                          $200/month
  Total Data Layer:                         $2,450/month

Networking & CDN:
  Load Balancer (AWS ALB):                  $25/month
  CloudFlare Pro CDN:                       $20/month
  Data transfer (5TB/month):                $450/month
  Total Networking:                         $495/month

Monitoring & Security:
  Prometheus + Grafana (managed):           $100/month
  ELK Stack (3 nodes):                      $300/month
  Sentry (APM):                             $50/month
  HashiCorp Vault:                          $50/month
  Total Observability:                      $500/month

External Services:
  Email (SendGrid):                         $20/month
  SMS (Twilio):                             $50/month
  reCAPTCHA Enterprise:                     $10/month
  Total External:                           $80/month

Backups & DR:
  S3 backups (500GB):                       $15/month
  Snapshot storage:                         $50/month
  Total Backups:                            $65/month

──────────────────────────────────────────────────────────────
GRAND TOTAL (AWS):                          $5,340/month

──────────────────────────────────────────────────────────────
ALTERNATIVE: Self-Hosted Kubernetes (Hetzner Cloud)

K8s Cluster (10 nodes):                     $400/month
PostgreSQL HA:                              $150/month
OpenSearch:                                 $120/month
Milvus:                                     $200/month
Redis:                                      $80/month
RabbitMQ:                                   $60/month
MinIO:                                      $100/month
GPU nodes (2x with NVIDIA T4):              $600/month
Load Balancers:                             $20/month
Backups:                                    $50/month
CDN (CloudFlare):                           $20/month
Monitoring:                                 $50/month

TOTAL (Self-Hosted):                        $1,850/month

Savings: ~$3,500/month (65% cheaper!)
Trade-off: More ops work, less managed services
```

---

### 4.5 Scale Performance Targets

```yaml
API Performance:
  Latency (p50): <50ms
  Latency (p95): <200ms
  Latency (p99): <500ms
  Throughput: 5,000 req/sec (peak)

Search Performance:
  Latency (p50): <30ms
  Latency (p95): <100ms
  Fuzzy search: Typo-tolerant (2 edits)
  Results: Paginated (20 per page)

Face Similarity Search:
  Latency (p95): <50ms (Milvus HNSW)
  Accuracy: 95%+ (top-10 results)
  Throughput: 1,000 searches/sec

OCR Processing:
  Latency: <2s per image (GPU-accelerated)
  Queue processing: 100 images/minute
  Accuracy: 90%+ (Tesseract + post-processing)

Face Detection:
  Latency: <500ms per image (GPU)
  Queue processing: 200 images/minute
  Accuracy: 95%+ (MTCNN model)

Database:
  Query latency (p95): <10ms (indexed queries)
  Write throughput: 1,000 inserts/sec
  Read throughput: 10,000 queries/sec (with replicas)
  Connection pooling: 500 max connections

Availability:
  Uptime: 99.9% (< 8.7 hours/year downtime)
  RTO (Recovery Time Objective): < 1 hour
  RPO (Recovery Point Objective): < 5 minutes (WAL archiving)

Autoscaling:
  API pods: 3-10 replicas (CPU > 70%)
  Worker pods: 2-20 replicas (queue depth > 100)
  Database: Read replicas (2-5 based on load)
```

---

### 4.6 Scale Migration Path (MVP → Scale)

```yaml
Phase 1: MVP (Month 1-6)
  - Single VPS, monolith, PostgreSQL + pgvector
  - Cost: $100-150/month
  - Scale: 0-10K reports, 1K searches/day

Phase 2: Microservices Split (Month 6-12)
  - Split monolith → 3-5 services (report, search, auth, ML, admin)
  - Add Typesense (search engine)
  - Multi-VPS deployment (Docker Swarm alebo K3s)
  - Cost: $400-600/month
  - Scale: 10K-50K reports, 5K searches/day

Phase 3: Kubernetes + GPU (Month 12-18)
  - Migrate to Kubernetes (self-hosted alebo managed)
  - Add GPU nodes (face detection, OCR)
  - OpenSearch + Milvus (replace pgvector)
  - RabbitMQ cluster
  - Cost: $1,500-2,000/month
  - Scale: 50K-200K reports, 20K searches/day

Phase 4: Full Scale (Month 18+)
  - Multi-region deployment (EU, US)
  - Istio service mesh
  - Advanced monitoring (Jaeger, ELK)
  - CDN optimization
  - Cost: $4,000-5,000/month
  - Scale: 200K+ reports, 50K+ searches/day

Migration Checklist:
  ✅ Database: PostgreSQL (single) → Patroni HA cluster
  ✅ Vector DB: pgvector → Milvus distributed
  ✅ Search: pg_trgm → Typesense → OpenSearch
  ✅ Queue: Redis Streams → RabbitMQ cluster
  ✅ Storage: MinIO single → MinIO distributed
  ✅ Workers: CPU-based → GPU-accelerated
  ✅ Deployment: Docker Compose → Kubernetes
  ✅ Monitoring: Basic logs → Full observability stack
```

---

## 5. WordPress Plugin Integration

### 5.1 WordPress Plugin Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  scamnemesis-plugin/                                        │
│  ├── scamnemesis.php              (Main plugin file)        │
│  ├── includes/                                              │
│  │   ├── class-api-client.php    (REST API wrapper)        │
│  │   ├── class-auth.php          (JWT auth handling)       │
│  │   ├── class-cache.php         (WP transients cache)     │
│  │   ├── class-settings.php      (Admin settings page)     │
│  │   └── class-shortcodes.php    (Shortcode handlers)      │
│  ├── public/                                                │
│  │   ├── css/                                               │
│  │   │   └── scamnemesis-public.css                        │
│  │   ├── js/                                                │
│  │   │   ├── alpine.min.js       (Alpine.js 15KB)          │
│  │   │   ├── search-widget.js    (Search functionality)    │
│  │   │   └── report-form.js      (Report submission)       │
│  │   └── templates/                                         │
│  │       ├── search-widget.php   (Search UI template)      │
│  │       ├── report-form.php     (Report form template)    │
│  │       └── results-list.php    (Search results template) │
│  ├── admin/                                                 │
│  │   ├── css/                                               │
│  │   │   └── scamnemesis-admin.css                         │
│  │   ├── js/                                                │
│  │   │   └── admin-settings.js                             │
│  │   └── views/                                             │
│  │       ├── settings-page.php   (Plugin settings UI)      │
│  │       └── dashboard-widget.php (WP dashboard widget)    │
│  └── languages/                                             │
│      ├── scamnemesis-sk_SK.po    (Slovak translations)     │
│      └── scamnemesis-en_US.po    (English translations)    │
└─────────────────────────────────────────────────────────────┘
```

---

### 5.2 REST API Wrapper (class-api-client.php)

```php
<?php
/**
 * Scamnemesis API Client
 * Handles all communication with backend microservices
 */

class Scamnemesis_API_Client {

    private $api_base_url;
    private $api_key;
    private $cache_enabled;
    private $cache_ttl = 300; // 5 minutes

    public function __construct() {
        $this->api_base_url = get_option('scamnemesis_api_url', 'https://api.scamnemesis.sk');
        $this->api_key = get_option('scamnemesis_api_key');
        $this->cache_enabled = get_option('scamnemesis_cache_enabled', true);
    }

    /**
     * Search reports (fuzzy search)
     */
    public function search_reports($query, $filters = [], $page = 1, $limit = 20) {
        $cache_key = 'scamnemesis_search_' . md5($query . serialize($filters) . $page);

        // Check cache
        if ($this->cache_enabled) {
            $cached = get_transient($cache_key);
            if ($cached !== false) {
                return $cached;
            }
        }

        // API request
        $response = $this->request('POST', '/api/v1/search', [
            'query' => $query,
            'filters' => $filters,
            'page' => $page,
            'limit' => $limit
        ]);

        // Cache response
        if ($this->cache_enabled && !is_wp_error($response)) {
            set_transient($cache_key, $response, $this->cache_ttl);
        }

        return $response;
    }

    /**
     * Submit fraud report
     */
    public function submit_report($data) {
        // Validate reCAPTCHA
        $recaptcha_token = $data['recaptcha_token'] ?? '';
        if (!$this->verify_recaptcha($recaptcha_token)) {
            return new WP_Error('recaptcha_failed', 'reCAPTCHA verification failed');
        }

        // Upload files to MinIO/S3
        $uploaded_files = [];
        if (!empty($data['files'])) {
            foreach ($data['files'] as $file) {
                $upload = $this->upload_file($file);
                if (is_wp_error($upload)) {
                    return $upload;
                }
                $uploaded_files[] = $upload['url'];
            }
        }

        // Submit to backend
        $response = $this->request('POST', '/api/v1/reports', [
            'scammer_name' => sanitize_text_field($data['scammer_name']),
            'email' => sanitize_email($data['email']),
            'phone' => sanitize_text_field($data['phone']),
            'description' => sanitize_textarea_field($data['description']),
            'amount_lost' => floatval($data['amount_lost']),
            'category' => sanitize_text_field($data['category']),
            'attachments' => $uploaded_files,
            'user_id' => get_current_user_id() ?: null
        ]);

        // Clear search cache (new report added)
        $this->clear_cache('scamnemesis_search_*');

        return $response;
    }

    /**
     * Get report by ID
     */
    public function get_report($report_id) {
        $cache_key = 'scamnemesis_report_' . $report_id;

        if ($this->cache_enabled) {
            $cached = get_transient($cache_key);
            if ($cached !== false) {
                return $cached;
            }
        }

        $response = $this->request('GET', '/api/v1/reports/' . $report_id);

        if ($this->cache_enabled && !is_wp_error($response)) {
            set_transient($cache_key, $response, $this->cache_ttl);
        }

        return $response;
    }

    /**
     * Face similarity search
     */
    public function search_by_face($image_data) {
        // Upload image temporarily
        $upload = $this->upload_file($image_data);
        if (is_wp_error($upload)) {
            return $upload;
        }

        // Request face search
        $response = $this->request('POST', '/api/v1/search/face', [
            'image_url' => $upload['url'],
            'limit' => 10
        ]);

        return $response;
    }

    /**
     * Generic HTTP request handler
     */
    private function request($method, $endpoint, $data = []) {
        $url = $this->api_base_url . $endpoint;

        $args = [
            'method' => $method,
            'headers' => [
                'Content-Type' => 'application/json',
                'X-API-Key' => $this->api_key,
                'User-Agent' => 'ScamnemesisWP/' . SCAMNEMESIS_VERSION
            ],
            'timeout' => 30
        ];

        if ($method === 'POST' || $method === 'PUT') {
            $args['body'] = json_encode($data);
        }

        $response = wp_remote_request($url, $args);

        if (is_wp_error($response)) {
            error_log('Scamnemesis API Error: ' . $response->get_error_message());
            return $response;
        }

        $code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);

        if ($code >= 400) {
            return new WP_Error('api_error', 'API returned error: ' . $code, ['response' => $body]);
        }

        return json_decode($body, true);
    }

    /**
     * Upload file to object storage
     */
    private function upload_file($file) {
        // Get presigned upload URL from backend
        $response = $this->request('POST', '/api/v1/upload/presigned', [
            'filename' => $file['name'],
            'content_type' => $file['type']
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        // Upload to MinIO/S3 using presigned URL
        $upload_response = wp_remote_post($response['upload_url'], [
            'body' => file_get_contents($file['tmp_name']),
            'headers' => [
                'Content-Type' => $file['type']
            ]
        ]);

        if (is_wp_error($upload_response)) {
            return $upload_response;
        }

        return [
            'url' => $response['file_url'],
            'key' => $response['file_key']
        ];
    }

    /**
     * Verify reCAPTCHA token
     */
    private function verify_recaptcha($token) {
        $secret = get_option('scamnemesis_recaptcha_secret');

        $response = wp_remote_post('https://www.google.com/recaptcha/api/siteverify', [
            'body' => [
                'secret' => $secret,
                'response' => $token
            ]
        ]);

        if (is_wp_error($response)) {
            return false;
        }

        $result = json_decode(wp_remote_retrieve_body($response), true);
        return $result['success'] ?? false;
    }

    /**
     * Clear cache by pattern
     */
    private function clear_cache($pattern) {
        global $wpdb;
        $pattern = str_replace('*', '%', $pattern);
        $wpdb->query($wpdb->prepare(
            "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s",
            '_transient_' . $pattern
        ));
    }
}
```

---

### 5.3 Shortcode Handlers (class-shortcodes.php)

```php
<?php
/**
 * Scamnemesis Shortcodes
 */

class Scamnemesis_Shortcodes {

    private $api_client;

    public function __construct() {
        $this->api_client = new Scamnemesis_API_Client();

        // Register shortcodes
        add_shortcode('scamnemesis_search', [$this, 'search_widget']);
        add_shortcode('scamnemesis_report_form', [$this, 'report_form']);
        add_shortcode('scamnemesis_latest_reports', [$this, 'latest_reports']);
        add_shortcode('scamnemesis_stats', [$this, 'stats_widget']);
    }

    /**
     * [scamnemesis_search]
     * Search widget with fuzzy search
     */
    public function search_widget($atts) {
        $atts = shortcode_atts([
            'placeholder' => __('Search by name, email, phone...', 'scamnemesis'),
            'show_filters' => 'true',
            'limit' => 20
        ], $atts);

        // Enqueue Alpine.js and scripts
        wp_enqueue_script('alpine-js', plugin_dir_url(__FILE__) . '../public/js/alpine.min.js', [], '3.13.0', true);
        wp_enqueue_script('scamnemesis-search', plugin_dir_url(__FILE__) . '../public/js/search-widget.js', ['alpine-js'], '1.0', true);
        wp_enqueue_style('scamnemesis-public', plugin_dir_url(__FILE__) . '../public/css/scamnemesis-public.css', [], '1.0');

        // Localize script
        wp_localize_script('scamnemesis-search', 'scamnemesisSearch', [
            'apiUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('scamnemesis_search'),
            'limit' => intval($atts['limit'])
        ]);

        // Load template
        ob_start();
        include plugin_dir_path(__FILE__) . '../public/templates/search-widget.php';
        return ob_get_clean();
    }

    /**
     * [scamnemesis_report_form]
     * Fraud report submission form
     */
    public function report_form($atts) {
        $atts = shortcode_atts([
            'redirect_url' => '',
            'show_captcha' => 'true'
        ], $atts);

        // Enqueue scripts
        wp_enqueue_script('scamnemesis-report-form', plugin_dir_url(__FILE__) . '../public/js/report-form.js', ['alpine-js'], '1.0', true);

        if ($atts['show_captcha'] === 'true') {
            wp_enqueue_script('recaptcha', 'https://www.google.com/recaptcha/api.js?render=' . get_option('scamnemesis_recaptcha_site_key'), [], null, true);
        }

        wp_localize_script('scamnemesis-report-form', 'scamnemesisForm', [
            'apiUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('scamnemesis_submit_report'),
            'recaptchaSiteKey' => get_option('scamnemesis_recaptcha_site_key'),
            'redirectUrl' => $atts['redirect_url']
        ]);

        ob_start();
        include plugin_dir_path(__FILE__) . '../public/templates/report-form.php';
        return ob_get_clean();
    }

    /**
     * [scamnemesis_latest_reports limit="5"]
     * Display latest fraud reports
     */
    public function latest_reports($atts) {
        $atts = shortcode_atts([
            'limit' => 5
        ], $atts);

        $reports = $this->api_client->request('GET', '/api/v1/reports/latest?limit=' . intval($atts['limit']));

        if (is_wp_error($reports)) {
            return '<p>' . __('Unable to load reports', 'scamnemesis') . '</p>';
        }

        ob_start();
        ?>
        <div class="scamnemesis-latest-reports">
            <?php foreach ($reports['data'] as $report): ?>
                <div class="report-item">
                    <h4><?php echo esc_html($report['scammer_name']); ?></h4>
                    <p><?php echo esc_html(wp_trim_words($report['description'], 30)); ?></p>
                    <a href="<?php echo get_permalink() . '?report_id=' . $report['id']; ?>">
                        <?php _e('Read more', 'scamnemesis'); ?>
                    </a>
                </div>
            <?php endforeach; ?>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * [scamnemesis_stats]
     * Display platform statistics
     */
    public function stats_widget($atts) {
        $stats = get_transient('scamnemesis_stats');

        if ($stats === false) {
            $stats = $this->api_client->request('GET', '/api/v1/stats');
            if (!is_wp_error($stats)) {
                set_transient('scamnemesis_stats', $stats, 3600); // Cache 1 hour
            }
        }

        if (is_wp_error($stats)) {
            return '';
        }

        ob_start();
        ?>
        <div class="scamnemesis-stats">
            <div class="stat-item">
                <span class="stat-number"><?php echo number_format_i18n($stats['total_reports']); ?></span>
                <span class="stat-label"><?php _e('Reports', 'scamnemesis'); ?></span>
            </div>
            <div class="stat-item">
                <span class="stat-number"><?php echo number_format_i18n($stats['total_scammers']); ?></span>
                <span class="stat-label"><?php _e('Scammers', 'scamnemesis'); ?></span>
            </div>
            <div class="stat-item">
                <span class="stat-number">€<?php echo number_format_i18n($stats['total_amount_lost']); ?></span>
                <span class="stat-label"><?php _e('Amount Lost', 'scamnemesis'); ?></span>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}

// Initialize shortcodes
new Scamnemesis_Shortcodes();
```

---

### 5.4 AJAX Handlers (scamnemesis.php)

```php
<?php
/**
 * AJAX handlers for WordPress plugin
 */

// Search AJAX handler
add_action('wp_ajax_scamnemesis_search', 'scamnemesis_ajax_search');
add_action('wp_ajax_nopriv_scamnemesis_search', 'scamnemesis_ajax_search');

function scamnemesis_ajax_search() {
    check_ajax_referer('scamnemesis_search', 'nonce');

    $query = sanitize_text_field($_POST['query'] ?? '');
    $filters = $_POST['filters'] ?? [];
    $page = intval($_POST['page'] ?? 1);

    $api_client = new Scamnemesis_API_Client();
    $results = $api_client->search_reports($query, $filters, $page);

    if (is_wp_error($results)) {
        wp_send_json_error(['message' => $results->get_error_message()]);
    }

    wp_send_json_success($results);
}

// Submit report AJAX handler
add_action('wp_ajax_scamnemesis_submit_report', 'scamnemesis_ajax_submit_report');
add_action('wp_ajax_nopriv_scamnemesis_submit_report', 'scamnemesis_ajax_submit_report');

function scamnemesis_ajax_submit_report() {
    check_ajax_referer('scamnemesis_submit_report', 'nonce');

    $data = [
        'scammer_name' => $_POST['scammer_name'] ?? '',
        'email' => $_POST['email'] ?? '',
        'phone' => $_POST['phone'] ?? '',
        'description' => $_POST['description'] ?? '',
        'amount_lost' => $_POST['amount_lost'] ?? 0,
        'category' => $_POST['category'] ?? '',
        'recaptcha_token' => $_POST['recaptcha_token'] ?? '',
        'files' => $_FILES['attachments'] ?? []
    ];

    $api_client = new Scamnemesis_API_Client();
    $result = $api_client->submit_report($data);

    if (is_wp_error($result)) {
        wp_send_json_error(['message' => $result->get_error_message()]);
    }

    wp_send_json_success([
        'message' => __('Report submitted successfully!', 'scamnemesis'),
        'report_id' => $result['id']
    ]);
}
```

---

### 5.5 Admin Settings Page (admin/views/settings-page.php)

```php
<?php
/**
 * Admin settings page
 */
?>

<div class="wrap">
    <h1><?php _e('Scamnemesis Settings', 'scamnemesis'); ?></h1>

    <form method="post" action="options.php">
        <?php settings_fields('scamnemesis_settings'); ?>
        <?php do_settings_sections('scamnemesis_settings'); ?>

        <table class="form-table">
            <tr>
                <th scope="row">
                    <label for="scamnemesis_api_url"><?php _e('API URL', 'scamnemesis'); ?></label>
                </th>
                <td>
                    <input type="text"
                           id="scamnemesis_api_url"
                           name="scamnemesis_api_url"
                           value="<?php echo esc_attr(get_option('scamnemesis_api_url', 'https://api.scamnemesis.sk')); ?>"
                           class="regular-text">
                    <p class="description"><?php _e('Backend API base URL', 'scamnemesis'); ?></p>
                </td>
            </tr>

            <tr>
                <th scope="row">
                    <label for="scamnemesis_api_key"><?php _e('API Key', 'scamnemesis'); ?></label>
                </th>
                <td>
                    <input type="password"
                           id="scamnemesis_api_key"
                           name="scamnemesis_api_key"
                           value="<?php echo esc_attr(get_option('scamnemesis_api_key')); ?>"
                           class="regular-text">
                    <p class="description"><?php _e('Your API authentication key', 'scamnemesis'); ?></p>
                </td>
            </tr>

            <tr>
                <th scope="row">
                    <label for="scamnemesis_recaptcha_site_key"><?php _e('reCAPTCHA Site Key', 'scamnemesis'); ?></label>
                </th>
                <td>
                    <input type="text"
                           id="scamnemesis_recaptcha_site_key"
                           name="scamnemesis_recaptcha_site_key"
                           value="<?php echo esc_attr(get_option('scamnemesis_recaptcha_site_key')); ?>"
                           class="regular-text">
                </td>
            </tr>

            <tr>
                <th scope="row">
                    <label for="scamnemesis_recaptcha_secret"><?php _e('reCAPTCHA Secret Key', 'scamnemesis'); ?></label>
                </th>
                <td>
                    <input type="password"
                           id="scamnemesis_recaptcha_secret"
                           name="scamnemesis_recaptcha_secret"
                           value="<?php echo esc_attr(get_option('scamnemesis_recaptcha_secret')); ?>"
                           class="regular-text">
                </td>
            </tr>

            <tr>
                <th scope="row">
                    <label for="scamnemesis_cache_enabled"><?php _e('Enable Cache', 'scamnemesis'); ?></label>
                </th>
                <td>
                    <input type="checkbox"
                           id="scamnemesis_cache_enabled"
                           name="scamnemesis_cache_enabled"
                           value="1"
                           <?php checked(get_option('scamnemesis_cache_enabled', true)); ?>>
                    <p class="description"><?php _e('Cache search results for better performance', 'scamnemesis'); ?></p>
                </td>
            </tr>
        </table>

        <?php submit_button(); ?>
    </form>

    <hr>

    <h2><?php _e('System Status', 'scamnemesis'); ?></h2>
    <table class="widefat">
        <tr>
            <td><?php _e('API Connection', 'scamnemesis'); ?></td>
            <td id="api-status">
                <button type="button" class="button" onclick="testApiConnection()">
                    <?php _e('Test Connection', 'scamnemesis'); ?>
                </button>
                <span id="api-status-result"></span>
            </td>
        </tr>
        <tr>
            <td><?php _e('Cache Status', 'scamnemesis'); ?></td>
            <td>
                <?php
                $cache_count = wp_cache_get_count();
                printf(__('%d cached items', 'scamnemesis'), $cache_count);
                ?>
                <button type="button" class="button" onclick="clearCache()">
                    <?php _e('Clear Cache', 'scamnemesis'); ?>
                </button>
            </td>
        </tr>
    </table>
</div>

<script>
function testApiConnection() {
    const resultSpan = document.getElementById('api-status-result');
    resultSpan.textContent = '<?php _e('Testing...', 'scamnemesis'); ?>';

    fetch(ajaxurl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            action: 'scamnemesis_test_api',
            nonce: '<?php echo wp_create_nonce('scamnemesis_test_api'); ?>'
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            resultSpan.textContent = '✅ ' + data.data.message;
            resultSpan.style.color = 'green';
        } else {
            resultSpan.textContent = '❌ ' + data.data.message;
            resultSpan.style.color = 'red';
        }
    });
}

function clearCache() {
    fetch(ajaxurl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            action: 'scamnemesis_clear_cache',
            nonce: '<?php echo wp_create_nonce('scamnemesis_clear_cache'); ?>'
        })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.data.message);
    });
}
</script>
```

---

### 5.6 Communication Flow

```
┌──────────────────────────────────────────────────────────────┐
│  WordPress Plugin ↔ Backend Microservices Flow               │
└──────────────────────────────────────────────────────────────┘

1. USER ACTION (Search):
   User types query → Alpine.js captures input
   ↓
   JavaScript AJAX call → admin-ajax.php (WordPress)
   ↓
   scamnemesis_ajax_search() → Scamnemesis_API_Client::search_reports()
   ↓
   HTTP POST → Kong API Gateway (https://api.scamnemesis.sk/v1/search)
   ↓
   Kong → Search Service (Go/Gin)
   ↓
   Search Service → Typesense/OpenSearch → PostgreSQL
   ↓
   Response (JSON) → WordPress → JavaScript → Alpine.js updates UI

2. USER ACTION (Submit Report):
   User fills form → Alpine.js validates
   ↓
   reCAPTCHA verification (client-side)
   ↓
   JavaScript AJAX call → admin-ajax.php
   ↓
   scamnemesis_ajax_submit_report() → Scamnemesis_API_Client::submit_report()
   ↓
   Upload files:
     Request presigned URL → Backend → MinIO/S3 generates presigned URL
     Upload files directly to MinIO/S3 (bypass backend)
   ↓
   HTTP POST → Kong → Report Service (Go/Gin)
   ↓
   Report Service:
     - Insert report to PostgreSQL
     - Push OCR job to Redis Streams/RabbitMQ
     - Push face detection job to queue
     - Send notification (email/SMS)
   ↓
   Response (report_id) → WordPress → Success message

3. BACKGROUND PROCESSING:
   OCR Worker polls queue → Downloads image from MinIO
   ↓
   Tesseract OCR extracts text → Updates report in PostgreSQL
   ↓
   Face Worker polls queue → Downloads image
   ↓
   MTCNN detects face → FaceNet generates embedding
   ↓
   Stores embedding in Milvus/pgvector
   ↓
   Updates report status in PostgreSQL

4. CACHING FLOW:
   WordPress checks WP transients (5 min cache)
   ↓
   If cache miss → API call → Backend checks Redis cache
   ↓
   If Redis miss → Database query → Cache in Redis (15 min)
   ↓
   Response → Cache in WordPress transients → Return to user
```

---

### 5.7 Shortcode Usage Examples

```php
// Basic search widget
[scamnemesis_search]

// Search with custom placeholder
[scamnemesis_search placeholder="Vyhľadať podvodníka..." show_filters="true" limit="30"]

// Report submission form
[scamnemesis_report_form]

// Report form with redirect
[scamnemesis_report_form redirect_url="/thank-you/" show_captcha="true"]

// Latest reports widget
[scamnemesis_latest_reports limit="10"]

// Statistics widget
[scamnemesis_stats]

// Face similarity search (upload image)
[scamnemesis_face_search max_results="10"]
```

---

### 5.8 WordPress Plugin Features

```yaml
Features:
  ✅ Search Widget:
     - Fuzzy search (typo-tolerant)
     - Real-time results (Alpine.js reactive)
     - Filters: category, date range, amount lost
     - Pagination
     - Cache: WP transients (5 min)

  ✅ Report Form:
     - Multi-file upload (images, PDFs)
     - reCAPTCHA v3 (bot protection)
     - Client-side validation (Alpine.js)
     - Progress indicator (upload progress)
     - Success/error notifications

  ✅ Admin Settings:
     - API URL configuration
     - API key authentication
     - reCAPTCHA keys
     - Cache enable/disable
     - Test API connection button
     - Clear cache button

  ✅ Dashboard Widget:
     - Latest reports
     - Platform statistics
     - Quick links to admin dashboard

  ✅ Caching:
     - WordPress transients (search, reports)
     - Automatic cache invalidation (new report)
     - Configurable TTL (default 5 min)

  ✅ Security:
     - Nonce verification (CSRF protection)
     - Input sanitization
     - reCAPTCHA verification
     - API key authentication

  ✅ i18n (Internationalization):
     - Slovak (sk_SK)
     - English (en_US)
     - PO/MO translation files
```

---

## ZÁVER

Tento dokument poskytuje kompletnú analýzu technických možností pre Scamnemesis fraud-report systém. Hlavné odporúčania:

### MVP Stack (< $150/month):
- **Frontend**: Alpine.js (WP plugin) + React/Next.js (admin dashboard)
- **Backend**: Python + FastAPI (monolith)
- **Database**: PostgreSQL 16 + pgvector
- **Search**: pg_trgm (built-in) alebo Typesense
- **Queue**: Redis Streams
- **Storage**: MinIO + CloudFlare CDN

### Scale Stack ($2,000-5,000/month):
- **Frontend**: Alpine.js + Next.js
- **Backend**: Go (core APIs) + Python (ML workers)
- **Database**: PostgreSQL HA (Patroni)
- **Search**: OpenSearch cluster
- **Vector DB**: Milvus (GPU-accelerated)
- **Queue**: RabbitMQ cluster
- **Storage**: MinIO distributed
- **Orchestration**: Kubernetes (self-hosted alebo AWS EKS)

Tento prístup umožňuje začať s nízkymi nákladmi a postupne škálovať podľa rastu platformy.
