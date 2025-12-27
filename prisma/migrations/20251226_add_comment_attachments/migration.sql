-- Create comment_attachments table
-- This table was defined in Prisma schema but missing from database

CREATE TABLE IF NOT EXISTS "comment_attachments" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "comment_id" TEXT NOT NULL,
    "file_key" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comment_attachments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "comment_attachments_comment_id_fkey"
        FOREIGN KEY ("comment_id")
        REFERENCES "comments"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Create index for faster lookups by comment_id
CREATE INDEX IF NOT EXISTS "comment_attachments_comment_id_idx" ON "comment_attachments"("comment_id");
