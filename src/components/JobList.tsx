import { useJobs } from '../hooks/useJobs';
import { JobCard } from './JobCard';
import type { JobWithClickCount } from '../hooks/useLaneJobs';

/**
 * Job listing container component
 * Fetches jobs on mount and displays as stacked full-width cards
 * Handles loading, error, and empty states with degen flair
 */
export function JobList() {
  const { data: jobs, isLoading, error } = useJobs();

  /**
   * Handle Quick Apply click
   * Logs click event with job_id (Phase 2 tracking foundation)
   * Opens original job posting in new tab
   */
  const handleApplyClick = (jobId: string, applyLink: string) => {
    // Log click event for Phase 2 click tracking
    console.log('[JobClick] User clicked Quick Apply:', {
      job_id: jobId,
      timestamp: new Date().toISOString(),
    });

    // Open original job posting in new tab
    window.open(applyLink, '_blank', 'noopener,noreferrer');
  };

  // Loading state with degen flair
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-pulse">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Finding you some shifts...
          </div>
        </div>
        <p className="text-gray-500 mt-2 text-sm">
          Solana might be nuking, but at least you can flip burgers
        </p>
      </div>
    );
  }

  // Error state with helpful message
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-xl font-bold text-red-400 mb-2">
          Oops, couldn't fetch jobs
        </div>
        <p className="text-gray-400 text-sm text-center max-w-md">
          {error instanceof Error ? error.message : 'Something went wrong'}
        </p>
        <p className="text-gray-600 text-xs mt-4">
          Make sure your VITE_JSEARCH_API_KEY is set in .env.local
        </p>
      </div>
    );
  }

  // Empty state
  if (!jobs || jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-xl font-bold text-gray-400 mb-2">
          No jobs found
        </div>
        <p className="text-gray-600 text-sm">
          Even fast food isn't hiring right now? That's rough.
        </p>
      </div>
    );
  }

  // Success state - render job cards
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="text-sm text-gray-500 mb-4">
        {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
      </div>
      {jobs.map((job) => (
        <JobCard
          key={job.job_id}
          job={job as unknown as JobWithClickCount}
          onApplyClick={handleApplyClick}
        />
      ))}
    </div>
  );
}
