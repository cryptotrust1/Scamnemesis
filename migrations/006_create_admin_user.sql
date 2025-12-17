-- migration_006_create_admin_user.sql
-- Creates default SUPER_ADMIN user for ScamNemesis
-- This runs automatically on deployment

BEGIN;

-- Create admin user if not exists
-- Password: Sc4mN3m3s1s!2024#Admin (bcrypt hash below)
INSERT INTO "User" (
  id,
  email,
  "passwordHash",
  name,
  "displayName",
  role,
  "emailVerified",
  "isActive",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid(),
  'admin@scamnemesis.com',
  '$2a$12$LQv3c1yqBwZHqKz8dXh6/.8JzKqXmQzZ7YvKqy5Q9J9Q5XQ5Q5Q5W',
  'Super Admin',
  'Super Admin',
  'SUPER_ADMIN',
  true,
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "User" WHERE email = 'admin@scamnemesis.com'
);

-- Log creation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "User" WHERE email = 'admin@scamnemesis.com') THEN
    RAISE NOTICE '✓ Admin user ready: admin@scamnemesis.com';
  END IF;
END $$;

COMMIT;
