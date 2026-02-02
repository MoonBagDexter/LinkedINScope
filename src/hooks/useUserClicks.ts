import { useQuery } from '@tanstack/react-query';
import { getUserClickedJobs } from '../services/clickTracker';

/**
 * Hook to fetch all jobs a user has clicked
 * Used to display "Already applied" badges on clicked jobs
 *
 * @param walletAddress - User's wallet address (undefined if not connected)
 * @returns Set of clicked job IDs and loading state
 */
export function useUserClicks(walletAddress: string | undefined) {
  const query = useQuery({
    queryKey: ['user-clicks', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return [];
      return await getUserClickedJobs(walletAddress);
    },
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 5, // 5 minutes - clicks don't change frequently
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  return {
    clickedJobIds: new Set(query.data || []),
    isLoading: query.isLoading,
  };
}
