import type { Job } from '../types/job';

interface JobCardProps {
  job: Job;
  onApplyClick: (jobId: string, applyLink: string) => void;
}

/**
 * Individual job card component
 * Displays job title, company, location, and salary with Quick Apply CTA
 * Styled with degen aesthetic - black bg, purple border, gradient button
 */
export function JobCard({ job, onApplyClick }: JobCardProps) {
  // Format location, handling missing values gracefully
  const formatLocation = () => {
    const parts = [job.job_city, job.job_state].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  };

  // Format salary range, showing "Pay info not listed" if not available
  const formatSalary = () => {
    if (job.job_min_salary && job.job_max_salary) {
      const currency = job.job_salary_currency || 'USD';
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
    return 'Pay info not listed';
  };

  const handleApplyClick = () => {
    onApplyClick(job.job_id, job.job_apply_link);
  };

  return (
    <div className="bg-black border border-purple-500/50 rounded-lg p-4 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-200">
      {/* Job Title */}
      <h3 className="text-lg font-bold text-white mb-1 leading-tight">
        {job.job_title}
      </h3>

      {/* Company Name */}
      <p className="text-gray-400 text-sm mb-2">
        {job.employer_name}
      </p>

      {/* Location and Salary */}
      <div className="flex flex-col gap-1 mb-4">
        <p className="text-gray-300 text-sm">
          {formatLocation()}
        </p>
        <p className="text-green-400 text-sm font-medium">
          {formatSalary()}
        </p>
      </div>

      {/* Quick Apply Button - Bold, prominent CTA */}
      <button
        onClick={handleApplyClick}
        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/30"
      >
        Quick Apply
      </button>
    </div>
  );
}
