import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recordClick } from '../services/clickTracker';
import { toast } from 'sonner';
import { supabase } from '../services/supabase';
import type { Lane } from '../types/kanban';

interface TrackClickParams {
  jobId: string;
  walletAddress: string;
  jobTitle?: string;
}

interface TrackClickResult {
  success: boolean;
  alreadyClicked: boolean;
  newLane?: Lane;
  clickCount: number;
}

/**
 * Hook for tracking job clicks with optimistic updates
 * Handles click recording, deduplication, and lane migration notifications
 */
export function useClickTracking() {
  const queryClient = useQueryClient();

  const mutation = useMutation<TrackClickResult, Error, TrackClickParams>({
    mutationFn: async ({ jobId, walletAddress }) => {
      return await recordClick(jobId, walletAddress);
    },
    onSuccess: (data, variables) => {
      if (data.alreadyClicked) {
        toast.info('Already sent it, anon', {
          description: 'Your click was recorded earlier',
        });
      } else if (data.success) {
        // Show migration toast if job moved to new lane (degen style)
        if (data.newLane === 'trending') {
          toast.success('LFG! Job is pumping', {
            description: `"${variables.jobTitle || 'Job'}" hit Trending lane`,
          });
        } else if (data.newLane === 'graduated') {
          toast.success('Job to the moon!', {
            description: `"${variables.jobTitle || 'Job'}" graduated - top tier now`,
          });
        } else {
          toast.success('Click recorded, fren', {
            description: `${data.clickCount} total clicks`,
          });
        }

        // Broadcast migration events to all users via realtime
        if (data.newLane === 'trending' || data.newLane === 'graduated') {
          const channel = supabase.channel('jobs-updates');
          channel.send({
            type: 'broadcast',
            event: 'job-migrated',
            payload: {
              jobId: variables.jobId,
              jobTitle: variables.jobTitle,
              newLane: data.newLane,
              clickCount: data.clickCount,
            },
          });
        }

        // Invalidate relevant queries to refresh UI
        queryClient.invalidateQueries({ queryKey: ['lane-jobs'] });
        queryClient.invalidateQueries({ queryKey: ['user-clicks', variables.walletAddress] });
      }
    },
    onError: (error) => {
      toast.error('Rekt! Click failed', {
        description: error.message || 'Try again ser',
      });
    },
  });

  return {
    trackClick: mutation.mutate,
    isTracking: mutation.isPending,
    error: mutation.error,
  };
}
