// Supabase Edge Function: Job Sync
// Purpose: Fetch jobs from JSearch API and cache in Supabase database
// Trigger: Scheduled daily via pg_cron OR manual invocation
// Runtime: Deno (uses esm.sh imports, native fetch)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_city: string;
  job_state: string;
  job_country: string;
  job_apply_link: string;
  job_min_salary?: number;
  job_max_salary?: number;
  job_salary_currency?: string;
  job_salary_period?: string;
  employer_logo?: string;
  job_description?: string;
}

interface JSearchResponse {
  status: string;
  request_id: string;
  data: JSearchJob[];
}

interface SyncResult {
  success: boolean;
  jobCount: number;
  timestamp: string;
  error?: string;
}

// ============================================================================
// FETCH WITH RETRY LOGIC
// ============================================================================

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Retry on rate limit (429) or server errors (5xx)
      if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
        // Exponential backoff with jitter: 100ms, 200ms, 400ms + random 30%
        const baseDelay = 100 * Math.pow(2, attempt - 1);
        const jitter = baseDelay * 0.3 * Math.random();
        const delay = baseDelay + jitter;

        console.log(`[job-sync] Attempt ${attempt} failed with status ${response.status}, retrying in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[job-sync] Attempt ${attempt} failed:`, lastError.message);

      if (attempt < maxRetries) {
        const baseDelay = 100 * Math.pow(2, attempt - 1);
        const jitter = baseDelay * 0.3 * Math.random();
        const delay = baseDelay + jitter;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Failed to fetch after retries');
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req) => {
  try {
    console.log('[job-sync] Starting job sync...');

    // Initialize Supabase client with service_role key (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const jsearchApiKey = Deno.env.get('JSEARCH_API_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing Supabase environment variables');
    }

    if (!jsearchApiKey) {
      throw new Error('Missing JSEARCH_API_KEY secret. Set via: supabase secrets set JSEARCH_API_KEY=your_key');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Fetch jobs from JSearch API
    console.log('[job-sync] Fetching jobs from JSearch API...');
    const jsearchUrl = new URL('https://jsearch.p.rapidapi.com/search');
    jsearchUrl.searchParams.set('query', 'fast food crew member USA');
    jsearchUrl.searchParams.set('num_pages', '1');

    const response = await fetchWithRetry(jsearchUrl.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': jsearchApiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    });

    if (!response.ok) {
      throw new Error(`JSearch API returned ${response.status}: ${await response.text()}`);
    }

    const jsearchData: JSearchResponse = await response.json();
    const jobs = jsearchData.data || [];

    console.log(`[job-sync] Received ${jobs.length} jobs from JSearch API`);

    // Mark all existing active jobs as inactive (will be reactivated if still in API)
    console.log('[job-sync] Marking existing active jobs as inactive...');
    const { error: deactivateError } = await supabase
      .from('jobs')
      .update({ is_active: false })
      .eq('is_active', true);

    if (deactivateError) {
      console.error('[job-sync] Error deactivating jobs:', deactivateError);
      throw new Error(`Failed to deactivate jobs: ${deactivateError.message}`);
    }

    // Identify which jobs are new vs returning, preserving existing created_at
    console.log('[job-sync] Checking for new vs existing jobs...');
    const { data: existingRows } = await supabase
      .from('jobs')
      .select('job_id, created_at')
      .in('job_id', jobs.map(j => j.job_id));
    const existingMap = new Map(
      (existingRows || []).map(r => [r.job_id, r.created_at])
    );

    // Build staggered drip times for new jobs
    const newJobs = jobs.filter(j => !existingMap.has(j.job_id));
    const shuffledNewIds = new Set(
      [...newJobs].sort(() => Math.random() - 0.5).map(j => j.job_id)
    );
    const now = Date.now();
    const DRIP_WINDOW_MS = 55 * 60 * 1000;
    let dripIndex = 0;
    const dripTimes = new Map<string, string>();
    for (const id of shuffledNewIds) {
      const offset = shuffledNewIds.size === 1
        ? 0
        : Math.round((dripIndex / (shuffledNewIds.size - 1)) * DRIP_WINDOW_MS);
      dripTimes.set(id, new Date(now + offset).toISOString());
      dripIndex++;
    }

    if (newJobs.length > 0) {
      console.log(`[job-sync] ${newJobs.length} new jobs will drip in over 55 minutes`);
    }

    // Upsert jobs in one atomic operation
    // - Existing jobs: preserve their created_at
    // - New jobs: set created_at to staggered future times for drip effect
    // CRITICAL: Do NOT include click_count or lane - preserve existing values
    console.log('[job-sync] Upserting jobs to database...');
    const jobsToUpsert = jobs.map((job) => ({
      job_id: job.job_id,
      job_title: job.job_title,
      employer_name: job.employer_name,
      job_city: job.job_city,
      job_state: job.job_state,
      job_country: job.job_country,
      job_apply_link: job.job_apply_link,
      job_min_salary: job.job_min_salary || null,
      job_max_salary: job.job_max_salary || null,
      job_salary_currency: job.job_salary_currency || null,
      job_salary_period: job.job_salary_period || null,
      employer_logo: job.employer_logo || null,
      job_description: job.job_description || null,
      is_active: true,
      last_seen: new Date().toISOString(),
      created_at: existingMap.get(job.job_id) ?? dripTimes.get(job.job_id) ?? new Date().toISOString(),
    }));

    const { error: upsertError } = await supabase
      .from('jobs')
      .upsert(jobsToUpsert, {
        onConflict: 'job_id',
        ignoreDuplicates: false,
      });

    if (upsertError) {
      console.error('[job-sync] Error upserting jobs:', upsertError);
      throw new Error(`Failed to upsert jobs: ${upsertError.message}`);
    }

    console.log(`[job-sync] Successfully synced ${jobs.length} jobs`);

    // Return success response
    const result: SyncResult = {
      success: true,
      jobCount: jobs.length,
      timestamp: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    // Error handling
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[job-sync] Fatal error:', errorMessage);

    const result: SyncResult = {
      success: false,
      jobCount: 0,
      timestamp: new Date().toISOString(),
      error: errorMessage,
    };

    return new Response(
      JSON.stringify(result),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
