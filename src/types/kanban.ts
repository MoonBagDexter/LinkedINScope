/**
 * Job lane types for kanban board
 * new: 0-4 clicks
 * trending: 5-19 clicks
 * graduated: 20+ clicks
 */
export type Lane = 'new' | 'trending' | 'graduated';

/**
 * Job record in database with lane and click tracking
 */
export interface JobWithLane {
  job_id: string;
  lane: Lane;
  click_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Click record tracking user engagement with jobs
 */
export interface Click {
  id: string;
  job_id: string;
  wallet_address: string;
  clicked_at: string;
}
