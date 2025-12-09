-- ============================================================================
-- Role-Based Database Views for Fraud Report System
-- ============================================================================
-- Purpose: Enforce data masking at the database level
-- Version: 1.0
-- Date: 2025-12-09
-- ============================================================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS fraud_reports_basic_view;
DROP VIEW IF EXISTS fraud_reports_standard_view;
DROP VIEW IF EXISTS fraud_reports_gold_view;
DROP VIEW IF EXISTS fraud_reports_admin_view;

-- ============================================================================
-- HELPER FUNCTIONS FOR MASKING
-- ============================================================================

-- Function to mask names (first 2 + xxx + last 1)
CREATE OR REPLACE FUNCTION mask_name(input_name TEXT)
RETURNS TEXT AS $$
DECLARE
    tokens TEXT[];
    masked_tokens TEXT[];
    token TEXT;
    masked_token TEXT;
BEGIN
    IF input_name IS NULL OR LENGTH(input_name) = 0 THEN
        RETURN '';
    END IF;

    tokens := string_to_array(input_name, ' ');
    masked_tokens := ARRAY[]::TEXT[];

    FOREACH token IN ARRAY tokens LOOP
        IF LENGTH(token) <= 1 THEN
            masked_token := token;
        ELSIF LENGTH(token) = 2 THEN
            masked_token := SUBSTRING(token, 1, 1) || 'x';
        ELSIF LENGTH(token) = 3 THEN
            masked_token := SUBSTRING(token, 1, 1) || 'x' || SUBSTRING(token, 3, 1);
        ELSE
            masked_token := SUBSTRING(token, 1, 2) ||
                           REPEAT('x', LENGTH(token) - 3) ||
                           SUBSTRING(token, LENGTH(token), 1);
        END IF;
        masked_tokens := array_append(masked_tokens, masked_token);
    END LOOP;

    RETURN array_to_string(masked_tokens, ' ');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to mask email (first char + ***** + @domain)
CREATE OR REPLACE FUNCTION mask_email(input_email TEXT)
RETURNS TEXT AS $$
DECLARE
    at_position INT;
    local_part TEXT;
    domain_part TEXT;
BEGIN
    IF input_email IS NULL OR LENGTH(input_email) = 0 THEN
        RETURN '';
    END IF;

    at_position := POSITION('@' IN input_email);

    IF at_position = 0 THEN
        RETURN '********';
    END IF;

    local_part := SUBSTRING(input_email, 1, at_position - 1);
    domain_part := SUBSTRING(input_email, at_position);

    RETURN SUBSTRING(local_part, 1, 1) || '*****' || domain_part;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to mask phone (middle 60%)
CREATE OR REPLACE FUNCTION mask_phone(input_phone TEXT)
RETURNS TEXT AS $$
DECLARE
    digits_only TEXT;
    total_digits INT;
    visible_start INT;
    visible_end INT;
    masked_part TEXT;
BEGIN
    IF input_phone IS NULL OR LENGTH(input_phone) = 0 THEN
        RETURN '';
    END IF;

    -- Extract digits only
    digits_only := regexp_replace(input_phone, '[^0-9]', '', 'g');
    total_digits := LENGTH(digits_only);

    IF total_digits < 6 THEN
        RETURN REPEAT('x', total_digits - 2) || SUBSTRING(digits_only, total_digits - 1);
    END IF;

    visible_start := CEIL(total_digits * 0.2);
    visible_end := FLOOR(total_digits * 0.8);

    masked_part := SUBSTRING(digits_only, 1, visible_start) ||
                   REPEAT('x', visible_end - visible_start) ||
                   SUBSTRING(digits_only, visible_end + 1);

    -- Attempt to preserve original formatting
    RETURN regexp_replace(input_phone, '[0-9]', 'X', 'g');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to mask IBAN (first 4 + **** + last 2)
CREATE OR REPLACE FUNCTION mask_iban(input_iban TEXT)
RETURNS TEXT AS $$
DECLARE
    clean_iban TEXT;
    masked TEXT;
BEGIN
    IF input_iban IS NULL OR LENGTH(input_iban) = 0 THEN
        RETURN '';
    END IF;

    clean_iban := regexp_replace(input_iban, '\s', '', 'g');

    IF LENGTH(clean_iban) < 8 THEN
        RETURN SUBSTRING(clean_iban, 1, 2) || '****';
    END IF;

    masked := SUBSTRING(clean_iban, 1, 4) ||
              REPEAT('*', LENGTH(clean_iban) - 6) ||
              SUBSTRING(clean_iban, LENGTH(clean_iban) - 1);

    -- Reformat with spaces every 4 characters
    RETURN regexp_replace(masked, '(.{4})', '\1 ', 'g');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to mask IP address (mask last octet)
CREATE OR REPLACE FUNCTION mask_ip(input_ip TEXT)
RETURNS TEXT AS $$
BEGIN
    IF input_ip IS NULL OR LENGTH(input_ip) = 0 THEN
        RETURN '';
    END IF;

    -- IPv4
    IF input_ip ~ '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$' THEN
        RETURN regexp_replace(input_ip, '([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)[0-9]{1,3}', '\1xxx');
    END IF;

    -- IPv6 (simplified - mask last 80%)
    IF input_ip ~ ':' THEN
        RETURN regexp_replace(input_ip, '(.*?:.*?:).*', '\1****:****:****:****:****:****');
    END IF;

    RETURN input_ip;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to mask crypto wallet (first 6 + ... + last 4)
CREATE OR REPLACE FUNCTION mask_wallet(input_wallet TEXT)
RETURNS TEXT AS $$
BEGIN
    IF input_wallet IS NULL OR LENGTH(input_wallet) < 12 THEN
        RETURN '';
    END IF;

    RETURN SUBSTRING(input_wallet, 1, 6) || '...' || SUBSTRING(input_wallet, LENGTH(input_wallet) - 3);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to mask date based on granularity
CREATE OR REPLACE FUNCTION mask_date(input_date TIMESTAMP, granularity TEXT)
RETURNS TEXT AS $$
BEGIN
    IF input_date IS NULL THEN
        RETURN '';
    END IF;

    CASE granularity
        WHEN 'month' THEN
            RETURN TO_CHAR(input_date, 'YYYY-MM-XX');
        WHEN 'day' THEN
            RETURN TO_CHAR(input_date, 'YYYY-MM-DD');
        ELSE
            RETURN TO_CHAR(input_date, 'YYYY-MM-DD HH24:MI:SS');
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to mask amount based on role
CREATE OR REPLACE FUNCTION mask_amount(input_amount NUMERIC, currency TEXT, mask_level TEXT)
RETURNS TEXT AS $$
DECLARE
    magnitude NUMERIC;
    lower_bound NUMERIC;
    upper_bound NUMERIC;
    rounded NUMERIC;
BEGIN
    IF input_amount IS NULL THEN
        RETURN '';
    END IF;

    CASE mask_level
        WHEN 'range' THEN
            -- Order of magnitude
            magnitude := POWER(10, FLOOR(LOG(input_amount)));
            lower_bound := magnitude;
            upper_bound := magnitude * 10;
            RETURN currency || ' ' || lower_bound::TEXT || ' - ' || upper_bound::TEXT;
        WHEN 'rounded' THEN
            -- Rounded to nearest 100
            rounded := ROUND(input_amount / 100) * 100;
            RETURN currency || ' ' || rounded::TEXT;
        ELSE
            -- Exact
            RETURN currency || ' ' || input_amount::TEXT;
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- VIEW 1: BASIC USER (Role Level 0)
-- ============================================================================
-- Visibility: Public metadata only, all PII masked
-- ============================================================================

CREATE VIEW fraud_reports_basic_view AS
SELECT
    -- Always visible metadata
    report_id,
    fraud_type,
    country,
    status,

    -- Masked date (month only)
    mask_date(submission_date, 'month') AS submission_date,

    -- Completely masked reporter info
    mask_name(reporter_name) AS reporter_name,
    mask_email(reporter_email) AS reporter_email,
    mask_phone(reporter_phone) AS reporter_phone,
    country AS reporter_country, -- Only country visible
    mask_ip(reporter_ip) AS reporter_ip,

    -- Completely masked scammer info
    mask_name(scammer_name) AS scammer_name,
    mask_email(scammer_email) AS scammer_email,
    mask_phone(scammer_phone) AS scammer_phone,
    country AS scammer_country, -- Only country visible
    mask_wallet(scammer_wallet) AS scammer_wallet,
    mask_ip(scammer_ip) AS scammer_ip,

    -- Masked financial data (range only)
    mask_amount(amount_lost, currency, 'range') AS amount_lost,
    currency,
    mask_iban(iban) AS iban,

    -- Limited description
    LEFT(description, 200) || '...' AS description,

    -- Attachment count only
    (SELECT COUNT(*) FROM report_attachments WHERE report_id = fraud_reports.report_id) AS attachment_count

FROM fraud_reports;

-- Grant access to basic users
GRANT SELECT ON fraud_reports_basic_view TO basic_user_role;

-- ============================================================================
-- VIEW 2: STANDARD USER (Role Level 1)
-- ============================================================================
-- Visibility: Detailed location, partial names, masked contact details
-- ============================================================================

CREATE VIEW fraud_reports_standard_view AS
SELECT
    -- Always visible metadata
    report_id,
    fraud_type,
    country,
    status,

    -- Full date, no time
    mask_date(submission_date, 'day') AS submission_date,

    -- Masked reporter info
    mask_name(reporter_name) AS reporter_name,
    mask_email(reporter_email) AS reporter_email,
    mask_phone(reporter_phone) AS reporter_phone,
    reporter_city,
    LEFT(reporter_postal_code, 3) || '**' AS reporter_postal_code,
    country AS reporter_country,
    mask_ip(reporter_ip) AS reporter_ip,

    -- Partially masked scammer info
    -- First name visible, last name masked
    SPLIT_PART(scammer_name, ' ', 1) || ' ' ||
    SUBSTRING(SPLIT_PART(scammer_name, ' ', 2), 1, 1) || '.' AS scammer_name,
    mask_email(scammer_email) AS scammer_email,
    mask_phone(scammer_phone) AS scammer_phone,
    scammer_city,
    LEFT(scammer_postal_code, 3) || '**' AS scammer_postal_code,
    scammer_country,
    mask_wallet(scammer_wallet) AS scammer_wallet,
    mask_ip(scammer_ip) AS scammer_ip,

    -- Rounded financial data
    mask_amount(amount_lost, currency, 'rounded') AS amount_lost,
    currency,
    mask_iban(iban) AS iban,

    -- Full description
    description,

    -- Attachment metadata
    (SELECT COUNT(*) FROM report_attachments WHERE report_id = fraud_reports.report_id) AS attachment_count,
    (SELECT array_agg(file_name) FROM report_attachments WHERE report_id = fraud_reports.report_id LIMIT 2) AS attachment_preview

FROM fraud_reports;

-- Grant access to standard users
GRANT SELECT ON fraud_reports_standard_view TO standard_user_role;

-- ============================================================================
-- VIEW 3: GOLD USER (Role Level 2)
-- ============================================================================
-- Visibility: Almost everything, only reporter email masked
-- ============================================================================

CREATE VIEW fraud_reports_gold_view AS
SELECT
    -- All metadata
    report_id,
    fraud_type,
    country,
    status,

    -- Full timestamp
    submission_date,

    -- Partially masked reporter info (email only)
    reporter_name,
    mask_email(reporter_email) AS reporter_email, -- Still masked
    reporter_phone,
    reporter_street,
    reporter_city,
    reporter_postal_code,
    reporter_country,
    mask_ip(reporter_ip) AS reporter_ip, -- Still masked for privacy

    -- Fully visible scammer info
    scammer_name,
    scammer_email,
    scammer_phone,
    scammer_street,
    scammer_city,
    scammer_postal_code,
    scammer_country,
    scammer_wallet,
    scammer_ip,
    scammer_spz,
    scammer_vin,

    -- Exact financial data
    amount_lost,
    currency,
    iban,
    transaction_id,

    -- Full description and evidence
    description,

    -- Full attachment access
    (SELECT array_agg(file_path) FROM report_attachments WHERE report_id = fraud_reports.report_id) AS attachments,
    (SELECT array_agg(screenshot_path) FROM report_screenshots WHERE report_id = fraud_reports.report_id) AS screenshots,
    chat_logs

FROM fraud_reports;

-- Grant access to gold users
GRANT SELECT ON fraud_reports_gold_view TO gold_user_role;

-- ============================================================================
-- VIEW 4: ADMIN USER (Role Level 3)
-- ============================================================================
-- Visibility: Everything, no masking
-- ============================================================================

CREATE VIEW fraud_reports_admin_view AS
SELECT
    *,
    -- Additional admin metadata
    created_at,
    updated_at,
    created_by,
    updated_by,
    last_accessed_at,
    access_count
FROM fraud_reports;

-- Grant full access to admins
GRANT SELECT, INSERT, UPDATE, DELETE ON fraud_reports_admin_view TO admin_role;

-- ============================================================================
-- AUDIT LOGGING
-- ============================================================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS data_access_audit_log (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    report_id VARCHAR(255) NOT NULL,
    fields_accessed TEXT[],
    ip_address INET,
    user_agent TEXT,
    action VARCHAR(50) NOT NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_report_id (report_id),
    INDEX idx_timestamp (timestamp)
);

-- Function to log data access
CREATE OR REPLACE FUNCTION log_data_access()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO data_access_audit_log (
        user_id,
        user_role,
        report_id,
        fields_accessed,
        ip_address,
        action
    ) VALUES (
        CURRENT_USER,
        CURRENT_SETTING('app.user_role', true),
        NEW.report_id,
        ARRAY['all'], -- In production, this would track specific fields
        INET_CLIENT_ADDR(),
        'view'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for audit logging on each view
CREATE TRIGGER audit_basic_access
    AFTER SELECT ON fraud_reports_basic_view
    FOR EACH ROW
    EXECUTE FUNCTION log_data_access();

CREATE TRIGGER audit_standard_access
    AFTER SELECT ON fraud_reports_standard_view
    FOR EACH ROW
    EXECUTE FUNCTION log_data_access();

CREATE TRIGGER audit_gold_access
    AFTER SELECT ON fraud_reports_gold_view
    FOR EACH ROW
    EXECUTE FUNCTION log_data_access();

CREATE TRIGGER audit_admin_access
    AFTER SELECT ON fraud_reports_admin_view
    FOR EACH ROW
    EXECUTE FUNCTION log_data_access();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on main table
ALTER TABLE fraud_reports ENABLE ROW LEVEL SECURITY;

-- Policy for basic users
CREATE POLICY basic_user_policy ON fraud_reports
    FOR SELECT
    TO basic_user_role
    USING (status = 'published'); -- Only see published reports

-- Policy for standard users
CREATE POLICY standard_user_policy ON fraud_reports
    FOR SELECT
    TO standard_user_role
    USING (status IN ('published', 'verified')); -- See published and verified

-- Policy for gold users
CREATE POLICY gold_user_policy ON fraud_reports
    FOR SELECT
    TO gold_user_role
    USING (true); -- See all reports

-- Policy for admins
CREATE POLICY admin_policy ON fraud_reports
    FOR ALL
    TO admin_role
    USING (true); -- Full access

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_fraud_reports_country ON fraud_reports(country);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_fraud_type ON fraud_reports(fraud_type);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_status ON fraud_reports(status);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_submission_date ON fraud_reports(submission_date);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_reporter_email_hash ON fraud_reports(MD5(reporter_email));
CREATE INDEX IF NOT EXISTS idx_fraud_reports_scammer_email_hash ON fraud_reports(MD5(scammer_email));

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

-- Example 1: Basic user querying reports
-- SET ROLE basic_user_role;
-- SELECT * FROM fraud_reports_basic_view WHERE country = 'Slovakia' LIMIT 10;

-- Example 2: Standard user with more details
-- SET ROLE standard_user_role;
-- SELECT * FROM fraud_reports_standard_view WHERE fraud_type = 'crypto_scam' LIMIT 10;

-- Example 3: Gold user with full scammer details
-- SET ROLE gold_user_role;
-- SELECT * FROM fraud_reports_gold_view WHERE scammer_email LIKE '%@evil.com';

-- Example 4: Admin with full access
-- SET ROLE admin_role;
-- SELECT * FROM fraud_reports_admin_view WHERE report_id = 'RPT-12345';

-- ============================================================================
-- MAINTENANCE
-- ============================================================================

-- Function to analyze view performance
CREATE OR REPLACE FUNCTION analyze_view_performance()
RETURNS TABLE(
    view_name TEXT,
    total_rows BIGINT,
    avg_query_time_ms NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        schemaname || '.' || viewname AS view_name,
        n_tup_ins + n_tup_upd + n_tup_del AS total_rows,
        0::NUMERIC AS avg_query_time_ms
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    AND tablename LIKE '%_view';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- END OF FILE
-- ============================================================================
