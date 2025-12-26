-- Add Partner API Key fields
-- This migration adds support for partner API keys with organization info

-- Create API Key Type enum
DO $$ BEGIN
    CREATE TYPE "ApiKeyType" AS ENUM ('PERSONAL', 'PARTNER', 'INTEGRATION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to api_keys table
ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "type" "ApiKeyType" NOT NULL DEFAULT 'PERSONAL';
ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "organization" TEXT;
ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "contact_email" TEXT;
ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "website" TEXT;
ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "daily_limit" INTEGER;
ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "request_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS "api_keys_type_idx" ON "api_keys"("type");
CREATE INDEX IF NOT EXISTS "api_keys_organization_idx" ON "api_keys"("organization");
