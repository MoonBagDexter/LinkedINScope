import { useState, useEffect } from 'react';
import type { JobWithClickCount } from '../hooks/useLaneJobs';
import { getCompanyColor, getCompanyInitials } from '../utils/companyLogo';

function timeAgo(dateString: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(dateString).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface JobCardProps {
  job: JobWithClickCount;
  appStatus: 'none' | 'in_progress' | 'applied';
  onQuickApply: () => void;
  onOpenApplyForm: () => void;
  onShareX: () => void;
  isAnimating?: boolean;
}

export function JobCard({ job, appStatus, onQuickApply, onOpenApplyForm, onShareX, isAnimating = false }: JobCardProps) {
  const [postedAgo, setPostedAgo] = useState(() => job.created_at ? timeAgo(job.created_at) : '');

  useEffect(() => {
    if (!job.created_at) return;
    setPostedAgo(timeAgo(job.created_at));
    const id = setInterval(() => setPostedAgo(timeAgo(job.created_at)), 30000);
    return () => clearInterval(id);
  }, [job.created_at]);

  const initials = getCompanyInitials(job.employer_name);
  const logoColor = getCompanyColor(job.employer_name);
  const logoUrl = `https://logo.clearbit.com/${job.employer_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

  const location = [job.job_city, job.job_state].filter(Boolean).join(', ') || 'Location not specified';

  return (
    <div className={`bg-cream-dark border border-cream-border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${isAnimating ? 'animate-[slideIn_250ms_cubic-bezier(0.215,0.61,0.355,1)]' : ''}`}>
      <div className="flex items-center gap-4">
        {/* Company logo */}
        <div
          className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden"
          style={{ backgroundColor: logoColor }}
        >
          <img
            src={job.employer_logo || logoUrl}
            alt={job.employer_name}
            className="w-14 h-14 rounded-full object-cover"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = 'none';
              el.parentElement!.textContent = initials;
            }}
          />
        </div>

        {/* Job info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-text-primary leading-tight truncate">{job.job_title}</h3>
          <p className="text-text-secondary text-sm">{job.employer_name}</p>
          <p className="text-text-muted text-sm">{location}</p>
          {postedAgo && <span className="text-text-muted text-xs">Posted {postedAgo}</span>}
        </div>

        {/* Action button based on status */}
        <div className="flex-shrink-0">
          {appStatus === 'none' && (
            <button
              onClick={onQuickApply}
              className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Quick Apply
            </button>
          )}

          {appStatus === 'in_progress' && (
            <button
              onClick={onOpenApplyForm}
              className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors animate-pulse"
            >
              ⭐ Apply Now
            </button>
          )}

          {appStatus === 'applied' && (
            <button
              onClick={onShareX}
              className="bg-black hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-transform hover:scale-105 animate-pulse"
            >
              Share on 𝕏
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
