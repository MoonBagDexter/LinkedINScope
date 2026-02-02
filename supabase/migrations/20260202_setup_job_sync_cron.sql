-- Migration: Set up pg_cron for daily job sync
-- Purpose: Schedule Edge Function to run daily at 6 AM UTC for automated job refresh
-- Date: 2026-02-02
-- Phase: 02.5-backend-job-caching
-- Prerequisites: pg_cron, vault, pg_net extensions must be enabled

-- ============================================================================
-- PREREQUISITE CHECK
-- ============================================================================

-- Verify required extensions are installed
-- If any are missing, enable them in Supabase Dashboard -> Database -> Extensions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    RAISE EXCEPTION 'pg_cron extension not found. Enable it in Dashboard -> Database -> Extensions';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vault') THEN
    RAISE EXCEPTION 'vault extension not found. Enable it in Dashboard -> Database -> Extensions';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    RAISE EXCEPTION 'pg_net extension not found. Enable it in Dashboard -> Database -> Extensions';
  END IF;

  RAISE NOTICE 'All required extensions are installed';
END $$;

-- ============================================================================
-- VAULT SECRETS SETUP
-- ============================================================================

-- NOTE: These INSERT statements are templates. You must replace the placeholder values
-- with your actual project URL and service role key before running.
--
-- MANUAL STEPS REQUIRED:
-- 1. Replace YOUR_PROJECT_REF with your actual project reference (e.g., hktddfhybqdnrytsqbho)
-- 2. Replace YOUR_SERVICE_ROLE_KEY with your actual service role key from Dashboard -> Settings -> API
--
-- Example:
-- SELECT vault.create_secret('https://hktddfhybqdnrytsqbho.supabase.co', 'project_url');
-- SELECT vault.create_secret('eyJhbGciOi...', 'service_role_key');

-- Store project URL in Vault (used by pg_cron to invoke Edge Function)
-- REPLACE YOUR_PROJECT_REF BEFORE RUNNING:
SELECT vault.create_secret(
  'https://YOUR_PROJECT_REF.supabase.co',
  'project_url'
);

-- Store service role key in Vault (used for Edge Function authentication)
-- REPLACE YOUR_SERVICE_ROLE_KEY BEFORE RUNNING:
SELECT vault.create_secret(
  'YOUR_SERVICE_ROLE_KEY',
  'service_role_key'
);

-- ============================================================================
-- CRON SCHEDULE SETUP
-- ============================================================================

-- Schedule daily job sync at 6 AM UTC
-- This invokes the job-sync Edge Function which:
-- 1. Fetches jobs from JSearch API
-- 2. Marks existing jobs as inactive
-- 3. Upserts fresh jobs (preserving click_count and lane)
-- 4. Reactivates jobs still in API response

-- Unschedule existing job if it exists (for idempotency)
SELECT cron.unschedule('job-sync-daily')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'job-sync-daily');

-- Create the daily schedule
SELECT cron.schedule(
  'job-sync-daily',           -- Job name
  '0 6 * * *',                -- Cron expression: 6 AM UTC daily
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url') || '/functions/v1/job-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := jsonb_build_object(
      'scheduled', true,
      'timestamp', NOW()
    )::text
  ) AS request_id;
  $$
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- View scheduled cron jobs
-- Run this to verify the job was created:
-- SELECT jobid, jobname, schedule, active, command
-- FROM cron.job
-- WHERE jobname = 'job-sync-daily';

-- View cron execution history
-- Run this after first scheduled run to verify success:
-- SELECT jobid, runid, job_pid, status, return_message, start_time, end_time
-- FROM cron.job_run_details
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'job-sync-daily')
-- ORDER BY start_time DESC
-- LIMIT 10;

-- ============================================================================
-- NOTES
-- ============================================================================

-- SCHEDULE DETAILS:
-- - Runs daily at 6 AM UTC
-- - Uses only 30 API requests/month (30 days × 1 request/day)
-- - Preserves 93% of 500 req/month JSearch quota for manual triggers/testing
--
-- MANUAL TRIGGER (for testing):
-- You can manually trigger the job sync without waiting for scheduled time:
-- SELECT net.http_post(
--   url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url') || '/functions/v1/job-sync',
--   headers := jsonb_build_object(
--     'Content-Type', 'application/json',
--     'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
--   ),
--   body := '{}'::text
-- );
--
-- MONITORING:
-- - Check Edge Function logs: Dashboard -> Edge Functions -> job-sync -> Logs
-- - Check cron history: Query cron.job_run_details table
-- - Check jobs table: SELECT COUNT(*) FROM jobs WHERE is_active = true;
