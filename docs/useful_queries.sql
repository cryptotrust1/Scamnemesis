-- useful_queries.sql
-- Scamnemesis - Collection of Useful SQL Queries
-- Author: Database Architect
-- Date: 2025-12-09
-- Description: Common queries for development, testing, and administration

-- ============================================================================
-- DATABASE STATISTICS
-- ============================================================================

-- Get table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Count records in all tables
SELECT
    'users' as table_name,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE deleted_at IS NULL) as active_count
FROM users
UNION ALL
SELECT 'reports', COUNT(*), COUNT(*) FILTER (WHERE deleted_at IS NULL) FROM reports
UNION ALL
SELECT 'perpetrators', COUNT(*), COUNT(*) FILTER (WHERE deleted_at IS NULL) FROM perpetrators
UNION ALL
SELECT 'evidence', COUNT(*), COUNT(*) FILTER (WHERE deleted_at IS NULL) FROM evidence
UNION ALL
SELECT 'comments', COUNT(*), COUNT(*) FILTER (WHERE deleted_at IS NULL) FROM comments
UNION ALL
SELECT 'audit_logs', COUNT(*), COUNT(*) FROM audit_logs
UNION ALL
SELECT 'crawl_results', COUNT(*), COUNT(*) FROM crawl_results;

-- Database overview
SELECT
    pg_size_pretty(pg_database_size(current_database())) as database_size,
    (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) as total_users,
    (SELECT COUNT(*) FROM reports WHERE deleted_at IS NULL) as total_reports,
    (SELECT COUNT(*) FROM perpetrators WHERE deleted_at IS NULL) as total_perpetrators,
    (SELECT COUNT(*) FROM audit_logs) as total_audit_logs;

-- ============================================================================
-- REPORT QUERIES
-- ============================================================================

-- Get recent reports
SELECT
    r.id,
    r.fraud_type,
    r.status,
    r.perpetrator_name,
    r.incident_date,
    r.incident_amount_usd,
    r.incident_country,
    r.submitted_at,
    u.email as reporter_email
FROM reports r
LEFT JOIN users u ON u.id = r.user_id
WHERE r.deleted_at IS NULL
ORDER BY r.submitted_at DESC
LIMIT 20;

-- Reports by fraud type
SELECT
    fraud_type,
    COUNT(*) as count,
    SUM(incident_amount_usd) as total_amount,
    AVG(incident_amount_usd) as avg_amount,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count
FROM reports
WHERE deleted_at IS NULL
GROUP BY fraud_type
ORDER BY count DESC;

-- Reports by status
SELECT
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM reports
WHERE deleted_at IS NULL
GROUP BY status
ORDER BY count DESC;

-- Reports by country
SELECT
    incident_country,
    COUNT(*) as count,
    SUM(incident_amount_usd) as total_amount,
    AVG(incident_amount_usd) as avg_amount
FROM reports
WHERE deleted_at IS NULL AND incident_country IS NOT NULL
GROUP BY incident_country
ORDER BY count DESC
LIMIT 20;

-- High-value fraud reports
SELECT
    r.id,
    r.fraud_type,
    r.perpetrator_name,
    r.incident_amount_usd,
    r.incident_date,
    r.status,
    r.severity
FROM reports r
WHERE r.deleted_at IS NULL
    AND r.incident_amount_usd > 10000
ORDER BY r.incident_amount_usd DESC
LIMIT 50;

-- Recent approved public reports
SELECT
    r.id,
    r.fraud_type,
    r.perpetrator_name,
    r.incident_country,
    r.incident_amount_usd,
    r.view_count,
    COUNT(DISTINCT c.id) as comment_count,
    COUNT(DISTINCT e.id) as evidence_count
FROM reports r
LEFT JOIN comments c ON c.report_id = r.id AND c.deleted_at IS NULL
LEFT JOIN evidence e ON e.report_id = r.id AND e.deleted_at IS NULL
WHERE r.is_public = true
    AND r.status = 'approved'
    AND r.deleted_at IS NULL
GROUP BY r.id
ORDER BY r.submitted_at DESC
LIMIT 20;

-- Reports pending review
SELECT
    r.id,
    r.fraud_type,
    r.perpetrator_name,
    r.incident_amount_usd,
    r.submitted_at,
    EXTRACT(DAY FROM NOW() - r.submitted_at) as days_pending,
    u.email as reporter_email
FROM reports r
LEFT JOIN users u ON u.id = r.user_id
WHERE r.status = 'pending'
    AND r.deleted_at IS NULL
ORDER BY r.submitted_at ASC;

-- ============================================================================
-- PERPETRATOR QUERIES
-- ============================================================================

-- Top perpetrators by report count
SELECT
    p.id,
    p.canonical_name,
    p.report_count,
    p.total_amount_reported_usd,
    p.risk_score,
    p.countries_active,
    p.fraud_types,
    p.pep_match,
    p.sanctions_match,
    p.first_reported_at,
    p.last_reported_at
FROM perpetrators p
WHERE p.deleted_at IS NULL
ORDER BY p.report_count DESC
LIMIT 20;

-- High-risk perpetrators
SELECT
    p.id,
    p.canonical_name,
    p.risk_score,
    p.report_count,
    p.total_amount_reported_usd,
    p.countries_active,
    array_length(p.countries_active, 1) as country_count,
    p.pep_match,
    p.sanctions_match,
    p.law_enforcement_reported
FROM perpetrators p
WHERE p.deleted_at IS NULL
    AND p.risk_score >= 70
ORDER BY p.risk_score DESC;

-- Perpetrators with external matches
SELECT
    p.canonical_name,
    p.risk_score,
    p.report_count,
    CASE WHEN p.pep_match THEN 'PEP' END as pep,
    CASE WHEN p.sanctions_match THEN 'SANCTIONS' END as sanctions,
    CASE WHEN p.law_enforcement_reported THEN 'LAW_ENF' END as law_enf
FROM perpetrators p
WHERE p.deleted_at IS NULL
    AND (p.pep_match OR p.sanctions_match OR p.law_enforcement_reported)
ORDER BY p.risk_score DESC;

-- Perpetrator details with linked reports
SELECT
    p.canonical_name,
    p.risk_score,
    r.id as report_id,
    r.fraud_type,
    r.incident_date,
    r.incident_amount_usd,
    prl.confidence_score,
    prl.matched_on
FROM perpetrators p
JOIN perpetrator_report_links prl ON prl.perpetrator_id = p.id
JOIN reports r ON r.id = prl.report_id
WHERE p.deleted_at IS NULL
    AND r.deleted_at IS NULL
ORDER BY p.risk_score DESC, r.incident_date DESC;

-- ============================================================================
-- USER QUERIES
-- ============================================================================

-- Active users summary
SELECT
    tier,
    status,
    COUNT(*) as count
FROM users
WHERE deleted_at IS NULL
GROUP BY tier, status
ORDER BY tier, status;

-- User activity summary
SELECT
    u.id,
    u.email,
    u.tier,
    u.status,
    COUNT(DISTINCT r.id) as reports_submitted,
    COUNT(DISTINCT c.id) as comments_posted,
    u.last_login_at,
    u.created_at
FROM users u
LEFT JOIN reports r ON r.user_id = u.id AND r.deleted_at IS NULL
LEFT JOIN comments c ON c.user_id = u.id AND c.deleted_at IS NULL
WHERE u.deleted_at IS NULL
GROUP BY u.id
ORDER BY reports_submitted DESC, comments_posted DESC;

-- Users with roles
SELECT
    u.email,
    u.tier,
    ur.role,
    ur.granted_at,
    ur.expires_at
FROM users u
JOIN user_roles ur ON ur.user_id = u.id
WHERE u.deleted_at IS NULL
    AND ur.revoked_at IS NULL
ORDER BY ur.role, u.email;

-- ============================================================================
-- EVIDENCE QUERIES
-- ============================================================================

-- Evidence summary by type
SELECT
    type,
    COUNT(*) as count,
    SUM(file_size_bytes) as total_size_bytes,
    pg_size_pretty(SUM(file_size_bytes)) as total_size,
    COUNT(*) FILTER (WHERE is_public = true) as public_count
FROM evidence
WHERE deleted_at IS NULL
GROUP BY type
ORDER BY count DESC;

-- Reports with most evidence
SELECT
    r.id,
    r.fraud_type,
    r.perpetrator_name,
    COUNT(e.id) as evidence_count,
    SUM(e.file_size_bytes) as total_evidence_size
FROM reports r
JOIN evidence e ON e.report_id = r.id AND e.deleted_at IS NULL
WHERE r.deleted_at IS NULL
GROUP BY r.id
ORDER BY evidence_count DESC
LIMIT 20;

-- Evidence pending virus scan
SELECT
    e.id,
    e.report_id,
    e.type,
    e.filename,
    e.status,
    e.uploaded_at
FROM evidence e
WHERE e.status = 'processing'
    AND e.deleted_at IS NULL
ORDER BY e.uploaded_at ASC;

-- ============================================================================
-- COMMENT QUERIES
-- ============================================================================

-- Recent comments
SELECT
    c.id,
    c.report_id,
    u.email as commenter,
    LEFT(c.content, 100) as content_preview,
    c.status,
    c.created_at
FROM comments c
JOIN users u ON u.id = c.user_id
WHERE c.deleted_at IS NULL
ORDER BY c.created_at DESC
LIMIT 20;

-- Flagged comments
SELECT
    c.id,
    c.report_id,
    u.email as commenter,
    c.content,
    c.flagged_count,
    c.status,
    c.created_at
FROM comments c
JOIN users u ON u.id = c.user_id
WHERE c.flagged_count > 0
    AND c.deleted_at IS NULL
ORDER BY c.flagged_count DESC, c.created_at DESC;

-- Comments by user
SELECT
    u.email,
    COUNT(c.id) as comment_count,
    SUM(c.upvotes) as total_upvotes,
    SUM(c.helpful_count) as total_helpful
FROM users u
JOIN comments c ON c.user_id = u.id AND c.deleted_at IS NULL
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.email
ORDER BY comment_count DESC;

-- ============================================================================
-- DUPLICATE DETECTION QUERIES
-- ============================================================================

-- Find potential duplicates for a report
SELECT * FROM find_duplicate_reports('20000000-0000-0000-0000-000000000001', 0.7);

-- Duplicate clusters needing review
SELECT
    dc.id,
    dc.canonical_report_id,
    array_length(dc.report_ids, 1) as report_count,
    dc.similarity_score,
    dc.created_at
FROM duplicate_clusters dc
WHERE dc.reviewed = false
ORDER BY dc.similarity_score DESC, dc.created_at ASC;

-- Reports marked as duplicates
SELECT
    r.id,
    r.fraud_type,
    r.perpetrator_name,
    r.duplicate_of,
    r.duplicate_cluster_id,
    r.status
FROM reports r
WHERE r.is_duplicate = true
    AND r.deleted_at IS NULL
ORDER BY r.created_at DESC;

-- ============================================================================
-- SEARCH QUERIES
-- ============================================================================

-- Full-text search reports
SELECT
    r.id,
    r.fraud_type,
    r.perpetrator_name,
    r.incident_date,
    ts_rank(r.search_vector_en, plainto_tsquery('english', 'investment scam')) as relevance
FROM reports r
WHERE r.search_vector_en @@ plainto_tsquery('english', 'investment scam')
    AND r.deleted_at IS NULL
ORDER BY relevance DESC
LIMIT 20;

-- Fuzzy search perpetrators by name
SELECT
    p.canonical_name,
    p.risk_score,
    p.report_count,
    similarity(p.canonical_name, 'John Scammer') as name_similarity
FROM perpetrators p
WHERE p.canonical_name % 'John Scammer'
    AND p.deleted_at IS NULL
ORDER BY name_similarity DESC
LIMIT 10;

-- Search reports using the search function
SELECT * FROM search_reports(
    search_query := 'cryptocurrency fraud',
    fraud_type_filter := NULL,
    status_filter := 'approved',
    country_filter := NULL,
    date_from := '2024-01-01',
    date_to := NULL,
    amount_min := 1000,
    amount_max := NULL,
    result_limit := 20,
    result_offset := 0
);

-- ============================================================================
-- CRAWL SOURCE QUERIES
-- ============================================================================

-- Active crawl sources
SELECT
    cs.id,
    cs.name,
    cs.source_type,
    cs.frequency,
    cs.last_crawl_at,
    cs.last_success_at,
    cs.consecutive_failures,
    cs.reliability_score
FROM crawl_sources cs
WHERE cs.is_active = true
ORDER BY cs.source_type, cs.name;

-- Sources due for crawling
SELECT
    cs.name,
    cs.source_type,
    cs.frequency,
    cs.last_crawl_at,
    NOW() - cs.last_crawl_at as time_since_last_crawl
FROM crawl_sources cs
WHERE cs.is_active = true
    AND (
        (cs.frequency = 'hourly' AND cs.last_crawl_at < NOW() - INTERVAL '1 hour') OR
        (cs.frequency = 'daily' AND cs.last_crawl_at < NOW() - INTERVAL '1 day') OR
        (cs.frequency = 'weekly' AND cs.last_crawl_at < NOW() - INTERVAL '1 week') OR
        cs.last_crawl_at IS NULL
    )
ORDER BY cs.last_crawl_at NULLS FIRST;

-- Failing crawl sources
SELECT
    cs.name,
    cs.source_type,
    cs.consecutive_failures,
    cs.last_error,
    cs.last_crawl_at
FROM crawl_sources cs
WHERE cs.consecutive_failures > 0
ORDER BY cs.consecutive_failures DESC;

-- Crawl results with high match scores
SELECT
    cr.id,
    cs.name as source_name,
    p.canonical_name as matched_perpetrator,
    cr.match_score,
    cr.source_title,
    cr.source_url,
    cr.crawled_at
FROM crawl_results cr
JOIN crawl_sources cs ON cs.id = cr.source_id
LEFT JOIN perpetrators p ON p.id = cr.perpetrator_id
WHERE cr.match_score > 0.8
ORDER BY cr.match_score DESC, cr.crawled_at DESC
LIMIT 20;

-- ============================================================================
-- AUDIT LOG QUERIES
-- ============================================================================

-- Recent audit activity
SELECT
    al.action,
    al.user_email,
    al.entity_type,
    al.entity_id,
    al.details,
    al.success,
    al.created_at
FROM audit_logs al
ORDER BY al.created_at DESC
LIMIT 50;

-- Audit activity by user
SELECT
    al.user_email,
    al.action,
    COUNT(*) as count
FROM audit_logs al
WHERE al.user_email IS NOT NULL
GROUP BY al.user_email, al.action
ORDER BY al.user_email, count DESC;

-- Failed actions
SELECT
    al.action,
    al.user_email,
    al.entity_type,
    al.error_message,
    al.created_at
FROM audit_logs al
WHERE al.success = false
ORDER BY al.created_at DESC
LIMIT 20;

-- Report approval/rejection history
SELECT
    al.entity_id as report_id,
    al.action,
    al.user_email as moderator,
    al.details,
    al.created_at
FROM audit_logs al
WHERE al.entity_type = 'report'
    AND al.action IN ('report_approved', 'report_rejected')
ORDER BY al.created_at DESC;

-- ============================================================================
-- ANALYTICS QUERIES
-- ============================================================================

-- Monthly report trends
SELECT
    DATE_TRUNC('month', submitted_at) as month,
    COUNT(*) as report_count,
    SUM(incident_amount_usd) as total_amount,
    COUNT(DISTINCT user_id) as unique_reporters
FROM reports
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('month', submitted_at)
ORDER BY month DESC;

-- Fraud type trends over time
SELECT
    DATE_TRUNC('month', submitted_at) as month,
    fraud_type,
    COUNT(*) as count
FROM reports
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('month', submitted_at), fraud_type
ORDER BY month DESC, count DESC;

-- Geographic distribution
SELECT
    incident_country,
    COUNT(*) as report_count,
    SUM(incident_amount_usd) as total_amount,
    COUNT(DISTINCT perpetrator_name) as unique_perpetrators
FROM reports
WHERE deleted_at IS NULL
    AND incident_country IS NOT NULL
GROUP BY incident_country
ORDER BY report_count DESC;

-- Most active reporters
SELECT
    u.email,
    u.tier,
    COUNT(r.id) as report_count,
    SUM(r.incident_amount_usd) as total_reported_amount,
    MIN(r.submitted_at) as first_report,
    MAX(r.submitted_at) as last_report
FROM users u
JOIN reports r ON r.user_id = u.id AND r.deleted_at IS NULL
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.email, u.tier
ORDER BY report_count DESC
LIMIT 20;

-- ============================================================================
-- MAINTENANCE QUERIES
-- ============================================================================

-- Archive old reports
SELECT archive_old_reports(365); -- Archive reports older than 365 days

-- Recalculate risk scores
SELECT recalculate_all_risk_scores();

-- Find orphaned records (reports without perpetrator links)
SELECT
    r.id,
    r.fraud_type,
    r.perpetrator_name,
    r.submitted_at
FROM reports r
LEFT JOIN perpetrator_report_links prl ON prl.report_id = r.id
WHERE r.deleted_at IS NULL
    AND prl.id IS NULL
    AND r.status = 'approved'
ORDER BY r.submitted_at DESC;

-- Vacuum and analyze tables
VACUUM ANALYZE reports;
VACUUM ANALYZE perpetrators;
VACUUM ANALYZE audit_logs;

-- Check index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Find unused indexes
SELECT
    schemaname,
    tablename,
    indexname
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
    AND idx_scan = 0
    AND indexname NOT LIKE '%_pkey'
ORDER BY tablename, indexname;

-- ============================================================================
-- TESTING QUERIES
-- ============================================================================

-- Test report similarity calculation
SELECT calculate_report_similarity(
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002'
);

-- Test perpetrator risk score
SELECT
    p.canonical_name,
    p.risk_score as current_score,
    calculate_perpetrator_risk_score(p.id) as calculated_score
FROM perpetrators p
WHERE p.deleted_at IS NULL
LIMIT 10;

-- Test user permissions
SELECT * FROM get_user_permissions('00000000-0000-0000-0000-000000000001');

-- Test search function
SELECT * FROM search_reports('fraud', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 10, 0);
