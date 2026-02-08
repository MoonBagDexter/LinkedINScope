import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { Job } from '../types/job';
import type { Lane } from '../types/kanban';

export interface JobWithClickCount extends Job {
  click_count: number;
  lane: Lane;
  created_at: string;
}

/**
 * Hook to fetch jobs organized by lane
 *
 * Strategy: Query Supabase jobs table (populated by Edge Function job-sync)
 * instead of JSearch API. This provides instant cached data and preserves API quota.
 *
 * Jobs without lane/click_count default to 'new' lane with 0 clicks.
 */
export function useLaneJobs() {
  // Fetch all active jobs from Supabase cache
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['cached-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .lte('created_at', new Date().toISOString())
        .order('last_seen', { ascending: false });

      if (error) throw error;

      // Map database columns to Job type
      return (data || []).map((row): JobWithClickCount => ({
        job_id: row.job_id,
        job_title: row.job_title,
        employer_name: row.employer_name,
        employer_logo: row.employer_logo,
        job_city: row.job_city,
        job_state: row.job_state,
        job_country: row.job_country,
        job_apply_link: row.job_apply_link,
        job_description: row.job_description,
        job_min_salary: row.job_min_salary,
        job_max_salary: row.job_max_salary,
        job_salary_currency: row.job_salary_currency,
        job_salary_period: row.job_salary_period,
        click_count: row.click_count ?? 0,
        lane: (row.lane as Lane) ?? 'new',
        created_at: row.created_at,
      }));
    },
    staleTime: 1000 * 30, // 30 seconds - jobs drip in with future timestamps
    refetchInterval: 1000 * 30, // Poll every 30s to reveal newly visible jobs
  });

  // Group jobs by lane
  const jobsByLane = useMemo(() => {
    if (!jobs) return { new: [], trending: [], graduated: [] };

    const result: Record<Lane, JobWithClickCount[]> = {
      new: [],
      trending: [],
      graduated: []
    };

    for (const job of jobs) {
      const lane = job.lane ?? 'new';
      result[lane].push(job);
    }

    // Sort each lane by newest first
    for (const lane of Object.keys(result) as Lane[]) {
      result[lane].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [jobs]);

  return {
    jobsByLane,
    isLoading,
    error
  };
}
