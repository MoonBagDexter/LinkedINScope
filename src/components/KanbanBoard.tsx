import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth/solana';
import { useLaneJobs } from '../hooks/useLaneJobs';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { useApplications } from '../hooks/useApplications';
import { useCoinLaunch } from '../hooks/useCoinLaunch';
import { JobCard } from './JobCard';
import { ApplyForm } from './ApplyForm';
import { SharePrompt } from './SharePrompt';
import { MobileTabNav } from './MobileTabNav';
import type { Lane } from '../types/kanban';
import type { JobWithClickCount } from '../hooks/useLaneJobs';
import { toast } from 'sonner';

const JOBS_PER_PAGE = 10;

export function KanbanBoard() {
  const { connectWallet } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets[0];

  useRealtimeSync();

  const { jobsByLane, isLoading, error } = useLaneJobs();
  const { applications, quickApply, submitApplication, getStatus } = useApplications(wallet?.address);
  const { createCoinMetadata } = useCoinLaunch();

  const [activeMobileLane, setActiveMobileLane] = useState<Lane>('new');
  const [pages, setPages] = useState<Record<Lane, number>>({ new: 0, trending: 0, graduated: 0 });
  const [formJob, setFormJob] = useState<JobWithClickCount | null>(null);
  const [shareJob, setShareJob] = useState<{ job: JobWithClickCount; coinPhrase?: string; contractAddress?: string } | null>(null);

  // Separate jobs by application status for the lanes
  const newJobs = jobsByLane.new.filter(j => getStatus(j.job_id) === 'none');
  const inProgressJobs = [
    ...jobsByLane.new.filter(j => getStatus(j.job_id) === 'in_progress'),
    ...jobsByLane.trending.filter(j => getStatus(j.job_id) === 'in_progress'),
    ...jobsByLane.graduated.filter(j => getStatus(j.job_id) === 'in_progress'),
  ];
  const appliedJobs = [
    ...jobsByLane.new.filter(j => getStatus(j.job_id) === 'applied'),
    ...jobsByLane.trending.filter(j => getStatus(j.job_id) === 'applied'),
    ...jobsByLane.graduated.filter(j => getStatus(j.job_id) === 'applied'),
  ];

  const laneData: Record<Lane, { title: string; jobs: JobWithClickCount[] }> = {
    new: { title: 'New Job Listings', jobs: newJobs },
    trending: { title: 'Application in Progress', jobs: inProgressJobs },
    graduated: { title: 'Applied For', jobs: appliedJobs },
  };

  const handleQuickApply = async (job: JobWithClickCount) => {
    if (!wallet) {
      connectWallet({ walletList: ['phantom'] });
      return;
    }
    // Open job link in new tab
    window.open(job.job_apply_link, '_blank', 'noopener,noreferrer');
    // Move to in_progress
    await quickApply.mutateAsync({ jobId: job.job_id, walletAddr: wallet.address });
    toast.success('Job moved to In Progress! Fill out the form to complete.');
  };

  const handleOpenForm = (job: JobWithClickCount) => {
    setFormJob(job);
  };

  const handleSubmitForm = async (data: { name: string; age: string; availability: string; girthSize: string }) => {
    if (!wallet || !formJob) return;

    const app = await submitApplication.mutateAsync({
      jobId: formJob.job_id,
      walletAddr: wallet.address,
      ...data,
    });

    // Auto-generate coin metadata
    const coin = await createCoinMetadata.mutateAsync({
      applicationId: app.id,
      jobId: formJob.job_id,
      walletAddress: wallet.address,
      employerName: formJob.employer_name,
    });

    setFormJob(null);
    toast.success('Application submitted! 🚀');

    // Show share prompt
    setShareJob({ job: formJob, coinPhrase: coin.coin_phrase, contractAddress: coin.contract_address ?? undefined });
  };

  const handleShareX = (job: JobWithClickCount) => {
    const app = applications.find(a => a.job_id === job.job_id);
    if (app) {
      setShareJob({ job });
    }
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

              {/* Pagination */}
              {tp > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => setPages(p => ({ ...p, [lane]: Math.max(0, p[lane] - 1) }))}
                    disabled={pages[lane] === 0}
                    className="px-3 py-1 text-sm rounded border border-cream-border hover:bg-cream-dark disabled:opacity-30 transition-colors"
                  >
                    ←
                  </button>
                  <span className="text-sm text-text-muted">
                    {pages[lane] + 1} / {tp}
                  </span>
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

      {/* Apply Form Modal */}
      {formJob && (
        <ApplyForm
          jobTitle={formJob.job_title}
          employerName={formJob.employer_name}
          onSubmit={handleSubmitForm}
          onClose={() => setFormJob(null)}
        />
      )}

      {/* Share on X Prompt */}
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
