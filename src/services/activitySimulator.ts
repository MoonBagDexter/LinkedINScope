import { supabase } from './supabase';

/**
 * Activity Simulator - Creates fake engagement for demo/testing
 *
 * Features:
 * - Simulates random job clicks
 * - Adds fake "degens online" to presence
 *
 * Usage: Call startSimulation() to begin, stopSimulation() to end
 */

let clickInterval: NodeJS.Timeout | null = null;
let presenceChannels: ReturnType<typeof supabase.channel>[] = [];

// Fake degen names for presence
const FAKE_DEGENS = [
  'anon_whale',
  'degen_andy',
  'paper_hands_pete',
  'diamond_hands_dave',
  'ape_together_strong',
  'ser_buys_dips',
  'wagmi_warrior',
  'ngmi_nancy',
  'rugged_rick',
  'moon_boy_mike',
];

/**
 * Start simulating activity
 * @param clicksPerMinute - How many random clicks per minute (default: 6)
 * @param fakeDegenCount - How many fake users to show online (default: 5)
 */
export async function startSimulation(
  clicksPerMinute: number = 6,
  fakeDegenCount: number = 5
): Promise<void> {
  console.log(`🤖 Starting activity simulation: ${clicksPerMinute} clicks/min, ${fakeDegenCount} fake degens`);

  // Add fake presence entries
  for (let i = 0; i < fakeDegenCount; i++) {
    const channel = supabase.channel(`lobby`, {
      config: { presence: { key: FAKE_DEGENS[i % FAKE_DEGENS.length] } },
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          online_at: new Date().toISOString(),
          is_bot: true,
        });
      }
    });

    presenceChannels.push(channel);
  }

  // Start random click simulation
  const intervalMs = (60 * 1000) / clicksPerMinute;
  clickInterval = setInterval(async () => {
    await simulateRandomClick();
  }, intervalMs);

  // Do one click immediately
  await simulateRandomClick();
}

/**
 * Stop all simulation activity
 */
export async function stopSimulation(): Promise<void> {
  console.log('🛑 Stopping activity simulation');

  // Stop click interval
  if (clickInterval) {
    clearInterval(clickInterval);
    clickInterval = null;
  }

  // Remove fake presence
  for (const channel of presenceChannels) {
    await channel.untrack();
    await channel.unsubscribe();
  }
  presenceChannels = [];
}

/**
 * Simulate a random click on a random job
 */
async function simulateRandomClick(): Promise<void> {
  try {
    // Get a random job from the 'new' or 'trending' lane
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('job_id, job_title, click_count, lane')
      .eq('is_active', true)
      .in('lane', ['new', 'trending'])
      .limit(20);

    if (error || !jobs || jobs.length === 0) {
      console.log('🤖 No jobs to click');
      return;
    }

    // Pick a random job
    const randomJob = jobs[Math.floor(Math.random() * jobs.length)];

    // Increment click count directly in database
    const newClickCount = (randomJob.click_count || 0) + 1;

    // Determine new lane based on thresholds
    let newLane = randomJob.lane;
    if (newClickCount >= 20 && randomJob.lane !== 'graduated') {
      newLane = 'graduated';
    } else if (newClickCount >= 5 && randomJob.lane === 'new') {
      newLane = 'trending';
    }

    // Update the job
    const { error: updateError } = await supabase
      .from('jobs')
      .update({ click_count: newClickCount, lane: newLane })
      .eq('job_id', randomJob.job_id);

    if (updateError) {
      console.error('🤖 Click failed:', updateError);
      return;
    }

    // Broadcast the click to all users
    const channel = supabase.channel('jobs-updates');
    const event = newLane !== randomJob.lane ? 'job-migrated' : 'job-clicked';

    channel.send({
      type: 'broadcast',
      event,
      payload: {
        jobId: randomJob.job_id,
        jobTitle: randomJob.job_title,
        newLane: newLane !== randomJob.lane ? newLane : undefined,
        clickCount: newClickCount,
      },
    });

    console.log(`🤖 Bot clicked "${randomJob.job_title}" (${newClickCount} clicks, ${newLane} lane)`);
  } catch (err) {
    console.error('🤖 Simulation error:', err);
  }
}

// Expose to window for easy console access in dev
if (typeof window !== 'undefined') {
  (window as any).activitySimulator = {
    start: startSimulation,
    stop: stopSimulation,
  };
}
