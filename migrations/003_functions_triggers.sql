-- migration_003_functions_triggers.sql
-- Scamnemesis Database Schema - Functions and Triggers
-- Author: Database Architect
-- Date: 2025-12-09
-- Description: Creates functions, triggers, and stored procedures for automation

BEGIN;

-- ============================================================================
-- TRIGGER FUNCTION: Update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Auto-update updated_at timestamp on row modification';

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_perpetrators_updated_at
    BEFORE UPDATE ON perpetrators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evidence_updated_at
    BEFORE UPDATE ON evidence
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_duplicate_clusters_updated_at
    BEFORE UPDATE ON duplicate_clusters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crawl_sources_updated_at
    BEFORE UPDATE ON crawl_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crawl_results_updated_at
    BEFORE UPDATE ON crawl_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_search_index_metadata_updated_at
    BEFORE UPDATE ON search_index_metadata
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TRIGGER FUNCTION: Update search vectors for reports
-- ============================================================================
CREATE OR REPLACE FUNCTION update_report_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    -- Extract searchable text from JSONB payload and denormalized fields
    NEW.search_vector_content :=
        COALESCE(NEW.perpetrator_name, '') || ' ' ||
        COALESCE(NEW.perpetrator_email, '') || ' ' ||
        COALESCE(NEW.perpetrator_phone, '') || ' ' ||
        COALESCE(array_to_string(NEW.perpetrator_addresses, ' '), '') || ' ' ||
        COALESCE(NEW.payload->'incident'->>'description', '') || ' ' ||
        COALESCE(NEW.payload->'perpetrator'->>'name', '') || ' ' ||
        COALESCE(NEW.payload->'perpetrator'->>'description', '') || ' ' ||
        COALESCE(NEW.payload->'company'->>'name', '');

    -- Update tsvector for full-text search
    NEW.search_vector_en := to_tsvector('english', NEW.search_vector_content);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_report_search_vector() IS 'Auto-update search vectors when report data changes';

CREATE TRIGGER update_reports_search_vector
    BEFORE INSERT OR UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_report_search_vector();

-- ============================================================================
-- TRIGGER FUNCTION: Update search vector for perpetrators
-- ============================================================================
CREATE OR REPLACE FUNCTION update_perpetrator_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english',
        COALESCE(NEW.canonical_name, '') || ' ' ||
        COALESCE(array_to_string(NEW.aliases, ' '), '') || ' ' ||
        COALESCE(array_to_string(NEW.emails, ' '), '') || ' ' ||
        COALESCE(array_to_string(NEW.phones, ' '), '') || ' ' ||
        COALESCE(NEW.payload->'identity'->>'physical_description', '')
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_perpetrator_search_vector() IS 'Auto-update search vectors for perpetrator entity';

CREATE TRIGGER update_perpetrators_search_vector
    BEFORE INSERT OR UPDATE ON perpetrators
    FOR EACH ROW EXECUTE FUNCTION update_perpetrator_search_vector();

-- ============================================================================
-- TRIGGER FUNCTION: Update perpetrator statistics on report link
-- ============================================================================
CREATE OR REPLACE FUNCTION update_perpetrator_stats()
RETURNS TRIGGER AS $$
DECLARE
    report_data RECORD;
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Get report data
        SELECT
            incident_amount_usd,
            incident_country,
            fraud_type,
            submitted_at
        INTO report_data
        FROM reports
        WHERE id = NEW.report_id;

        -- Update perpetrator statistics
        UPDATE perpetrators
        SET
            report_count = report_count + 1,
            last_reported_at = report_data.submitted_at,
            first_reported_at = COALESCE(first_reported_at, report_data.submitted_at),
            total_amount_reported_usd = COALESCE(total_amount_reported_usd, 0) + COALESCE(report_data.incident_amount_usd, 0),
            countries_active = CASE
                WHEN report_data.incident_country IS NOT NULL AND NOT (report_data.incident_country = ANY(COALESCE(countries_active, ARRAY[]::TEXT[])))
                THEN array_append(COALESCE(countries_active, ARRAY[]::TEXT[]), report_data.incident_country)
                ELSE countries_active
            END,
            fraud_types = CASE
                WHEN report_data.fraud_type IS NOT NULL AND NOT (report_data.fraud_type = ANY(COALESCE(fraud_types, ARRAY[]::fraud_type[])))
                THEN array_append(COALESCE(fraud_types, ARRAY[]::fraud_type[]), report_data.fraud_type)
                ELSE fraud_types
            END
        WHERE id = NEW.perpetrator_id;

    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement report count (amount recalculation would require full recompute)
        UPDATE perpetrators
        SET report_count = GREATEST(report_count - 1, 0)
        WHERE id = OLD.perpetrator_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_perpetrator_stats() IS 'Auto-update perpetrator statistics when reports are linked/unlinked';

CREATE TRIGGER update_perpetrator_stats_on_link
    AFTER INSERT OR DELETE ON perpetrator_report_links
    FOR EACH ROW EXECUTE FUNCTION update_perpetrator_stats();

-- ============================================================================
-- FUNCTION: Calculate report similarity score
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_report_similarity(
    report1_id UUID,
    report2_id UUID
) RETURNS NUMERIC AS $$
DECLARE
    similarity_score NUMERIC := 0.0;
    r1 RECORD;
    r2 RECORD;
BEGIN
    SELECT * INTO r1 FROM reports WHERE id = report1_id;
    SELECT * INTO r2 FROM reports WHERE id = report2_id;

    IF r1 IS NULL OR r2 IS NULL THEN
        RETURN 0.0;
    END IF;

    -- Compare perpetrator email (high confidence)
    IF r1.perpetrator_email = r2.perpetrator_email AND r1.perpetrator_email IS NOT NULL THEN
        similarity_score := similarity_score + 0.4;
    END IF;

    -- Compare perpetrator phone (high confidence)
    IF r1.perpetrator_phone = r2.perpetrator_phone AND r1.perpetrator_phone IS NOT NULL THEN
        similarity_score := similarity_score + 0.3;
    END IF;

    -- Compare perpetrator name (fuzzy matching)
    IF r1.perpetrator_name IS NOT NULL AND r2.perpetrator_name IS NOT NULL THEN
        similarity_score := similarity_score + (
            similarity(r1.perpetrator_name, r2.perpetrator_name) * 0.3
        );
    END IF;

    RETURN LEAST(similarity_score, 1.0);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_report_similarity(UUID, UUID) IS 'Calculate similarity score between two reports (0.0 - 1.0)';

-- ============================================================================
-- FUNCTION: Find duplicate reports
-- ============================================================================
CREATE OR REPLACE FUNCTION find_duplicate_reports(
    target_report_id UUID,
    similarity_threshold NUMERIC DEFAULT 0.7
) RETURNS TABLE (
    report_id UUID,
    similarity_score NUMERIC,
    matched_fields TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH target AS (
        SELECT
            perpetrator_email,
            perpetrator_phone,
            perpetrator_name
        FROM reports
        WHERE id = target_report_id
    )
    SELECT
        r.id,
        calculate_report_similarity(target_report_id, r.id) AS score,
        ARRAY[
            CASE WHEN r.perpetrator_email = t.perpetrator_email AND r.perpetrator_email IS NOT NULL THEN 'email' END,
            CASE WHEN r.perpetrator_phone = t.perpetrator_phone AND r.perpetrator_phone IS NOT NULL THEN 'phone' END,
            CASE WHEN similarity(r.perpetrator_name, t.perpetrator_name) > 0.8 THEN 'name' END
        ]::TEXT[] AS matched_fields
    FROM reports r, target t
    WHERE r.id != target_report_id
        AND r.deleted_at IS NULL
        AND calculate_report_similarity(target_report_id, r.id) >= similarity_threshold
    ORDER BY score DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION find_duplicate_reports(UUID, NUMERIC) IS 'Find potential duplicate reports based on similarity threshold';

-- ============================================================================
-- FUNCTION: Merge perpetrators
-- ============================================================================
CREATE OR REPLACE FUNCTION merge_perpetrators(
    target_perpetrator_id UUID,
    source_perpetrator_id UUID,
    merged_by_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    target_perp RECORD;
    source_perp RECORD;
BEGIN
    -- Get both perpetrators
    SELECT * INTO target_perp FROM perpetrators WHERE id = target_perpetrator_id;
    SELECT * INTO source_perp FROM perpetrators WHERE id = source_perpetrator_id;

    IF target_perp IS NULL OR source_perp IS NULL THEN
        RAISE EXCEPTION 'One or both perpetrators not found';
    END IF;

    -- Update target perpetrator with merged data
    UPDATE perpetrators
    SET
        aliases = array_cat(COALESCE(aliases, ARRAY[]::TEXT[]), COALESCE(source_perp.aliases, ARRAY[]::TEXT[])),
        emails = array_cat(COALESCE(emails, ARRAY[]::TEXT[]), COALESCE(source_perp.emails, ARRAY[]::TEXT[])),
        phones = array_cat(COALESCE(phones, ARRAY[]::TEXT[]), COALESCE(source_perp.phones, ARRAY[]::TEXT[])),
        pep_match = pep_match OR source_perp.pep_match,
        sanctions_match = sanctions_match OR source_perp.sanctions_match,
        law_enforcement_reported = law_enforcement_reported OR source_perp.law_enforcement_reported
    WHERE id = target_perpetrator_id;

    -- Move all report links from source to target
    UPDATE perpetrator_report_links
    SET perpetrator_id = target_perpetrator_id
    WHERE perpetrator_id = source_perpetrator_id
    ON CONFLICT (report_id, perpetrator_id) DO NOTHING;

    -- Move crawl results
    UPDATE crawl_results
    SET perpetrator_id = target_perpetrator_id
    WHERE perpetrator_id = source_perpetrator_id;

    -- Soft delete source perpetrator
    UPDATE perpetrators
    SET deleted_at = NOW()
    WHERE id = source_perpetrator_id;

    -- Log the merge
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
    VALUES (
        merged_by_user_id,
        'perpetrator_merged',
        'perpetrator',
        target_perpetrator_id,
        jsonb_build_object(
            'source_id', source_perpetrator_id,
            'target_id', target_perpetrator_id
        )
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION merge_perpetrators(UUID, UUID, UUID) IS 'Merge two perpetrator entities into one';

-- ============================================================================
-- FUNCTION: Calculate risk score for perpetrator
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_perpetrator_risk_score(
    perp_id UUID
) RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    perp RECORD;
BEGIN
    SELECT * INTO perp FROM perpetrators WHERE id = perp_id;

    IF perp IS NULL THEN
        RETURN 0;
    END IF;

    -- Base score from report count (max 30 points)
    score := score + LEAST(perp.report_count * 3, 30);

    -- Total amount reported (max 25 points)
    IF perp.total_amount_reported_usd > 1000000 THEN
        score := score + 25;
    ELSIF perp.total_amount_reported_usd > 100000 THEN
        score := score + 20;
    ELSIF perp.total_amount_reported_usd > 10000 THEN
        score := score + 15;
    ELSIF perp.total_amount_reported_usd > 1000 THEN
        score := score + 10;
    END IF;

    -- Multiple countries (max 15 points)
    IF array_length(perp.countries_active, 1) >= 5 THEN
        score := score + 15;
    ELSIF array_length(perp.countries_active, 1) >= 3 THEN
        score := score + 10;
    ELSIF array_length(perp.countries_active, 1) >= 2 THEN
        score := score + 5;
    END IF;

    -- Multiple fraud types (max 10 points)
    IF array_length(perp.fraud_types, 1) >= 4 THEN
        score := score + 10;
    ELSIF array_length(perp.fraud_types, 1) >= 2 THEN
        score := score + 5;
    END IF;

    -- External matches (max 20 points)
    IF perp.pep_match THEN
        score := score + 10;
    END IF;
    IF perp.sanctions_match THEN
        score := score + 10;
    END IF;
    IF perp.law_enforcement_reported THEN
        score := score + 10;
    END IF;

    RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_perpetrator_risk_score(UUID) IS 'Calculate risk score (0-100) based on activity and external data';

-- ============================================================================
-- FUNCTION: Recalculate all perpetrator risk scores
-- ============================================================================
CREATE OR REPLACE FUNCTION recalculate_all_risk_scores()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER := 0;
BEGIN
    UPDATE perpetrators
    SET risk_score = calculate_perpetrator_risk_score(id)
    WHERE deleted_at IS NULL;

    GET DIAGNOSTICS updated_count = ROW_COUNT;

    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION recalculate_all_risk_scores() IS 'Batch recalculate risk scores for all perpetrators';

-- ============================================================================
-- FUNCTION: Archive old reports
-- ============================================================================
CREATE OR REPLACE FUNCTION archive_old_reports(
    days_threshold INTEGER DEFAULT 365
) RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER := 0;
BEGIN
    UPDATE reports
    SET
        status = 'archived',
        archived_at = NOW()
    WHERE
        status IN ('approved', 'rejected')
        AND archived_at IS NULL
        AND deleted_at IS NULL
        AND updated_at < NOW() - (days_threshold || ' days')::INTERVAL;

    GET DIAGNOSTICS archived_count = ROW_COUNT;

    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION archive_old_reports(INTEGER) IS 'Archive old approved/rejected reports after N days';

-- ============================================================================
-- FUNCTION: Get user permissions
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_permissions(
    user_uuid UUID
) RETURNS TABLE (
    role system_role,
    permissions JSONB,
    scope JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ur.role,
        ur.permissions,
        ur.scope
    FROM user_roles ur
    WHERE ur.user_id = user_uuid
        AND ur.revoked_at IS NULL
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW());
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_user_permissions(UUID) IS 'Get all active permissions for a user';

-- ============================================================================
-- FUNCTION: Search reports (full-text + filters)
-- ============================================================================
CREATE OR REPLACE FUNCTION search_reports(
    search_query TEXT DEFAULT NULL,
    fraud_type_filter fraud_type DEFAULT NULL,
    status_filter report_status DEFAULT NULL,
    country_filter VARCHAR(2) DEFAULT NULL,
    date_from DATE DEFAULT NULL,
    date_to DATE DEFAULT NULL,
    amount_min NUMERIC DEFAULT NULL,
    amount_max NUMERIC DEFAULT NULL,
    result_limit INTEGER DEFAULT 50,
    result_offset INTEGER DEFAULT 0
) RETURNS TABLE (
    id UUID,
    fraud_type fraud_type,
    status report_status,
    perpetrator_name VARCHAR(255),
    incident_date DATE,
    incident_amount_usd NUMERIC(15, 2),
    submitted_at TIMESTAMPTZ,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.fraud_type,
        r.status,
        r.perpetrator_name,
        r.incident_date,
        r.incident_amount_usd,
        r.submitted_at,
        CASE
            WHEN search_query IS NOT NULL THEN ts_rank(r.search_vector_en, plainto_tsquery('english', search_query))
            ELSE 0
        END AS relevance
    FROM reports r
    WHERE r.deleted_at IS NULL
        AND (fraud_type_filter IS NULL OR r.fraud_type = fraud_type_filter)
        AND (status_filter IS NULL OR r.status = status_filter)
        AND (country_filter IS NULL OR r.incident_country = country_filter)
        AND (date_from IS NULL OR r.incident_date >= date_from)
        AND (date_to IS NULL OR r.incident_date <= date_to)
        AND (amount_min IS NULL OR r.incident_amount_usd >= amount_min)
        AND (amount_max IS NULL OR r.incident_amount_usd <= amount_max)
        AND (search_query IS NULL OR r.search_vector_en @@ plainto_tsquery('english', search_query))
    ORDER BY
        CASE WHEN search_query IS NOT NULL THEN ts_rank(r.search_vector_en, plainto_tsquery('english', search_query)) END DESC,
        r.submitted_at DESC
    LIMIT result_limit
    OFFSET result_offset;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_reports IS 'Full-text search with filters for fraud reports';

-- ============================================================================
-- VIEW: Public reports summary
-- ============================================================================
CREATE OR REPLACE VIEW public_reports_view AS
SELECT
    r.id,
    r.fraud_type,
    r.incident_date,
    r.incident_country,
    r.incident_amount_usd,
    r.perpetrator_name,
    r.perpetrator_email,
    r.perpetrator_phone,
    r.submitted_at,
    r.view_count,
    r.is_verified,
    COUNT(DISTINCT e.id) as evidence_count,
    COUNT(DISTINCT c.id) as comment_count
FROM reports r
LEFT JOIN evidence e ON e.report_id = r.id AND e.deleted_at IS NULL AND e.is_public = TRUE
LEFT JOIN comments c ON c.report_id = r.id AND c.deleted_at IS NULL AND c.status = 'active'
WHERE r.is_public = TRUE
    AND r.deleted_at IS NULL
    AND r.status = 'approved'
GROUP BY r.id;

COMMENT ON VIEW public_reports_view IS 'Public-facing view of approved reports with aggregated counts';

-- ============================================================================
-- VIEW: Perpetrator summary statistics
-- ============================================================================
CREATE OR REPLACE VIEW perpetrator_stats_view AS
SELECT
    p.id,
    p.canonical_name,
    p.risk_score,
    p.report_count,
    p.total_amount_reported_usd,
    p.countries_active,
    p.fraud_types,
    p.pep_match,
    p.sanctions_match,
    p.law_enforcement_reported,
    p.first_reported_at,
    p.last_reported_at,
    COUNT(DISTINCT cr.id) as external_references_count
FROM perpetrators p
LEFT JOIN crawl_results cr ON cr.perpetrator_id = p.id AND cr.status = 'matched'
WHERE p.deleted_at IS NULL
GROUP BY p.id;

COMMENT ON VIEW perpetrator_stats_view IS 'Perpetrator statistics with external data counts';

COMMIT;
