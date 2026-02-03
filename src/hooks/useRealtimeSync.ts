import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

/**
 * Hook for real-time job update subscriptions
 * Listens for job-migrated events and invalidates React Query cache
 *
 * @param onMigration - Optional callback for handling migration events (e.g., showing toasts)
 */
export function useRealtimeSync(onMigration?: (payload: any) => void): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('jobs-updates')
      .on('broadcast', { event: 'job-migrated' }, (payload) => {
        // Invalidate cached jobs to trigger refetch
        queryClient.invalidateQueries({
          queryKey: ['cached-jobs'],
          refetchType: 'active', // Only refetch if query is currently active
        });

        // Call optional migration callback if provided
        onMigration?.(payload);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient, onMigration]);
}
