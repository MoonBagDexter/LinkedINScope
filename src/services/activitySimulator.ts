import { supabase } from './supabase';

/**
 * Activity Simulator - Runs 24/7 in background to maintain engagement
 *
 * Constraints:
 * - Only runs when Trending < 5 jobs and Graduated < 3 jobs
 * - Won't click jobs that would overflow higher lanes
 * - Fake degens appear temporarily around clicks, then leave
 */

let isRunning = false;
let broadcastChannel: ReturnType<typeof supabase.channel> | null = null;

// Thresholds
const TRENDING_THRESHOLD = 5;  // Clicks needed to move new -> trending
const GRADUATED_THRESHOLD = 20; // Clicks needed to move trending -> graduated

// Lane limits
const MAX_TRENDING = 5;
const MAX_GRADUATED = 3;

// Fake degen names for presence
const FAKE_DEGENS = [
  'anon_whale',
  'degen_andy',
  'paper_hands_pete',
  'diamond_hands_dave',
  'ape_together_strong',
  'wagmi_warrior',
  'moon_boy_mike',
  'ser_buys_dips',
];

/**
 * Initialize and start the background simulator
 * Called automatically on app load
 */
export async function initSimulator(): Promise<void> {
  if (isRunning) return;
  isRunning = true;

  // Initialize broadcast channel (must subscribe before sending)
  broadcastChannel = supabase.channel('jobs-updates');
  broadcastChannel.subscribe();

  // Start click simulation - check every 10 seconds
  setInterval(async () => {
    await simulateClickIfNeeded();
  }, 10000);

  // Initial check after 5 seconds
  setTimeout(() => simulateClickIfNeeded(), 5000);
}

/**
 * Add a temporary fake degen to presence, then remove after delay
 */
async function addTemporaryDegen(durationMs: number = 15000): Promise<void> {
  const degenName = FAKE_DEGENS[Math.floor(Math.random() * FAKE_DEGENS.length)];
  const uniqueKey = `bot_${degenName}_${Date.now()}`;

  const channel = supabase.channel('lobby', {
    config: { presence: { key: uniqueKey } },
  });

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        online_at: new Date().toISOString(),
      });

      // Remove after duration
      setTimeout(async () => {
        await channel.untrack();
        await channel.unsubscribe();
      }, durationMs);
    }
  });
}

/**
 * Check lane counts and simulate a click if conditions allow
 */
async function simulateClickIfNeeded(): Promise<void> {
  try {
    // Get current lane counts
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('job_id, job_title, click_count, lane')
      .eq('is_active', true);

    if (error || !jobs) return;

    const laneCounts = {
      new: jobs.filter(j => j.lane === 'new').length,
      trending: jobs.filter(j => j.lane === 'trending').length,
      graduated: jobs.filter(j => j.lane === 'graduated').length,
    };

    // Check if we should run at all
    if (laneCounts.trending >= MAX_TRENDING && laneCounts.graduated >= MAX_GRADUATED) {
      return;
    }

    // Find a job we can safely click
    const jobToClick = findSafeJobToClick(jobs, laneCounts);

    if (jobToClick) {
      // Add temporary degen presence (stays 10-30 seconds)
      const duration = 10000 + Math.random() * 20000;
      addTemporaryDegen(duration);

      // Click the job
      await clickJob(jobToClick);
    }
  } catch {
    // Silent fail
  }
}

/**
 * Find a job that can be clicked without overflowing higher lanes
 */
function findSafeJobToClick(
  jobs: Array<{ job_id: string; job_title: string; click_count: number; lane: string }>,
  laneCounts: { new: number; trending: number; graduated: number }
): { job_id: string; job_title: string; click_count: number; lane: string } | null {

  // Priority 1: Click trending jobs if graduated has room
  if (laneCounts.graduated < MAX_GRADUATED) {
    const trendingJobs = jobs.filter(j => j.lane === 'trending');

    // Find jobs that WON'T graduate with one more click (safeguard)
    const safeTrendingJobs = trendingJobs.filter(j =>
      (j.click_count || 0) + 1 < GRADUATED_THRESHOLD
    );

    // Or if graduated has room for more, allow jobs near threshold
    const nearThresholdJobs = laneCounts.graduated < MAX_GRADUATED - 1
      ? trendingJobs.filter(j => (j.click_count || 0) + 1 >= GRADUATED_THRESHOLD)
      : [];

    const clickableTrending = [...safeTrendingJobs, ...nearThresholdJobs];
    if (clickableTrending.length > 0) {
      return clickableTrending[Math.floor(Math.random() * clickableTrending.length)];
    }
  }

  // Priority 2: Click new jobs if trending has room
  if (laneCounts.trending < MAX_TRENDING) {
    const newJobs = jobs.filter(j => j.lane === 'new');

    // Find jobs that WON'T move to trending with one more click (safeguard)
    const safeNewJobs = newJobs.filter(j =>
      (j.click_count || 0) + 1 < TRENDING_THRESHOLD
    );

    // Or if trending has room for more, allow jobs near threshold
    const nearThresholdJobs = laneCounts.trending < MAX_TRENDING - 1
      ? newJobs.filter(j => (j.click_count || 0) + 1 >= TRENDING_THRESHOLD)
      : [];

    const clickableNew = [...safeNewJobs, ...nearThresholdJobs];
    if (clickableNew.length > 0) {
      return clickableNew[Math.floor(Math.random() * clickableNew.length)];
    }
  }

  return null;
}

/**
 * Execute a click on a job
 */
async function clickJob(job: { job_id: string; job_title: string; click_count: number; lane: string }): Promise<void> {
  const newClickCount = (job.click_count || 0) + 1;

  // Determine new lane based on thresholds
  let newLane = job.lane;
  if (newClickCount >= GRADUATED_THRESHOLD && job.lane === 'trending') {
    newLane = 'graduated';
  } else if (newClickCount >= TRENDING_THRESHOLD && job.lane === 'new') {
    newLane = 'trending';
  }

  // Update the job in database
  const { error } = await supabase
    .from('jobs')
    .update({ click_count: newClickCount, lane: newLane })
    .eq('job_id', job.job_id);

  if (error) return;

  // Broadcast to all users via the subscribed channel
  if (broadcastChannel) {
    broadcastChannel.send({
      type: 'broadcast',
      event: newLane !== job.lane ? 'job-migrated' : 'job-clicked',
      payload: {
        jobId: job.job_id,
        jobTitle: job.job_title,
        newLane: newLane !== job.lane ? newLane : undefined,
        clickCount: newClickCount,
      },
    });
  }
}

// Auto-start when module loads
initSimulator();
