-- Add TOTP 2FA fields to users table
-- This enables Google Authenticator and other TOTP-based 2FA

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "totp_secret" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "totp_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "totp_verified_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "backup_codes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create index for faster 2FA status checks
CREATE INDEX IF NOT EXISTS "users_totp_enabled_idx" ON "users"("totp_enabled");
