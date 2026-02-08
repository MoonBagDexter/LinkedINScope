import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

/**
 * Hook for real-time job update subscriptions
 * - Listens for job-clicked and job-migrated broadcast events (click tracking)
 * - Listens for postgres INSERT on jobs table (new jobs from sync appear instantly)
 *
 * @param onMigration - Optional callback for handling migration events (e.g., showing toasts)
 */
export function useRealtimeSync(onMigration?: (payload: any) => void): void {
  const queryClient = useQueryClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Handler for click/migration broadcast events
    const handleJobUpdate = (payload: any) => {
      const { jobId, clickCount, newLane } = payload.payload || {};

      // Update cache directly for instant UI update
      queryClient.setQueryData(['cached-jobs'], (oldData: any[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((job: any) =>
          job.job_id === jobId
            ? { ...job, click_count: clickCount, lane: newLane || job.lane }
            : job
        );
      });

      // Call migration callback for migration events
      if (newLane && onMigration) {
        onMigration(payload);
      }
    };

    // Handler for new job inserts — debounced since syncs insert multiple rows at once
    const handleNewJob = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['cached-jobs'] });
      }, 500);
    };

    const channel = supabase
      .channel('jobs-updates')
      .on('broadcast', { event: 'job-clicked' }, handleJobUpdate)
      .on('broadcast', { event: 'job-migrated' }, handleJobUpdate)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'jobs' },
        handleNewJob
      )
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      channel.unsubscribe();
    };
  }, [queryClient, onMigration]);
}
