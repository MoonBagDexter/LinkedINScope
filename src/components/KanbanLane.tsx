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
