import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useJobs } from './useJobs';
import type { Job } from '../types/job';
import type { Lane } from '../types/kanban';

export interface JobWithClickCount extends Job {
  click_count: number;
  lane: Lane;
}

/**
 * Hook to fetch jobs organized by lane
 *
 * Strategy: Fetch jobs from JSearch API, fetch lane assignments from Supabase,
 * then merge client-side to avoid duplicating job content in database.
 *
 * Jobs not yet in Supabase default to 'new' lane with 0 clicks.
 */
export function useLaneJobs() {
  // Fetch jobs from JSearch API
  const { data: apiJobs, isLoading: apiLoading, error: apiError } = useJobs();

  // Fetch lane assignments from Supabase
  const { data: laneData, isLoading: laneLoading } = useQuery({
    queryKey: ['lane-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('job_id, lane, click_count');
      if (error) throw error;
      return data as { job_id: string; lane: Lane; click_count: number }[];
    },
    staleTime: 1000 * 30, // 30 seconds - lane data changes frequently with clicks
  });

  // Combine: assign lane to each job, default to 'new' if not in Supabase yet
  const jobsByLane = useMemo(() => {
    if (!apiJobs) return { new: [], trending: [], graduated: [] };

    const laneMap = new Map(laneData?.map(l => [l.job_id, l]) ?? []);

    const result: Record<Lane, JobWithClickCount[]> = {
      new: [],
      trending: [],
      graduated: []
    };

    for (const job of apiJobs) {
      const laneInfo = laneMap.get(job.job_id);
      const lane = laneInfo?.lane ?? 'new';
      const click_count = laneInfo?.click_count ?? 0;
      result[lane].push({ ...job, click_count, lane });
    }

    return result;
  }, [apiJobs, laneData]);

  return {
    jobsByLane,
    isLoading: apiLoading || laneLoading,
    error: apiError
  };
}
