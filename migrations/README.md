# Scamnemesis Database Migrations

This directory contains SQL migration scripts for the Scamnemesis fraud reporting system database.

## Migration Order

Execute migrations in the following order:

1. **001_initial_schema.sql** - Creates all tables, types, and constraints
2. **002_create_indexes.sql** - Creates all indexes for performance
3. **003_functions_triggers.sql** - Creates functions, triggers, and views

## Prerequisites

- PostgreSQL 13+ (recommended: PostgreSQL 15+)
- Extensions required:
  - `uuid-ossp` (UUID generation)
  - `pg_trgm` (Trigram similarity matching)
  - `btree_gin` (GIN indexes on btree types)
  - `btree_gist` (GiST indexes on btree types)

## Running Migrations

### Using psql

```bash
# Connect to your database
psql -U postgres -d scamnemesis

# Run migrations in order
\i migrations/001_initial_schema.sql
\i migrations/002_create_indexes.sql
\i migrations/003_functions_triggers.sql
```

### Using command line

```bash
psql -U postgres -d scamnemesis -f migrations/001_initial_schema.sql
psql -U postgres -d scamnemesis -f migrations/002_create_indexes.sql
psql -U postgres -d scamnemesis -f migrations/003_functions_triggers.sql
```

### Using a migration tool

If you're using a migration tool like [golang-migrate](https://github.com/golang-migrate/migrate) or [Flyway](https://flywaydb.org/):

1. Rename files to match your tool's naming convention
2. Configure your tool to run migrations in order
3. Execute migrations through the tool

## Database Setup Script

Complete database setup from scratch:

```bash
#!/bin/bash

DB_NAME="scamnemesis"
DB_USER="scamnemesis_user"
DB_PASSWORD="your_secure_password"

# Create database
createdb -U postgres $DB_NAME

# Create user (if needed)
psql -U postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"

# Grant privileges
psql -U postgres -d $DB_NAME -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
psql -U postgres -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"

# Run migrations
psql -U postgres -d $DB_NAME -f migrations/001_initial_schema.sql
psql -U postgres -d $DB_NAME -f migrations/002_create_indexes.sql
psql -U postgres -d $DB_NAME -f migrations/003_functions_triggers.sql

echo "Database setup complete!"
```

## Verification

After running migrations, verify the setup:

```sql
-- Check extensions
SELECT * FROM pg_extension;

-- Check tables
\dt

-- Check indexes
\di

-- Check functions
\df

-- Check types
\dT

-- Check triggers
SELECT tgname, tgtype, tgenabled FROM pg_trigger WHERE tgisinternal = false;
```

## Migration Details

### 001_initial_schema.sql

Creates:
- 13 custom PostgreSQL types (enums)
- 12 core tables with constraints and relationships
- Table comments and column documentation

Tables created:
- `users` - User accounts and authentication
- `user_roles` - RBAC permissions
- `perpetrators` - Deduplicated fraud perpetrators
- `reports` - Fraud reports
- `perpetrator_report_links` - Many-to-many links
- `evidence` - Attached files and URLs
- `comments` - User comments with threading
- `duplicate_clusters` - Duplicate report groups
- `crawl_sources` - External data source configuration
- `crawl_results` - Crawled data from external sources
- `audit_logs` - Comprehensive audit trail
- `search_index_metadata` - Search engine sync tracking

### 002_create_indexes.sql

Creates:
- 100+ indexes for optimal query performance
- B-tree indexes for exact matches and sorting
- GIN indexes for full-text search and JSONB
- Trigram indexes for fuzzy string matching
- Composite indexes for common query patterns
- Partial indexes for filtered queries

Index categories:
- Primary key and foreign key indexes
- Full-text search (tsvector)
- Fuzzy matching (pg_trgm)
- JSONB path queries
- Array containment
- Geolocation (country codes)
- Date ranges
- Status filtering

### 003_functions_triggers.sql

Creates:
- 10+ stored functions
- 10+ triggers for automation
- 2 materialized views for reporting

Functions:
- `update_updated_at_column()` - Auto-update timestamps
- `update_report_search_vector()` - Auto-update search indexes
- `update_perpetrator_search_vector()` - Auto-update perpetrator search
- `update_perpetrator_stats()` - Auto-calculate statistics
- `calculate_report_similarity()` - Duplicate detection scoring
- `find_duplicate_reports()` - Find potential duplicates
- `merge_perpetrators()` - Merge duplicate perpetrators
- `calculate_perpetrator_risk_score()` - Risk assessment
- `recalculate_all_risk_scores()` - Batch risk updates
- `archive_old_reports()` - Archive old records
- `get_user_permissions()` - Get user RBAC permissions
- `search_reports()` - Advanced search with filters

Views:
- `public_reports_view` - Public-facing report summary
- `perpetrator_stats_view` - Perpetrator statistics

## Rollback

To rollback all migrations (⚠️ DESTRUCTIVE):

```sql
-- Drop all tables (cascades to indexes, triggers, constraints)
DROP TABLE IF EXISTS search_index_metadata CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS crawl_results CASCADE;
DROP TABLE IF EXISTS crawl_sources CASCADE;
DROP TABLE IF EXISTS duplicate_clusters CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS evidence CASCADE;
DROP TABLE IF EXISTS perpetrator_report_links CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS perpetrators CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop types
DROP TYPE IF EXISTS sync_status CASCADE;
DROP TYPE IF EXISTS search_index_type CASCADE;
DROP TYPE IF EXISTS audit_action CASCADE;
DROP TYPE IF EXISTS crawl_result_status CASCADE;
DROP TYPE IF EXISTS crawl_frequency CASCADE;
DROP TYPE IF EXISTS crawl_source_type CASCADE;
DROP TYPE IF EXISTS comment_status CASCADE;
DROP TYPE IF EXISTS evidence_status CASCADE;
DROP TYPE IF EXISTS evidence_type CASCADE;
DROP TYPE IF EXISTS report_severity CASCADE;
DROP TYPE IF EXISTS report_status CASCADE;
DROP TYPE IF EXISTS fraud_type CASCADE;
DROP TYPE IF EXISTS system_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS user_tier CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_report_search_vector() CASCADE;
DROP FUNCTION IF EXISTS update_perpetrator_search_vector() CASCADE;
DROP FUNCTION IF EXISTS update_perpetrator_stats() CASCADE;
DROP FUNCTION IF EXISTS calculate_report_similarity(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS find_duplicate_reports(UUID, NUMERIC) CASCADE;
DROP FUNCTION IF EXISTS merge_perpetrators(UUID, UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS calculate_perpetrator_risk_score(UUID) CASCADE;
DROP FUNCTION IF EXISTS recalculate_all_risk_scores() CASCADE;
DROP FUNCTION IF EXISTS archive_old_reports(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_user_permissions(UUID) CASCADE;
DROP FUNCTION IF EXISTS search_reports CASCADE;

-- Drop views
DROP VIEW IF EXISTS public_reports_view CASCADE;
DROP VIEW IF EXISTS perpetrator_stats_view CASCADE;
```

## Performance Considerations

### Indexing Strategy

- **Reports table**: Heavily indexed for search performance (10+ indexes)
- **Perpetrators table**: Optimized for name/contact matching (8+ indexes)
- **Audit logs**: Consider partitioning by date for large datasets
- **Full-text search**: Uses PostgreSQL native tsvector (consider external search engine for >1M records)

### Partitioning Recommendations

For high-volume deployments, consider partitioning:

```sql
-- Partition audit_logs by month
CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Partition reports by submission year
CREATE TABLE reports_2025 PARTITION OF reports
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### Maintenance

Regular maintenance tasks:

```sql
-- Reindex for performance (run during off-peak hours)
REINDEX TABLE reports;
REINDEX TABLE perpetrators;

-- Update statistics
ANALYZE reports;
ANALYZE perpetrators;

-- Vacuum to reclaim space
VACUUM ANALYZE reports;
VACUUM ANALYZE audit_logs;

-- Archive old audit logs (older than 2 years)
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '2 years';
```

## Security

### Recommended Privileges

```sql
-- Create read-only user for analytics
CREATE USER analyst WITH PASSWORD 'analyst_password';
GRANT CONNECT ON DATABASE scamnemesis TO analyst;
GRANT USAGE ON SCHEMA public TO analyst;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analyst;

-- Create application user with limited privileges
CREATE USER app_user WITH PASSWORD 'app_password';
GRANT CONNECT ON DATABASE scamnemesis TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE ON reports, evidence, comments TO app_user;
GRANT SELECT ON perpetrators, users TO app_user;
GRANT INSERT ON audit_logs TO app_user;
```

### Row-Level Security (RLS)

Consider enabling RLS for multi-tenant scenarios:

```sql
-- Enable RLS on reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own reports
CREATE POLICY user_reports_policy ON reports
    FOR SELECT
    USING (user_id = current_setting('app.current_user_id')::UUID);
```

## Backup & Restore

### Backup

```bash
# Full database backup
pg_dump -U postgres -d scamnemesis -F c -f scamnemesis_backup_$(date +%Y%m%d).dump

# Schema only
pg_dump -U postgres -d scamnemesis --schema-only -f schema_backup.sql

# Data only
pg_dump -U postgres -d scamnemesis --data-only -f data_backup.sql
```

### Restore

```bash
# Restore from custom format
pg_restore -U postgres -d scamnemesis_new scamnemesis_backup_20251209.dump

# Restore from SQL
psql -U postgres -d scamnemesis_new -f schema_backup.sql
psql -U postgres -d scamnemesis_new -f data_backup.sql
```

## Testing

After migration, run tests:

```sql
-- Test report creation
INSERT INTO users (email, tier, status) VALUES ('test@example.com', 'basic', 'active') RETURNING id;

-- Test search function
SELECT * FROM search_reports('investment fraud', NULL, 'pending', NULL, NULL, NULL, NULL, NULL, 10, 0);

-- Test duplicate detection
SELECT * FROM find_duplicate_reports('report-uuid-here', 0.7);

-- Test risk score calculation
SELECT calculate_perpetrator_risk_score('perpetrator-uuid-here');
```

## Monitoring

Query performance monitoring:

```sql
-- Slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan;

-- Table sizes
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(tablename::text)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::text) DESC;
```

## Support

For issues or questions:
- Review the main documentation: `/docs/database_schema.md`
- Check PostgreSQL version compatibility
- Ensure all required extensions are installed
- Review error logs: `tail -f /var/log/postgresql/postgresql-15-main.log`
