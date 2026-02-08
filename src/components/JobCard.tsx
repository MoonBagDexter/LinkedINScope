import { useState, useEffect } from 'react';
import type { JobWithClickCount } from '../hooks/useLaneJobs';

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

    // Tick every second for the first minute, then every 30s
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
}

/**
 * Individual job card component
 * Displays job title, company, location, and salary (if available) with Quick Apply CTA
 */
export function JobCard({ job, onApplyClick, isAnimating = false }: JobCardProps) {
  const postedAgo = useTimeAgo(job.created_at);

  const formatLocation = () => {
    const parts = [job.job_city, job.job_state].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  };

  const formatSalary = (): string | null => {
    if (job.job_min_salary && job.job_max_salary) {
      const period = job.job_salary_period || 'YEAR';
      const periodLabel = period === 'HOUR' ? '/hr' : period === 'YEAR' ? '/yr' : `/${period.toLowerCase()}`;
      return `$${job.job_min_salary.toLocaleString()} - $${job.job_max_salary.toLocaleString()}${periodLabel}`;
    }
    if (job.job_min_salary) {
      return `From $${job.job_min_salary.toLocaleString()}`;
    }
    if (job.job_max_salary) {
      return `Up to $${job.job_max_salary.toLocaleString()}`;
    }
    return null;
  };

  const handleApplyClick = () => {
    onApplyClick(job.job_id, job.job_apply_link);
  };

  const salary = formatSalary();

  return (
    <div className={`relative bg-black border border-purple-500/50 rounded-lg p-4 hover:shadow-lg hover:border-purple-400 hover:shadow-purple-500/20 transition-all duration-200 ${isAnimating ? 'animate-[slideIn_250ms_cubic-bezier(0.215,0.61,0.355,1)]' : ''}`}>
      {/* Main content area with job info */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          {/* Job Title */}
          <h3 className="text-lg font-bold text-white mb-1 leading-tight">
            {job.job_title}
          </h3>

          {/* Company Name */}
          <p className="text-gray-400 text-sm mb-2">
            {job.employer_name}
          </p>

          {/* Location and Salary */}
          <div className="flex flex-col gap-1">
            <p className="text-gray-300 text-sm">
              {formatLocation()}
            </p>
            {salary && (
              <p className="text-green-400 text-sm font-medium">
                {salary}
              </p>
            )}
          </div>

          {/* Posted time - updates live */}
          {postedAgo && (
            <p className="text-gray-500 text-xs mt-2">
              Posted {postedAgo}
            </p>
          )}
        </div>

        {/* Quick Apply Button */}
        <button
          onClick={handleApplyClick}
          className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/30 flex items-center justify-center"
          title="Quick Apply"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
