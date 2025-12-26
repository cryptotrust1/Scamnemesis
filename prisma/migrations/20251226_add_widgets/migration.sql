-- Add Embeddable Widgets table
-- Allows users to create customizable search widgets for their websites

-- Create Widget Theme enum
DO $$ BEGIN
    CREATE TYPE "WidgetTheme" AS ENUM ('LIGHT', 'DARK');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Widget Search Mode enum
DO $$ BEGIN
    CREATE TYPE "WidgetSearchMode" AS ENUM ('AUTO', 'FUZZY', 'EXACT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create widgets table
CREATE TABLE IF NOT EXISTS "widgets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "theme" "WidgetTheme" NOT NULL DEFAULT 'LIGHT',
    "primary_color" TEXT NOT NULL DEFAULT '#4f46e5',
    "background_color" TEXT NOT NULL DEFAULT '#ffffff',
    "text_color" TEXT NOT NULL DEFAULT '#1f2937',
    "border_radius" INTEGER NOT NULL DEFAULT 8,
    "show_report_button" BOOLEAN NOT NULL DEFAULT true,
    "show_advanced_by_default" BOOLEAN NOT NULL DEFAULT false,
    "default_search_mode" "WidgetSearchMode" NOT NULL DEFAULT 'AUTO',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "widgets_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "widgets_user_id_idx" ON "widgets"("user_id");
CREATE INDEX IF NOT EXISTS "widgets_is_active_idx" ON "widgets"("is_active");

-- Add foreign key constraint
DO $$ BEGIN
    ALTER TABLE "widgets" ADD CONSTRAINT "widgets_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
