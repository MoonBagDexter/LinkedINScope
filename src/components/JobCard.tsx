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
          {/* Social placeholders + posted time */}
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1.5">
              {/* X icon placeholder */}
              <svg className="w-3.5 h-3.5 text-text-muted" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              {/* Globe icon placeholder */}
              <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-4.247m0 0A8.966 8.966 0 013 12c0-1.528.382-2.966 1.054-4.229" />
              </svg>
            </div>
            {postedAgo && (
              <span className="text-text-muted text-xs">
                Posted {postedAgo}
              </span>
            )}
          </div>
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
