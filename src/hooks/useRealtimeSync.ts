import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

/**
 * Hook for real-time job update subscriptions
 * Listens for job-clicked and job-migrated events and updates cache directly
 *
 * @param onMigration - Optional callback for handling migration events (e.g., showing toasts)
 */
export function useRealtimeSync(onMigration?: (payload: any) => void): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Handler for all job update events
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

    const channel = supabase
      .channel('jobs-updates')
      .on('broadcast', { event: 'job-clicked' }, handleJobUpdate)
      .on('broadcast', { event: 'job-migrated' }, handleJobUpdate)
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient, onMigration]);
}
