-- ============================================================================
-- DUPLICATE DETECTION SYSTEM - DATABASE MIGRATION
-- Version: 001
-- Description: Complete schema for duplicate detection with pgvector
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- FRAUD REPORTS TABLE (Extended)
-- ============================================================================

CREATE TABLE IF NOT EXISTS fraud_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Scammer information
  scammer_name VARCHAR(255),
  company_name VARCHAR(255),

  -- Contact information
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),

  -- Financial identifiers
  iban VARCHAR(50),
  crypto_wallet VARCHAR(255),
  crypto_type VARCHAR(20), -- 'BTC', 'ETH', 'OTHER'
  bank_account VARCHAR(100),

  -- Vehicle identifiers
  license_plate VARCHAR(20),
  vin VARCHAR(17),

  -- Company identifiers
  company_id VARCHAR(50), -- IČO
  tax_id VARCHAR(50),     -- DIČ

  -- Report details
  description TEXT,
  scam_type VARCHAR(100),
  amount_lost DECIMAL(15, 2),
  currency VARCHAR(10) DEFAULT 'EUR',

  -- Vector embedding for similarity search (384 dimensions)
  embedding vector(384),

  -- Status and metadata
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'rejected', 'merged'
  has_duplicates BOOLEAN DEFAULT FALSE,
  merged_into_id UUID, -- Reference to primary report if merged

  -- Timestamps and user tracking
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  verified_by UUID,
  verified_at TIMESTAMP
);

-- Indexes for fraud_reports
CREATE INDEX IF NOT EXISTS idx_fraud_reports_status ON fraud_reports(status);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_created_at ON fraud_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_has_duplicates ON fraud_reports(has_duplicates);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_merged_into ON fraud_reports(merged_into_id);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_scammer_name ON fraud_reports(scammer_name);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_company_name ON fraud_reports(company_name);

-- HNSW index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_fraud_reports_embedding ON fraud_reports
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- ============================================================================
-- NORMALIZED FIELDS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS normalized_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES fraud_reports(id) ON DELETE CASCADE,

  -- Normalized unique identifiers
  normalized_phone VARCHAR(50),
  normalized_email VARCHAR(255),
  normalized_iban VARCHAR(50),
  normalized_crypto_wallet VARCHAR(255),
  normalized_license_plate VARCHAR(20),
  normalized_vin VARCHAR(17),
  normalized_company_id VARCHAR(50),

  created_at TIMESTAMP DEFAULT NOW(),

  -- Ensure one normalized record per report
  UNIQUE(report_id)
);

-- Indexes for fast exact matching
CREATE INDEX IF NOT EXISTS idx_normalized_phone ON normalized_fields(normalized_phone) WHERE normalized_phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_normalized_email ON normalized_fields(normalized_email) WHERE normalized_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_normalized_iban ON normalized_fields(normalized_iban) WHERE normalized_iban IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_normalized_crypto ON normalized_fields(normalized_crypto_wallet) WHERE normalized_crypto_wallet IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_normalized_plate ON normalized_fields(normalized_license_plate) WHERE normalized_license_plate IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_normalized_vin ON normalized_fields(normalized_vin) WHERE normalized_vin IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_normalized_company ON normalized_fields(normalized_company_id) WHERE normalized_company_id IS NOT NULL;

-- ============================================================================
-- DUPLICATE CLUSTERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS duplicate_clusters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Primary report (canonical)
  primary_report_id UUID NOT NULL REFERENCES fraud_reports(id) ON DELETE CASCADE,

  -- All report IDs in cluster (including primary)
  report_ids UUID[] NOT NULL,

  -- Cluster statistics
  total_reports INTEGER NOT NULL DEFAULT 1,
  avg_confidence DECIMAL(4, 3), -- 0.000 to 1.000

  -- Review status
  is_reviewed BOOLEAN DEFAULT FALSE,
  reviewed_by UUID,
  reviewed_at TIMESTAMP,
  merge_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'merged', 'rejected'

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for duplicate_clusters
CREATE INDEX IF NOT EXISTS idx_clusters_primary ON duplicate_clusters(primary_report_id);
CREATE INDEX IF NOT EXISTS idx_clusters_reviewed ON duplicate_clusters(is_reviewed);
CREATE INDEX IF NOT EXISTS idx_clusters_status ON duplicate_clusters(merge_status);
CREATE INDEX IF NOT EXISTS idx_clusters_created ON duplicate_clusters(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clusters_confidence ON duplicate_clusters(avg_confidence DESC);

-- GIN index for array containment queries
CREATE INDEX IF NOT EXISTS idx_clusters_report_ids ON duplicate_clusters USING GIN(report_ids);

-- ============================================================================
-- DUPLICATE MATCHES
-- ============================================================================

CREATE TABLE IF NOT EXISTS duplicate_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Cluster this match belongs to
  cluster_id UUID NOT NULL REFERENCES duplicate_clusters(id) ON DELETE CASCADE,

  -- The two reports being matched
  report_id_1 UUID NOT NULL REFERENCES fraud_reports(id) ON DELETE CASCADE,
  report_id_2 UUID NOT NULL REFERENCES fraud_reports(id) ON DELETE CASCADE,

  -- Match details
  match_type VARCHAR(50) NOT NULL, -- 'exact', 'fuzzy', 'vector', 'image'
  confidence DECIMAL(4, 3) NOT NULL, -- 0.000 to 1.000
  matched_fields TEXT[], -- e.g., ['phone', 'email', 'name']
  details JSONB, -- Detailed match information

  -- Detection method
  detection_method VARCHAR(50) DEFAULT 'auto', -- 'auto', 'manual'
  detected_by UUID,

  -- Confirmation status
  is_confirmed BOOLEAN DEFAULT NULL, -- NULL = pending, TRUE = confirmed, FALSE = rejected
  confirmed_by UUID,
  confirmed_at TIMESTAMP,

  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CHECK (report_id_1 <> report_id_2),
  CHECK (confidence >= 0 AND confidence <= 1)
);

-- Indexes for duplicate_matches
CREATE INDEX IF NOT EXISTS idx_matches_cluster ON duplicate_matches(cluster_id);
CREATE INDEX IF NOT EXISTS idx_matches_report1 ON duplicate_matches(report_id_1);
CREATE INDEX IF NOT EXISTS idx_matches_report2 ON duplicate_matches(report_id_2);
CREATE INDEX IF NOT EXISTS idx_matches_type ON duplicate_matches(match_type);
CREATE INDEX IF NOT EXISTS idx_matches_confidence ON duplicate_matches(confidence DESC);
CREATE INDEX IF NOT EXISTS idx_matches_confirmed ON duplicate_matches(is_confirmed);
CREATE INDEX IF NOT EXISTS idx_matches_created ON duplicate_matches(created_at DESC);

-- Unique constraint: no duplicate pairwise matches
CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_unique_pair ON duplicate_matches(
  LEAST(report_id_1, report_id_2),
  GREATEST(report_id_1, report_id_2)
);

-- ============================================================================
-- IMAGE HASHES
-- ============================================================================

CREATE TABLE IF NOT EXISTS report_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES fraud_reports(id) ON DELETE CASCADE,

  -- Image info
  image_url TEXT NOT NULL,
  image_type VARCHAR(50), -- 'profile', 'screenshot', 'document', 'evidence', 'other'

  -- Perceptual hashes (hex strings)
  phash VARCHAR(64),
  ahash VARCHAR(64),
  dhash VARCHAR(64),
  whash VARCHAR(64),

  -- Image metadata
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  format VARCHAR(10), -- 'jpg', 'png', 'gif', etc.

  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for report_images
CREATE INDEX IF NOT EXISTS idx_images_report ON report_images(report_id);
CREATE INDEX IF NOT EXISTS idx_images_phash ON report_images(phash) WHERE phash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_images_ahash ON report_images(ahash) WHERE ahash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_images_dhash ON report_images(dhash) WHERE dhash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_images_type ON report_images(image_type);

-- ============================================================================
-- DETECTION JOB QUEUE
-- ============================================================================

CREATE TABLE IF NOT EXISTS duplicate_detection_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES fraud_reports(id) ON DELETE CASCADE,

  -- Job details
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  job_type VARCHAR(50) NOT NULL, -- 'fuzzy', 'vector', 'image', 'all'

  -- Results
  matches_found INTEGER DEFAULT 0,
  highest_confidence DECIMAL(4, 3),
  error_message TEXT,

  -- Timing
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),

  -- Worker info
  worker_id VARCHAR(100)
);

-- Indexes for detection jobs
CREATE INDEX IF NOT EXISTS idx_jobs_report ON duplicate_detection_jobs(report_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON duplicate_detection_jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON duplicate_detection_jobs(created_at DESC);

-- ============================================================================
-- ADMIN ACTION LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS duplicate_admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- What was acted upon
  cluster_id UUID REFERENCES duplicate_clusters(id) ON DELETE SET NULL,
  match_id UUID REFERENCES duplicate_matches(id) ON DELETE SET NULL,
  report_id UUID REFERENCES fraud_reports(id) ON DELETE SET NULL,

  -- Action details
  action_type VARCHAR(50) NOT NULL, -- 'merge', 'unmerge', 'confirm', 'reject', 'update_primary'
  action_data JSONB,

  -- Who performed the action
  admin_user_id UUID NOT NULL,
  admin_username VARCHAR(255),

  -- When
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for admin actions
CREATE INDEX IF NOT EXISTS idx_actions_cluster ON duplicate_admin_actions(cluster_id);
CREATE INDEX IF NOT EXISTS idx_actions_admin ON duplicate_admin_actions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_actions_type ON duplicate_admin_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_actions_created ON duplicate_admin_actions(created_at DESC);

-- ============================================================================
-- THRESHOLD CONFIGURATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS duplicate_thresholds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Config name
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,

  -- Threshold values
  levenshtein_max INTEGER DEFAULT 5,
  jaro_winkler_min DECIMAL(3, 2) DEFAULT 0.85,
  ngram_jaccard_min DECIMAL(3, 2) DEFAULT 0.70,
  vector_similarity_min DECIMAL(3, 2) DEFAULT 0.85,
  image_hash_distance_max INTEGER DEFAULT 10,
  overall_confidence_min DECIMAL(3, 2) DEFAULT 0.75,

  -- Status
  is_active BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,

  -- Performance tracking
  matches_found INTEGER DEFAULT 0,
  false_positives INTEGER DEFAULT 0,
  false_negatives INTEGER DEFAULT 0,
  precision DECIMAL(5, 4),
  recall DECIMAL(5, 4)
);

-- Indexes for thresholds
CREATE INDEX IF NOT EXISTS idx_thresholds_active ON duplicate_thresholds(is_active);
CREATE INDEX IF NOT EXISTS idx_thresholds_default ON duplicate_thresholds(is_default);

-- Insert default threshold configurations
INSERT INTO duplicate_thresholds (name, description, is_active, is_default) VALUES
  ('default', 'Default balanced thresholds (precision ~80%, recall ~70%)', TRUE, TRUE),
  ('strict', 'Strict thresholds for high precision (precision ~95%, recall ~50%)', FALSE, FALSE),
  ('relaxed', 'Relaxed thresholds for high recall (precision ~60%, recall ~90%)', FALSE, FALSE)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Cluster summary with statistics
CREATE OR REPLACE VIEW v_cluster_summary AS
SELECT
  c.id,
  c.primary_report_id,
  c.total_reports,
  c.avg_confidence,
  c.is_reviewed,
  c.merge_status,
  c.created_at,
  c.updated_at,
  pr.scammer_name AS primary_scammer_name,
  pr.company_name AS primary_company_name,
  pr.phone AS primary_phone,
  pr.email AS primary_email,
  pr.description AS primary_description,
  COUNT(DISTINCT m.id) AS total_matches,
  MAX(m.confidence) AS max_confidence,
  MIN(m.confidence) AS min_confidence
FROM duplicate_clusters c
JOIN fraud_reports pr ON c.primary_report_id = pr.id
LEFT JOIN duplicate_matches m ON c.id = m.cluster_id
GROUP BY c.id, c.primary_report_id, c.total_reports, c.avg_confidence,
         c.is_reviewed, c.merge_status, c.created_at, c.updated_at,
         pr.scammer_name, pr.company_name, pr.phone, pr.email, pr.description;

-- View: High-confidence pending clusters
CREATE OR REPLACE VIEW v_pending_high_confidence_clusters AS
SELECT *
FROM v_cluster_summary
WHERE is_reviewed = FALSE
  AND avg_confidence >= 0.85
ORDER BY avg_confidence DESC, created_at ASC;

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function: Update cluster statistics
CREATE OR REPLACE FUNCTION update_cluster_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE duplicate_clusters
  SET
    total_reports = array_length(report_ids, 1),
    avg_confidence = (
      SELECT AVG(confidence)
      FROM duplicate_matches
      WHERE cluster_id = COALESCE(NEW.cluster_id, OLD.cluster_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.cluster_id, OLD.cluster_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update cluster stats when match is added/updated/deleted
DROP TRIGGER IF EXISTS trg_update_cluster_stats ON duplicate_matches;
CREATE TRIGGER trg_update_cluster_stats
AFTER INSERT OR UPDATE OR DELETE ON duplicate_matches
FOR EACH ROW
EXECUTE FUNCTION update_cluster_stats();

-- Function: Mark reports as having duplicates
CREATE OR REPLACE FUNCTION mark_report_duplicates()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE fraud_reports
  SET has_duplicates = TRUE
  WHERE id = ANY(NEW.report_ids);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Mark reports when cluster is created/updated
DROP TRIGGER IF EXISTS trg_mark_duplicates ON duplicate_clusters;
CREATE TRIGGER trg_mark_duplicates
AFTER INSERT OR UPDATE ON duplicate_clusters
FOR EACH ROW
EXECUTE FUNCTION mark_report_duplicates();

-- Function: Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trg_fraud_reports_updated_at ON fraud_reports;
CREATE TRIGGER trg_fraud_reports_updated_at
BEFORE UPDATE ON fraud_reports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_clusters_updated_at ON duplicate_clusters;
CREATE TRIGGER trg_clusters_updated_at
BEFORE UPDATE ON duplicate_clusters
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- EXAMPLE QUERIES (COMMENTED OUT)
-- ============================================================================

/*
-- Find all exact matches for a phone number
SELECT r.*
FROM fraud_reports r
JOIN normalized_fields nf ON r.id = nf.report_id
WHERE nf.normalized_phone = '421911123456';

-- Find similar reports using vector search
SELECT
  id,
  scammer_name,
  description,
  1 - (embedding <=> '[0.1, 0.2, ...]'::vector) AS similarity
FROM fraud_reports
WHERE 1 - (embedding <=> '[0.1, 0.2, ...]'::vector) > 0.85
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 10;

-- Get cluster with all matches
SELECT
  c.*,
  m.report_id_2,
  m.match_type,
  m.confidence,
  m.matched_fields,
  r.scammer_name,
  r.phone,
  r.email
FROM duplicate_clusters c
JOIN duplicate_matches m ON c.id = m.cluster_id
JOIN fraud_reports r ON m.report_id_2 = r.id
WHERE c.id = 'some-cluster-id'
ORDER BY m.confidence DESC;

-- Daily duplicate detection stats
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_reports,
  SUM(CASE WHEN has_duplicates THEN 1 ELSE 0 END) as reports_with_duplicates,
  SUM(CASE WHEN has_duplicates THEN 1 ELSE 0 END)::float / COUNT(*) as duplicate_rate
FROM fraud_reports
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
