# Scamnemesis - Database Schema Documentation

## 1. ENTITY RELATIONSHIP DIAGRAM (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SCAMNEMESIS DATABASE SCHEMA                              │
└─────────────────────────────────────────────────────────────────────────────────┘

                                    ┌──────────────┐
                                    │    users     │
                                    ├──────────────┤
                                    │ id (PK)      │
                                    │ email        │
                                    │ role         │
                                    │ status       │
                                    │ tier         │
                                    └──────┬───────┘
                                           │
                        ┌──────────────────┼──────────────────┐
                        │                  │                  │
                        │                  │                  │
                  ┌─────▼─────┐    ┌──────▼──────┐   ┌──────▼──────┐
                  │  reports  │    │ user_roles  │   │ audit_logs  │
                  ├───────────┤    ├─────────────┤   ├─────────────┤
                  │ id (PK)   │◄───┤ user_id(FK) │   │ id (PK)     │
                  │ user_id   │    │ role        │   │ user_id(FK) │
                  │ status    │    │ permissions │   │ action      │
                  │ payload   │    └─────────────┘   │ details     │
                  │ fraud_type│                      └─────────────┘
                  └─────┬─────┘
                        │
        ┌───────────────┼───────────────┬───────────────┐
        │               │               │               │
  ┌─────▼─────┐  ┌──────▼──────┐  ┌────▼────┐  ┌──────▼──────┐
  │ evidence  │  │ comments    │  │ perp_   │  │ duplicate_  │
  ├───────────┤  ├─────────────┤  │ links   │  │ clusters    │
  │ id (PK)   │  │ id (PK)     │  ├─────────┤  ├─────────────┤
  │report_id  │  │ report_id   │  │report_id│  │ id (PK)     │
  │ type      │  │ user_id(FK) │  │perp_id  │  │ report_ids  │
  │ s3_key    │  │ content     │  └────┬────┘  │ similarity  │
  │ metadata  │  │ status      │       │       └─────────────┘
  └───────────┘  └─────────────┘       │
                                        │
                                 ┌──────▼──────┐
                                 │perpetrators │
                                 ├─────────────┤
                                 │ id (PK)     │
                                 │ name        │
                                 │ identifiers │
                                 │ risk_score  │
                                 │ payload     │
                                 └──────┬──────┘
                                        │
                                 ┌──────▼──────┐
                                 │ crawl_      │
                                 │ results     │
                                 ├─────────────┤
                                 │ id (PK)     │
                                 │ perp_id(FK) │
                                 │ source_id   │
                                 │ data        │
                                 └──────▲──────┘
                                        │
                                 ┌──────┴──────┐
                                 │ crawl_      │
                                 │ sources     │
                                 ├─────────────┤
                                 │ id (PK)     │
                                 │ name        │
                                 │ url_pattern │
                                 │ config      │
                                 └─────────────┘

                          ┌───────────────────┐
                          │search_index_      │
                          │   metadata        │
                          ├───────────────────┤
                          │ id (PK)           │
                          │ entity_type       │
                          │ last_sync         │
                          │ status            │
                          └───────────────────┘
```

## 2. PostgreSQL TABLE DEFINITIONS

### 2.1 Users Table

```sql
CREATE TYPE user_tier AS ENUM ('basic', 'standard', 'gold', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deleted', 'pending_verification');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

    -- Metadata
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

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_tier ON users(tier);
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id) WHERE oauth_provider IS NOT NULL;
```

### 2.2 User Roles Table

```sql
CREATE TYPE system_role AS ENUM ('user', 'moderator', 'analyst', 'admin', 'superadmin');

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
    CONSTRAINT unique_active_user_role UNIQUE (user_id, role)
        WHERE revoked_at IS NULL,
    CONSTRAINT valid_expiration CHECK (
        expires_at IS NULL OR expires_at > granted_at
    )
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_user_roles_role ON user_roles(role) WHERE revoked_at IS NULL;
CREATE INDEX idx_user_roles_expires ON user_roles(expires_at) WHERE expires_at IS NOT NULL AND revoked_at IS NULL;
```

### 2.3 Reports Table

```sql
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
    CONSTRAINT valid_incident_date CHECK (incident_date <= CURRENT_DATE),
    CONSTRAINT valid_amount CHECK (incident_amount_usd >= 0)
);

-- Indexes for reports table (see section 3)
```

### 2.4 Perpetrators Table

```sql
CREATE TABLE perpetrators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Core Identity (deduplicated)
    canonical_name VARCHAR(255),
    aliases TEXT[],

    -- Contact Information (arrays for multiple values)
    emails TEXT[],
    phones TEXT[],
    addresses JSONB[], -- structured addresses

    -- Digital Footprints
    digital_identifiers JSONB DEFAULT '{}', -- social media, crypto addresses, websites, etc.

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

-- Indexes for perpetrators (see section 3)
```

### 2.5 Perpetrator-Report Links Table

```sql
CREATE TABLE perpetrator_report_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    perpetrator_id UUID NOT NULL REFERENCES perpetrators(id) ON DELETE CASCADE,

    -- Link confidence (for fuzzy matching)
    confidence_score NUMERIC(3, 2) DEFAULT 1.00 CHECK (confidence_score BETWEEN 0 AND 1),
    link_type VARCHAR(50) DEFAULT 'primary', -- primary, secondary, suspected

    -- Matching criteria
    matched_on TEXT[], -- ['email', 'phone', 'name']

    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    CONSTRAINT unique_report_perpetrator UNIQUE (report_id, perpetrator_id)
);

CREATE INDEX idx_perp_links_report ON perpetrator_report_links(report_id);
CREATE INDEX idx_perp_links_perpetrator ON perpetrator_report_links(perpetrator_id);
CREATE INDEX idx_perp_links_confidence ON perpetrator_report_links(confidence_score) WHERE confidence_score < 1.0;
```

### 2.6 Evidence Table

```sql
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

CREATE TYPE evidence_status AS ENUM ('uploaded', 'processing', 'available', 'virus_detected', 'rejected', 'deleted');

CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,

    -- File Information
    type evidence_type NOT NULL,
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    file_size_bytes BIGINT,

    -- Storage
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
    metadata JSONB DEFAULT '{}', -- EXIF, dimensions, duration, etc.
    extracted_text TEXT, -- OCR or document text extraction
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
        (s3_key IS NOT NULL AND s3_bucket IS NOT NULL) OR
        (url IS NOT NULL)
    )
);

CREATE INDEX idx_evidence_report ON evidence(report_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_evidence_type ON evidence(type);
CREATE INDEX idx_evidence_status ON evidence(status);
CREATE INDEX idx_evidence_checksum ON evidence(checksum_sha256) WHERE checksum_sha256 IS NOT NULL;
```

### 2.7 Comments Table

```sql
CREATE TYPE comment_status AS ENUM ('active', 'hidden', 'deleted', 'flagged', 'approved');

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Comment Data
    content TEXT NOT NULL,
    content_html TEXT, -- sanitized HTML version

    -- Threading
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    thread_depth INTEGER DEFAULT 0,

    -- Moderation
    status comment_status DEFAULT 'active',
    is_internal BOOLEAN DEFAULT FALSE, -- internal notes for moderators
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

CREATE INDEX idx_comments_report ON comments(report_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_user ON comments(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_parent ON comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_flagged ON comments(flagged_count) WHERE flagged_count > 0;
```

### 2.8 Duplicate Clusters Table

```sql
CREATE TABLE duplicate_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Cluster metadata
    canonical_report_id UUID REFERENCES reports(id),
    report_ids UUID[] NOT NULL,

    -- Similarity metrics
    similarity_score NUMERIC(3, 2) CHECK (similarity_score BETWEEN 0 AND 1),
    match_criteria JSONB, -- what fields matched

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
        canonical_report_id IS NULL OR
        canonical_report_id = ANY(report_ids)
    )
);

CREATE INDEX idx_duplicate_clusters_canonical ON duplicate_clusters(canonical_report_id);
CREATE INDEX idx_duplicate_clusters_reports ON duplicate_clusters USING GIN (report_ids);
CREATE INDEX idx_duplicate_clusters_unreviewed ON duplicate_clusters(reviewed) WHERE NOT reviewed;
```

### 2.9 Crawl Sources Table

```sql
CREATE TYPE crawl_source_type AS ENUM ('news', 'pep_list', 'sanctions_list', 'court_records', 'social_media', 'custom');
CREATE TYPE crawl_frequency AS ENUM ('realtime', 'hourly', 'daily', 'weekly', 'monthly', 'manual');

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
    config JSONB DEFAULT '{}', -- selectors, API keys, headers, etc.
    frequency crawl_frequency DEFAULT 'daily',

    -- Authentication
    requires_auth BOOLEAN DEFAULT FALSE,
    auth_config JSONB, -- encrypted credentials

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

CREATE INDEX idx_crawl_sources_type ON crawl_sources(source_type);
CREATE INDEX idx_crawl_sources_active ON crawl_sources(is_active) WHERE is_active;
CREATE INDEX idx_crawl_sources_frequency ON crawl_sources(frequency);
CREATE INDEX idx_crawl_sources_next_crawl ON crawl_sources(last_crawl_at, frequency) WHERE is_active;
```

### 2.10 Crawl Results Table

```sql
CREATE TYPE crawl_result_status AS ENUM ('pending', 'processed', 'matched', 'no_match', 'error');

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
    entities_found JSONB, -- named entities: names, organizations, locations

    -- Timestamps
    crawled_at TIMESTAMPTZ NOT NULL,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Deduplication
    content_hash VARCHAR(64),

    CONSTRAINT unique_content_hash UNIQUE (source_id, content_hash)
);

CREATE INDEX idx_crawl_results_source ON crawl_results(source_id);
CREATE INDEX idx_crawl_results_perpetrator ON crawl_results(perpetrator_id) WHERE perpetrator_id IS NOT NULL;
CREATE INDEX idx_crawl_results_status ON crawl_results(status);
CREATE INDEX idx_crawl_results_crawled_at ON crawl_results(crawled_at DESC);
CREATE INDEX idx_crawl_results_match ON crawl_results(match_score DESC) WHERE match_score IS NOT NULL;
CREATE INDEX idx_crawl_results_entities ON crawl_results USING GIN (entities_found);
```

### 2.11 Audit Logs Table

```sql
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

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Actor
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    user_role system_role,

    -- Action
    action audit_action NOT NULL,
    entity_type VARCHAR(50), -- 'report', 'user', 'perpetrator', etc.
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

-- Partitioning strategy: partition by month for audit logs
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_logs_action ON audit_logs(action, created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id) WHERE entity_id IS NOT NULL;
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_ip ON audit_logs(ip_address) WHERE ip_address IS NOT NULL;
```

### 2.12 Search Index Metadata Table

```sql
CREATE TYPE search_index_type AS ENUM ('elasticsearch', 'opensearch', 'meilisearch', 'typesense');
CREATE TYPE sync_status AS ENUM ('in_sync', 'syncing', 'out_of_sync', 'error');

CREATE TABLE search_index_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Index Configuration
    index_type search_index_type NOT NULL,
    index_name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'reports', 'perpetrators', etc.

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
    mapping JSONB, -- index mapping/schema
    settings JSONB, -- index settings

    -- Checkpoints
    last_synced_id UUID,
    last_synced_timestamp TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_index_entity UNIQUE (index_type, index_name, entity_type)
);

CREATE INDEX idx_search_index_status ON search_index_metadata(status);
CREATE INDEX idx_search_index_entity ON search_index_metadata(entity_type);
CREATE INDEX idx_search_index_last_sync ON search_index_metadata(last_sync_completed_at);
```

## 3. COMPREHENSIVE INDEXES

### 3.1 Reports Table Indexes

```sql
-- Primary search indexes
CREATE INDEX idx_reports_status ON reports(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_reports_fraud_type ON reports(fraud_type);
CREATE INDEX idx_reports_user ON reports(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_reports_severity ON reports(severity) WHERE severity IS NOT NULL;

-- Date range queries
CREATE INDEX idx_reports_incident_date ON reports(incident_date) WHERE incident_date IS NOT NULL;
CREATE INDEX idx_reports_submitted_at ON reports(submitted_at DESC);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Geographic searches
CREATE INDEX idx_reports_country ON reports(incident_country) WHERE incident_country IS NOT NULL;

-- Financial queries
CREATE INDEX idx_reports_amount ON reports(incident_amount_usd) WHERE incident_amount_usd IS NOT NULL;
CREATE INDEX idx_reports_large_amounts ON reports(incident_amount_usd)
    WHERE incident_amount_usd > 10000 AND deleted_at IS NULL;

-- Full-text search (PostgreSQL native)
CREATE INDEX idx_reports_search_vector ON reports USING GIN(search_vector_en);

-- Perpetrator searches
CREATE INDEX idx_reports_perp_name ON reports USING GIN(perpetrator_name gin_trgm_ops)
    WHERE perpetrator_name IS NOT NULL;
CREATE INDEX idx_reports_perp_email ON reports(LOWER(perpetrator_email))
    WHERE perpetrator_email IS NOT NULL;
CREATE INDEX idx_reports_perp_phone ON reports(perpetrator_phone)
    WHERE perpetrator_phone IS NOT NULL;

-- Array searches
CREATE INDEX idx_reports_addresses ON reports USING GIN(perpetrator_addresses)
    WHERE perpetrator_addresses IS NOT NULL;

-- Duplicate detection
CREATE INDEX idx_reports_duplicate_cluster ON reports(duplicate_cluster_id)
    WHERE duplicate_cluster_id IS NOT NULL;
CREATE INDEX idx_reports_is_duplicate ON reports(is_duplicate) WHERE is_duplicate;
CREATE INDEX idx_reports_duplicate_of ON reports(duplicate_of) WHERE duplicate_of IS NOT NULL;

-- JSONB payload searches
CREATE INDEX idx_reports_payload ON reports USING GIN(payload);
CREATE INDEX idx_reports_payload_paths ON reports USING GIN(payload jsonb_path_ops);

-- Composite indexes for common queries
CREATE INDEX idx_reports_status_date ON reports(status, submitted_at DESC)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_reports_type_status ON reports(fraud_type, status)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_reports_user_status ON reports(user_id, status, created_at DESC)
    WHERE user_id IS NOT NULL AND deleted_at IS NULL;

-- Public reports
CREATE INDEX idx_reports_public ON reports(is_public, created_at DESC)
    WHERE is_public = TRUE AND deleted_at IS NULL;

-- Analytics
CREATE INDEX idx_reports_view_count ON reports(view_count DESC) WHERE view_count > 0;
```

### 3.2 Perpetrators Table Indexes

```sql
-- Name searches with trigrams
CREATE INDEX idx_perpetrators_name ON perpetrators USING GIN(canonical_name gin_trgm_ops)
    WHERE canonical_name IS NOT NULL;
CREATE INDEX idx_perpetrators_aliases ON perpetrators USING GIN(aliases)
    WHERE aliases IS NOT NULL;

-- Contact information
CREATE INDEX idx_perpetrators_emails ON perpetrators USING GIN(emails)
    WHERE emails IS NOT NULL;
CREATE INDEX idx_perpetrators_phones ON perpetrators USING GIN(phones)
    WHERE phones IS NOT NULL;

-- Full-text search
CREATE INDEX idx_perpetrators_search ON perpetrators USING GIN(search_vector);

-- JSONB indexes
CREATE INDEX idx_perpetrators_digital ON perpetrators USING GIN(digital_identifiers);
CREATE INDEX idx_perpetrators_payload ON perpetrators USING GIN(payload jsonb_path_ops);

-- Risk assessment
CREATE INDEX idx_perpetrators_risk_score ON perpetrators(risk_score DESC);
CREATE INDEX idx_perpetrators_high_risk ON perpetrators(risk_score)
    WHERE risk_score >= 70;

-- Statistics
CREATE INDEX idx_perpetrators_report_count ON perpetrators(report_count DESC);
CREATE INDEX idx_perpetrators_amount ON perpetrators(total_amount_reported_usd DESC);

-- Array fields
CREATE INDEX idx_perpetrators_countries ON perpetrators USING GIN(countries_active);
CREATE INDEX idx_perpetrators_fraud_types ON perpetrators USING GIN(fraud_types);

-- External matches
CREATE INDEX idx_perpetrators_pep ON perpetrators(pep_match) WHERE pep_match = TRUE;
CREATE INDEX idx_perpetrators_sanctions ON perpetrators(sanctions_match) WHERE sanctions_match = TRUE;
CREATE INDEX idx_perpetrators_law_enforcement ON perpetrators(law_enforcement_reported)
    WHERE law_enforcement_reported = TRUE;

-- Timestamps
CREATE INDEX idx_perpetrators_first_reported ON perpetrators(first_reported_at);
CREATE INDEX idx_perpetrators_last_reported ON perpetrators(last_reported_at DESC);
```

### 3.3 Enable pg_trgm Extension

```sql
-- Required for trigram similarity searches
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;
CREATE EXTENSION IF NOT EXISTS btree_gist;
```

## 4. JSON SCHEMAS

### 4.1 Report Payload Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Fraud Report Payload",
  "required": ["incident", "perpetrator", "reporter"],
  "properties": {
    "incident": {
      "type": "object",
      "required": ["date", "fraud_type", "description"],
      "properties": {
        "date": {
          "type": "string",
          "format": "date",
          "description": "Date when the incident occurred"
        },
        "fraud_type": {
          "type": "string",
          "enum": [
            "romance_scam", "investment_fraud", "phishing", "identity_theft",
            "online_shopping_fraud", "tech_support_scam", "lottery_prize_scam",
            "employment_scam", "rental_scam", "cryptocurrency_scam",
            "pyramid_mlm_scheme", "insurance_fraud", "credit_card_fraud",
            "wire_fraud", "money_mule", "advance_fee_fraud",
            "business_email_compromise", "social_engineering", "fake_charity",
            "government_impersonation", "utility_scam", "grandparent_scam",
            "sextortion", "ransomware", "account_takeover", "sim_swapping",
            "catfishing", "ponzi_scheme", "other"
          ]
        },
        "description": {
          "type": "string",
          "minLength": 50,
          "maxLength": 10000,
          "description": "Detailed description of the incident"
        },
        "location": {
          "type": "object",
          "properties": {
            "country": {"type": "string", "pattern": "^[A-Z]{2}$"},
            "city": {"type": "string"},
            "region": {"type": "string"},
            "postal_code": {"type": "string"}
          }
        },
        "duration": {
          "type": "object",
          "properties": {
            "start_date": {"type": "string", "format": "date"},
            "end_date": {"type": "string", "format": "date"}
          }
        },
        "reported_to_authorities": {
          "type": "boolean",
          "default": false
        },
        "authority_details": {
          "type": "object",
          "properties": {
            "agency": {"type": "string"},
            "report_number": {"type": "string"},
            "report_date": {"type": "string", "format": "date"},
            "officer_name": {"type": "string"}
          }
        }
      }
    },
    "perpetrator": {
      "type": "object",
      "properties": {
        "name": {"type": "string", "maxLength": 255},
        "aliases": {
          "type": "array",
          "items": {"type": "string"},
          "maxItems": 20
        },
        "email": {
          "type": "array",
          "items": {"type": "string", "format": "email"},
          "maxItems": 10
        },
        "phone": {
          "type": "array",
          "items": {"type": "string", "pattern": "^\\+?[0-9\\s\\-\\(\\)]+$"},
          "maxItems": 10
        },
        "addresses": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "street": {"type": "string"},
              "city": {"type": "string"},
              "region": {"type": "string"},
              "country": {"type": "string", "pattern": "^[A-Z]{2}$"},
              "postal_code": {"type": "string"}
            }
          },
          "maxItems": 5
        },
        "description": {
          "type": "string",
          "maxLength": 2000,
          "description": "Physical description or other identifying information"
        }
      }
    },
    "digital_footprints": {
      "type": "object",
      "properties": {
        "websites": {
          "type": "array",
          "items": {"type": "string", "format": "uri"},
          "maxItems": 20
        },
        "social_media": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "platform": {
                "type": "string",
                "enum": ["facebook", "instagram", "twitter", "linkedin", "tiktok", "telegram", "whatsapp", "wechat", "other"]
              },
              "handle": {"type": "string"},
              "url": {"type": "string", "format": "uri"},
              "profile_name": {"type": "string"}
            }
          },
          "maxItems": 20
        },
        "messaging_apps": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "app": {"type": "string"},
              "identifier": {"type": "string"}
            }
          }
        },
        "ip_addresses": {
          "type": "array",
          "items": {"type": "string", "format": "ipv4"},
          "maxItems": 10
        },
        "domains": {
          "type": "array",
          "items": {"type": "string", "format": "hostname"},
          "maxItems": 20
        }
      }
    },
    "financial": {
      "type": "object",
      "properties": {
        "total_loss": {
          "type": "object",
          "properties": {
            "amount": {"type": "number", "minimum": 0},
            "currency": {"type": "string", "pattern": "^[A-Z]{3}$"}
          }
        },
        "transactions": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "date": {"type": "string", "format": "date"},
              "amount": {"type": "number", "minimum": 0},
              "currency": {"type": "string", "pattern": "^[A-Z]{3}$"},
              "method": {
                "type": "string",
                "enum": ["wire_transfer", "credit_card", "debit_card", "bank_transfer", "cash", "check", "money_order", "cryptocurrency", "gift_card", "other"]
              },
              "description": {"type": "string"}
            }
          }
        },
        "bank_accounts": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "bank_name": {"type": "string"},
              "account_number": {"type": "string"},
              "routing_number": {"type": "string"},
              "iban": {"type": "string"},
              "swift": {"type": "string"},
              "account_holder_name": {"type": "string"}
            }
          },
          "maxItems": 10
        },
        "payment_platforms": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "platform": {
                "type": "string",
                "enum": ["paypal", "venmo", "zelle", "cashapp", "western_union", "moneygram", "wise", "revolut", "other"]
              },
              "account_id": {"type": "string"}
            }
          }
        }
      }
    },
    "crypto": {
      "type": "object",
      "properties": {
        "addresses": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "blockchain": {
                "type": "string",
                "enum": ["bitcoin", "ethereum", "tether", "usdc", "binance_coin", "ripple", "cardano", "solana", "polkadot", "dogecoin", "tron", "other"]
              },
              "address": {"type": "string"},
              "amount_sent": {"type": "number", "minimum": 0},
              "transaction_hash": {"type": "string"}
            }
          },
          "maxItems": 20
        },
        "exchanges": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "exchange": {"type": "string"},
              "account_id": {"type": "string"}
            }
          }
        }
      }
    },
    "company": {
      "type": "object",
      "description": "If perpetrator claimed to represent a company",
      "properties": {
        "name": {"type": "string"},
        "registered_name": {"type": "string"},
        "registration_number": {"type": "string"},
        "registration_country": {"type": "string", "pattern": "^[A-Z]{2}$"},
        "address": {
          "type": "object",
          "properties": {
            "street": {"type": "string"},
            "city": {"type": "string"},
            "region": {"type": "string"},
            "country": {"type": "string"},
            "postal_code": {"type": "string"}
          }
        },
        "website": {"type": "string", "format": "uri"},
        "phone": {"type": "string"},
        "email": {"type": "string", "format": "email"},
        "claimed_legitimacy": {"type": "boolean"}
      }
    },
    "vehicle": {
      "type": "object",
      "description": "If a vehicle was involved",
      "properties": {
        "make": {"type": "string"},
        "model": {"type": "string"},
        "year": {"type": "integer", "minimum": 1900, "maximum": 2030},
        "color": {"type": "string"},
        "license_plate": {"type": "string"},
        "vin": {"type": "string"},
        "state_country": {"type": "string"}
      }
    },
    "evidence": {
      "type": "array",
      "description": "References to uploaded evidence files",
      "items": {
        "type": "object",
        "properties": {
          "evidence_id": {"type": "string", "format": "uuid"},
          "type": {"type": "string"},
          "description": {"type": "string"}
        }
      }
    },
    "reporter": {
      "type": "object",
      "required": ["relationship"],
      "properties": {
        "relationship": {
          "type": "string",
          "enum": ["victim", "witness", "third_party", "law_enforcement", "organization"]
        },
        "name": {"type": "string"},
        "email": {"type": "string", "format": "email"},
        "phone": {"type": "string"},
        "consent_to_contact": {"type": "boolean", "default": false},
        "anonymous": {"type": "boolean", "default": false}
      }
    },
    "metadata": {
      "type": "object",
      "properties": {
        "submission_ip": {"type": "string"},
        "user_agent": {"type": "string"},
        "form_version": {"type": "string"},
        "completion_time_seconds": {"type": "integer"}
      }
    }
  }
}
```

### 4.2 Perpetrator Payload Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Perpetrator Entity",
  "properties": {
    "identity": {
      "type": "object",
      "properties": {
        "canonical_name": {"type": "string"},
        "aliases": {"type": "array", "items": {"type": "string"}},
        "date_of_birth": {"type": "string", "format": "date"},
        "nationality": {"type": "string", "pattern": "^[A-Z]{2}$"},
        "gender": {"type": "string", "enum": ["male", "female", "other", "unknown"]},
        "physical_description": {"type": "string"}
      }
    },
    "contact": {
      "type": "object",
      "properties": {
        "emails": {"type": "array", "items": {"type": "string", "format": "email"}},
        "phones": {"type": "array", "items": {"type": "string"}},
        "addresses": {"type": "array", "items": {"type": "object"}}
      }
    },
    "digital_presence": {
      "type": "object",
      "properties": {
        "social_media": {"type": "array"},
        "websites": {"type": "array"},
        "crypto_addresses": {"type": "array"}
      }
    },
    "modus_operandi": {
      "type": "object",
      "properties": {
        "primary_fraud_types": {"type": "array", "items": {"type": "string"}},
        "tactics": {"type": "array", "items": {"type": "string"}},
        "target_demographics": {"type": "string"},
        "common_lures": {"type": "array", "items": {"type": "string"}}
      }
    },
    "risk_assessment": {
      "type": "object",
      "properties": {
        "risk_score": {"type": "integer", "minimum": 0, "maximum": 100},
        "risk_factors": {"type": "array", "items": {"type": "string"}},
        "threat_level": {"type": "string", "enum": ["low", "medium", "high", "critical"]}
      }
    },
    "external_references": {
      "type": "object",
      "properties": {
        "pep_matches": {"type": "array"},
        "sanctions_matches": {"type": "array"},
        "law_enforcement_records": {"type": "array"},
        "news_articles": {"type": "array"}
      }
    }
  }
}
```

### 4.3 Evidence Metadata Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Evidence Metadata",
  "properties": {
    "file": {
      "type": "object",
      "properties": {
        "original_filename": {"type": "string"},
        "mime_type": {"type": "string"},
        "size_bytes": {"type": "integer"},
        "checksum_sha256": {"type": "string"}
      }
    },
    "image": {
      "type": "object",
      "properties": {
        "width": {"type": "integer"},
        "height": {"type": "integer"},
        "format": {"type": "string"},
        "exif": {"type": "object"},
        "camera_make": {"type": "string"},
        "camera_model": {"type": "string"},
        "timestamp": {"type": "string", "format": "date-time"},
        "gps_coordinates": {
          "type": "object",
          "properties": {
            "latitude": {"type": "number"},
            "longitude": {"type": "number"}
          }
        }
      }
    },
    "video": {
      "type": "object",
      "properties": {
        "duration_seconds": {"type": "number"},
        "codec": {"type": "string"},
        "resolution": {"type": "string"},
        "frame_rate": {"type": "number"},
        "bitrate": {"type": "integer"}
      }
    },
    "audio": {
      "type": "object",
      "properties": {
        "duration_seconds": {"type": "number"},
        "format": {"type": "string"},
        "sample_rate": {"type": "integer"},
        "bitrate": {"type": "integer"},
        "channels": {"type": "integer"}
      }
    },
    "document": {
      "type": "object",
      "properties": {
        "page_count": {"type": "integer"},
        "author": {"type": "string"},
        "created_at": {"type": "string", "format": "date-time"},
        "modified_at": {"type": "string", "format": "date-time"},
        "application": {"type": "string"}
      }
    },
    "url": {
      "type": "object",
      "properties": {
        "original_url": {"type": "string", "format": "uri"},
        "final_url": {"type": "string", "format": "uri"},
        "title": {"type": "string"},
        "description": {"type": "string"},
        "screenshot_taken_at": {"type": "string", "format": "date-time"},
        "http_status": {"type": "integer"},
        "ssl_valid": {"type": "boolean"}
      }
    },
    "processing": {
      "type": "object",
      "properties": {
        "ocr_performed": {"type": "boolean"},
        "extracted_text_length": {"type": "integer"},
        "faces_detected": {"type": "integer"},
        "text_detection_confidence": {"type": "number"}
      }
    }
  }
}
```

### 4.4 Audit Log Details Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Audit Log Details",
  "properties": {
    "action": {"type": "string"},
    "entity_type": {"type": "string"},
    "entity_id": {"type": "string"},
    "changes": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "field": {"type": "string"},
          "old_value": {},
          "new_value": {}
        }
      }
    },
    "reason": {"type": "string"},
    "additional_info": {"type": "object"},
    "affected_users": {"type": "array", "items": {"type": "string"}},
    "duration_ms": {"type": "integer"}
  }
}
```

### 4.5 User Role Permissions Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "User Role Permissions",
  "properties": {
    "reports": {
      "type": "object",
      "properties": {
        "create": {"type": "boolean", "default": false},
        "read": {"type": "boolean", "default": false},
        "update": {"type": "boolean", "default": false},
        "delete": {"type": "boolean", "default": false},
        "approve": {"type": "boolean", "default": false},
        "reject": {"type": "boolean", "default": false},
        "view_private": {"type": "boolean", "default": false}
      }
    },
    "perpetrators": {
      "type": "object",
      "properties": {
        "create": {"type": "boolean", "default": false},
        "read": {"type": "boolean", "default": false},
        "update": {"type": "boolean", "default": false},
        "merge": {"type": "boolean", "default": false},
        "view_sensitive": {"type": "boolean", "default": false}
      }
    },
    "users": {
      "type": "object",
      "properties": {
        "create": {"type": "boolean", "default": false},
        "read": {"type": "boolean", "default": false},
        "update": {"type": "boolean", "default": false},
        "delete": {"type": "boolean", "default": false},
        "manage_roles": {"type": "boolean", "default": false}
      }
    },
    "evidence": {
      "type": "object",
      "properties": {
        "upload": {"type": "boolean", "default": false},
        "download": {"type": "boolean", "default": false},
        "delete": {"type": "boolean", "default": false}
      }
    },
    "comments": {
      "type": "object",
      "properties": {
        "create": {"type": "boolean", "default": false},
        "update_own": {"type": "boolean", "default": false},
        "update_any": {"type": "boolean", "default": false},
        "delete_own": {"type": "boolean", "default": false},
        "delete_any": {"type": "boolean", "default": false},
        "moderate": {"type": "boolean", "default": false}
      }
    },
    "crawl": {
      "type": "object",
      "properties": {
        "configure_sources": {"type": "boolean", "default": false},
        "trigger_crawl": {"type": "boolean", "default": false},
        "view_results": {"type": "boolean", "default": false}
      }
    },
    "analytics": {
      "type": "object",
      "properties": {
        "view_basic": {"type": "boolean", "default": false},
        "view_advanced": {"type": "boolean", "default": false},
        "export_data": {"type": "boolean", "default": false}
      }
    },
    "audit": {
      "type": "object",
      "properties": {
        "view_logs": {"type": "boolean", "default": false},
        "export_logs": {"type": "boolean", "default": false}
      }
    }
  }
}
```

## 5. FRAUD TYPE ENUM - Complete List

```sql
CREATE TYPE fraud_type AS ENUM (
    -- Financial & Investment
    'investment_fraud',           -- Fake investment opportunities
    'ponzi_scheme',               -- Ponzi/pyramid schemes
    'pyramid_mlm_scheme',         -- Multi-level marketing scams
    'cryptocurrency_scam',        -- Crypto investment scams
    'advance_fee_fraud',          -- Nigerian prince, upfront payment scams

    -- Identity & Account Fraud
    'identity_theft',             -- Stolen identity
    'account_takeover',           -- Compromised accounts
    'sim_swapping',               -- SIM swap attacks
    'phishing',                   -- Email/SMS phishing

    -- Financial Instruments
    'credit_card_fraud',          -- Unauthorized credit card use
    'wire_fraud',                 -- Fraudulent wire transfers
    'insurance_fraud',            -- False insurance claims
    'money_mule',                 -- Money laundering participation

    -- Romance & Social Engineering
    'romance_scam',               -- Dating/romance scams
    'catfishing',                 -- Fake online identities
    'sextortion',                 -- Sexual extortion
    'social_engineering',         -- Manipulation tactics

    -- E-commerce & Services
    'online_shopping_fraud',      -- Fake online stores
    'rental_scam',                -- Fake property rentals
    'employment_scam',            -- Fake job offers

    -- Technical
    'tech_support_scam',          -- Fake tech support
    'ransomware',                 -- Ransomware attacks

    -- Impersonation
    'government_impersonation',   -- Fake government officials
    'business_email_compromise',  -- BEC attacks
    'utility_scam',               -- Fake utility companies

    -- Targeting Vulnerable
    'lottery_prize_scam',         -- Fake lottery winnings
    'grandparent_scam',           -- Elder targeting
    'fake_charity',               -- Fraudulent charities

    -- Other
    'other'                       -- Other fraud types
);
```

### Fraud Type Descriptions

| Fraud Type | Description | Common Indicators |
|------------|-------------|-------------------|
| **romance_scam** | Scammer builds romantic relationship to extract money | Long-distance relationship, requests for money, never meets in person |
| **investment_fraud** | Fake investment opportunities with promised high returns | Guaranteed returns, pressure to invest quickly, unregistered advisors |
| **phishing** | Fraudulent emails/messages to steal credentials | Suspicious links, urgent language, requests for passwords |
| **identity_theft** | Stealing personal information for fraudulent use | Unauthorized accounts, credit inquiries, tax fraud |
| **online_shopping_fraud** | Fake online stores or non-delivery of goods | Too-good-to-be-true prices, new websites, no contact info |
| **tech_support_scam** | Fake tech support demanding payment | Unsolicited calls, urgent warnings, remote access requests |
| **lottery_prize_scam** | Fake lottery winnings requiring upfront payment | Unexpected winnings, fees required, foreign lotteries |
| **employment_scam** | Fake job offers to extract money or information | Upfront fees, work-from-home, vague job description |
| **rental_scam** | Fake property listings or landlords | Too-low rent, wire transfer required, landlord unavailable |
| **cryptocurrency_scam** | Fake crypto investments or giveaways | Guaranteed returns, celebrity endorsements, send crypto to get more |
| **pyramid_mlm_scheme** | Multi-level marketing with focus on recruitment | Recruitment over sales, buy-in required, income from recruiting |
| **insurance_fraud** | False insurance claims | Staged accidents, exaggerated damages, fake injuries |
| **credit_card_fraud** | Unauthorized use of credit cards | Unfamiliar charges, card not present, skimmed data |
| **wire_fraud** | Fraudulent wire transfer requests | Urgent requests, change of payment details, email compromise |
| **money_mule** | Using others to transfer stolen money | Job involves receiving and forwarding money, vague business |
| **advance_fee_fraud** | Upfront payment for promised benefit | Nigerian prince, inheritance, advance fees |
| **business_email_compromise** | Compromised business email for fraud | CEO fraud, invoice changes, urgent wire requests |
| **social_engineering** | Manipulation to gain information or money | Pretexting, baiting, quid pro quo |
| **fake_charity** | Fraudulent charitable organizations | High-pressure tactics, cash-only, vague mission |
| **government_impersonation** | Impersonating government officials | Threats of arrest, immediate payment, gift cards |
| **utility_scam** | Fake utility company demanding payment | Immediate disconnection threat, specific payment method |
| **grandparent_scam** | Targeting elderly with family emergency | Grandchild in trouble, urgent money need, secrecy |
| **sextortion** | Threatening to release intimate content | Webcam recording claims, Bitcoin demands, shame tactics |
| **ransomware** | Malware encrypting data for ransom | Locked files, ransom note, cryptocurrency payment |
| **account_takeover** | Unauthorized access to online accounts | Password changes, unfamiliar activity, locked out |
| **sim_swapping** | Hijacking phone number via SIM card | Lost phone service, unauthorized account access |
| **catfishing** | Fake online identity for deception | Refuses video calls, stolen photos, inconsistent stories |
| **ponzi_scheme** | Using new investor money to pay old investors | Consistent returns, referral bonuses, complex strategy |

## 6. MIGRATION SCRIPTS

### Migration 001: Initial Schema

```sql
-- migration_001_initial_schema.sql
-- Scamnemesis Database Schema - Initial Migration
-- Author: Database Architect
-- Date: 2025-12-09

BEGIN;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Create custom types
CREATE TYPE user_tier AS ENUM ('basic', 'standard', 'gold', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deleted', 'pending_verification');
CREATE TYPE system_role AS ENUM ('user', 'moderator', 'analyst', 'admin', 'superadmin');

CREATE TYPE fraud_type AS ENUM (
    'romance_scam', 'investment_fraud', 'phishing', 'identity_theft',
    'online_shopping_fraud', 'tech_support_scam', 'lottery_prize_scam',
    'employment_scam', 'rental_scam', 'cryptocurrency_scam',
    'pyramid_mlm_scheme', 'insurance_fraud', 'credit_card_fraud',
    'wire_fraud', 'money_mule', 'advance_fee_fraud',
    'business_email_compromise', 'social_engineering', 'fake_charity',
    'government_impersonation', 'utility_scam', 'grandparent_scam',
    'sextortion', 'ransomware', 'account_takeover', 'sim_swapping',
    'catfishing', 'ponzi_scheme', 'other'
);

CREATE TYPE report_status AS ENUM (
    'pending', 'under_review', 'approved', 'rejected',
    'archived', 'flagged', 'requires_info'
);

CREATE TYPE report_severity AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TYPE evidence_type AS ENUM (
    'screenshot', 'document', 'video', 'audio', 'chat_log',
    'transaction_record', 'email', 'url', 'other'
);

CREATE TYPE evidence_status AS ENUM (
    'uploaded', 'processing', 'available', 'virus_detected', 'rejected', 'deleted'
);

CREATE TYPE comment_status AS ENUM ('active', 'hidden', 'deleted', 'flagged', 'approved');

CREATE TYPE crawl_source_type AS ENUM (
    'news', 'pep_list', 'sanctions_list', 'court_records', 'social_media', 'custom'
);

CREATE TYPE crawl_frequency AS ENUM ('realtime', 'hourly', 'daily', 'weekly', 'monthly', 'manual');

CREATE TYPE crawl_result_status AS ENUM ('pending', 'processed', 'matched', 'no_match', 'error');

CREATE TYPE audit_action AS ENUM (
    'user_created', 'user_updated', 'user_deleted', 'user_login', 'user_logout',
    'user_password_reset', 'role_granted', 'role_revoked',
    'report_created', 'report_updated', 'report_approved', 'report_rejected',
    'report_deleted', 'report_viewed',
    'evidence_uploaded', 'evidence_deleted',
    'comment_created', 'comment_moderated', 'comment_deleted',
    'perpetrator_created', 'perpetrator_merged', 'perpetrator_updated',
    'crawl_executed', 'config_updated', 'export_generated', 'search_performed'
);

CREATE TYPE search_index_type AS ENUM ('elasticsearch', 'opensearch', 'meilisearch', 'typesense');
CREATE TYPE sync_status AS ENUM ('in_sync', 'syncing', 'out_of_sync', 'error');

-- Create tables

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255),
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    country_code VARCHAR(2),
    tier user_tier DEFAULT 'basic',
    status user_status DEFAULT 'pending_verification',
    login_count INTEGER DEFAULT 0,
    last_login_at TIMESTAMPTZ,
    last_login_ip INET,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT email_lowercase CHECK (email = LOWER(email)),
    CONSTRAINT valid_oauth CHECK (
        (oauth_provider IS NOT NULL AND oauth_id IS NOT NULL) OR
        (oauth_provider IS NULL AND oauth_id IS NULL AND password_hash IS NOT NULL)
    )
);

-- User roles table
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role system_role NOT NULL,
    permissions JSONB DEFAULT '{}',
    scope JSONB DEFAULT '{}',
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_active_user_role UNIQUE (user_id, role) WHERE revoked_at IS NULL,
    CONSTRAINT valid_expiration CHECK (expires_at IS NULL OR expires_at > granted_at)
);

-- Perpetrators table
CREATE TABLE perpetrators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_name VARCHAR(255),
    aliases TEXT[],
    emails TEXT[],
    phones TEXT[],
    addresses JSONB[],
    digital_identifiers JSONB DEFAULT '{}',
    risk_score INTEGER DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
    risk_factors JSONB DEFAULT '[]',
    payload JSONB DEFAULT '{}',
    report_count INTEGER DEFAULT 0,
    total_amount_reported_usd NUMERIC(15, 2) DEFAULT 0,
    countries_active TEXT[],
    fraud_types fraud_type[],
    pep_match BOOLEAN DEFAULT FALSE,
    sanctions_match BOOLEAN DEFAULT FALSE,
    law_enforcement_reported BOOLEAN DEFAULT FALSE,
    search_vector TSVECTOR,
    first_reported_at TIMESTAMPTZ,
    last_reported_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT has_identifier CHECK (
        canonical_name IS NOT NULL OR
        array_length(emails, 1) > 0 OR
        array_length(phones, 1) > 0
    )
);

-- Reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reporter_email VARCHAR(255),
    reporter_anonymous BOOLEAN DEFAULT FALSE,
    fraud_type fraud_type NOT NULL,
    status report_status DEFAULT 'pending',
    severity report_severity,
    payload JSONB NOT NULL,
    incident_date DATE,
    incident_country VARCHAR(2),
    incident_amount_usd NUMERIC(15, 2),
    perpetrator_name VARCHAR(255),
    perpetrator_email VARCHAR(255),
    perpetrator_phone VARCHAR(50),
    perpetrator_addresses TEXT[],
    search_vector_en TSVECTOR,
    search_vector_content TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    rejection_reason TEXT,
    duplicate_cluster_id UUID,
    is_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_of UUID REFERENCES reports(id),
    is_public BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    search_hits INTEGER DEFAULT 0,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    archived_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT valid_payload CHECK (jsonb_typeof(payload) = 'object'),
    CONSTRAINT valid_incident_date CHECK (incident_date IS NULL OR incident_date <= CURRENT_DATE),
    CONSTRAINT valid_amount CHECK (incident_amount_usd IS NULL OR incident_amount_usd >= 0)
);

-- Perpetrator-report links table
CREATE TABLE perpetrator_report_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    perpetrator_id UUID NOT NULL REFERENCES perpetrators(id) ON DELETE CASCADE,
    confidence_score NUMERIC(3, 2) DEFAULT 1.00 CHECK (confidence_score BETWEEN 0 AND 1),
    link_type VARCHAR(50) DEFAULT 'primary',
    matched_on TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    CONSTRAINT unique_report_perpetrator UNIQUE (report_id, perpetrator_id)
);

-- Evidence table
CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    type evidence_type NOT NULL,
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    file_size_bytes BIGINT,
    s3_bucket VARCHAR(100),
    s3_key VARCHAR(500),
    s3_region VARCHAR(50),
    storage_url TEXT,
    status evidence_status DEFAULT 'uploaded',
    checksum_sha256 VARCHAR(64),
    virus_scan_result JSONB,
    virus_scanned_at TIMESTAMPTZ,
    is_public BOOLEAN DEFAULT FALSE,
    requires_authentication BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    extracted_text TEXT,
    thumbnail_s3_key VARCHAR(500),
    url TEXT,
    url_screenshot_s3_key VARCHAR(500),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT valid_storage CHECK (
        (s3_key IS NOT NULL AND s3_bucket IS NOT NULL) OR (url IS NOT NULL)
    )
);

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_html TEXT,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    thread_depth INTEGER DEFAULT 0,
    status comment_status DEFAULT 'active',
    is_internal BOOLEAN DEFAULT FALSE,
    flagged_count INTEGER DEFAULT 0,
    moderated_by UUID REFERENCES users(id),
    moderated_at TIMESTAMPTZ,
    moderation_reason TEXT,
    upvotes INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    edited_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT content_not_empty CHECK (LENGTH(TRIM(content)) > 0),
    CONSTRAINT valid_thread_depth CHECK (
        (parent_comment_id IS NULL AND thread_depth = 0) OR
        (parent_comment_id IS NOT NULL AND thread_depth > 0)
    )
);

-- Duplicate clusters table
CREATE TABLE duplicate_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_report_id UUID REFERENCES reports(id),
    report_ids UUID[] NOT NULL,
    similarity_score NUMERIC(3, 2) CHECK (similarity_score BETWEEN 0 AND 1),
    match_criteria JSONB,
    reviewed BOOLEAN DEFAULT FALSE,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    confirmed BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT has_multiple_reports CHECK (array_length(report_ids, 1) >= 2),
    CONSTRAINT canonical_in_cluster CHECK (
        canonical_report_id IS NULL OR canonical_report_id = ANY(report_ids)
    )
);

-- Crawl sources table
CREATE TABLE crawl_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    source_type crawl_source_type NOT NULL,
    description TEXT,
    base_url TEXT NOT NULL,
    url_pattern TEXT,
    api_endpoint TEXT,
    config JSONB DEFAULT '{}',
    frequency crawl_frequency DEFAULT 'daily',
    requires_auth BOOLEAN DEFAULT FALSE,
    auth_config JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    last_crawl_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    last_error TEXT,
    consecutive_failures INTEGER DEFAULT 0,
    rate_limit_per_hour INTEGER,
    reliability_score INTEGER DEFAULT 50 CHECK (reliability_score BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    CONSTRAINT valid_url CHECK (base_url ~* '^https?://')
);

-- Crawl results table
CREATE TABLE crawl_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES crawl_sources(id) ON DELETE CASCADE,
    perpetrator_id UUID REFERENCES perpetrators(id),
    raw_data JSONB NOT NULL,
    normalized_data JSONB,
    status crawl_result_status DEFAULT 'pending',
    match_score NUMERIC(3, 2) CHECK (match_score IS NULL OR match_score BETWEEN 0 AND 1),
    match_fields TEXT[],
    source_url TEXT,
    source_title TEXT,
    source_date DATE,
    extracted_text TEXT,
    entities_found JSONB,
    crawled_at TIMESTAMPTZ NOT NULL,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    content_hash VARCHAR(64),
    CONSTRAINT unique_content_hash UNIQUE (source_id, content_hash)
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    user_role system_role,
    action audit_action NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB DEFAULT '{}',
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_entity CHECK (
        (entity_type IS NOT NULL AND entity_id IS NOT NULL) OR
        (entity_type IS NULL AND entity_id IS NULL)
    )
);

-- Search index metadata table
CREATE TABLE search_index_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    index_type search_index_type NOT NULL,
    index_name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    status sync_status DEFAULT 'out_of_sync',
    last_sync_started_at TIMESTAMPTZ,
    last_sync_completed_at TIMESTAMPTZ,
    last_sync_error TEXT,
    total_documents BIGINT DEFAULT 0,
    synced_documents BIGINT DEFAULT 0,
    failed_documents BIGINT DEFAULT 0,
    mapping JSONB,
    settings JSONB,
    last_synced_id UUID,
    last_synced_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_index_entity UNIQUE (index_type, index_name, entity_type)
);

COMMIT;
```

### Migration 002: Create Indexes

```sql
-- migration_002_create_indexes.sql
-- Scamnemesis Database Schema - Indexes Migration
-- This migration creates all performance and search indexes

BEGIN;

-- ============================================================================
-- USERS TABLE INDEXES
-- ============================================================================
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_tier ON users(tier);
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id) WHERE oauth_provider IS NOT NULL;
CREATE INDEX idx_users_last_login ON users(last_login_at DESC) WHERE deleted_at IS NULL;

-- ============================================================================
-- USER ROLES TABLE INDEXES
-- ============================================================================
CREATE INDEX idx_user_roles_user ON user_roles(user_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_user_roles_role ON user_roles(role) WHERE revoked_at IS NULL;
CREATE INDEX idx_user_roles_expires ON user_roles(expires_at)
    WHERE expires_at IS NOT NULL AND revoked_at IS NULL;
CREATE INDEX idx_user_roles_granted_by ON user_roles(granted_by) WHERE granted_by IS NOT NULL;

-- ============================================================================
-- REPORTS TABLE INDEXES
-- ============================================================================

-- Status and workflow
CREATE INDEX idx_reports_status ON reports(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_reports_fraud_type ON reports(fraud_type);
CREATE INDEX idx_reports_user ON reports(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_reports_severity ON reports(severity) WHERE severity IS NOT NULL;

-- Date range queries
CREATE INDEX idx_reports_incident_date ON reports(incident_date) WHERE incident_date IS NOT NULL;
CREATE INDEX idx_reports_submitted_at ON reports(submitted_at DESC);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Geographic searches
CREATE INDEX idx_reports_country ON reports(incident_country) WHERE incident_country IS NOT NULL;

-- Financial queries
CREATE INDEX idx_reports_amount ON reports(incident_amount_usd) WHERE incident_amount_usd IS NOT NULL;
CREATE INDEX idx_reports_large_amounts ON reports(incident_amount_usd)
    WHERE incident_amount_usd > 10000 AND deleted_at IS NULL;

-- Full-text search (PostgreSQL native)
CREATE INDEX idx_reports_search_vector ON reports USING GIN(search_vector_en);

-- Perpetrator searches
CREATE INDEX idx_reports_perp_name ON reports USING GIN(perpetrator_name gin_trgm_ops)
    WHERE perpetrator_name IS NOT NULL;
CREATE INDEX idx_reports_perp_email ON reports(LOWER(perpetrator_email))
    WHERE perpetrator_email IS NOT NULL;
CREATE INDEX idx_reports_perp_phone ON reports(perpetrator_phone)
    WHERE perpetrator_phone IS NOT NULL;
CREATE INDEX idx_reports_addresses ON reports USING GIN(perpetrator_addresses)
    WHERE perpetrator_addresses IS NOT NULL;

-- Duplicate detection
CREATE INDEX idx_reports_duplicate_cluster ON reports(duplicate_cluster_id)
    WHERE duplicate_cluster_id IS NOT NULL;
CREATE INDEX idx_reports_is_duplicate ON reports(is_duplicate) WHERE is_duplicate;
CREATE INDEX idx_reports_duplicate_of ON reports(duplicate_of) WHERE duplicate_of IS NOT NULL;

-- JSONB payload searches
CREATE INDEX idx_reports_payload ON reports USING GIN(payload);
CREATE INDEX idx_reports_payload_paths ON reports USING GIN(payload jsonb_path_ops);

-- Composite indexes for common queries
CREATE INDEX idx_reports_status_date ON reports(status, submitted_at DESC)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_reports_type_status ON reports(fraud_type, status)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_reports_user_status ON reports(user_id, status, created_at DESC)
    WHERE user_id IS NOT NULL AND deleted_at IS NULL;

-- Public reports
CREATE INDEX idx_reports_public ON reports(is_public, created_at DESC)
    WHERE is_public = TRUE AND deleted_at IS NULL;

-- Analytics
CREATE INDEX idx_reports_view_count ON reports(view_count DESC) WHERE view_count > 0;
CREATE INDEX idx_reports_reviewed ON reports(reviewed_by, reviewed_at)
    WHERE reviewed_by IS NOT NULL;

-- ============================================================================
-- PERPETRATORS TABLE INDEXES
-- ============================================================================

-- Name searches with trigrams
CREATE INDEX idx_perpetrators_name ON perpetrators USING GIN(canonical_name gin_trgm_ops)
    WHERE canonical_name IS NOT NULL;
CREATE INDEX idx_perpetrators_aliases ON perpetrators USING GIN(aliases)
    WHERE aliases IS NOT NULL;

-- Contact information
CREATE INDEX idx_perpetrators_emails ON perpetrators USING GIN(emails)
    WHERE emails IS NOT NULL;
CREATE INDEX idx_perpetrators_phones ON perpetrators USING GIN(phones)
    WHERE phones IS NOT NULL;

-- Full-text search
CREATE INDEX idx_perpetrators_search ON perpetrators USING GIN(search_vector);

-- JSONB indexes
CREATE INDEX idx_perpetrators_digital ON perpetrators USING GIN(digital_identifiers);
CREATE INDEX idx_perpetrators_payload ON perpetrators USING GIN(payload jsonb_path_ops);

-- Risk assessment
CREATE INDEX idx_perpetrators_risk_score ON perpetrators(risk_score DESC);
CREATE INDEX idx_perpetrators_high_risk ON perpetrators(risk_score)
    WHERE risk_score >= 70;

-- Statistics
CREATE INDEX idx_perpetrators_report_count ON perpetrators(report_count DESC);
CREATE INDEX idx_perpetrators_amount ON perpetrators(total_amount_reported_usd DESC);

-- Array fields
CREATE INDEX idx_perpetrators_countries ON perpetrators USING GIN(countries_active);
CREATE INDEX idx_perpetrators_fraud_types ON perpetrators USING GIN(fraud_types);

-- External matches
CREATE INDEX idx_perpetrators_pep ON perpetrators(pep_match) WHERE pep_match = TRUE;
CREATE INDEX idx_perpetrators_sanctions ON perpetrators(sanctions_match)
    WHERE sanctions_match = TRUE;
CREATE INDEX idx_perpetrators_law_enforcement ON perpetrators(law_enforcement_reported)
    WHERE law_enforcement_reported = TRUE;

-- Timestamps
CREATE INDEX idx_perpetrators_first_reported ON perpetrators(first_reported_at);
CREATE INDEX idx_perpetrators_last_reported ON perpetrators(last_reported_at DESC);
CREATE INDEX idx_perpetrators_created_at ON perpetrators(created_at DESC);

-- ============================================================================
-- PERPETRATOR-REPORT LINKS TABLE INDEXES
-- ============================================================================
CREATE INDEX idx_perp_links_report ON perpetrator_report_links(report_id);
CREATE INDEX idx_perp_links_perpetrator ON perpetrator_report_links(perpetrator_id);
CREATE INDEX idx_perp_links_confidence ON perpetrator_report_links(confidence_score)
    WHERE confidence_score < 1.0;
CREATE INDEX idx_perp_links_type ON perpetrator_report_links(link_type);

-- ============================================================================
-- EVIDENCE TABLE INDEXES
-- ============================================================================
CREATE INDEX idx_evidence_report ON evidence(report_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_evidence_type ON evidence(type);
CREATE INDEX idx_evidence_status ON evidence(status);
CREATE INDEX idx_evidence_checksum ON evidence(checksum_sha256)
    WHERE checksum_sha256 IS NOT NULL;
CREATE INDEX idx_evidence_uploaded_at ON evidence(uploaded_at DESC);
CREATE INDEX idx_evidence_public ON evidence(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_evidence_virus_scan ON evidence(virus_scanned_at)
    WHERE status = 'processing';

-- ============================================================================
-- COMMENTS TABLE INDEXES
-- ============================================================================
CREATE INDEX idx_comments_report ON comments(report_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_user ON comments(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_parent ON comments(parent_comment_id)
    WHERE parent_comment_id IS NOT NULL;
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_flagged ON comments(flagged_count) WHERE flagged_count > 0;
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX idx_comments_internal ON comments(is_internal, report_id) WHERE is_internal;

-- ============================================================================
-- DUPLICATE CLUSTERS TABLE INDEXES
-- ============================================================================
CREATE INDEX idx_duplicate_clusters_canonical ON duplicate_clusters(canonical_report_id);
CREATE INDEX idx_duplicate_clusters_reports ON duplicate_clusters USING GIN (report_ids);
CREATE INDEX idx_duplicate_clusters_unreviewed ON duplicate_clusters(reviewed)
    WHERE NOT reviewed;
CREATE INDEX idx_duplicate_clusters_similarity ON duplicate_clusters(similarity_score DESC);

-- ============================================================================
-- CRAWL SOURCES TABLE INDEXES
-- ============================================================================
CREATE INDEX idx_crawl_sources_type ON crawl_sources(source_type);
CREATE INDEX idx_crawl_sources_active ON crawl_sources(is_active) WHERE is_active;
CREATE INDEX idx_crawl_sources_frequency ON crawl_sources(frequency);
CREATE INDEX idx_crawl_sources_next_crawl ON crawl_sources(last_crawl_at, frequency)
    WHERE is_active;
CREATE INDEX idx_crawl_sources_failures ON crawl_sources(consecutive_failures)
    WHERE consecutive_failures > 0;

-- ============================================================================
-- CRAWL RESULTS TABLE INDEXES
-- ============================================================================
CREATE INDEX idx_crawl_results_source ON crawl_results(source_id);
CREATE INDEX idx_crawl_results_perpetrator ON crawl_results(perpetrator_id)
    WHERE perpetrator_id IS NOT NULL;
CREATE INDEX idx_crawl_results_status ON crawl_results(status);
CREATE INDEX idx_crawl_results_crawled_at ON crawl_results(crawled_at DESC);
CREATE INDEX idx_crawl_results_match ON crawl_results(match_score DESC)
    WHERE match_score IS NOT NULL;
CREATE INDEX idx_crawl_results_entities ON crawl_results USING GIN (entities_found);
CREATE INDEX idx_crawl_results_content_hash ON crawl_results(content_hash);

-- ============================================================================
-- AUDIT LOGS TABLE INDEXES
-- ============================================================================
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_logs_action ON audit_logs(action, created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id)
    WHERE entity_id IS NOT NULL;
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_ip ON audit_logs(ip_address) WHERE ip_address IS NOT NULL;
CREATE INDEX idx_audit_logs_success ON audit_logs(success) WHERE success = FALSE;
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action, created_at DESC)
    WHERE user_id IS NOT NULL;

-- ============================================================================
-- SEARCH INDEX METADATA TABLE INDEXES
-- ============================================================================
CREATE INDEX idx_search_index_status ON search_index_metadata(status);
CREATE INDEX idx_search_index_entity ON search_index_metadata(entity_type);
CREATE INDEX idx_search_index_last_sync ON search_index_metadata(last_sync_completed_at);
CREATE INDEX idx_search_index_out_of_sync ON search_index_metadata(status)
    WHERE status IN ('out_of_sync', 'error');

COMMIT;
```

### Migration 003: Functions and Triggers

```sql
-- migration_003_functions_triggers.sql
-- Scamnemesis Database Schema - Functions and Triggers
-- Author: Database Architect
-- Date: 2025-12-09

BEGIN;

-- ============================================================================
-- TRIGGER FUNCTION: Update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_perpetrators_updated_at BEFORE UPDATE ON perpetrators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evidence_updated_at BEFORE UPDATE ON evidence
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_duplicate_clusters_updated_at BEFORE UPDATE ON duplicate_clusters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crawl_sources_updated_at BEFORE UPDATE ON crawl_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crawl_results_updated_at BEFORE UPDATE ON crawl_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_search_index_metadata_updated_at BEFORE UPDATE ON search_index_metadata
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TRIGGER FUNCTION: Update search vectors for reports
-- ============================================================================
CREATE OR REPLACE FUNCTION update_report_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    -- Extract searchable text from JSONB payload
    NEW.search_vector_content :=
        COALESCE(NEW.perpetrator_name, '') || ' ' ||
        COALESCE(NEW.perpetrator_email, '') || ' ' ||
        COALESCE(NEW.perpetrator_phone, '') || ' ' ||
        COALESCE(array_to_string(NEW.perpetrator_addresses, ' '), '') || ' ' ||
        COALESCE(NEW.payload->>'incident'->>'description', '') || ' ' ||
        COALESCE(NEW.payload->>'perpetrator'->>'name', '');

    -- Update tsvector
    NEW.search_vector_en := to_tsvector('english', NEW.search_vector_content);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reports_search_vector BEFORE INSERT OR UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_report_search_vector();

-- ============================================================================
-- TRIGGER FUNCTION: Update search vector for perpetrators
-- ============================================================================
CREATE OR REPLACE FUNCTION update_perpetrator_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english',
        COALESCE(NEW.canonical_name, '') || ' ' ||
        COALESCE(array_to_string(NEW.aliases, ' '), '') || ' ' ||
        COALESCE(array_to_string(NEW.emails, ' '), '') || ' ' ||
        COALESCE(array_to_string(NEW.phones, ' '), '')
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_perpetrators_search_vector BEFORE INSERT OR UPDATE ON perpetrators
    FOR EACH ROW EXECUTE FUNCTION update_perpetrator_search_vector();

-- ============================================================================
-- TRIGGER FUNCTION: Update perpetrator statistics
-- ============================================================================
CREATE OR REPLACE FUNCTION update_perpetrator_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update perpetrator statistics when a new report is linked
    IF TG_OP = 'INSERT' THEN
        UPDATE perpetrators
        SET
            report_count = report_count + 1,
            last_reported_at = NOW()
        WHERE id = NEW.perpetrator_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_perpetrator_stats_on_link
    AFTER INSERT ON perpetrator_report_links
    FOR EACH ROW EXECUTE FUNCTION update_perpetrator_stats();

-- ============================================================================
-- FUNCTION: Calculate report similarity score
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_report_similarity(
    report1_id UUID,
    report2_id UUID
) RETURNS NUMERIC AS $$
DECLARE
    similarity_score NUMERIC := 0.0;
    r1 RECORD;
    r2 RECORD;
BEGIN
    SELECT * INTO r1 FROM reports WHERE id = report1_id;
    SELECT * INTO r2 FROM reports WHERE id = report2_id;

    -- Compare perpetrator email
    IF r1.perpetrator_email = r2.perpetrator_email AND r1.perpetrator_email IS NOT NULL THEN
        similarity_score := similarity_score + 0.4;
    END IF;

    -- Compare perpetrator phone
    IF r1.perpetrator_phone = r2.perpetrator_phone AND r1.perpetrator_phone IS NOT NULL THEN
        similarity_score := similarity_score + 0.3;
    END IF;

    -- Compare perpetrator name (fuzzy)
    IF r1.perpetrator_name IS NOT NULL AND r2.perpetrator_name IS NOT NULL THEN
        similarity_score := similarity_score + (
            similarity(r1.perpetrator_name, r2.perpetrator_name) * 0.3
        );
    END IF;

    RETURN LEAST(similarity_score, 1.0);
END;
$$ LANGUAGE plpgsql;

COMMIT;
```

---

## Summary

This comprehensive database schema for Scamnemesis includes:

1. **12 Core Tables** with complete relationships and constraints
2. **100+ Indexes** optimized for search, filtering, and analytics
3. **13 Custom PostgreSQL Types** for type safety
4. **5 JSON Schemas** for payload validation
5. **29 Fraud Types** with descriptions
6. **3 Migration Scripts** ready to execute
7. **Triggers & Functions** for auto-updating search vectors and statistics

### Key Features:
- **JSONB** for flexible fraud report data
- **Full-text search** with PostgreSQL native tsvector
- **Trigram matching** for fuzzy name searches
- **Audit logging** for all admin actions
- **RBAC** with flexible permissions
- **Duplicate detection** with similarity scoring
- **External data crawling** infrastructure
- **Evidence storage** with S3 references
- **Multi-tier user system**
- **Search index sync tracking**

### Next Steps:
1. Execute migration scripts in order
2. Set up application-level JSON schema validation
3. Configure S3 buckets for evidence storage
4. Implement search indexing service (Elasticsearch/MeiliSearch)
5. Set up automated crawlers for external data sources
6. Configure backup and partitioning strategies (especially for audit_logs)
