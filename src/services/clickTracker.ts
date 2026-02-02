import { supabase } from './supabase';
import type { JobWithLane, Lane } from '../types/kanban';

// Get current thresholds from environment (parse to numbers!)
const THRESHOLD_NEW_TO_TRENDING = parseInt(import.meta.env.VITE_THRESHOLD_NEW_TO_TRENDING || '5', 10);
const THRESHOLD_TRENDING_TO_GRADUATED = parseInt(import.meta.env.VITE_THRESHOLD_TRENDING_TO_GRADUATED || '20', 10);

/**
 * Ensure job record exists in database
 * Creates job with lane='new' if it doesn't exist
 */
export async function ensureJobExists(jobId: string): Promise<void> {
  const { data: existingJob } = await supabase
    .from('jobs')
    .select('job_id')
    .eq('job_id', jobId)
    .single();

  if (!existingJob) {
    await supabase
      .from('jobs')
      .insert({
        job_id: jobId,
        lane: 'new',
        click_count: 0,
      });
  }
}

/**
 * Record a click - handles deduplication, click count increment, and lane migration
 * @returns Object with success status, whether already clicked, new lane if migrated, and current click count
 */
export async function recordClick(
  jobId: string,
  walletAddress: string
): Promise<{
  success: boolean;
  alreadyClicked: boolean;
  newLane?: Lane;
  clickCount: number;
}> {
  // Ensure job exists before recording click
  await ensureJobExists(jobId);

  // Try to insert click - will fail silently on duplicate due to unique constraint
  const { error: clickError } = await supabase
    .from('clicks')
    .insert({
      job_id: jobId,
      wallet_address: walletAddress,
    });

  // If constraint error, user already clicked this job
  if (clickError && clickError.code === '23505') {
    // Get current click count for the job
    const { data: jobData } = await supabase
      .from('jobs')
      .select('click_count')
      .eq('job_id', jobId)
      .single();

    return {
      success: false,
      alreadyClicked: true,
      clickCount: jobData?.click_count || 0,
    };
  }

  // Click was successfully recorded - increment click_count
  const { data: jobData } = await supabase
    .from('jobs')
    .select('click_count, lane')
    .eq('job_id', jobId)
    .single();

  const currentClickCount = (jobData?.click_count || 0) + 1;
  const currentLane = jobData?.lane || 'new';

  // Determine if migration is needed
  let newLane: Lane | undefined;
  if (currentClickCount >= THRESHOLD_TRENDING_TO_GRADUATED && currentLane === 'trending') {
    newLane = 'graduated';
  } else if (currentClickCount >= THRESHOLD_NEW_TO_TRENDING && currentLane === 'new') {
    newLane = 'trending';
  }

  // Update click count and lane if needed
  await supabase
    .from('jobs')
    .update({
      click_count: currentClickCount,
      ...(newLane && { lane: newLane }),
      updated_at: new Date().toISOString(),
    })
    .eq('job_id', jobId);

  return {
    success: true,
    alreadyClicked: false,
    newLane,
    clickCount: currentClickCount,
  };
}

/**
 * Check if user has already clicked a job
 */
export async function hasUserClicked(jobId: string, walletAddress: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('clicks')
    .select('id')
    .eq('job_id', jobId)
    .eq('wallet_address', walletAddress)
    .single();

  return !error && !!data;
}

/**
 * Get all job IDs user has clicked
 */
export async function getUserClickedJobs(walletAddress: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('clicks')
    .select('job_id')
    .eq('wallet_address', walletAddress);

  if (error || !data) {
    return [];
  }

  return data.map((click) => click.job_id);
}

/**
 * Get click count for a job
 */
export async function getClickCount(jobId: string): Promise<number> {
  const { data, error } = await supabase
    .from('jobs')
    .select('click_count')
    .eq('job_id', jobId)
    .single();

  if (error || !data) {
    return 0;
  }

  return data.click_count || 0;
}

/**
 * Get job lane status
 */
export async function getJobLane(jobId: string): Promise<JobWithLane | null> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('job_id', jobId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as JobWithLane;
}
