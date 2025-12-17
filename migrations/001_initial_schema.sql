-- migration_001_initial_schema.sql
-- Scamnemesis Database Schema - Initial Migration
-- Author: Database Architect
-- Date: 2025-12-09
-- Description: Creates all base tables, types, and constraints for the Scamnemesis fraud reporting system

BEGIN;

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ============================================================================
-- CUSTOM TYPES
-- ============================================================================

-- User types
CREATE TYPE user_tier AS ENUM ('basic', 'standard', 'gold', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deleted', 'pending_verification');
CREATE TYPE system_role AS ENUM ('user', 'moderator', 'analyst', 'admin', 'superadmin');

-- Fraud types (29 categories)
CREATE TYPE fraud_type AS ENUM (
    'romance_scam',
    'investment_fraud',
    'phishing',
    'identity_theft',
    'online_shopping_fraud',
    'tech_support_scam',
    'lottery_prize_scam',
    'employment_scam',
    'rental_scam',
    'cryptocurrency_scam',
    'pyramid_mlm_scheme',
    'insurance_fraud',
    'credit_card_fraud',
    'wire_fraud',
    'money_mule',
    'advance_fee_fraud',
    'business_email_compromise',
    'social_engineering',
    'fake_charity',
    'government_impersonation',
    'utility_scam',
    'grandparent_scam',
    'sextortion',
    'ransomware',
    'account_takeover',
    'sim_swapping',
    'catfishing',
    'ponzi_scheme',
    'other'
);

-- Report types
CREATE TYPE report_status AS ENUM (
    'pending',
    'under_review',
    'approved',
    'rejected',
    'archived',
    'flagged',
    'requires_info'
);

CREATE TYPE report_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- Evidence types
CREATE TYPE evidence_type AS ENUM (
    'screenshot',
    'document',
    'video',
    'audio',
    'chat_log',
    'transaction_record',
    'email',
    'url',
    'other'
);

CREATE TYPE evidence_status AS ENUM (
    'uploaded',
    'processing',
    'available',
    'virus_detected',
    'rejected',
    'deleted'
);

-- Comment types
CREATE TYPE comment_status AS ENUM ('active', 'hidden', 'deleted', 'flagged', 'approved');

-- Crawl types
CREATE TYPE crawl_source_type AS ENUM (
    'news',
    'pep_list',
    'sanctions_list',
    'court_records',
    'social_media',
    'custom'
);

CREATE TYPE crawl_frequency AS ENUM ('realtime', 'hourly', 'daily', 'weekly', 'monthly', 'manual');
CREATE TYPE crawl_result_status AS ENUM ('pending', 'processed', 'matched', 'no_match', 'error');

-- Audit types
CREATE TYPE audit_action AS ENUM (
    'user_created',
    'user_updated',
    'user_deleted',
    'user_login',
    'user_logout',
    'user_password_reset',
    'role_granted',
    'role_revoked',
    'report_created',
    'report_updated',
    'report_approved',
    'report_rejected',
    'report_deleted',
    'report_viewed',
    'evidence_uploaded',
    'evidence_deleted',
    'comment_created',
    'comment_moderated',
    'comment_deleted',
    'perpetrator_created',
    'perpetrator_merged',
    'perpetrator_updated',
    'crawl_executed',
    'config_updated',
    'export_generated',
    'search_performed'
);

-- Search types
CREATE TYPE search_index_type AS ENUM ('elasticsearch', 'opensearch', 'meilisearch', 'typesense');
CREATE TYPE sync_status AS ENUM ('in_sync', 'syncing', 'out_of_sync', 'error');

-- ============================================================================
-- TABLE: users
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Authentication
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255),
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255),

    -- Profile
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    country_code VARCHAR(2),

    -- Role & Permissions
    tier user_tier DEFAULT 'basic',
    status user_status DEFAULT 'pending_verification',

    -- Security
    login_count INTEGER DEFAULT 0,
    last_login_at TIMESTAMPTZ,
    last_login_ip INET,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT email_lowercase CHECK (email = LOWER(email)),
    CONSTRAINT valid_oauth CHECK (
        (oauth_provider IS NOT NULL AND oauth_id IS NOT NULL) OR
        (oauth_provider IS NULL AND oauth_id IS NULL AND password_hash IS NOT NULL)
    )
);

COMMENT ON TABLE users IS 'System users with authentication and profile information';
COMMENT ON COLUMN users.tier IS 'User tier: basic (free), standard, gold, admin';
COMMENT ON COLUMN users.status IS 'Account status: active, suspended, deleted, pending_verification';

-- ============================================================================
-- TABLE: user_roles
-- ============================================================================
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role system_role NOT NULL,

    -- Permissions (JSONB for flexibility)
    permissions JSONB DEFAULT '{}',

    -- Scope (optional: limit to specific reports, regions, etc.)
    scope JSONB DEFAULT '{}',

    -- Metadata
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES users(id),
    reason TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_expiration CHECK (expires_at IS NULL OR expires_at > granted_at)
);

-- Partial unique index for active user roles (replaces invalid inline constraint)
CREATE UNIQUE INDEX idx_unique_active_user_role ON user_roles (user_id, role) WHERE revoked_at IS NULL;

COMMENT ON TABLE user_roles IS 'Role-based access control (RBAC) for users';
COMMENT ON COLUMN user_roles.role IS 'System role: user, moderator, analyst, admin, superadmin';
COMMENT ON COLUMN user_roles.permissions IS 'JSON object defining granular permissions';

-- ============================================================================
-- TABLE: perpetrators
-- ============================================================================
CREATE TABLE perpetrators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Core Identity (deduplicated)
    canonical_name VARCHAR(255),
    aliases TEXT[],

    -- Contact Information (arrays for multiple values)
    emails TEXT[],
    phones TEXT[],
    addresses JSONB[],

    -- Digital Footprints
    digital_identifiers JSONB DEFAULT '{}',

    -- Risk Assessment
    risk_score INTEGER DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
    risk_factors JSONB DEFAULT '[]',

    -- Complete Perpetrator Data
    payload JSONB DEFAULT '{}',

    -- Statistics
    report_count INTEGER DEFAULT 0,
    total_amount_reported_usd NUMERIC(15, 2) DEFAULT 0,
    countries_active TEXT[],
    fraud_types fraud_type[],

    -- External Data
    pep_match BOOLEAN DEFAULT FALSE,
    sanctions_match BOOLEAN DEFAULT FALSE,
    law_enforcement_reported BOOLEAN DEFAULT FALSE,

    -- Search
    search_vector TSVECTOR,

    -- Metadata
    first_reported_at TIMESTAMPTZ,
    last_reported_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT has_identifier CHECK (
        canonical_name IS NOT NULL OR
        array_length(emails, 1) > 0 OR
        array_length(phones, 1) > 0
    )
);

COMMENT ON TABLE perpetrators IS 'Deduplicated fraud perpetrators aggregated from multiple reports';
COMMENT ON COLUMN perpetrators.risk_score IS 'Risk score 0-100 based on report count, amounts, and external data';
COMMENT ON COLUMN perpetrators.digital_identifiers IS 'Social media, crypto addresses, websites, etc.';

-- ============================================================================
-- TABLE: reports
-- ============================================================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Reporter
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reporter_email VARCHAR(255),
    reporter_anonymous BOOLEAN DEFAULT FALSE,

    -- Classification
    fraud_type fraud_type NOT NULL,
    status report_status DEFAULT 'pending',
    severity report_severity,

    -- Complete Report Data (JSON Schema validated)
    payload JSONB NOT NULL,

    -- Extracted/Normalized Fields (for indexing and search)
    incident_date DATE,
    incident_country VARCHAR(2),
    incident_amount_usd NUMERIC(15, 2),

    perpetrator_name VARCHAR(255),
    perpetrator_email VARCHAR(255),
    perpetrator_phone VARCHAR(50),
    perpetrator_addresses TEXT[],

    -- Search vectors
    search_vector_en TSVECTOR,
    search_vector_content TEXT,

    -- Review & Moderation
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    rejection_reason TEXT,

    -- Duplicate detection
    duplicate_cluster_id UUID,
    is_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_of UUID REFERENCES reports(id),

    -- Visibility
    is_public BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,

    -- Analytics
    view_count INTEGER DEFAULT 0,
    search_hits INTEGER DEFAULT 0,

    -- Timestamps
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    archived_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT valid_payload CHECK (jsonb_typeof(payload) = 'object'),
    CONSTRAINT valid_incident_date CHECK (incident_date IS NULL OR incident_date <= CURRENT_DATE),
    CONSTRAINT valid_amount CHECK (incident_amount_usd IS NULL OR incident_amount_usd >= 0)
);

COMMENT ON TABLE reports IS 'Fraud reports submitted by users';
COMMENT ON COLUMN reports.payload IS 'Complete report data in JSON format (validated against schema)';
COMMENT ON COLUMN reports.status IS 'Workflow status: pending, under_review, approved, rejected, archived, flagged, requires_info';

-- ============================================================================
-- TABLE: perpetrator_report_links
-- ============================================================================
CREATE TABLE perpetrator_report_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    perpetrator_id UUID NOT NULL REFERENCES perpetrators(id) ON DELETE CASCADE,

    -- Link confidence (for fuzzy matching)
    confidence_score NUMERIC(3, 2) DEFAULT 1.00 CHECK (confidence_score BETWEEN 0 AND 1),
    link_type VARCHAR(50) DEFAULT 'primary',

    -- Matching criteria
    matched_on TEXT[],

    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    CONSTRAINT unique_report_perpetrator UNIQUE (report_id, perpetrator_id)
);

COMMENT ON TABLE perpetrator_report_links IS 'Many-to-many relationship between reports and perpetrators';
COMMENT ON COLUMN perpetrator_report_links.confidence_score IS 'Confidence score 0-1 for fuzzy matches';

-- ============================================================================
-- TABLE: evidence
-- ============================================================================
CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,

    -- File Information
    type evidence_type NOT NULL,
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    file_size_bytes BIGINT,

    -- Storage (S3)
    s3_bucket VARCHAR(100),
    s3_key VARCHAR(500),
    s3_region VARCHAR(50),
    storage_url TEXT,

    -- Security
    status evidence_status DEFAULT 'uploaded',
    checksum_sha256 VARCHAR(64),
    virus_scan_result JSONB,
    virus_scanned_at TIMESTAMPTZ,

    -- Access Control
    is_public BOOLEAN DEFAULT FALSE,
    requires_authentication BOOLEAN DEFAULT TRUE,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    extracted_text TEXT,
    thumbnail_s3_key VARCHAR(500),

    -- URL-specific fields
    url TEXT,
    url_screenshot_s3_key VARCHAR(500),

    -- Timestamps
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT valid_storage CHECK (
        (s3_key IS NOT NULL AND s3_bucket IS NOT NULL) OR (url IS NOT NULL)
    )
);

COMMENT ON TABLE evidence IS 'Evidence files and URLs attached to reports';
COMMENT ON COLUMN evidence.metadata IS 'File metadata (EXIF, dimensions, etc.)';

-- ============================================================================
-- TABLE: comments
-- ============================================================================
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Comment Data
    content TEXT NOT NULL,
    content_html TEXT,

    -- Threading
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    thread_depth INTEGER DEFAULT 0,

    -- Moderation
    status comment_status DEFAULT 'active',
    is_internal BOOLEAN DEFAULT FALSE,
    flagged_count INTEGER DEFAULT 0,
    moderated_by UUID REFERENCES users(id),
    moderated_at TIMESTAMPTZ,
    moderation_reason TEXT,

    -- Engagement
    upvotes INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    edited_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT content_not_empty CHECK (LENGTH(TRIM(content)) > 0),
    CONSTRAINT valid_thread_depth CHECK (
        (parent_comment_id IS NULL AND thread_depth = 0) OR
        (parent_comment_id IS NOT NULL AND thread_depth > 0)
    )
);

COMMENT ON TABLE comments IS 'User comments on reports with threading and moderation';
COMMENT ON COLUMN comments.is_internal IS 'Internal notes visible only to moderators/admins';

-- ============================================================================
-- TABLE: duplicate_clusters
-- ============================================================================
CREATE TABLE duplicate_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Cluster metadata
    canonical_report_id UUID REFERENCES reports(id),
    report_ids UUID[] NOT NULL,

    -- Similarity metrics
    similarity_score NUMERIC(3, 2) CHECK (similarity_score BETWEEN 0 AND 1),
    match_criteria JSONB,

    -- Status
    reviewed BOOLEAN DEFAULT FALSE,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    confirmed BOOLEAN,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT has_multiple_reports CHECK (array_length(report_ids, 1) >= 2),
    CONSTRAINT canonical_in_cluster CHECK (
        canonical_report_id IS NULL OR canonical_report_id = ANY(report_ids)
    )
);

COMMENT ON TABLE duplicate_clusters IS 'Groups of duplicate or similar reports';

-- ============================================================================
-- TABLE: crawl_sources
-- ============================================================================
CREATE TABLE crawl_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Source Identity
    name VARCHAR(255) NOT NULL UNIQUE,
    source_type crawl_source_type NOT NULL,
    description TEXT,

    -- URL Configuration
    base_url TEXT NOT NULL,
    url_pattern TEXT,
    api_endpoint TEXT,

    -- Crawl Configuration
    config JSONB DEFAULT '{}',
    frequency crawl_frequency DEFAULT 'daily',

    -- Authentication
    requires_auth BOOLEAN DEFAULT FALSE,
    auth_config JSONB,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_crawl_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    last_error TEXT,
    consecutive_failures INTEGER DEFAULT 0,

    -- Rate Limiting
    rate_limit_per_hour INTEGER,

    -- Data Quality
    reliability_score INTEGER DEFAULT 50 CHECK (reliability_score BETWEEN 0 AND 100),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    CONSTRAINT valid_url CHECK (base_url ~* '^https?://')
);

COMMENT ON TABLE crawl_sources IS 'External data sources for automated crawling (news, PEP, sanctions)';

-- ============================================================================
-- TABLE: crawl_results
-- ============================================================================
CREATE TABLE crawl_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES crawl_sources(id) ON DELETE CASCADE,

    -- Target Entity
    perpetrator_id UUID REFERENCES perpetrators(id),

    -- Crawled Data
    raw_data JSONB NOT NULL,
    normalized_data JSONB,

    -- Match Information
    status crawl_result_status DEFAULT 'pending',
    match_score NUMERIC(3, 2) CHECK (match_score IS NULL OR match_score BETWEEN 0 AND 1),
    match_fields TEXT[],

    -- Source Reference
    source_url TEXT,
    source_title TEXT,
    source_date DATE,

    -- Content
    extracted_text TEXT,
    entities_found JSONB,

    -- Timestamps
    crawled_at TIMESTAMPTZ NOT NULL,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Deduplication
    content_hash VARCHAR(64),

    CONSTRAINT unique_content_hash UNIQUE (source_id, content_hash)
);

COMMENT ON TABLE crawl_results IS 'Results from external data source crawls';

-- ============================================================================
-- TABLE: audit_logs
-- ============================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Actor
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    user_role system_role,

    -- Action
    action audit_action NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,

    -- Details
    details JSONB DEFAULT '{}',
    old_values JSONB,
    new_values JSONB,

    -- Request Context
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),

    -- Result
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,

    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_entity CHECK (
        (entity_type IS NOT NULL AND entity_id IS NOT NULL) OR
        (entity_type IS NULL AND entity_id IS NULL)
    )
);

COMMENT ON TABLE audit_logs IS 'Comprehensive audit log of all system actions';
COMMENT ON COLUMN audit_logs.action IS 'Type of action performed (see audit_action enum)';

-- ============================================================================
-- TABLE: search_index_metadata
-- ============================================================================
CREATE TABLE search_index_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Index Configuration
    index_type search_index_type NOT NULL,
    index_name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,

    -- Sync Status
    status sync_status DEFAULT 'out_of_sync',
    last_sync_started_at TIMESTAMPTZ,
    last_sync_completed_at TIMESTAMPTZ,
    last_sync_error TEXT,

    -- Statistics
    total_documents BIGINT DEFAULT 0,
    synced_documents BIGINT DEFAULT 0,
    failed_documents BIGINT DEFAULT 0,

    -- Configuration
    mapping JSONB,
    settings JSONB,

    -- Checkpoints
    last_synced_id UUID,
    last_synced_timestamp TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_index_entity UNIQUE (index_type, index_name, entity_type)
);

COMMENT ON TABLE search_index_metadata IS 'Metadata for external search index synchronization';

COMMIT;
