import { useState, useEffect, useRef } from 'react';
import { JobCard } from './JobCard';
import type { Lane } from '../types/kanban';
import type { JobWithClickCount } from '../hooks/useLaneJobs';

interface KanbanLaneProps {
  lane: Lane;
  jobs: JobWithClickCount[];
  title: string;
  onApplyClick: (jobId: string, applyLink: string) => void;
}

/**
 * Individual Kanban lane displaying jobs
 * New jobs slide in with animation as they appear from server-driven drip
 */
export function KanbanLane({
  jobs,
  title,
  onApplyClick,
}: KanbanLaneProps) {
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());
  const knownIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const newIds = jobs
      .map(j => j.job_id)
      .filter(id => !knownIds.current.has(id));

    // Update known set
    knownIds.current = new Set(jobs.map(j => j.job_id));

    if (newIds.length > 0 && knownIds.current.size > newIds.length) {
      // Only animate if these are additions (not initial load)
      setAnimatingIds(new Set(newIds));
      const timer = setTimeout(() => setAnimatingIds(new Set()), 300);
      return () => clearTimeout(timer);
    }
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
            <JobCard
              key={job.job_id}
              job={job}
              onApplyClick={(jobId, applyLink) => onApplyClick(jobId, applyLink)}
              isAnimating={animatingIds.has(job.job_id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
