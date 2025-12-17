-- migration_005_add_case_tracking.sql
-- Scamnemesis Database Schema - Case Tracking Migration
-- Date: 2025-12-17
-- Description: Adds tracking_token and case_number columns to Report table for case tracking
--              Also adds missing Comment fields (is_reported, upvotes)

BEGIN;

-- ============================================================================
-- ADD CASE TRACKING COLUMNS TO REPORT TABLE
-- ============================================================================
-- These columns are used for anonymous reporters to track their report status

-- Check if tracking_token column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Report' AND column_name = 'tracking_token'
    ) THEN
        ALTER TABLE "Report" ADD COLUMN tracking_token VARCHAR(64) UNIQUE;
        RAISE NOTICE 'Added tracking_token column to Report table';
    ELSE
        RAISE NOTICE 'tracking_token column already exists';
    END IF;
END $$;

-- Check if case_number column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Report' AND column_name = 'case_number'
    ) THEN
        ALTER TABLE "Report" ADD COLUMN case_number VARCHAR(20) UNIQUE;
        RAISE NOTICE 'Added case_number column to Report table';
    ELSE
        RAISE NOTICE 'case_number column already exists';
    END IF;
END $$;

-- Create indexes for case tracking columns (if not exists)
CREATE INDEX IF NOT EXISTS idx_report_tracking_token ON "Report" (tracking_token) WHERE tracking_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_report_case_number ON "Report" (case_number) WHERE case_number IS NOT NULL;

-- ============================================================================
-- ADD MISSING COMMENT TABLE COLUMNS
-- ============================================================================
-- These columns were added to Prisma schema during admin audit

-- Check if is_reported column exists on Comment table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Comment' AND column_name = 'is_reported'
    ) THEN
        ALTER TABLE "Comment" ADD COLUMN is_reported BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added is_reported column to Comment table';
    ELSE
        RAISE NOTICE 'is_reported column already exists';
    END IF;
END $$;

-- Check if report_reason column exists on Comment table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Comment' AND column_name = 'report_reason'
    ) THEN
        ALTER TABLE "Comment" ADD COLUMN report_reason TEXT;
        RAISE NOTICE 'Added report_reason column to Comment table';
    ELSE
        RAISE NOTICE 'report_reason column already exists';
    END IF;
END $$;

-- Check if reported_at column exists on Comment table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Comment' AND column_name = 'reported_at'
    ) THEN
        ALTER TABLE "Comment" ADD COLUMN reported_at TIMESTAMPTZ;
        RAISE NOTICE 'Added reported_at column to Comment table';
    ELSE
        RAISE NOTICE 'reported_at column already exists';
    END IF;
END $$;

-- Check if upvotes column exists on Comment table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Comment' AND column_name = 'upvotes'
    ) THEN
        ALTER TABLE "Comment" ADD COLUMN upvotes INTEGER DEFAULT 0;
        RAISE NOTICE 'Added upvotes column to Comment table';
    ELSE
        RAISE NOTICE 'upvotes column already exists';
    END IF;
END $$;

-- Create index for reported comments
CREATE INDEX IF NOT EXISTS idx_comment_is_reported ON "Comment" (is_reported) WHERE is_reported = TRUE;

-- ============================================================================
-- ADD MISSING DUPLICATECLUSTER COLUMNS
-- ============================================================================

-- Check if resolved_by_id column exists on DuplicateCluster table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'DuplicateCluster' AND column_name = 'resolved_by_id'
    ) THEN
        ALTER TABLE "DuplicateCluster" ADD COLUMN resolved_by_id VARCHAR(255);
        RAISE NOTICE 'Added resolved_by_id column to DuplicateCluster table';
    ELSE
        RAISE NOTICE 'resolved_by_id column already exists';
    END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'DuplicateCluster_resolved_by_id_fkey'
        AND table_name = 'DuplicateCluster'
    ) THEN
        -- Only add if User table exists and column was added
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'DuplicateCluster' AND column_name = 'resolved_by_id'
        ) THEN
            ALTER TABLE "DuplicateCluster"
            ADD CONSTRAINT "DuplicateCluster_resolved_by_id_fkey"
            FOREIGN KEY (resolved_by_id) REFERENCES "User"(id) ON DELETE SET NULL;
            RAISE NOTICE 'Added resolved_by_id foreign key constraint';
        END IF;
    ELSE
        RAISE NOTICE 'resolved_by_id foreign key already exists';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not add foreign key (table structure may differ): %', SQLERRM;
END $$;

-- ============================================================================
-- ADD MISSING INDEXES
-- ============================================================================

-- RefreshToken indexes
CREATE INDEX IF NOT EXISTS idx_refresh_token_user_id ON "RefreshToken" (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_token_expires_at ON "RefreshToken" (expires_at);

-- FaceData indexes
CREATE INDEX IF NOT EXISTS idx_face_data_evidence_id ON "FaceData" (evidence_id) WHERE evidence_id IS NOT NULL;

-- Page indexes
CREATE INDEX IF NOT EXISTS idx_page_author_id ON "Page" (author_id);

-- AuditLog indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON "AuditLog" (entity_type, entity_id);

-- ApiKey indexes
CREATE INDEX IF NOT EXISTS idx_api_key_user_id ON "ApiKey" (user_id);
CREATE INDEX IF NOT EXISTS idx_api_key_key_hash ON "ApiKey" (key_hash);

-- ============================================================================
-- VERIFY MIGRATION
-- ============================================================================
DO $$
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_name = 'Report'
    AND column_name IN ('tracking_token', 'case_number');

    IF col_count = 2 THEN
        RAISE NOTICE '✓ Migration 005 verified: All Report tracking columns exist';
    ELSE
        RAISE WARNING '⚠ Migration 005: Some Report tracking columns may be missing';
    END IF;
END $$;

COMMIT;
