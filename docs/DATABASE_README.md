# Scamnemesis Database Documentation

Complete database architecture documentation for the Scamnemesis fraud reporting system.

## 📚 Documentation Index

### Core Documentation

1. **[database_schema.md](./database_schema.md)** - Complete database schema specification
   - Entity Relationship Diagram (ASCII)
   - Full table definitions with all columns
   - Comprehensive indexes (100+)
   - JSON schemas for all payload types
   - Complete fraud type enum (29 types)
   - Migration scripts

2. **[ERD_mermaid.md](./ERD_mermaid.md)** - Visual diagrams
   - Mermaid ERD diagrams
   - Data flow diagrams
   - Report lifecycle state diagram
   - Risk scoring flowchart
   - Search architecture diagram

3. **[useful_queries.sql](./useful_queries.sql)** - SQL query collection
   - Database statistics queries
   - Report analysis queries
   - Perpetrator analytics
   - User activity queries
   - Search examples
   - Maintenance queries
   - Testing queries

### Migration Files

Located in `/migrations/`:

1. **001_initial_schema.sql** - Core schema creation
2. **002_create_indexes.sql** - Performance indexes
3. **003_functions_triggers.sql** - Functions, triggers, and views
4. **004_seed_data.sql** - Sample data for testing
5. **README.md** - Migration execution guide

## 🗄️ Database Overview

### Core Entities

| Table | Purpose | Key Features |
|-------|---------|--------------|
| **users** | User accounts & authentication | OAuth support, tiered access, security tracking |
| **user_roles** | RBAC permissions | Flexible JSONB permissions, role expiration |
| **reports** | Fraud reports | Full-text search, JSONB payload, duplicate detection |
| **perpetrators** | Deduplicated fraud actors | Risk scoring, external data matching, statistics |
| **evidence** | Attached files & URLs | S3 storage, virus scanning, metadata extraction |
| **comments** | User discussions | Threading, moderation, upvoting |
| **perpetrator_report_links** | Report-perpetrator relationships | Confidence scoring, match tracking |
| **duplicate_clusters** | Duplicate report groups | Similarity scoring, review workflow |
| **crawl_sources** | External data sources | Configurable crawlers, scheduling |
| **crawl_results** | Crawled external data | Entity matching, data enrichment |
| **audit_logs** | System audit trail | Comprehensive activity logging |
| **search_index_metadata** | Search sync tracking | External index synchronization |

### Key Statistics

- **12 Core Tables**
- **13 Custom PostgreSQL Types** (enums)
- **100+ Indexes** (B-tree, GIN, trigram)
- **10+ Functions** (stored procedures)
- **10+ Triggers** (automation)
- **2 Views** (reporting)
- **29 Fraud Types** (comprehensive categorization)

## 🏗️ Architecture Highlights

### 1. Search & Performance

```sql
-- Full-text search on reports
CREATE INDEX idx_reports_search_vector ON reports USING GIN(search_vector_en);

-- Fuzzy name matching on perpetrators
CREATE INDEX idx_perpetrators_name ON perpetrators
    USING GIN(canonical_name gin_trgm_ops);

-- JSONB payload search
CREATE INDEX idx_reports_payload ON reports USING GIN(payload jsonb_path_ops);
```

### 2. Duplicate Detection

```sql
-- Find potential duplicates
SELECT * FROM find_duplicate_reports(
    target_report_id := 'uuid-here',
    similarity_threshold := 0.7
);

-- Calculate similarity score
SELECT calculate_report_similarity(
    report1_id := 'uuid-1',
    report2_id := 'uuid-2'
);
```

### 3. Risk Scoring

```sql
-- Auto-calculated risk score (0-100)
SELECT calculate_perpetrator_risk_score('perpetrator-id');

-- Factors considered:
-- - Report count (max 30 points)
-- - Total amount (max 25 points)
-- - Countries active (max 15 points)
-- - Multiple fraud types (max 10 points)
-- - External matches: PEP, sanctions, law enforcement (max 20 points)
```

### 4. RBAC Permissions

```sql
-- Flexible JSONB permissions structure
{
  "reports": {
    "create": true,
    "read": true,
    "update": true,
    "delete": true,
    "approve": true
  },
  "perpetrators": {
    "merge": true,
    "view_sensitive": true
  }
}
```

## 🚀 Quick Start

### 1. Database Setup

```bash
# Create database
createdb scamnemesis

# Run migrations
psql -d scamnemesis -f migrations/001_initial_schema.sql
psql -d scamnemesis -f migrations/002_create_indexes.sql
psql -d scamnemesis -f migrations/003_functions_triggers.sql

# Load sample data (optional)
psql -d scamnemesis -f migrations/004_seed_data.sql
```

### 2. Verify Installation

```sql
-- Check tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check indexes
SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';

-- Check extensions
SELECT * FROM pg_extension;
```

### 3. Test Queries

```sql
-- Search reports
SELECT * FROM search_reports(
    search_query := 'investment fraud',
    status_filter := 'approved',
    result_limit := 10
);

-- Find high-risk perpetrators
SELECT canonical_name, risk_score, report_count
FROM perpetrators
WHERE risk_score >= 70
ORDER BY risk_score DESC;
```

## 📊 Data Model Highlights

### Report Payload Structure

```json
{
  "incident": {
    "date": "2024-12-01",
    "fraud_type": "investment_fraud",
    "description": "...",
    "location": {"country": "US", "city": "New York"}
  },
  "perpetrator": {
    "name": "John Scammer",
    "email": ["scammer@fake.com"],
    "phone": ["+1-555-0123"]
  },
  "digital_footprints": {
    "websites": ["https://fake-site.com"],
    "social_media": [...]
  },
  "financial": {
    "total_loss": {"amount": 50000, "currency": "USD"},
    "transactions": [...]
  },
  "crypto": {
    "addresses": [...]
  },
  "reporter": {
    "relationship": "victim",
    "consent_to_contact": true
  }
}
```

### Fraud Types (29 Categories)

**Financial & Investment:**
- Investment Fraud, Ponzi Scheme, Pyramid/MLM, Cryptocurrency Scam, Advance Fee Fraud

**Identity & Account:**
- Identity Theft, Account Takeover, SIM Swapping, Phishing

**Romance & Social:**
- Romance Scam, Catfishing, Sextortion, Social Engineering

**E-commerce:**
- Online Shopping Fraud, Rental Scam, Employment Scam

**Technical:**
- Tech Support Scam, Ransomware

**Impersonation:**
- Government Impersonation, Business Email Compromise, Fake Charity

**Other:**
- Lottery/Prize Scam, Grandparent Scam, Utility Scam, and more...

## 🔍 Common Query Patterns

### 1. Search & Filter Reports

```sql
-- Full-text search with filters
SELECT * FROM search_reports(
    search_query := 'romance scam dating app',
    fraud_type_filter := 'romance_scam',
    country_filter := 'US',
    date_from := '2024-01-01',
    amount_min := 1000,
    result_limit := 20
);
```

### 2. Perpetrator Analytics

```sql
-- Top 10 most reported perpetrators
SELECT
    p.canonical_name,
    p.risk_score,
    p.report_count,
    p.total_amount_reported_usd,
    p.countries_active
FROM perpetrators p
WHERE p.deleted_at IS NULL
ORDER BY p.report_count DESC
LIMIT 10;
```

### 3. Duplicate Detection

```sql
-- Find potential duplicates for a report
SELECT
    report_id,
    similarity_score,
    matched_fields
FROM find_duplicate_reports(
    '20000000-0000-0000-0000-000000000001',
    0.75
);
```

### 4. User Activity

```sql
-- User submission statistics
SELECT
    u.email,
    COUNT(r.id) as reports_submitted,
    SUM(r.incident_amount_usd) as total_reported,
    MAX(r.submitted_at) as last_submission
FROM users u
JOIN reports r ON r.user_id = u.id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.email
ORDER BY reports_submitted DESC;
```

## 🛠️ Maintenance

### Regular Tasks

```sql
-- Archive old reports (annually)
SELECT archive_old_reports(365);

-- Recalculate risk scores (weekly)
SELECT recalculate_all_risk_scores();

-- Vacuum and analyze (nightly)
VACUUM ANALYZE reports;
VACUUM ANALYZE perpetrators;
VACUUM ANALYZE audit_logs;

-- Update statistics (weekly)
ANALYZE;
```

### Performance Monitoring

```sql
-- Check index usage
SELECT
    tablename,
    indexname,
    idx_scan as scans,
    idx_tup_read as tuples_read
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Find slow queries
SELECT
    query,
    calls,
    total_time,
    mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## 🔐 Security Considerations

### 1. Row-Level Security (RLS)

```sql
-- Enable RLS on sensitive tables
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users see only their own reports
CREATE POLICY user_reports_policy ON reports
    FOR SELECT
    USING (user_id = current_setting('app.current_user_id')::UUID);
```

### 2. Audit Logging

All sensitive operations are automatically logged in `audit_logs`:
- User authentication
- Report creation/modification/deletion
- Permission changes
- Data exports
- Configuration updates

### 3. Data Masking

Sensitive PII can be masked for non-privileged users:
- Email addresses → `j***@example.com`
- Phone numbers → `+1-***-***-1234`
- Crypto addresses → `1A1z...DivfNa`

## 📈 Scaling Recommendations

### For High Volume (>1M records)

1. **Partition Large Tables**
   ```sql
   -- Partition audit_logs by month
   CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs
       FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
   ```

2. **Use External Search Engine**
   - Elasticsearch for full-text search
   - MeiliSearch for typo-tolerant search
   - Sync via `search_index_metadata` table

3. **Implement Caching**
   - Redis for frequent queries
   - Materialized views for reports

4. **Archive Strategy**
   - Move old reports to archive tables
   - Compress historical data
   - Separate read replicas for analytics

## 🧪 Testing

### Run Sample Data

```bash
psql -d scamnemesis -f migrations/004_seed_data.sql
```

### Verify Functions

```sql
-- Test similarity calculation
SELECT calculate_report_similarity(
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002'
);

-- Test risk scoring
SELECT calculate_perpetrator_risk_score('10000000-0000-0000-0000-000000000001');

-- Test search
SELECT * FROM search_reports('fraud', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 10, 0);
```

## 📝 JSON Schema Validation

Use JSON Schema validation in your application layer to ensure data integrity:

1. **Report Payload**: Validates incident details, perpetrator info, financial data
2. **Perpetrator Payload**: Validates identity, contact info, modus operandi
3. **Evidence Metadata**: Validates file metadata, EXIF data, extracted content
4. **User Permissions**: Validates RBAC permission structure

See `database_schema.md` for complete JSON schemas.

## 🆘 Troubleshooting

### Common Issues

**1. Slow searches**
```sql
-- Check if search indexes exist
SELECT * FROM pg_indexes WHERE tablename = 'reports' AND indexname LIKE '%search%';

-- Rebuild if needed
REINDEX TABLE reports;
```

**2. High disk usage**
```sql
-- Check table sizes
SELECT tablename, pg_size_pretty(pg_total_relation_size(tablename::text))
FROM pg_tables WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::text) DESC;

-- Vacuum to reclaim space
VACUUM FULL;
```

**3. Missing extensions**
```sql
-- Install required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
```

## 📚 Further Reading

- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Full-Text Search**: https://www.postgresql.org/docs/current/textsearch.html
- **JSONB Indexing**: https://www.postgresql.org/docs/current/datatype-json.html
- **pg_trgm Extension**: https://www.postgresql.org/docs/current/pgtrgm.html

## 🤝 Contributing

When modifying the database schema:

1. Create a new migration file with sequential numbering
2. Document all changes in comments
3. Update this documentation
4. Test with sample data
5. Update JSON schemas if payload structure changes

## 📄 License

This database schema is part of the Scamnemesis fraud reporting system.

---

**Database Version**: 1.0.0
**PostgreSQL**: 13+ (Recommended: 15+)
**Last Updated**: 2025-12-09
