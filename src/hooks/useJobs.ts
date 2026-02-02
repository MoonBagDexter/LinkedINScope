import { useQuery } from '@tanstack/react-query';
import { searchJobs } from '../services/jsearch';

/**
 * React Query hook for fetching job listings
 * Uses default search query "fast food crew member USA" if not provided
 *
 * Caching is configured at QueryClient level (24h stale, 48h gc)
 * to preserve JSearch API quota (500 req/month free tier)
 */
export function useJobs(searchQuery?: string) {
  const query = searchQuery || 'fast food crew member USA';

  return useQuery({
    queryKey: ['jobs', query],
    queryFn: () => searchJobs({ query }),
    // Enabled by default - fetches on mount
    enabled: true,
  });
}
