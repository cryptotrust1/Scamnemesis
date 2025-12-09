# Project TODO List - Scamnemesis

## Phase Overview

| Phase | Duration | Focus | Deliverables |
|-------|----------|-------|--------------|
| **MVP** | 6-8 weeks | Core functionality | Working system, basic search, admin |
| **v2** | 4-6 weeks | Enhanced features | Fuzzy search, face detection, crawlers |
| **v3** | 4-6 weeks | Scale & ML | GPU workers, advanced ML, autoscaling |

---

## Phase 1: MVP (6-8 weeks)

### 1.1 Infrastructure Setup (Week 1)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Setup Git repository structure | DevOps | ⬜ Pending | |
| Create Docker Compose for dev | DevOps | ⬜ Pending | |
| Setup PostgreSQL with pgvector | DevOps | ⬜ Pending | |
| Setup Redis | DevOps | ⬜ Pending | |
| Setup MinIO for S3 storage | DevOps | ⬜ Pending | |
| Setup Typesense | DevOps | ⬜ Pending | |
| Configure Traefik reverse proxy | DevOps | ⬜ Pending | |
| Create .env.example | DevOps | ⬜ Pending | |
| Setup CI pipeline (GitHub Actions) | DevOps | ⬜ Pending | |

### 1.2 Database & Backend Foundation (Week 1-2)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Create DB migrations - core tables | Backend | ⬜ Pending | reports, perpetrators, evidence |
| Create DB migrations - users & roles | Backend | ⬜ Pending | users, roles, permissions |
| Create DB migrations - audit & comments | Backend | ⬜ Pending | audit_logs, comments |
| Setup NestJS/FastAPI project structure | Backend | ⬜ Pending | |
| Implement database connection pool | Backend | ⬜ Pending | |
| Create base entity models | Backend | ⬜ Pending | |
| Implement repository pattern | Backend | ⬜ Pending | |

### 1.3 Authentication & Authorization (Week 2)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Implement JWT authentication | Backend | ⬜ Pending | |
| Implement refresh token flow | Backend | ⬜ Pending | |
| Create RBAC middleware | Backend | ⬜ Pending | Basic, Standard, Gold, Admin |
| Implement API key authentication | Backend | ⬜ Pending | |
| Create user registration flow | Backend | ⬜ Pending | |
| Implement password reset | Backend | ⬜ Pending | |
| Add rate limiting middleware | Backend | ⬜ Pending | |
| Unit tests for auth | Backend | ⬜ Pending | |

### 1.4 Report Submission API (Week 2-3)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| POST /reports endpoint | Backend | ⬜ Pending | Full form validation |
| Input sanitization | Backend | ⬜ Pending | |
| CAPTCHA verification | Backend | ⬜ Pending | reCAPTCHA v3 |
| File upload handling | Backend | ⬜ Pending | |
| S3 presigned URL generation | Backend | ⬜ Pending | |
| Virus scanning integration | Backend | ⬜ Pending | ClamAV |
| Report status workflow | Backend | ⬜ Pending | pending→approved/rejected |
| Duplicate exact check (sync) | Backend | ⬜ Pending | phone, email, IBAN |
| GET /reports/:id endpoint | Backend | ⬜ Pending | |
| Integration tests | Backend | ⬜ Pending | |

### 1.5 Masking Module (Week 3)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Implement masking service | Backend | ⬜ Pending | |
| Name masking algorithm | Backend | ⬜ Pending | |
| Phone masking algorithm | Backend | ⬜ Pending | |
| Email masking algorithm | Backend | ⬜ Pending | |
| IBAN masking algorithm | Backend | ⬜ Pending | |
| IP masking algorithm | Backend | ⬜ Pending | |
| Wallet masking algorithm | Backend | ⬜ Pending | |
| Role-based masking config | Backend | ⬜ Pending | |
| Deterministic hashing | Backend | ⬜ Pending | |
| Unit tests for masking | Backend | ⬜ Pending | |

### 1.6 Basic Search (Week 3-4)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Setup Typesense schema | Backend | ⬜ Pending | |
| Index synchronization service | Backend | ⬜ Pending | |
| GET /search endpoint | Backend | ⬜ Pending | |
| Exact search (phone, email, IBAN) | Backend | ⬜ Pending | PostgreSQL |
| Basic fuzzy search (names) | Backend | ⬜ Pending | Typesense |
| Search filters implementation | Backend | ⬜ Pending | country, date, type |
| Search result masking | Backend | ⬜ Pending | |
| Search caching (Redis) | Backend | ⬜ Pending | |
| Integration tests | Backend | ⬜ Pending | |

### 1.7 Admin API (Week 4-5)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| GET /admin/reports/pending | Backend | ⬜ Pending | |
| POST /admin/reports/:id/approve | Backend | ⬜ Pending | |
| POST /admin/reports/:id/reject | Backend | ⬜ Pending | |
| PATCH /admin/reports/:id | Backend | ⬜ Pending | Edit before publish |
| GET /admin/duplicates | Backend | ⬜ Pending | |
| POST /admin/duplicates/:id/merge | Backend | ⬜ Pending | |
| Comment moderation endpoints | Backend | ⬜ Pending | |
| Audit logging middleware | Backend | ⬜ Pending | |
| Export PDF endpoint | Backend | ⬜ Pending | |

### 1.8 Frontend - Public Pages (Week 4-5)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Setup Next.js project | Frontend | ⬜ Pending | |
| Homepage with search bar | Frontend | ⬜ Pending | |
| Search results page | Frontend | ⬜ Pending | |
| Report detail page | Frontend | ⬜ Pending | |
| Report submission form | Frontend | ⬜ Pending | Multi-step wizard |
| Form validation (client-side) | Frontend | ⬜ Pending | |
| File upload component | Frontend | ⬜ Pending | |
| Responsive design | Frontend | ⬜ Pending | |
| i18n setup (SK, EN, CS, DE) | Frontend | ⬜ Pending | |

### 1.9 Frontend - Admin Dashboard (Week 5-6)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Admin login page | Frontend | ⬜ Pending | |
| Dashboard overview | Frontend | ⬜ Pending | Stats, charts |
| Pending reports queue | Frontend | ⬜ Pending | |
| Report detail/edit view | Frontend | ⬜ Pending | |
| Masking toggle per field | Frontend | ⬜ Pending | |
| Duplicate cluster view | Frontend | ⬜ Pending | |
| Comment moderation view | Frontend | ⬜ Pending | |
| User management | Frontend | ⬜ Pending | |
| Audit log viewer | Frontend | ⬜ Pending | |

### 1.10 WordPress Plugin (Week 6)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Plugin boilerplate | Backend | ⬜ Pending | |
| Admin settings page | Backend | ⬜ Pending | |
| [scamnemesis_search] shortcode | Backend | ⬜ Pending | |
| [scamnemesis_report] shortcode | Backend | ⬜ Pending | |
| REST API wrapper | Backend | ⬜ Pending | |
| Gutenberg blocks | Frontend | ⬜ Pending | |

### 1.11 Basic Crawlers (Week 6-7)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Crawler worker architecture | Backend | ⬜ Pending | Bull queue |
| RSS connector base class | Backend | ⬜ Pending | |
| OFAC sanctions connector | Backend | ⬜ Pending | |
| EU sanctions connector | Backend | ⬜ Pending | |
| Interpol connector | Backend | ⬜ Pending | |
| 10 news source connectors | Backend | ⬜ Pending | RSS-based |
| Language detection | Backend | ⬜ Pending | |
| Entity extraction (basic) | Backend | ⬜ Pending | regex patterns |
| Deduplication | Backend | ⬜ Pending | |
| Scheduler configuration | DevOps | ⬜ Pending | |

### 1.12 Testing & Documentation (Week 7-8)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Unit tests (80% coverage) | All | ⬜ Pending | |
| Integration tests | Backend | ⬜ Pending | |
| E2E tests (critical paths) | Frontend | ⬜ Pending | |
| API documentation | Backend | ⬜ Pending | OpenAPI |
| Deployment documentation | DevOps | ⬜ Pending | |
| User guide | All | ⬜ Pending | |

### 1.13 MVP Deployment (Week 8)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Production environment setup | DevOps | ⬜ Pending | |
| SSL certificates | DevOps | ⬜ Pending | |
| DNS configuration | DevOps | ⬜ Pending | |
| Backup configuration | DevOps | ⬜ Pending | |
| Monitoring setup (basic) | DevOps | ⬜ Pending | |
| Production deployment | DevOps | ⬜ Pending | |
| Smoke tests | All | ⬜ Pending | |

---

## Phase 2: Enhanced Features (4-6 weeks)

### 2.1 Advanced Search (Week 1-2)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| OpenSearch/Elasticsearch setup | DevOps | ⬜ Pending | |
| N-gram indexing | Backend | ⬜ Pending | |
| Phonetic search | Backend | ⬜ Pending | |
| Multi-language analyzers | Backend | ⬜ Pending | |
| Transliteration (Cyrillic) | Backend | ⬜ Pending | |
| Vector embeddings for text | ML | ⬜ Pending | |
| Semantic search | Backend | ⬜ Pending | |

### 2.2 Image Pipeline (Week 2-3)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Image worker service | Backend | ⬜ Pending | |
| Thumbnail generation | Backend | ⬜ Pending | |
| pHash computation | Backend | ⬜ Pending | |
| aHash/dHash computation | Backend | ⬜ Pending | |
| Image duplicate detection | Backend | ⬜ Pending | |
| Face detection (CPU) | ML | ⬜ Pending | face-api.js |
| Face crop & alignment | ML | ⬜ Pending | |
| Face embedding storage | Backend | ⬜ Pending | pgvector |
| Face search API | Backend | ⬜ Pending | |
| EXIF stripping | Backend | ⬜ Pending | |

### 2.3 Duplicate Detection (Week 3)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Async duplicate check | Backend | ⬜ Pending | |
| Fuzzy name matching | Backend | ⬜ Pending | Levenshtein, Jaro-Winkler |
| Vector similarity matching | Backend | ⬜ Pending | |
| Duplicate cluster management | Backend | ⬜ Pending | |
| Admin merge UI | Frontend | ⬜ Pending | |
| Duplicate scoring | Backend | ⬜ Pending | |

### 2.4 Expanded Crawlers (Week 3-4)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| 50 news source connectors | Data Eng | ⬜ Pending | |
| Yandex search integration | Data Eng | ⬜ Pending | |
| HTML scraping connectors | Data Eng | ⬜ Pending | |
| Translation pipeline | ML | ⬜ Pending | LibreTranslate |
| NER extraction | ML | ⬜ Pending | |
| Enrichment matching | Backend | ⬜ Pending | |
| Admin enrichment review | Frontend | ⬜ Pending | |

### 2.5 OCR Pipeline (Week 4-5)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| OCR worker service | Backend | ⬜ Pending | |
| Tesseract integration | Backend | ⬜ Pending | |
| PDF page extraction | Backend | ⬜ Pending | |
| Image preprocessing | Backend | ⬜ Pending | |
| Entity extraction from OCR | Backend | ⬜ Pending | |
| EXIF/Geo extraction | Backend | ⬜ Pending | |
| Confidence scoring | Backend | ⬜ Pending | |

### 2.6 Widget Improvements (Week 5)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| JavaScript SDK | Frontend | ⬜ Pending | |
| Customizable styling | Frontend | ⬜ Pending | |
| Domain whitelist config | Backend | ⬜ Pending | |
| Analytics tracking | Backend | ⬜ Pending | |

### 2.7 Kubernetes Setup (Week 5-6)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Helm chart creation | DevOps | ⬜ Pending | |
| Staging environment | DevOps | ⬜ Pending | |
| HPA configuration | DevOps | ⬜ Pending | |
| Network policies | DevOps | ⬜ Pending | |
| Secrets management | DevOps | ⬜ Pending | |

---

## Phase 3: Scale & ML (4-6 weeks)

### 3.1 GPU Workers (Week 1-2)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| GPU node pool setup | DevOps | ⬜ Pending | |
| Face embedding worker | ML | ⬜ Pending | InsightFace/ArcFace |
| Batch embedding generation | ML | ⬜ Pending | |
| EasyOCR GPU worker | ML | ⬜ Pending | |

### 3.2 Advanced ML Features (Week 2-3)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| External face web search | ML | ⬜ Pending | |
| Advanced NER models | ML | ⬜ Pending | |
| Fraud pattern detection | ML | ⬜ Pending | |
| Report quality scoring | ML | ⬜ Pending | |

### 3.3 Production Scaling (Week 3-4)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Managed DB migration | DevOps | ⬜ Pending | Cloud SQL/RDS |
| Read replicas | DevOps | ⬜ Pending | |
| CDN setup | DevOps | ⬜ Pending | |
| Multi-region prep | DevOps | ⬜ Pending | |

### 3.4 Advanced Monitoring (Week 4-5)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Prometheus + Grafana | DevOps | ⬜ Pending | |
| Custom dashboards | DevOps | ⬜ Pending | |
| Alerting rules | DevOps | ⬜ Pending | |
| Distributed tracing | DevOps | ⬜ Pending | Jaeger |
| Log aggregation | DevOps | ⬜ Pending | Loki |

### 3.5 Performance Optimization (Week 5-6)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Load testing | All | ⬜ Pending | k6 |
| Query optimization | Backend | ⬜ Pending | |
| Caching optimization | Backend | ⬜ Pending | |
| Index optimization | Backend | ⬜ Pending | |
| CDN optimization | DevOps | ⬜ Pending | |

---

## Acceptance Criteria

### MVP Release Criteria
- [ ] Report submission works end-to-end
- [ ] Basic search returns relevant results
- [ ] Admin can approve/reject reports
- [ ] Masking works correctly per role
- [ ] Exact duplicate detection flags matches
- [ ] Files upload and store correctly
- [ ] WordPress plugin functional
- [ ] Basic crawlers running
- [ ] Documentation complete
- [ ] No critical bugs

### v2 Release Criteria
- [ ] Fuzzy search working with high quality
- [ ] Face detection and search functional
- [ ] OCR extraction working
- [ ] 50+ news sources crawling
- [ ] Duplicate clustering accurate
- [ ] Widget embeddable on external sites
- [ ] Kubernetes deployment stable

### v3 Release Criteria
- [ ] GPU workers processing embeddings
- [ ] Autoscaling working
- [ ] Load test passing (100 RPS)
- [ ] 99.9% uptime achieved
- [ ] Monitoring and alerting complete
- [ ] Disaster recovery tested

---

## Owner Legend
- **Backend**: Node.js/Python backend developers
- **Frontend**: React/Next.js frontend developers
- **DevOps**: Infrastructure and deployment engineers
- **ML**: Machine learning engineers
- **Data Eng**: Data pipeline engineers
- **All**: Cross-functional team

## Status Legend
- ⬜ Pending
- 🔄 In Progress
- ✅ Completed
- ❌ Blocked
- ⏸️ On Hold
