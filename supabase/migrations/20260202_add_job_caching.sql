-- Migration: Add full JSearch job fields and caching columns
-- Purpose: Expand jobs table from minimal schema (job_id, click_count, lane)
--          to include all JSearch API fields plus caching control columns
-- Date: 2026-02-02
-- Phase: 02.5-backend-job-caching

-- ============================================================================
-- CORE JOB FIELDS (from JSearch API)
-- ============================================================================

-- Required job fields
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS employer_name TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_city TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_state TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_country TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_apply_link TEXT;

-- Salary fields (optional, nullable)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_min_salary NUMERIC;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_max_salary NUMERIC;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_salary_currency TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_salary_period TEXT;

-- Additional job info (optional)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS employer_logo TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_description TEXT;

-- ============================================================================
-- CACHING CONTROL COLUMNS
-- ============================================================================

-- is_active: Marks if job was seen in most recent sync (TRUE) or stale (FALSE)
-- Default TRUE for new inserts, set FALSE before sync then TRUE during upsert
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL;

-- last_seen: Timestamp of last time job appeared in sync
-- Updated during each upsert to track freshness
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW();

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Index for filtering active jobs (frontend queries)
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);

-- Index for lane-based queries (already exists from Phase 2, but ensure it exists)
CREATE INDEX IF NOT EXISTS idx_jobs_lane ON jobs(lane);

-- Composite index for efficient lane + active filtering
CREATE INDEX IF NOT EXISTS idx_jobs_lane_active ON jobs(lane, is_active) WHERE is_active = TRUE;

-- ============================================================================
-- COLUMN COMMENTS
-- ============================================================================

COMMENT ON COLUMN jobs.job_title IS 'Job title from JSearch API';
COMMENT ON COLUMN jobs.employer_name IS 'Employer/company name from JSearch API';
COMMENT ON COLUMN jobs.job_city IS 'Job location city from JSearch API';
COMMENT ON COLUMN jobs.job_state IS 'Job location state from JSearch API';
COMMENT ON COLUMN jobs.job_country IS 'Job location country from JSearch API';
COMMENT ON COLUMN jobs.job_apply_link IS 'Application URL from JSearch API';
COMMENT ON COLUMN jobs.job_min_salary IS 'Minimum salary from JSearch API (nullable)';
COMMENT ON COLUMN jobs.job_max_salary IS 'Maximum salary from JSearch API (nullable)';
COMMENT ON COLUMN jobs.job_salary_currency IS 'Salary currency code from JSearch API (nullable)';
COMMENT ON COLUMN jobs.job_salary_period IS 'Salary period (YEAR, MONTH, HOUR) from JSearch API (nullable)';
COMMENT ON COLUMN jobs.employer_logo IS 'Employer logo URL from JSearch API (nullable)';
COMMENT ON COLUMN jobs.job_description IS 'Full job description from JSearch API (nullable)';
COMMENT ON COLUMN jobs.is_active IS 'Whether job appeared in most recent sync (TRUE = active, FALSE = stale)';
COMMENT ON COLUMN jobs.last_seen IS 'Timestamp of last sync where job appeared';

-- ============================================================================
-- NOTES
-- ============================================================================

-- PRESERVED COLUMNS (DO NOT MODIFY):
-- - job_id: Primary key, used for JSearch API correlation
-- - click_count: Engagement tracking from Phase 2
-- - lane: Kanban position (new, trending, graduated) from Phase 2
-- - created_at, updated_at: Timestamp tracking from Phase 2

-- IDEMPOTENCY:
-- All statements use IF NOT EXISTS patterns so migration can be run multiple times safely

-- BACKWARD COMPATIBILITY:
-- Existing jobs table data preserved (click_count, lane columns untouched)
-- New columns nullable or have defaults, so existing rows remain valid
