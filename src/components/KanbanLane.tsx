import { useState, useEffect, useRef } from 'react';
import { JobCard } from './JobCard';
import { ProgressBar } from './ProgressBar';
import type { Lane } from '../types/kanban';
import type { JobWithClickCount } from '../hooks/useLaneJobs';

interface KanbanLaneProps {
  lane: Lane;
  jobs: JobWithClickCount[];
  title: string;
  walletAddress?: string;
  clickedJobIds?: Set<string>;
  onApplyClick: (jobId: string, applyLink: string, jobTitle: string) => void;
}

/**
 * Individual Kanban lane displaying jobs
 * Renders job cards with progress bars (except graduated lane)
 */
export function KanbanLane({
  lane,
  jobs,
  title,
  walletAddress,
  clickedJobIds,
  onApplyClick,
}: KanbanLaneProps) {
  // Track which jobs are animating (recently migrated to this lane)
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());
  const prevJobIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentIds = new Set(jobs.map(j => j.job_id));
    const newIds = [...currentIds].filter(id => !prevJobIds.current.has(id));

    if (newIds.length > 0) {
      setAnimatingIds(new Set(newIds));
      // Clear animation state after animation completes (300ms to allow 250ms animation + buffer)
      const timer = setTimeout(() => setAnimatingIds(new Set()), 300);
      return () => clearTimeout(timer);
    }

    prevJobIds.current = currentIds;
  }, [jobs]);

  return (
    <div className="flex flex-col">
      {/* Lane header */}
      <h2 className="text-xl font-bold text-white mb-4 px-2">
        {title}
      </h2>

      {/* Jobs list */}
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border border-purple-500/20 rounded-lg">
            No jobs in this lane yet
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.job_id}>
              <JobCard
                job={job}
                onApplyClick={(jobId, applyLink) => onApplyClick(jobId, applyLink, job.job_title)}
                walletAddress={walletAddress}
                hasClicked={clickedJobIds?.has(job.job_id)}
                isAnimating={animatingIds.has(job.job_id)}
              />
              {/* Progress bar below each card (except graduated) */}
              <ProgressBar current={job.click_count} lane={lane} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
