import { useQuery } from '@tanstack/react-query';
import { searchJobs } from '../services/jsearch';

/**
 * @deprecated This hook is no longer used by the frontend.
 * Jobs are now fetched from Supabase cache (see useLaneJobs.ts) instead of JSearch API.
 * This preserves API quota and provides instant cached data.
 *
 * Backend Edge Function (job-sync) handles JSearch API calls and populates Supabase.
 *
 * Kept for reference only - safe to delete after Phase 2.5 verification.
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
