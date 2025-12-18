-- Scamnemesis Baseline Migration
-- Auto-generated from prisma/schema.prisma
-- This migration creates all tables, enums, and indexes

-- ==================== EXTENSIONS ====================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Try to create pgvector if available
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "vector";
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pgvector extension not available, skipping';
END $$;

-- ==================== ENUMS ====================

-- UserRole
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('BASIC', 'STANDARD', 'GOLD', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ReportStatus
DO $$ BEGIN
    CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'MERGED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Severity
DO $$ BEGIN
    CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- FraudType
DO $$ BEGIN
    CREATE TYPE "FraudType" AS ENUM (
        'ROMANCE_SCAM', 'INVESTMENT_FRAUD', 'PHISHING', 'IDENTITY_THEFT',
        'ONLINE_SHOPPING_FRAUD', 'TECH_SUPPORT_SCAM', 'LOTTERY_PRIZE_SCAM',
        'EMPLOYMENT_SCAM', 'RENTAL_SCAM', 'CRYPTOCURRENCY_SCAM',
        'PYRAMID_MLM_SCHEME', 'INSURANCE_FRAUD', 'CREDIT_CARD_FRAUD',
        'WIRE_FRAUD', 'MONEY_MULE', 'ADVANCE_FEE_FRAUD',
        'BUSINESS_EMAIL_COMPROMISE', 'SOCIAL_ENGINEERING', 'FAKE_CHARITY',
        'GOVERNMENT_IMPERSONATION', 'UTILITY_SCAM', 'GRANDPARENT_SCAM',
        'SEXTORTION', 'RANSOMWARE', 'ACCOUNT_TAKEOVER', 'SIM_SWAPPING',
        'CATFISHING', 'PONZI_SCHEME', 'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- EvidenceType
DO $$ BEGIN
    CREATE TYPE "EvidenceType" AS ENUM (
        'IMAGE', 'DOCUMENT', 'VIDEO', 'AUDIO', 'PAYMENT_EVIDENCE',
        'FRAUDSTER_PHOTO', 'SCREENSHOT', 'DAMAGE_DOCS', 'CRIME_SCENE', 'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Blockchain
DO $$ BEGIN
    CREATE TYPE "Blockchain" AS ENUM (
        'BITCOIN', 'ETHEREUM', 'TRON', 'SOLANA', 'BINANCE_SMART_CHAIN',
        'POLYGON', 'CARDANO', 'RIPPLE', 'LITECOIN', 'POLKADOT', 'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- PerpetratorType
DO $$ BEGIN
    CREATE TYPE "PerpetratorType" AS ENUM ('INDIVIDUAL', 'COMPANY', 'UNKNOWN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CommentStatus
DO $$ BEGIN
    CREATE TYPE "CommentStatus" AS ENUM ('PENDING_MODERATION', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- DuplicateClusterStatus
DO $$ BEGIN
    CREATE TYPE "DuplicateClusterStatus" AS ENUM ('PENDING', 'RESOLVED', 'IGNORED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- EnrichmentEventType
DO $$ BEGIN
    CREATE TYPE "EnrichmentEventType" AS ENUM ('CRAWL_RESULT', 'SANCTIONS_MATCH', 'NEWS_MATCH');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- EnrichmentStatus
DO $$ BEGIN
    CREATE TYPE "EnrichmentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- MediaType
DO $$ BEGIN
    CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- MediaStatus
DO $$ BEGIN
    CREATE TYPE "MediaStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED', 'DELETED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- PageStatus
DO $$ BEGIN
    CREATE TYPE "PageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ==================== TABLES ====================

-- Users
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'BASIC',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verified_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "display_name" TEXT,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- API Keys
CREATE TABLE IF NOT EXISTS "api_keys" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "user_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rate_limit" INTEGER NOT NULL DEFAULT 1000,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "api_keys_key_key" ON "api_keys"("key");
CREATE INDEX IF NOT EXISTS "api_keys_user_id_idx" ON "api_keys"("user_id");
CREATE INDEX IF NOT EXISTS "api_keys_is_active_expires_at_idx" ON "api_keys"("is_active", "expires_at");

-- Refresh Tokens
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "refresh_tokens_token_key" ON "refresh_tokens"("token");
CREATE INDEX IF NOT EXISTS "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");
CREATE INDEX IF NOT EXISTS "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- Reports
CREATE TABLE IF NOT EXISTS "reports" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "severity" "Severity",
    "public_id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "fraud_type" "FraudType" NOT NULL,
    "incident_date" TIMESTAMP(3),
    "transaction_date" TIMESTAMP(3),
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "financial_loss_amount" DECIMAL(15,2),
    "financial_loss_currency" TEXT NOT NULL DEFAULT 'EUR',
    "location" JSONB,
    "location_street" TEXT,
    "location_city" TEXT,
    "location_postal_code" TEXT,
    "location_country" TEXT,
    "reporter_id" TEXT NOT NULL,
    "reporter_email" TEXT NOT NULL,
    "reporter_name" TEXT,
    "reporter_phone" TEXT,
    "reporter_consent" BOOLEAN NOT NULL DEFAULT true,
    "reporter_lang" TEXT NOT NULL DEFAULT 'en',
    "want_updates" BOOLEAN NOT NULL DEFAULT false,
    "agree_to_terms" BOOLEAN NOT NULL DEFAULT false,
    "agree_to_gdpr" BOOLEAN NOT NULL DEFAULT false,
    "moderated_by_id" TEXT,
    "moderated_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "admin_notes" TEXT,
    "masking_overrides" JSONB,
    "metadata" JSONB,
    "merged_into_id" TEXT,
    "merge_count" INTEGER NOT NULL DEFAULT 0,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "tracking_token" TEXT,
    "case_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reports_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reports_moderated_by_id_fkey" FOREIGN KEY ("moderated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "reports_merged_into_id_fkey" FOREIGN KEY ("merged_into_id") REFERENCES "reports"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "reports_public_id_key" ON "reports"("public_id");
CREATE UNIQUE INDEX IF NOT EXISTS "reports_tracking_token_key" ON "reports"("tracking_token");
CREATE UNIQUE INDEX IF NOT EXISTS "reports_case_number_key" ON "reports"("case_number");
CREATE INDEX IF NOT EXISTS "reports_status_idx" ON "reports"("status");
CREATE INDEX IF NOT EXISTS "reports_severity_idx" ON "reports"("severity");
CREATE INDEX IF NOT EXISTS "reports_fraud_type_idx" ON "reports"("fraud_type");
CREATE INDEX IF NOT EXISTS "reports_location_country_idx" ON "reports"("location_country");
CREATE INDEX IF NOT EXISTS "reports_created_at_idx" ON "reports"("created_at");
CREATE INDEX IF NOT EXISTS "reports_merged_into_id_idx" ON "reports"("merged_into_id");
CREATE INDEX IF NOT EXISTS "reports_reporter_id_idx" ON "reports"("reporter_id");
CREATE INDEX IF NOT EXISTS "reports_moderated_by_id_idx" ON "reports"("moderated_by_id");
CREATE INDEX IF NOT EXISTS "reports_status_created_at_idx" ON "reports"("status", "created_at");

-- Perpetrators
CREATE TABLE IF NOT EXISTS "perpetrators" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "report_id" TEXT NOT NULL,
    "perpetrator_type" "PerpetratorType" NOT NULL DEFAULT 'INDIVIDUAL',
    "full_name" TEXT,
    "full_name_normalized" TEXT,
    "nickname" TEXT,
    "username" TEXT,
    "approx_age" INTEGER,
    "nationality" TEXT,
    "physical_description" TEXT,
    "phone" TEXT,
    "phone_normalized" TEXT,
    "email" TEXT,
    "email_normalized" TEXT,
    "address_street" TEXT,
    "address_city" TEXT,
    "address_postal_code" TEXT,
    "address_country" TEXT,
    "enriched_data" JSONB,
    CONSTRAINT "perpetrators_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "perpetrators_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
-- Add vector column for name embeddings (optional - only if pgvector is available)
DO $$
BEGIN
    ALTER TABLE "perpetrators" ADD COLUMN IF NOT EXISTS "name_embedding" vector(384);
EXCEPTION WHEN undefined_object THEN
    RAISE NOTICE 'pgvector not available, skipping name_embedding column';
END $$;
CREATE INDEX IF NOT EXISTS "perpetrators_report_id_idx" ON "perpetrators"("report_id");
CREATE INDEX IF NOT EXISTS "perpetrators_phone_normalized_idx" ON "perpetrators"("phone_normalized");
CREATE INDEX IF NOT EXISTS "perpetrators_email_normalized_idx" ON "perpetrators"("email_normalized");
CREATE INDEX IF NOT EXISTS "perpetrators_full_name_normalized_idx" ON "perpetrators"("full_name_normalized");

-- Digital Footprints
CREATE TABLE IF NOT EXISTS "digital_footprints" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "report_id" TEXT NOT NULL,
    "telegram" TEXT,
    "whatsapp" TEXT,
    "signal" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "tiktok" TEXT,
    "twitter" TEXT,
    "website_url" TEXT,
    "domain_name" TEXT,
    "domain_creation_date" TIMESTAMP(3),
    "ip_address" TEXT,
    "ip_country" TEXT,
    "isp" TEXT,
    "ip_abuse_score" INTEGER,
    CONSTRAINT "digital_footprints_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "digital_footprints_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "digital_footprints_report_id_key" ON "digital_footprints"("report_id");
CREATE INDEX IF NOT EXISTS "digital_footprints_domain_name_idx" ON "digital_footprints"("domain_name");
CREATE INDEX IF NOT EXISTS "digital_footprints_ip_address_idx" ON "digital_footprints"("ip_address");

-- Financial Info
CREATE TABLE IF NOT EXISTS "financial_info" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "report_id" TEXT NOT NULL,
    "iban" TEXT,
    "iban_normalized" TEXT,
    "account_holder" TEXT,
    "account_number" TEXT,
    "bank_name" TEXT,
    "bank_country" TEXT,
    "swift_bic" TEXT,
    "routing_number" TEXT,
    "bsb" TEXT,
    "sort_code" TEXT,
    "ifsc" TEXT,
    "cnaps" TEXT,
    "other_banking_details" TEXT,
    CONSTRAINT "financial_info_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "financial_info_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "financial_info_report_id_key" ON "financial_info"("report_id");
CREATE INDEX IF NOT EXISTS "financial_info_iban_normalized_idx" ON "financial_info"("iban_normalized");
CREATE INDEX IF NOT EXISTS "financial_info_account_number_idx" ON "financial_info"("account_number");

-- Crypto Info
CREATE TABLE IF NOT EXISTS "crypto_info" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "report_id" TEXT NOT NULL,
    "wallet_address" TEXT,
    "wallet_normalized" TEXT,
    "blockchain" "Blockchain",
    "exchange_wallet_name" TEXT,
    "transaction_hash" TEXT,
    "paypal_account" TEXT,
    CONSTRAINT "crypto_info_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "crypto_info_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "crypto_info_report_id_key" ON "crypto_info"("report_id");
CREATE INDEX IF NOT EXISTS "crypto_info_wallet_normalized_idx" ON "crypto_info"("wallet_normalized");

-- Company Info
CREATE TABLE IF NOT EXISTS "company_info" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "report_id" TEXT NOT NULL,
    "name" TEXT,
    "vat_tax_id" TEXT,
    "address_street" TEXT,
    "address_city" TEXT,
    "address_postal" TEXT,
    "address_country" TEXT,
    CONSTRAINT "company_info_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "company_info_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "company_info_report_id_key" ON "company_info"("report_id");
CREATE INDEX IF NOT EXISTS "company_info_vat_tax_id_idx" ON "company_info"("vat_tax_id");

-- Vehicle Info
CREATE TABLE IF NOT EXISTS "vehicle_info" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "report_id" TEXT NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "color" TEXT,
    "license_plate" TEXT,
    "vin" TEXT,
    "registered_owner" TEXT,
    CONSTRAINT "vehicle_info_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "vehicle_info_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "vehicle_info_report_id_key" ON "vehicle_info"("report_id");
CREATE INDEX IF NOT EXISTS "vehicle_info_license_plate_idx" ON "vehicle_info"("license_plate");
CREATE INDEX IF NOT EXISTS "vehicle_info_vin_idx" ON "vehicle_info"("vin");

-- Evidence
CREATE TABLE IF NOT EXISTS "evidence" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "report_id" TEXT NOT NULL,
    "type" "EvidenceType" NOT NULL,
    "file_key" TEXT,
    "url" TEXT,
    "external_url" TEXT,
    "description" TEXT,
    "mime_type" TEXT,
    "file_size" INTEGER,
    "hash" TEXT,
    "thumbnail_key" TEXT,
    "thumbnail_url" TEXT,
    "p_hash" TEXT,
    "has_face" BOOLEAN NOT NULL DEFAULT false,
    "face_count" INTEGER,
    "ocr_text" TEXT,
    "ocr_confidence" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "evidence_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "evidence_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "evidence_report_id_idx" ON "evidence"("report_id");
CREATE INDEX IF NOT EXISTS "evidence_p_hash_idx" ON "evidence"("p_hash");
CREATE INDEX IF NOT EXISTS "evidence_hash_idx" ON "evidence"("hash");

-- Face Data
CREATE TABLE IF NOT EXISTS "face_data" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "evidence_id" TEXT NOT NULL,
    "bounding_box" JSONB NOT NULL,
    "quality" DOUBLE PRECISION,
    "crop_key" TEXT,
    CONSTRAINT "face_data_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "face_data_evidence_id_fkey" FOREIGN KEY ("evidence_id") REFERENCES "evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
-- Add vector column for face embeddings (optional - only if pgvector is available)
DO $$
BEGIN
    ALTER TABLE "face_data" ADD COLUMN IF NOT EXISTS "embedding" vector(512);
EXCEPTION WHEN undefined_object THEN
    RAISE NOTICE 'pgvector not available, skipping face embedding column';
END $$;
CREATE INDEX IF NOT EXISTS "face_data_evidence_id_idx" ON "face_data"("evidence_id");

-- Comments
CREATE TABLE IF NOT EXISTS "comments" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "report_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'PENDING_MODERATION',
    "moderated_at" TIMESTAMP(3),
    "moderated_by_id" TEXT,
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_reported" BOOLEAN NOT NULL DEFAULT false,
    "report_reason" TEXT,
    "reported_at" TIMESTAMP(3),
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "comments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "comments_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comments_moderated_by_id_fkey" FOREIGN KEY ("moderated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "comments_report_id_idx" ON "comments"("report_id");
CREATE INDEX IF NOT EXISTS "comments_status_idx" ON "comments"("status");
CREATE INDEX IF NOT EXISTS "comments_user_id_idx" ON "comments"("user_id");
CREATE INDEX IF NOT EXISTS "comments_moderated_by_id_idx" ON "comments"("moderated_by_id");
CREATE INDEX IF NOT EXISTS "comments_report_id_status_idx" ON "comments"("report_id", "status");
CREATE INDEX IF NOT EXISTS "comments_is_reported_idx" ON "comments"("is_reported");

-- Duplicate Clusters
CREATE TABLE IF NOT EXISTS "duplicate_clusters" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "primary_report_id" TEXT,
    "status" "DuplicateClusterStatus" NOT NULL DEFAULT 'PENDING',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "match_type" TEXT,
    "matching_criteria" JSONB,
    "resolved_at" TIMESTAMP(3),
    "resolved_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "duplicate_clusters_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "duplicate_clusters_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "duplicate_clusters_status_idx" ON "duplicate_clusters"("status");
CREATE INDEX IF NOT EXISTS "duplicate_clusters_confidence_idx" ON "duplicate_clusters"("confidence");
CREATE INDEX IF NOT EXISTS "duplicate_clusters_resolved_by_id_idx" ON "duplicate_clusters"("resolved_by_id");
CREATE INDEX IF NOT EXISTS "duplicate_clusters_primary_report_id_idx" ON "duplicate_clusters"("primary_report_id");

-- Duplicate Cluster Reports (Join Table)
CREATE TABLE IF NOT EXISTS "duplicate_cluster_reports" (
    "cluster_id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "similarity" DOUBLE PRECISION NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "duplicate_cluster_reports_pkey" PRIMARY KEY ("cluster_id", "report_id"),
    CONSTRAINT "duplicate_cluster_reports_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "duplicate_clusters"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "duplicate_cluster_reports_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Enrichments
CREATE TABLE IF NOT EXISTS "enrichments" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "perpetrator_id" TEXT,
    "event_type" "EnrichmentEventType" NOT NULL,
    "source_id" TEXT NOT NULL,
    "match_type" TEXT NOT NULL,
    "match_value" TEXT NOT NULL,
    "similarity" DOUBLE PRECISION,
    "data" JSONB NOT NULL,
    "status" "EnrichmentStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "enrichments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "enrichments_perpetrator_id_fkey" FOREIGN KEY ("perpetrator_id") REFERENCES "perpetrators"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "enrichments_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "enrichments_perpetrator_id_idx" ON "enrichments"("perpetrator_id");
CREATE INDEX IF NOT EXISTS "enrichments_status_idx" ON "enrichments"("status");
CREATE INDEX IF NOT EXISTS "enrichments_reviewed_by_id_idx" ON "enrichments"("reviewed_by_id");
CREATE INDEX IF NOT EXISTS "enrichments_event_type_idx" ON "enrichments"("event_type");

-- Crawl Results (for news/RSS crawler data)
CREATE TABLE IF NOT EXISTS "crawl_results" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "source_id" TEXT NOT NULL,
    "url" TEXT,
    "url_canonical" TEXT,
    "title" TEXT,
    "content" TEXT,
    "language" VARCHAR(10),
    "published_at" TIMESTAMP(3),
    "content_hash" TEXT NOT NULL,
    "entities" JSONB DEFAULT '[]'::JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "crawl_results_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "crawl_results_content_hash_key" ON "crawl_results"("content_hash");
CREATE INDEX IF NOT EXISTS "crawl_results_source_id_idx" ON "crawl_results"("source_id");
CREATE INDEX IF NOT EXISTS "crawl_results_published_at_idx" ON "crawl_results"("published_at");
CREATE INDEX IF NOT EXISTS "crawl_results_url_canonical_idx" ON "crawl_results"("url_canonical");

-- Sanction Entries (OFAC, EU, Interpol sanctions data)
CREATE TABLE IF NOT EXISTS "sanctions_entries" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "source_id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "entry_type" TEXT NOT NULL,
    "names" TEXT[] NOT NULL,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "date_of_birth" DATE,
    "nationalities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "addresses" JSONB DEFAULT '[]'::JSONB,
    "identifications" JSONB DEFAULT '[]'::JSONB,
    "programs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "remarks" TEXT,
    "raw_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sanctions_entries_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "sanctions_entries_source_id_external_id_key" ON "sanctions_entries"("source_id", "external_id");
CREATE INDEX IF NOT EXISTS "sanctions_entries_source_id_idx" ON "sanctions_entries"("source_id");
CREATE INDEX IF NOT EXISTS "sanctions_entries_entry_type_idx" ON "sanctions_entries"("entry_type");

-- Audit Logs
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "changes" JSONB,
    "old_value" JSONB,
    "new_value" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "audit_logs_user_id_idx" ON "audit_logs"("user_id");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- Report Views
CREATE TABLE IF NOT EXISTS "report_views" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "report_id" TEXT NOT NULL,
    "ip_hash" TEXT NOT NULL,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "report_views_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "report_views_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "report_views_report_id_ip_hash_key" ON "report_views"("report_id", "ip_hash");
CREATE INDEX IF NOT EXISTS "report_views_report_id_idx" ON "report_views"("report_id");
CREATE INDEX IF NOT EXISTS "report_views_created_at_idx" ON "report_views"("created_at");

-- Search Index
CREATE TABLE IF NOT EXISTS "search_index" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "report_id" TEXT NOT NULL,
    "search_text" TEXT NOT NULL,
    "last_indexed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "search_index_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "search_index_report_id_key" ON "search_index"("report_id");

-- Rate Limits
CREATE TABLE IF NOT EXISTS "rate_limits" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "identifier" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "window_start" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "rate_limits_identifier_key" ON "rate_limits"("identifier");
CREATE INDEX IF NOT EXISTS "rate_limits_expires_at_idx" ON "rate_limits"("expires_at");

-- Media
CREATE TABLE IF NOT EXISTS "media" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "status" "MediaStatus" NOT NULL DEFAULT 'PROCESSING',
    "filename" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_key" TEXT NOT NULL,
    "thumbnail_key" TEXT,
    "url" TEXT,
    "thumbnail_url" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "title" TEXT,
    "alt_text" TEXT,
    "caption" TEXT,
    "description" TEXT,
    "hash" TEXT,
    "p_hash" TEXT,
    "scan_status" TEXT,
    "scan_result" TEXT,
    "scanned_at" TIMESTAMP(3),
    "uploaded_by_id" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "media_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "media_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "media_type_idx" ON "media"("type");
CREATE INDEX IF NOT EXISTS "media_status_idx" ON "media"("status");
CREATE INDEX IF NOT EXISTS "media_hash_idx" ON "media"("hash");
CREATE INDEX IF NOT EXISTS "media_uploaded_by_id_idx" ON "media"("uploaded_by_id");
CREATE INDEX IF NOT EXISTS "media_deleted_at_idx" ON "media"("deleted_at");

-- SEO Meta
CREATE TABLE IF NOT EXISTS "seo_meta" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "title" VARCHAR(70),
    "description" VARCHAR(160),
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "og_title" TEXT,
    "og_description" TEXT,
    "og_image" TEXT,
    "og_type" TEXT DEFAULT 'website',
    "twitter_title" TEXT,
    "twitter_description" TEXT,
    "twitter_image" TEXT,
    "twitter_card" TEXT DEFAULT 'summary_large_image',
    "no_index" BOOLEAN NOT NULL DEFAULT false,
    "no_follow" BOOLEAN NOT NULL DEFAULT false,
    "canonical_url" TEXT,
    "schema_markup" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "seo_meta_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "seo_meta_entity_type_entity_id_key" ON "seo_meta"("entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "seo_meta_entity_type_idx" ON "seo_meta"("entity_type");

-- SEO Redirects
CREATE TABLE IF NOT EXISTS "seo_redirects" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "from_path" TEXT NOT NULL,
    "to_path" TEXT NOT NULL,
    "status_code" INTEGER NOT NULL DEFAULT 301,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "hit_count" INTEGER NOT NULL DEFAULT 0,
    "last_hit_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "seo_redirects_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "seo_redirects_from_path_key" ON "seo_redirects"("from_path");
CREATE INDEX IF NOT EXISTS "seo_redirects_is_active_idx" ON "seo_redirects"("is_active");

-- Pages
CREATE TABLE IF NOT EXISTS "pages" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "slug" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "status" "PageStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "parent_id" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "template" TEXT NOT NULL DEFAULT 'default',
    "featured_image_id" TEXT,
    "author_id" TEXT NOT NULL,
    "metadata" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pages_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "pages_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "pages_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "pages_slug_key" ON "pages"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "pages_path_key" ON "pages"("path");
CREATE INDEX IF NOT EXISTS "pages_status_idx" ON "pages"("status");
CREATE INDEX IF NOT EXISTS "pages_parent_id_idx" ON "pages"("parent_id");
CREATE INDEX IF NOT EXISTS "pages_deleted_at_idx" ON "pages"("deleted_at");
CREATE INDEX IF NOT EXISTS "pages_author_id_idx" ON "pages"("author_id");
CREATE INDEX IF NOT EXISTS "pages_status_published_at_idx" ON "pages"("status", "published_at");
CREATE INDEX IF NOT EXISTS "pages_featured_image_id_idx" ON "pages"("featured_image_id");

-- Page Revisions
CREATE TABLE IF NOT EXISTS "page_revisions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "page_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "version" INTEGER NOT NULL,
    "author_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "page_revisions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "page_revisions_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "page_revisions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "page_revisions_page_id_idx" ON "page_revisions"("page_id");
CREATE INDEX IF NOT EXISTS "page_revisions_version_idx" ON "page_revisions"("version");
CREATE INDEX IF NOT EXISTS "page_revisions_author_id_idx" ON "page_revisions"("author_id");

-- Page Media (Join Table)
CREATE TABLE IF NOT EXISTS "page_media" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "page_id" TEXT NOT NULL,
    "media_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "page_media_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "page_media_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "page_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "page_media_page_id_media_id_key" ON "page_media"("page_id", "media_id");
CREATE INDEX IF NOT EXISTS "page_media_media_id_idx" ON "page_media"("media_id");

-- System Settings
CREATE TABLE IF NOT EXISTS "system_settings" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'string',
    "group" TEXT NOT NULL DEFAULT 'general',
    "label" TEXT,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" TEXT,
    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "system_settings_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "system_settings_key_key" ON "system_settings"("key");
CREATE INDEX IF NOT EXISTS "system_settings_group_idx" ON "system_settings"("group");
CREATE INDEX IF NOT EXISTS "system_settings_is_public_idx" ON "system_settings"("is_public");
CREATE INDEX IF NOT EXISTS "system_settings_updated_by_id_idx" ON "system_settings"("updated_by_id");

-- ==================== VECTOR & TRIGRAM INDEXES ====================
-- These indexes improve semantic and fuzzy text search performance

-- Vector indexes for similarity search (requires pgvector)
DO $$
BEGIN
    -- HNSW index for perpetrator name embeddings (faster for ANN search)
    CREATE INDEX IF NOT EXISTS "perpetrators_name_embedding_idx" ON "perpetrators"
    USING hnsw ("name_embedding" vector_cosine_ops) WITH (m = 16, ef_construction = 64);
EXCEPTION WHEN undefined_object THEN
    RAISE NOTICE 'pgvector not available, skipping name_embedding index';
END $$;

DO $$
BEGIN
    -- HNSW index for face embeddings
    CREATE INDEX IF NOT EXISTS "face_data_embedding_idx" ON "face_data"
    USING hnsw ("embedding" vector_cosine_ops) WITH (m = 16, ef_construction = 64);
EXCEPTION WHEN undefined_object THEN
    RAISE NOTICE 'pgvector not available, skipping face embedding index';
END $$;

-- Trigram indexes for fuzzy text search (requires pg_trgm)
DO $$
BEGIN
    -- Perpetrator name fuzzy search
    CREATE INDEX IF NOT EXISTS "perpetrators_full_name_trgm_idx" ON "perpetrators"
    USING gin ("full_name" gin_trgm_ops);

    -- Perpetrator email fuzzy search
    CREATE INDEX IF NOT EXISTS "perpetrators_email_trgm_idx" ON "perpetrators"
    USING gin ("email" gin_trgm_ops);

    -- Perpetrator phone fuzzy search
    CREATE INDEX IF NOT EXISTS "perpetrators_phone_trgm_idx" ON "perpetrators"
    USING gin ("phone" gin_trgm_ops);

    -- Report summary fuzzy search
    CREATE INDEX IF NOT EXISTS "reports_summary_trgm_idx" ON "reports"
    USING gin ("summary" gin_trgm_ops);

    -- Domain name fuzzy search
    CREATE INDEX IF NOT EXISTS "digital_footprints_domain_trgm_idx" ON "digital_footprints"
    USING gin ("domain_name" gin_trgm_ops);

    -- Company name fuzzy search
    CREATE INDEX IF NOT EXISTS "company_info_name_trgm_idx" ON "company_info"
    USING gin ("name" gin_trgm_ops);

    -- Sanctions names fuzzy search (array element search)
    CREATE INDEX IF NOT EXISTS "sanctions_entries_names_trgm_idx" ON "sanctions_entries"
    USING gin ("names");

EXCEPTION WHEN undefined_object THEN
    RAISE NOTICE 'pg_trgm not available, skipping trigram indexes';
END $$;

-- ==================== PRISMA MIGRATIONS TABLE ====================
-- This tracks which migrations have been applied
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMP(3),
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);

-- Mark this baseline migration as applied
INSERT INTO "_prisma_migrations" ("id", "checksum", "migration_name", "finished_at", "applied_steps_count")
SELECT
    gen_random_uuid()::VARCHAR(36),
    'baseline_' || md5(now()::TEXT),
    '0_baseline',
    NOW(),
    1
WHERE NOT EXISTS (
    SELECT 1 FROM "_prisma_migrations" WHERE "migration_name" = '0_baseline'
);
