import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

/**
 * Hook for real-time job update subscriptions
 * Listens for postgres INSERT on jobs table so new jobs from sync appear instantly
 */
export function useRealtimeSync(): void {
  const queryClient = useQueryClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Handler for new job inserts — debounced since syncs insert multiple rows at once
    const handleNewJob = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['cached-jobs'] });
      }, 500);
    };

    const channel = supabase
      .channel('jobs-updates')
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
  }, [queryClient]);
}
