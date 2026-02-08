import { useJobs } from '../hooks/useJobs';
import { JobCard } from './JobCard';
import type { JobWithClickCount } from '../hooks/useLaneJobs';

export function JobList() {
  const { data: jobs, isLoading, error } = useJobs();

  const handleApplyClick = (jobId: string, applyLink: string) => {
    console.log('[JobClick] User clicked Quick Apply:', {
      job_id: jobId,
      timestamp: new Date().toISOString(),
    });

    window.open(applyLink, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-pulse">
          <div className="text-2xl font-bold text-primary">
            Finding jobs...
          </div>
        </div>
        <p className="text-text-muted mt-2 text-sm">
          Searching for the best opportunities
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-xl font-bold text-red-700 mb-2">
          Couldn't fetch jobs
        </div>
        <p className="text-text-secondary text-sm text-center max-w-md">
          {error instanceof Error ? error.message : 'Something went wrong'}
        </p>
        <p className="text-text-muted text-xs mt-4">
          Make sure your VITE_JSEARCH_API_KEY is set in .env.local
        </p>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-xl font-bold text-text-secondary mb-2">
          No jobs found
        </div>
        <p className="text-text-muted text-sm">
          No matching positions right now. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="text-sm text-text-muted mb-4">
        {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
      </div>
      {jobs.map((job) => (
        <JobCard
          key={job.job_id}
          job={job as unknown as JobWithClickCount}
          onApplyClick={handleApplyClick}
          lane="new"
        />
      ))}
    </div>
  );
}
