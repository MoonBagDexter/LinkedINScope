import { useState, useEffect } from 'react';
import type { JobWithClickCount } from '../hooks/useLaneJobs';
import type { Lane } from '../types/kanban';
import { getCompanyColor, getCompanyInitials } from '../utils/companyLogo';

function timeAgo(dateString: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(dateString).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function useTimeAgo(dateString: string | undefined): string {
  const [display, setDisplay] = useState(() => dateString ? timeAgo(dateString) : '');

  useEffect(() => {
    if (!dateString) return;
    setDisplay(timeAgo(dateString));

    const tick = () => {
      const age = Date.now() - new Date(dateString).getTime();
      return age < 60_000 ? 1_000 : 30_000;
    };

    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        setDisplay(timeAgo(dateString));
        schedule();
      }, tick());
    };
    schedule();

    return () => clearTimeout(timer);
  }, [dateString]);

  return display;
}

interface JobCardProps {
  job: JobWithClickCount;
  onApplyClick: (jobId: string, applyLink: string) => void;
  isAnimating?: boolean;
  lane: Lane;
}

export function JobCard({ job, onApplyClick, isAnimating = false, lane }: JobCardProps) {
  const postedAgo = useTimeAgo(job.created_at);

  const formatLocation = () => {
    const parts = [job.job_city, job.job_state].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  };

  const handleApplyClick = () => {
    onApplyClick(job.job_id, job.job_apply_link);
  };

  const buttonLabel = lane === 'graduated' ? 'Applied' : 'Quick Apply';
  const initials = getCompanyInitials(job.employer_name);
  const logoColor = getCompanyColor(job.employer_name);

  return (
    <div className={`bg-cream-dark border border-cream-border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${isAnimating ? 'animate-[slideIn_250ms_cubic-bezier(0.215,0.61,0.355,1)]' : ''}`}>
      <div className="flex items-center gap-4">
        {/* Company logo / initials */}
        <div
          className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: logoColor }}
        >
          {job.employer_logo ? (
            <img
              src={job.employer_logo}
              alt={job.employer_name}
              className="w-14 h-14 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.textContent = initials;
              }}
            />
          ) : (
            initials
          )}
        </div>

        {/* Job info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-text-primary leading-tight truncate">
            {job.job_title}
          </h3>
          <p className="text-text-secondary text-sm">
            {job.employer_name}
          </p>
          <p className="text-text-muted text-sm">
            {formatLocation()}
          </p>
          {postedAgo && (
            <span className="text-text-muted text-xs mt-1">
              Posted {postedAgo}
            </span>
          )}
        </div>

        {/* Action button */}
        <button
          onClick={handleApplyClick}
          className="flex-shrink-0 bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
