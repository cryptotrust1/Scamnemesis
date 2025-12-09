-- migration_004_seed_data.sql
-- Scamnemesis Database Schema - Sample Seed Data
-- Author: Database Architect
-- Date: 2025-12-09
-- Description: Sample data for testing and development

-- WARNING: This is SAMPLE DATA only. DO NOT run in production!

BEGIN;

-- ============================================================================
-- SEED DATA: Users
-- ============================================================================

-- Admin user
INSERT INTO users (id, email, email_verified, password_hash, first_name, last_name, tier, status, country_code, created_at)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin@scamnemesis.com', true, '$2a$10$dummy_hash_admin', 'Admin', 'User', 'admin', 'active', 'US', NOW() - INTERVAL '1 year');

-- Moderator user
INSERT INTO users (id, email, email_verified, password_hash, first_name, last_name, tier, status, country_code, created_at)
VALUES
    ('00000000-0000-0000-0000-000000000002', 'moderator@scamnemesis.com', true, '$2a$10$dummy_hash_mod', 'Jane', 'Moderator', 'gold', 'active', 'UK', NOW() - INTERVAL '6 months');

-- Regular users
INSERT INTO users (id, email, email_verified, password_hash, first_name, last_name, tier, status, country_code, created_at)
VALUES
    ('00000000-0000-0000-0000-000000000003', 'john.doe@example.com', true, '$2a$10$dummy_hash_john', 'John', 'Doe', 'standard', 'active', 'US', NOW() - INTERVAL '3 months'),
    ('00000000-0000-0000-0000-000000000004', 'jane.smith@example.com', true, '$2a$10$dummy_hash_jane', 'Jane', 'Smith', 'basic', 'active', 'CA', NOW() - INTERVAL '2 months'),
    ('00000000-0000-0000-0000-000000000005', 'bob.wilson@example.com', true, '$2a$10$dummy_hash_bob', 'Bob', 'Wilson', 'basic', 'active', 'AU', NOW() - INTERVAL '1 month');

-- ============================================================================
-- SEED DATA: User Roles
-- ============================================================================

INSERT INTO user_roles (user_id, role, permissions, granted_by, granted_at)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'superadmin', '{"reports": {"create": true, "read": true, "update": true, "delete": true, "approve": true}, "users": {"manage_roles": true}}', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 year'),
    ('00000000-0000-0000-0000-000000000002', 'moderator', '{"reports": {"read": true, "approve": true, "reject": true}, "comments": {"moderate": true}}', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '6 months');

-- ============================================================================
-- SEED DATA: Perpetrators
-- ============================================================================

INSERT INTO perpetrators (id, canonical_name, aliases, emails, phones, digital_identifiers, risk_score, report_count, total_amount_reported_usd, countries_active, fraud_types, pep_match, sanctions_match, created_at)
VALUES
    (
        '10000000-0000-0000-0000-000000000001',
        'John Scammer',
        ARRAY['Johnny Fraud', 'J. Scam'],
        ARRAY['scammer@fake-email.com', 'john.scam@fraud.net'],
        ARRAY['+1-555-0123', '+1-555-9999'],
        '{"social_media": [{"platform": "facebook", "url": "https://facebook.com/fake-profile"}], "crypto_addresses": [{"blockchain": "bitcoin", "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"}]}',
        85,
        5,
        125000.00,
        ARRAY['US', 'UK', 'CA'],
        ARRAY['romance_scam', 'investment_fraud'],
        false,
        false,
        NOW() - INTERVAL '6 months'
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        'Maria Fraudster',
        ARRAY['Mary Scam', 'Marie Fraud'],
        ARRAY['maria@scam.com'],
        ARRAY['+44-20-1234-5678'],
        '{"social_media": [{"platform": "instagram", "handle": "@fake_influencer"}]}',
        72,
        3,
        45000.00,
        ARRAY['UK', 'ES'],
        ARRAY['online_shopping_fraud'],
        false,
        false,
        NOW() - INTERVAL '4 months'
    ),
    (
        '10000000-0000-0000-0000-000000000003',
        'Tech Support Scammer',
        ARRAY['Microsoft Support', 'Windows Tech'],
        ARRAY['support@fake-microsoft.com'],
        ARRAY['+1-800-SCAM-NOW'],
        '{"websites": ["https://fake-microsoft-support.com"]}',
        90,
        12,
        180000.00,
        ARRAY['US', 'IN'],
        ARRAY['tech_support_scam'],
        false,
        false,
        NOW() - INTERVAL '1 year'
    );

-- ============================================================================
-- SEED DATA: Reports
-- ============================================================================

-- Romance Scam Report
INSERT INTO reports (
    id,
    user_id,
    fraud_type,
    status,
    severity,
    payload,
    incident_date,
    incident_country,
    incident_amount_usd,
    perpetrator_name,
    perpetrator_email,
    perpetrator_phone,
    is_public,
    is_verified,
    submitted_at,
    created_at
)
VALUES (
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003',
    'romance_scam',
    'approved',
    'high',
    '{
        "incident": {
            "date": "2024-09-15",
            "fraud_type": "romance_scam",
            "description": "Met someone on a dating app who claimed to be a U.S. soldier stationed overseas. After building trust over 2 months, they requested money for emergency medical treatment. I sent $25,000 via wire transfer before realizing it was a scam.",
            "location": {"country": "US", "city": "Los Angeles", "region": "CA"},
            "reported_to_authorities": true,
            "authority_details": {"agency": "FBI IC3", "report_number": "24-123456"}
        },
        "perpetrator": {
            "name": "John Scammer",
            "aliases": ["Captain John Smith"],
            "email": ["scammer@fake-email.com"],
            "phone": ["+1-555-0123"]
        },
        "digital_footprints": {
            "social_media": [
                {"platform": "dating_app", "handle": "john_soldier_2024", "url": "https://dating-app.com/profile/12345"}
            ]
        },
        "financial": {
            "total_loss": {"amount": 25000, "currency": "USD"},
            "transactions": [
                {"date": "2024-09-15", "amount": 25000, "currency": "USD", "method": "wire_transfer"}
            ]
        },
        "reporter": {
            "relationship": "victim",
            "consent_to_contact": true
        }
    }',
    '2024-09-15',
    'US',
    25000.00,
    'John Scammer',
    'scammer@fake-email.com',
    '+1-555-0123',
    true,
    true,
    NOW() - INTERVAL '3 months',
    NOW() - INTERVAL '3 months'
);

-- Investment Fraud Report
INSERT INTO reports (
    id,
    user_id,
    fraud_type,
    status,
    severity,
    payload,
    incident_date,
    incident_country,
    incident_amount_usd,
    perpetrator_name,
    perpetrator_email,
    is_public,
    submitted_at,
    created_at
)
VALUES (
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000004',
    'investment_fraud',
    'approved',
    'critical',
    '{
        "incident": {
            "date": "2024-10-01",
            "fraud_type": "investment_fraud",
            "description": "Contacted by someone claiming to represent a legitimate investment firm. They promised guaranteed 40% returns on cryptocurrency investments. Invested $100,000 and was unable to withdraw any funds. Website disappeared after 3 weeks.",
            "location": {"country": "CA"}
        },
        "perpetrator": {
            "name": "John Scammer",
            "email": ["john.scam@fraud.net"]
        },
        "digital_footprints": {
            "websites": ["https://fake-investment-firm.com"],
            "social_media": [
                {"platform": "linkedin", "handle": "john-investment-expert"}
            ]
        },
        "financial": {
            "total_loss": {"amount": 100000, "currency": "USD"},
            "transactions": [
                {"date": "2024-10-01", "amount": 50000, "currency": "USD", "method": "cryptocurrency"},
                {"date": "2024-10-05", "amount": 50000, "currency": "USD", "method": "cryptocurrency"}
            ]
        },
        "crypto": {
            "addresses": [
                {"blockchain": "bitcoin", "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", "amount_sent": 100000}
            ]
        },
        "reporter": {
            "relationship": "victim",
            "consent_to_contact": false
        }
    }',
    '2024-10-01',
    'CA',
    100000.00,
    'John Scammer',
    'john.scam@fraud.net',
    true,
    NOW() - INTERVAL '2 months',
    NOW() - INTERVAL '2 months'
);

-- Tech Support Scam Report
INSERT INTO reports (
    id,
    user_id,
    fraud_type,
    status,
    severity,
    payload,
    incident_date,
    incident_country,
    incident_amount_usd,
    perpetrator_name,
    perpetrator_phone,
    is_public,
    submitted_at,
    created_at
)
VALUES (
    '20000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000005',
    'tech_support_scam',
    'approved',
    'medium',
    '{
        "incident": {
            "date": "2024-11-20",
            "fraud_type": "tech_support_scam",
            "description": "Received a pop-up warning that my computer was infected with viruses. Called the number displayed and was convinced to allow remote access. They charged $500 for fake antivirus software.",
            "location": {"country": "AU"}
        },
        "perpetrator": {
            "name": "Tech Support Scammer",
            "phone": ["+1-800-SCAM-NOW"]
        },
        "digital_footprints": {
            "websites": ["https://fake-microsoft-support.com"]
        },
        "financial": {
            "total_loss": {"amount": 500, "currency": "USD"},
            "transactions": [
                {"date": "2024-11-20", "amount": 500, "currency": "USD", "method": "credit_card"}
            ]
        },
        "reporter": {
            "relationship": "victim",
            "consent_to_contact": true
        }
    }',
    '2024-11-20',
    'AU',
    500.00,
    'Tech Support Scammer',
    '+1-800-SCAM-NOW',
    true,
    NOW() - INTERVAL '3 weeks',
    NOW() - INTERVAL '3 weeks'
);

-- Pending Report (not yet reviewed)
INSERT INTO reports (
    id,
    user_id,
    fraud_type,
    status,
    payload,
    incident_date,
    incident_country,
    perpetrator_name,
    perpetrator_email,
    submitted_at,
    created_at
)
VALUES (
    '20000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000003',
    'phishing',
    'pending',
    '{
        "incident": {
            "date": "2024-12-05",
            "fraud_type": "phishing",
            "description": "Received an email claiming to be from my bank asking me to verify my account information by clicking a link.",
            "location": {"country": "US"}
        },
        "perpetrator": {
            "name": "Unknown",
            "email": ["noreply@fake-bank.com"]
        },
        "digital_footprints": {
            "websites": ["https://fake-bank-security.com"]
        },
        "reporter": {
            "relationship": "victim"
        }
    }',
    '2024-12-05',
    'US',
    'Unknown',
    'noreply@fake-bank.com',
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days'
);

-- ============================================================================
-- SEED DATA: Perpetrator-Report Links
-- ============================================================================

INSERT INTO perpetrator_report_links (report_id, perpetrator_id, confidence_score, link_type, matched_on, created_by)
VALUES
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1.00, 'primary', ARRAY['email', 'phone', 'name'], '00000000-0000-0000-0000-000000000002'),
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 0.95, 'primary', ARRAY['email', 'name'], '00000000-0000-0000-0000-000000000002'),
    ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 1.00, 'primary', ARRAY['phone', 'name'], '00000000-0000-0000-0000-000000000002');

-- ============================================================================
-- SEED DATA: Evidence
-- ============================================================================

INSERT INTO evidence (id, report_id, type, filename, mime_type, file_size_bytes, status, is_public, metadata, created_at)
VALUES
    (
        '30000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        'screenshot',
        'dating_profile_screenshot.png',
        'image/png',
        245678,
        'available',
        true,
        '{"image": {"width": 1920, "height": 1080, "format": "png"}}',
        NOW() - INTERVAL '3 months'
    ),
    (
        '30000000-0000-0000-0000-000000000002',
        '20000000-0000-0000-0000-000000000001',
        'chat_log',
        'conversation_messages.txt',
        'text/plain',
        12345,
        'available',
        false,
        '{}',
        NOW() - INTERVAL '3 months'
    ),
    (
        '30000000-0000-0000-0000-000000000003',
        '20000000-0000-0000-0000-000000000002',
        'url',
        'fake_website',
        NULL,
        NULL,
        'available',
        true,
        '{"url": {"original_url": "https://fake-investment-firm.com", "http_status": 404, "ssl_valid": false}}',
        NOW() - INTERVAL '2 months'
    );

-- ============================================================================
-- SEED DATA: Comments
-- ============================================================================

INSERT INTO comments (id, report_id, user_id, content, status, created_at)
VALUES
    (
        '40000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000004',
        'I had a similar experience with this person! They used the same story about being a soldier overseas.',
        'active',
        NOW() - INTERVAL '2 months'
    ),
    (
        '40000000-0000-0000-0000-000000000002',
        '20000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000005',
        'This investment scheme is still active. I almost fell for it last week. Thank you for sharing!',
        'active',
        NOW() - INTERVAL '1 month'
    );

-- Reply to first comment
INSERT INTO comments (id, report_id, user_id, content, parent_comment_id, thread_depth, status, created_at)
VALUES
    (
        '40000000-0000-0000-0000-000000000003',
        '20000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000003',
        'Thank you for confirming. I hope others see this warning.',
        '40000000-0000-0000-0000-000000000001',
        1,
        'active',
        NOW() - INTERVAL '2 months' + INTERVAL '1 day'
    );

-- ============================================================================
-- SEED DATA: Crawl Sources
-- ============================================================================

INSERT INTO crawl_sources (id, name, source_type, description, base_url, frequency, is_active, reliability_score, created_by, created_at)
VALUES
    (
        '50000000-0000-0000-0000-000000000001',
        'FBI Most Wanted',
        'news',
        'FBI Most Wanted Cyber Criminals',
        'https://www.fbi.gov/wanted/cyber',
        'daily',
        true,
        95,
        '00000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '6 months'
    ),
    (
        '50000000-0000-0000-0000-000000000002',
        'OFAC Sanctions List',
        'sanctions_list',
        'Office of Foreign Assets Control Sanctions List',
        'https://www.treasury.gov/ofac/downloads/sdnlist.txt',
        'daily',
        true,
        100,
        '00000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '6 months'
    ),
    (
        '50000000-0000-0000-0000-000000000003',
        'Scam Alert News',
        'news',
        'General scam news aggregator',
        'https://scam-alert-news.example.com',
        'hourly',
        true,
        70,
        '00000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '3 months'
    );

-- ============================================================================
-- SEED DATA: Audit Logs
-- ============================================================================

INSERT INTO audit_logs (user_id, user_email, action, entity_type, entity_id, details, ip_address, success, created_at)
VALUES
    (
        '00000000-0000-0000-0000-000000000002',
        'moderator@scamnemesis.com',
        'report_approved',
        'report',
        '20000000-0000-0000-0000-000000000001',
        '{"reason": "Verified with supporting evidence"}',
        '192.168.1.100',
        true,
        NOW() - INTERVAL '3 months' + INTERVAL '1 day'
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'moderator@scamnemesis.com',
        'report_approved',
        'report',
        '20000000-0000-0000-0000-000000000002',
        '{"reason": "High-value fraud with documentation"}',
        '192.168.1.100',
        true,
        NOW() - INTERVAL '2 months' + INTERVAL '1 day'
    ),
    (
        '00000000-0000-0000-0000-000000000003',
        'john.doe@example.com',
        'report_created',
        'report',
        '20000000-0000-0000-0000-000000000001',
        '{"fraud_type": "romance_scam"}',
        '10.0.0.50',
        true,
        NOW() - INTERVAL '3 months'
    );

-- ============================================================================
-- Update statistics after seeding
-- ============================================================================

-- Update perpetrator statistics (trigger handles this, but we can also recalculate)
SELECT recalculate_all_risk_scores();

-- Update search vectors
UPDATE reports SET payload = payload WHERE id IS NOT NULL;
UPDATE perpetrators SET canonical_name = canonical_name WHERE id IS NOT NULL;

COMMIT;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check data was inserted
DO $$
DECLARE
    user_count INTEGER;
    report_count INTEGER;
    perpetrator_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO report_count FROM reports;
    SELECT COUNT(*) INTO perpetrator_count FROM perpetrators;

    RAISE NOTICE 'Seed data inserted successfully:';
    RAISE NOTICE '  Users: %', user_count;
    RAISE NOTICE '  Reports: %', report_count;
    RAISE NOTICE '  Perpetrators: %', perpetrator_count;
END $$;
