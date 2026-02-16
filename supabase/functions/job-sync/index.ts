import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
  data: JSearchJob[];
}

// Diverse search queries to get 50+ distinct jobs across service industry
const SEARCH_QUERIES = [
  'McDonald\'s crew member USA',
  'Walmart cashier part time USA',
  'Target team member USA',
  'Starbucks barista USA',
  'Subway sandwich artist USA',
  'Chick-fil-A team member USA',
  'hotel front desk receptionist USA',
  'retail sales associate part time USA',
  'restaurant server part time USA',
  'Costco warehouse associate USA',
  'Wendy\'s crew member USA',
  'Taco Bell team member USA',
  'Burger King crew USA',
  'Dunkin Donuts crew member USA',
  'Chipotle crew member USA',
  'Home Depot cashier USA',
  'grocery store clerk part time USA',
  'fast food cashier USA',
  'hotel housekeeper USA',
  'pizza delivery driver USA',
];

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 100 * Math.pow(2, attempt - 1)));
        continue;
      }
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) await new Promise(r => setTimeout(r, 100 * Math.pow(2, attempt - 1)));
    }
  }
  throw lastError || new Error('Failed to fetch after retries');
}

Deno.serve(async () => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const jsearchApiKey = Deno.env.get('JSEARCH_API_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) throw new Error('Missing Supabase env vars');
    if (!jsearchApiKey) throw new Error('Missing JSEARCH_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Fetch from multiple queries for diversity
    const allJobs = new Map<string, JSearchJob>();

    for (const query of SEARCH_QUERIES) {
      try {
        const url = new URL('https://jsearch.p.rapidapi.com/search');
        url.searchParams.set('query', query);
        url.searchParams.set('num_pages', '1');

        const response = await fetchWithRetry(url.toString(), {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': jsearchApiKey,
            'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
          },
        });

        if (!response.ok) {
          console.warn(`[job-sync] Query "${query}" failed: ${response.status}`);
          continue;
        }

        const data: JSearchResponse = await response.json();
        for (const job of (data.data || [])) {
          if (!allJobs.has(job.job_id)) allJobs.set(job.job_id, job);
        }

        console.log(`[job-sync] "${query}" → ${data.data?.length || 0} jobs (total unique: ${allJobs.size})`);

        // Small delay between requests to avoid rate limiting
        await new Promise(r => setTimeout(r, 200));
      } catch (err) {
        console.warn(`[job-sync] Query "${query}" error:`, err);
      }
    }

    const jobs = Array.from(allJobs.values());
    console.log(`[job-sync] Total unique jobs: ${jobs.length}`);

    // Check existing jobs
    const { data: existingRows } = await supabase
      .from('jobs')
      .select('job_id, created_at')
      .in('job_id', jobs.map(j => j.job_id));
    const existingMap = new Map((existingRows || []).map(r => [r.job_id, r.created_at]));

    // Drip timing for new jobs
    const newJobs = jobs.filter(j => !existingMap.has(j.job_id));
    const now = Date.now();
    const DRIP_WINDOW_MS = 55 * 60 * 1000;
    const dripTimes = new Map<string, string>();
    const shuffled = [...newJobs].sort(() => Math.random() - 0.5);
    shuffled.forEach((j, i) => {
      const offset = shuffled.length === 1 ? 0 : Math.round((i / (shuffled.length - 1)) * DRIP_WINDOW_MS);
      dripTimes.set(j.job_id, new Date(now + offset).toISOString());
    });

    // Upsert
    const jobsToUpsert = jobs.map(job => ({
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
      .upsert(jobsToUpsert, { onConflict: 'job_id', ignoreDuplicates: false });

    if (upsertError) throw new Error(`Upsert failed: ${upsertError.message}`);

    console.log(`[job-sync] Synced ${jobs.length} jobs (${newJobs.length} new)`);

    return new Response(JSON.stringify({ success: true, jobCount: jobs.length, newJobs: newJobs.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[job-sync] Fatal:', msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
