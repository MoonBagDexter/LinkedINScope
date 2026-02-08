-- Migration: Clear all job data and increase sync frequency
-- Purpose: Start fresh and use JSearch API quota (~500/month) within ~15 days
-- Date: 2026-02-08

-- ============================================================================
-- CLEAR EXISTING DATA
-- ============================================================================

-- Remove all click tracking data
TRUNCATE TABLE clicks;

-- Remove all cached jobs
TRUNCATE TABLE jobs;

-- ============================================================================
-- UPDATE CRON SCHEDULE: Daily -> Hourly
-- ============================================================================

-- Remove the existing daily schedule
SELECT cron.unschedule('job-sync-daily')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'job-sync-daily');

-- Create hourly schedule (24 requests/day × ~21 days = ~500 requests)
SELECT cron.schedule(
  'job-sync-hourly',
  '0 * * * *',                -- Every hour at minute 0
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
