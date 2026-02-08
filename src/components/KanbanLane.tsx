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

export function KanbanLane({
  lane,
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

    knownIds.current = new Set(jobs.map(j => j.job_id));

    if (newIds.length > 0 && knownIds.current.size > newIds.length) {
      setAnimatingIds(new Set(newIds));
      const timer = setTimeout(() => setAnimatingIds(new Set()), 300);
      return () => clearTimeout(timer);
    }
  }, [jobs]);

  return (
    <div className="flex flex-col">
      {/* Lane header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-sm font-bold tracking-wider text-text-primary uppercase">
          {title}
        </h2>
        <span className="text-xs bg-cream-dark border border-cream-border rounded-full px-2 py-0.5 text-text-muted">
          {jobs.length}
        </span>
      </div>

      {/* Jobs list */}
      <div className="space-y-3">
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-text-muted border border-cream-border bg-cream-dark rounded-lg">
            No jobs in this lane yet
          </div>
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job.job_id}
              job={job}
              lane={lane}
              onApplyClick={(jobId, applyLink) => onApplyClick(jobId, applyLink)}
              isAnimating={animatingIds.has(job.job_id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
