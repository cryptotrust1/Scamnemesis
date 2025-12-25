-- Add bio column to users table
-- This column was missing from the baseline migration

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bio" TEXT;
