-- Add performance indexes identified in audit
-- These indexes improve query performance for common operations

-- VerificationToken: Index for cleanup of expired tokens
CREATE INDEX IF NOT EXISTS "verification_tokens_expires_idx" ON "verification_tokens"("expires");

-- ReportView: Index for IP-based view deduplication
CREATE INDEX IF NOT EXISTS "report_views_ip_hash_idx" ON "report_views"("ip_hash");

-- SearchIndex: Index for index maintenance queries
CREATE INDEX IF NOT EXISTS "search_index_last_indexed_at_idx" ON "search_index"("last_indexed_at");

-- Comment: Composite index for dashboard comment filtering
CREATE INDEX IF NOT EXISTS "comments_status_created_at_idx" ON "comments"("status", "created_at");
