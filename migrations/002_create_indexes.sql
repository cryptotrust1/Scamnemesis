-- migration_002_create_indexes.sql
-- Scamnemesis Database Schema - Indexes Migration
-- Author: Database Architect
-- Date: 2025-12-09
-- Description: Creates all performance and search indexes for optimal query performance

BEGIN;

-- ============================================================================
-- USERS TABLE INDEXES
-- ============================================================================
COMMENT ON INDEX idx_users_email IS 'Fast email lookup for authentication';
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_users_status IS 'Filter users by status';
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_users_tier IS 'Filter users by subscription tier';
CREATE INDEX idx_users_tier ON users(tier);

COMMENT ON INDEX idx_users_oauth IS 'OAuth provider lookup';
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id) WHERE oauth_provider IS NOT NULL;

COMMENT ON INDEX idx_users_last_login IS 'Sort users by last login';
CREATE INDEX idx_users_last_login ON users(last_login_at DESC) WHERE deleted_at IS NULL;

-- ============================================================================
-- USER ROLES TABLE INDEXES
-- ============================================================================
COMMENT ON INDEX idx_user_roles_user IS 'Get all roles for a user';
CREATE INDEX idx_user_roles_user ON user_roles(user_id) WHERE revoked_at IS NULL;

COMMENT ON INDEX idx_user_roles_role IS 'Find all users with a specific role';
CREATE INDEX idx_user_roles_role ON user_roles(role) WHERE revoked_at IS NULL;

COMMENT ON INDEX idx_user_roles_expires IS 'Find expiring roles';
CREATE INDEX idx_user_roles_expires ON user_roles(expires_at)
    WHERE expires_at IS NOT NULL AND revoked_at IS NULL;

COMMENT ON INDEX idx_user_roles_granted_by IS 'Track who granted roles';
CREATE INDEX idx_user_roles_granted_by ON user_roles(granted_by) WHERE granted_by IS NOT NULL;

-- ============================================================================
-- REPORTS TABLE INDEXES
-- ============================================================================

-- Status and workflow
COMMENT ON INDEX idx_reports_status IS 'Filter reports by workflow status';
CREATE INDEX idx_reports_status ON reports(status) WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_reports_fraud_type IS 'Filter by fraud type';
CREATE INDEX idx_reports_fraud_type ON reports(fraud_type);

COMMENT ON INDEX idx_reports_user IS 'Get all reports by user';
CREATE INDEX idx_reports_user ON reports(user_id) WHERE user_id IS NOT NULL;

COMMENT ON INDEX idx_reports_severity IS 'Filter by severity level';
CREATE INDEX idx_reports_severity ON reports(severity) WHERE severity IS NOT NULL;

-- Date range queries
COMMENT ON INDEX idx_reports_incident_date IS 'Date range queries on incident date';
CREATE INDEX idx_reports_incident_date ON reports(incident_date) WHERE incident_date IS NOT NULL;

COMMENT ON INDEX idx_reports_submitted_at IS 'Sort reports by submission date';
CREATE INDEX idx_reports_submitted_at ON reports(submitted_at DESC);

COMMENT ON INDEX idx_reports_created_at IS 'Sort reports by creation date';
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Geographic searches
COMMENT ON INDEX idx_reports_country IS 'Filter by country';
CREATE INDEX idx_reports_country ON reports(incident_country) WHERE incident_country IS NOT NULL;

-- Financial queries
COMMENT ON INDEX idx_reports_amount IS 'Sort by incident amount';
CREATE INDEX idx_reports_amount ON reports(incident_amount_usd) WHERE incident_amount_usd IS NOT NULL;

COMMENT ON INDEX idx_reports_large_amounts IS 'Find high-value fraud reports';
CREATE INDEX idx_reports_large_amounts ON reports(incident_amount_usd)
    WHERE incident_amount_usd > 10000 AND deleted_at IS NULL;

-- Full-text search (PostgreSQL native)
COMMENT ON INDEX idx_reports_search_vector IS 'Full-text search on report content';
CREATE INDEX idx_reports_search_vector ON reports USING GIN(search_vector_en);

-- Perpetrator searches
COMMENT ON INDEX idx_reports_perp_name IS 'Fuzzy search on perpetrator name';
CREATE INDEX idx_reports_perp_name ON reports USING GIN(perpetrator_name gin_trgm_ops)
    WHERE perpetrator_name IS NOT NULL;

COMMENT ON INDEX idx_reports_perp_email IS 'Search by perpetrator email';
CREATE INDEX idx_reports_perp_email ON reports(LOWER(perpetrator_email))
    WHERE perpetrator_email IS NOT NULL;

COMMENT ON INDEX idx_reports_perp_phone IS 'Search by perpetrator phone';
CREATE INDEX idx_reports_perp_phone ON reports(perpetrator_phone)
    WHERE perpetrator_phone IS NOT NULL;

COMMENT ON INDEX idx_reports_addresses IS 'Search in perpetrator addresses array';
CREATE INDEX idx_reports_addresses ON reports USING GIN(perpetrator_addresses)
    WHERE perpetrator_addresses IS NOT NULL;

-- Duplicate detection
COMMENT ON INDEX idx_reports_duplicate_cluster IS 'Find reports in same duplicate cluster';
CREATE INDEX idx_reports_duplicate_cluster ON reports(duplicate_cluster_id)
    WHERE duplicate_cluster_id IS NOT NULL;

COMMENT ON INDEX idx_reports_is_duplicate IS 'Filter duplicate reports';
CREATE INDEX idx_reports_is_duplicate ON reports(is_duplicate) WHERE is_duplicate;

COMMENT ON INDEX idx_reports_duplicate_of IS 'Find original report of duplicate';
CREATE INDEX idx_reports_duplicate_of ON reports(duplicate_of) WHERE duplicate_of IS NOT NULL;

-- JSONB payload searches
COMMENT ON INDEX idx_reports_payload IS 'Full JSONB search on payload';
CREATE INDEX idx_reports_payload ON reports USING GIN(payload);

COMMENT ON INDEX idx_reports_payload_paths IS 'Optimized JSONB path queries';
CREATE INDEX idx_reports_payload_paths ON reports USING GIN(payload jsonb_path_ops);

-- Composite indexes for common queries
COMMENT ON INDEX idx_reports_status_date IS 'Status + date composite for dashboards';
CREATE INDEX idx_reports_status_date ON reports(status, submitted_at DESC)
    WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_reports_type_status IS 'Fraud type + status composite';
CREATE INDEX idx_reports_type_status ON reports(fraud_type, status)
    WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_reports_user_status IS 'User reports with status filter';
CREATE INDEX idx_reports_user_status ON reports(user_id, status, created_at DESC)
    WHERE user_id IS NOT NULL AND deleted_at IS NULL;

-- Public reports
COMMENT ON INDEX idx_reports_public IS 'Public reports for search engine';
CREATE INDEX idx_reports_public ON reports(is_public, created_at DESC)
    WHERE is_public = TRUE AND deleted_at IS NULL;

-- Analytics
COMMENT ON INDEX idx_reports_view_count IS 'Most viewed reports';
CREATE INDEX idx_reports_view_count ON reports(view_count DESC) WHERE view_count > 0;

COMMENT ON INDEX idx_reports_reviewed IS 'Find reports reviewed by specific user';
CREATE INDEX idx_reports_reviewed ON reports(reviewed_by, reviewed_at)
    WHERE reviewed_by IS NOT NULL;

-- ============================================================================
-- PERPETRATORS TABLE INDEXES
-- ============================================================================

-- Name searches with trigrams
COMMENT ON INDEX idx_perpetrators_name IS 'Fuzzy search on canonical name';
CREATE INDEX idx_perpetrators_name ON perpetrators USING GIN(canonical_name gin_trgm_ops)
    WHERE canonical_name IS NOT NULL;

COMMENT ON INDEX idx_perpetrators_aliases IS 'Search in aliases array';
CREATE INDEX idx_perpetrators_aliases ON perpetrators USING GIN(aliases)
    WHERE aliases IS NOT NULL;

-- Contact information
COMMENT ON INDEX idx_perpetrators_emails IS 'Search in emails array';
CREATE INDEX idx_perpetrators_emails ON perpetrators USING GIN(emails)
    WHERE emails IS NOT NULL;

COMMENT ON INDEX idx_perpetrators_phones IS 'Search in phones array';
CREATE INDEX idx_perpetrators_phones ON perpetrators USING GIN(phones)
    WHERE phones IS NOT NULL;

-- Full-text search
COMMENT ON INDEX idx_perpetrators_search IS 'Full-text search on perpetrator data';
CREATE INDEX idx_perpetrators_search ON perpetrators USING GIN(search_vector);

-- JSONB indexes
COMMENT ON INDEX idx_perpetrators_digital IS 'Search digital identifiers';
CREATE INDEX idx_perpetrators_digital ON perpetrators USING GIN(digital_identifiers);

COMMENT ON INDEX idx_perpetrators_payload IS 'JSONB payload search';
CREATE INDEX idx_perpetrators_payload ON perpetrators USING GIN(payload jsonb_path_ops);

-- Risk assessment
COMMENT ON INDEX idx_perpetrators_risk_score IS 'Sort by risk score';
CREATE INDEX idx_perpetrators_risk_score ON perpetrators(risk_score DESC);

COMMENT ON INDEX idx_perpetrators_high_risk IS 'Filter high-risk perpetrators';
CREATE INDEX idx_perpetrators_high_risk ON perpetrators(risk_score)
    WHERE risk_score >= 70;

-- Statistics
COMMENT ON INDEX idx_perpetrators_report_count IS 'Most reported perpetrators';
CREATE INDEX idx_perpetrators_report_count ON perpetrators(report_count DESC);

COMMENT ON INDEX idx_perpetrators_amount IS 'Highest total amounts';
CREATE INDEX idx_perpetrators_amount ON perpetrators(total_amount_reported_usd DESC);

-- Array fields
COMMENT ON INDEX idx_perpetrators_countries IS 'Search countries active';
CREATE INDEX idx_perpetrators_countries ON perpetrators USING GIN(countries_active);

COMMENT ON INDEX idx_perpetrators_fraud_types IS 'Search by fraud types';
CREATE INDEX idx_perpetrators_fraud_types ON perpetrators USING GIN(fraud_types);

-- External matches
COMMENT ON INDEX idx_perpetrators_pep IS 'Find PEP matches';
CREATE INDEX idx_perpetrators_pep ON perpetrators(pep_match) WHERE pep_match = TRUE;

COMMENT ON INDEX idx_perpetrators_sanctions IS 'Find sanctions matches';
CREATE INDEX idx_perpetrators_sanctions ON perpetrators(sanctions_match)
    WHERE sanctions_match = TRUE;

COMMENT ON INDEX idx_perpetrators_law_enforcement IS 'Law enforcement reported';
CREATE INDEX idx_perpetrators_law_enforcement ON perpetrators(law_enforcement_reported)
    WHERE law_enforcement_reported = TRUE;

-- Timestamps
COMMENT ON INDEX idx_perpetrators_first_reported IS 'First report date';
CREATE INDEX idx_perpetrators_first_reported ON perpetrators(first_reported_at);

COMMENT ON INDEX idx_perpetrators_last_reported IS 'Most recently reported';
CREATE INDEX idx_perpetrators_last_reported ON perpetrators(last_reported_at DESC);

COMMENT ON INDEX idx_perpetrators_created_at IS 'Sort by creation date';
CREATE INDEX idx_perpetrators_created_at ON perpetrators(created_at DESC);

-- ============================================================================
-- PERPETRATOR-REPORT LINKS TABLE INDEXES
-- ============================================================================
COMMENT ON INDEX idx_perp_links_report IS 'Find all perpetrators for a report';
CREATE INDEX idx_perp_links_report ON perpetrator_report_links(report_id);

COMMENT ON INDEX idx_perp_links_perpetrator IS 'Find all reports for a perpetrator';
CREATE INDEX idx_perp_links_perpetrator ON perpetrator_report_links(perpetrator_id);

COMMENT ON INDEX idx_perp_links_confidence IS 'Find low-confidence links for review';
CREATE INDEX idx_perp_links_confidence ON perpetrator_report_links(confidence_score)
    WHERE confidence_score < 1.0;

COMMENT ON INDEX idx_perp_links_type IS 'Filter by link type';
CREATE INDEX idx_perp_links_type ON perpetrator_report_links(link_type);

-- ============================================================================
-- EVIDENCE TABLE INDEXES
-- ============================================================================
COMMENT ON INDEX idx_evidence_report IS 'Get all evidence for a report';
CREATE INDEX idx_evidence_report ON evidence(report_id) WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_evidence_type IS 'Filter by evidence type';
CREATE INDEX idx_evidence_type ON evidence(type);

COMMENT ON INDEX idx_evidence_status IS 'Filter by processing status';
CREATE INDEX idx_evidence_status ON evidence(status);

COMMENT ON INDEX idx_evidence_checksum IS 'Deduplication by checksum';
CREATE INDEX idx_evidence_checksum ON evidence(checksum_sha256)
    WHERE checksum_sha256 IS NOT NULL;

COMMENT ON INDEX idx_evidence_uploaded_at IS 'Sort by upload date';
CREATE INDEX idx_evidence_uploaded_at ON evidence(uploaded_at DESC);

COMMENT ON INDEX idx_evidence_public IS 'Find public evidence';
CREATE INDEX idx_evidence_public ON evidence(is_public) WHERE is_public = TRUE;

COMMENT ON INDEX idx_evidence_virus_scan IS 'Find pending virus scans';
CREATE INDEX idx_evidence_virus_scan ON evidence(virus_scanned_at)
    WHERE status = 'processing';

-- ============================================================================
-- COMMENTS TABLE INDEXES
-- ============================================================================
COMMENT ON INDEX idx_comments_report IS 'Get all comments for a report';
CREATE INDEX idx_comments_report ON comments(report_id) WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_comments_user IS 'Get all comments by user';
CREATE INDEX idx_comments_user ON comments(user_id) WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_comments_parent IS 'Get replies to a comment';
CREATE INDEX idx_comments_parent ON comments(parent_comment_id)
    WHERE parent_comment_id IS NOT NULL;

COMMENT ON INDEX idx_comments_status IS 'Filter by moderation status';
CREATE INDEX idx_comments_status ON comments(status);

COMMENT ON INDEX idx_comments_flagged IS 'Find flagged comments';
CREATE INDEX idx_comments_flagged ON comments(flagged_count) WHERE flagged_count > 0;

COMMENT ON INDEX idx_comments_created_at IS 'Sort by creation date';
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

COMMENT ON INDEX idx_comments_internal IS 'Internal moderator notes';
CREATE INDEX idx_comments_internal ON comments(is_internal, report_id) WHERE is_internal;

-- ============================================================================
-- DUPLICATE CLUSTERS TABLE INDEXES
-- ============================================================================
COMMENT ON INDEX idx_duplicate_clusters_canonical IS 'Find cluster by canonical report';
CREATE INDEX idx_duplicate_clusters_canonical ON duplicate_clusters(canonical_report_id);

COMMENT ON INDEX idx_duplicate_clusters_reports IS 'Search reports in clusters';
CREATE INDEX idx_duplicate_clusters_reports ON duplicate_clusters USING GIN (report_ids);

COMMENT ON INDEX idx_duplicate_clusters_unreviewed IS 'Find unreviewed clusters';
CREATE INDEX idx_duplicate_clusters_unreviewed ON duplicate_clusters(reviewed)
    WHERE NOT reviewed;

COMMENT ON INDEX idx_duplicate_clusters_similarity IS 'Sort by similarity score';
CREATE INDEX idx_duplicate_clusters_similarity ON duplicate_clusters(similarity_score DESC);

-- ============================================================================
-- CRAWL SOURCES TABLE INDEXES
-- ============================================================================
COMMENT ON INDEX idx_crawl_sources_type IS 'Filter by source type';
CREATE INDEX idx_crawl_sources_type ON crawl_sources(source_type);

COMMENT ON INDEX idx_crawl_sources_active IS 'Active sources only';
CREATE INDEX idx_crawl_sources_active ON crawl_sources(is_active) WHERE is_active;

COMMENT ON INDEX idx_crawl_sources_frequency IS 'Filter by crawl frequency';
CREATE INDEX idx_crawl_sources_frequency ON crawl_sources(frequency);

COMMENT ON INDEX idx_crawl_sources_next_crawl IS 'Find sources due for crawling';
CREATE INDEX idx_crawl_sources_next_crawl ON crawl_sources(last_crawl_at, frequency)
    WHERE is_active;

COMMENT ON INDEX idx_crawl_sources_failures IS 'Find failing sources';
CREATE INDEX idx_crawl_sources_failures ON crawl_sources(consecutive_failures)
    WHERE consecutive_failures > 0;

-- ============================================================================
-- CRAWL RESULTS TABLE INDEXES
-- ============================================================================
COMMENT ON INDEX idx_crawl_results_source IS 'Get all results from a source';
CREATE INDEX idx_crawl_results_source ON crawl_results(source_id);

COMMENT ON INDEX idx_crawl_results_perpetrator IS 'Find crawl results for perpetrator';
CREATE INDEX idx_crawl_results_perpetrator ON crawl_results(perpetrator_id)
    WHERE perpetrator_id IS NOT NULL;

COMMENT ON INDEX idx_crawl_results_status IS 'Filter by processing status';
CREATE INDEX idx_crawl_results_status ON crawl_results(status);

COMMENT ON INDEX idx_crawl_results_crawled_at IS 'Sort by crawl date';
CREATE INDEX idx_crawl_results_crawled_at ON crawl_results(crawled_at DESC);

COMMENT ON INDEX idx_crawl_results_match IS 'High-confidence matches';
CREATE INDEX idx_crawl_results_match ON crawl_results(match_score DESC)
    WHERE match_score IS NOT NULL;

COMMENT ON INDEX idx_crawl_results_entities IS 'Search extracted entities';
CREATE INDEX idx_crawl_results_entities ON crawl_results USING GIN (entities_found);

COMMENT ON INDEX idx_crawl_results_content_hash IS 'Deduplication index';
CREATE INDEX idx_crawl_results_content_hash ON crawl_results(content_hash);

-- ============================================================================
-- AUDIT LOGS TABLE INDEXES
-- ============================================================================
COMMENT ON INDEX idx_audit_logs_user IS 'Get all actions by user';
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id) WHERE user_id IS NOT NULL;

COMMENT ON INDEX idx_audit_logs_action IS 'Filter by action type and date';
CREATE INDEX idx_audit_logs_action ON audit_logs(action, created_at DESC);

COMMENT ON INDEX idx_audit_logs_entity IS 'Find all actions on an entity';
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id)
    WHERE entity_id IS NOT NULL;

COMMENT ON INDEX idx_audit_logs_created_at IS 'Sort by timestamp';
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

COMMENT ON INDEX idx_audit_logs_ip IS 'Search by IP address';
CREATE INDEX idx_audit_logs_ip ON audit_logs(ip_address) WHERE ip_address IS NOT NULL;

COMMENT ON INDEX idx_audit_logs_success IS 'Find failed actions';
CREATE INDEX idx_audit_logs_success ON audit_logs(success) WHERE success = FALSE;

COMMENT ON INDEX idx_audit_logs_user_action IS 'User + action composite';
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action, created_at DESC)
    WHERE user_id IS NOT NULL;

-- ============================================================================
-- SEARCH INDEX METADATA TABLE INDEXES
-- ============================================================================
COMMENT ON INDEX idx_search_index_status IS 'Filter by sync status';
CREATE INDEX idx_search_index_status ON search_index_metadata(status);

COMMENT ON INDEX idx_search_index_entity IS 'Filter by entity type';
CREATE INDEX idx_search_index_entity ON search_index_metadata(entity_type);

COMMENT ON INDEX idx_search_index_last_sync IS 'Sort by last sync time';
CREATE INDEX idx_search_index_last_sync ON search_index_metadata(last_sync_completed_at);

COMMENT ON INDEX idx_search_index_out_of_sync IS 'Find out-of-sync indexes';
CREATE INDEX idx_search_index_out_of_sync ON search_index_metadata(status)
    WHERE status IN ('out_of_sync', 'error');

COMMIT;
