import { useState } from 'react';
import { useWallet } from '../contexts/WalletProvider';
import { useLaneJobs, type JobWithClickCount } from '../hooks/useLaneJobs';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { useApplications } from '../hooks/useApplications';
import { useCoinLaunch } from '../hooks/useCoinLaunch';
import { JobCard } from './JobCard';
import { ApplyForm } from './ApplyForm';
import { SharePrompt } from './SharePrompt';
import { MobileTabNav } from './MobileTabNav';
import type { Lane } from '../types/kanban';
import { toast } from 'sonner';

const JOBS_PER_PAGE = 10;

export function KanbanBoard() {
  const { address: walletAddress, connect: connectWallet } = useWallet();

  useRealtimeSync();

  const { jobsByLane, isLoading, error } = useLaneJobs();
  const { quickApply, submitApplication, getStatus } = useApplications(walletAddress ?? undefined);
  const { createCoinMetadata } = useCoinLaunch();

  const [activeMobileLane, setActiveMobileLane] = useState<Lane>('new');
  const [pages, setPages] = useState<Record<Lane, number>>({ new: 0, trending: 0, graduated: 0 });
  const [formJob, setFormJob] = useState<JobWithClickCount | null>(null);
  const [shareJob, setShareJob] = useState<{ job: JobWithClickCount; coinPhrase?: string; contractAddress?: string } | null>(null);

  // Flatten all jobs, then separate by user's application status
  const allJobs = [...jobsByLane.new, ...jobsByLane.trending, ...jobsByLane.graduated];
  const seen = new Set<string>();
  const uniqueJobs = allJobs.filter(j => { if (seen.has(j.job_id)) return false; seen.add(j.job_id); return true; });

  const newJobs = uniqueJobs.filter(j => getStatus(j.job_id) === 'none');
  const inProgressJobs = uniqueJobs.filter(j => getStatus(j.job_id) === 'in_progress');
  const appliedJobs = uniqueJobs.filter(j => getStatus(j.job_id) === 'applied');

  const laneData: Record<Lane, { title: string; jobs: JobWithClickCount[] }> = {
    new: { title: 'New Job Listings', jobs: newJobs },
    trending: { title: 'Application in Progress', jobs: inProgressJobs },
    graduated: { title: 'Applied For', jobs: appliedJobs },
  };

  const handleQuickApply = async (job: JobWithClickCount) => {
    if (!walletAddress) {
      connectWallet();
      return;
    }
    // Immediately move to in_progress
    await quickApply(job.job_id, walletAddress);
    toast.success('Moved to In Progress! Click "Apply Now" to complete.');
  };

  const handleOpenForm = (job: JobWithClickCount) => {
    // Open job link in new tab first
    window.open(job.job_apply_link, '_blank', 'noopener,noreferrer');
    // Then show the form
    setFormJob(job);
  };

  const handleSubmitForm = async (data: { name: string; age: string; availability: string; girthSize: string }) => {
    if (!walletAddress || !formJob) return;

    const app = await submitApplication({
      jobId: formJob.job_id,
      walletAddr: walletAddress,
      ...data,
    });

    const coin = await createCoinMetadata({
      applicationId: app.id,
      jobId: formJob.job_id,
      walletAddress: walletAddress,
      employerName: formJob.employer_name,
    });

    setFormJob(null);
    toast.success('Application submitted! 🚀');
    setShareJob({ job: formJob, coinPhrase: coin.coin_phrase, contractAddress: coin.contract_address });
  };

  const handleShareX = (job: JobWithClickCount) => {
    setShareJob({ job });
  };

  const paginate = (jobs: JobWithClickCount[], lane: Lane) => {
    const start = pages[lane] * JOBS_PER_PAGE;
    return jobs.slice(start, start + JOBS_PER_PAGE);
  };

  const totalPages = (jobs: JobWithClickCount[]) => Math.max(1, Math.ceil(jobs.length / JOBS_PER_PAGE));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-text-muted">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-semibold">Failed to load jobs</p>
        <p className="text-sm mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  const lanes: Lane[] = ['new', 'trending', 'graduated'];

  return (
    <div>
      <MobileTabNav activeLane={activeMobileLane} onLaneChange={setActiveMobileLane} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {lanes.map(lane => {
          const { title, jobs } = laneData[lane];
          const paged = paginate(jobs, lane);
          const tp = totalPages(jobs);

          return (
            <div key={lane} className={`${lane === activeMobileLane ? 'block' : 'hidden'} md:block`}>
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-sm font-bold tracking-wider text-text-primary uppercase">{title}</h2>
                <span className="text-xs bg-cream-dark border border-cream-border rounded-full px-2 py-0.5 text-text-muted">
                  {jobs.length}
                </span>
              </div>

              <div className="space-y-3">
                {paged.length === 0 ? (
                  <div className="text-center py-8 text-text-muted border border-cream-border bg-cream-dark rounded-lg">
                    {lane === 'trending' ? 'Click Quick Apply to start!' : lane === 'graduated' ? 'Complete an application to see it here' : 'No jobs yet'}
                  </div>
                ) : (
                  paged.map(job => (
                    <JobCard
                      key={job.job_id}
                      job={job}
                      appStatus={getStatus(job.job_id)}
                      onQuickApply={() => handleQuickApply(job)}
                      onOpenApplyForm={() => handleOpenForm(job)}
                      onShareX={() => handleShareX(job)}
                    />
                  ))
                )}
              </div>

              {tp > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => setPages(p => ({ ...p, [lane]: Math.max(0, p[lane] - 1) }))}
                    disabled={pages[lane] === 0}
                    className="px-3 py-1 text-sm rounded border border-cream-border hover:bg-cream-dark disabled:opacity-30 transition-colors"
                  >
                    ←
                  </button>
                  <span className="text-sm text-text-muted">{pages[lane] + 1} / {tp}</span>
                  <button
                    onClick={() => setPages(p => ({ ...p, [lane]: Math.min(tp - 1, p[lane] + 1) }))}
                    disabled={pages[lane] >= tp - 1}
                    className="px-3 py-1 text-sm rounded border border-cream-border hover:bg-cream-dark disabled:opacity-30 transition-colors"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {formJob && (
        <ApplyForm
          jobTitle={formJob.job_title}
          employerName={formJob.employer_name}
          onSubmit={handleSubmitForm}
          onClose={() => setFormJob(null)}
        />
      )}

      {shareJob && (
        <SharePrompt
          jobTitle={shareJob.job.job_title}
          employerName={shareJob.job.employer_name}
          coinPhrase={shareJob.coinPhrase}
          contractAddress={shareJob.contractAddress}
          onClose={() => setShareJob(null)}
        />
      )}
    </div>
  );
}
