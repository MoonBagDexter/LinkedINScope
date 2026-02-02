import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recordClick } from '../services/clickTracker';
import { toast } from 'sonner';
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
        toast.info('You\'ve already applied to this job', {
          description: 'Click recorded earlier',
        });
      } else if (data.success) {
        // Show migration toast if job moved to new lane
        if (data.newLane === 'trending') {
          toast.success(`🔥 "${variables.jobTitle || 'Job'}" is now trending!`, {
            description: `Reached ${data.clickCount} clicks`,
          });
        } else if (data.newLane === 'graduated') {
          toast.success(`🚀 "${variables.jobTitle || 'Job'}" graduated!`, {
            description: `Reached ${data.clickCount} clicks - now in top tier`,
          });
        } else {
          toast.success('Click recorded!', {
            description: `${data.clickCount} total clicks`,
          });
        }

        // Invalidate relevant queries to refresh UI
        queryClient.invalidateQueries({ queryKey: ['lane-jobs'] });
        queryClient.invalidateQueries({ queryKey: ['user-clicks', variables.walletAddress] });
      }
    },
    onError: (error) => {
      toast.error('Failed to record click', {
        description: error.message || 'Please try again',
      });
    },
  });

  return {
    trackClick: mutation.mutate,
    isTracking: mutation.isPending,
    error: mutation.error,
  };
}
