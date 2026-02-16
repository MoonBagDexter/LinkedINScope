import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletProvider';
import { useLaneJobs, type JobWithClickCount } from '../hooks/useLaneJobs';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { useApplications } from '../hooks/useApplications';
import { useCoinLaunch } from '../hooks/useCoinLaunch';
import { forceShareOnX } from '../utils/shareX';
import { JobCard } from './JobCard';
import { ApplyForm } from './ApplyForm';
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
  const [drippingId, setDrippingId] = useState<string | null>(null);

  // Flatten and dedupe
  const allJobs = [...jobsByLane.new, ...jobsByLane.trending, ...jobsByLane.graduated];
  const seen = new Set<string>();
  const uniqueJobs = allJobs.filter(j => { if (seen.has(j.job_id)) return false; seen.add(j.job_id); return true; });

  const newJobs = uniqueJobs.filter(j => getStatus(j.job_id) === 'none');
  const inProgressJobs = uniqueJobs.filter(j => getStatus(j.job_id) === 'in_progress');
  const appliedJobs = uniqueJobs.filter(j => getStatus(j.job_id) === 'applied');

  // Drip effect: every 20-30s, "surface" a random job to the top with animation
  const [dripOrder, setDripOrder] = useState<string[]>([]);

  useEffect(() => {
    if (newJobs.length < 2) return;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * newJobs.length);
      const job = newJobs[randomIdx];
      setDrippingId(job.job_id);
      setDripOrder(prev => {
        const filtered = prev.filter(id => id !== job.job_id);
        return [job.job_id, ...filtered];
      });
      setTimeout(() => setDrippingId(null), 700);
    }, 20000 + Math.random() * 10000); // 20-30s
    return () => clearInterval(interval);
  }, [newJobs.length]);

  // Sort new jobs: drip order first, then default
  const sortedNewJobs = [...newJobs].sort((a, b) => {
    const aIdx = dripOrder.indexOf(a.job_id);
    const bIdx = dripOrder.indexOf(b.job_id);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return 0;
  });

  const laneData: Record<Lane, { title: string; jobs: JobWithClickCount[] }> = {
    new: { title: '🔥 New Job Listings', jobs: sortedNewJobs },
    trending: { title: '⏳ Application in Progress', jobs: inProgressJobs },
    graduated: { title: '✅ Applied For', jobs: appliedJobs },
  };

  const handleQuickApply = async (job: JobWithClickCount) => {
    if (!walletAddress) { connectWallet(); return; }
    await quickApply(job.job_id, walletAddress);
    toast.success('Moved to In Progress! Complete your application.');
  };

  const handleOpenForm = (job: JobWithClickCount) => {
    window.open(job.job_apply_link, '_blank', 'noopener,noreferrer');
    setFormJob(job);
  };

  const handleSubmitForm = async (data: { name: string; age: string; availability: string; girthSize: string }) => {
    if (!walletAddress || !formJob) return;
    const app = await submitApplication({ jobId: formJob.job_id, walletAddr: walletAddress, ...data });
    const coin = await createCoinMetadata({
      applicationId: app.id, jobId: formJob.job_id,
      walletAddress: walletAddress, employerName: formJob.employer_name,
    });
    setFormJob(null);
    toast.success('Application submitted! Sharing on X...');
    // Force redirect to X immediately
    setTimeout(() => forceShareOnX(formJob.job_title, formJob.employer_name, coin.coin_phrase), 500);
  };

  const handleShareX = (job: JobWithClickCount) => {
    forceShareOnX(job.job_title, job.employer_name);
  };

  const paginate = (jobs: JobWithClickCount[], lane: Lane) => {
    const start = pages[lane] * JOBS_PER_PAGE;
    return jobs.slice(start, start + JOBS_PER_PAGE);
  };

  const totalPages = (jobs: JobWithClickCount[]) => Math.max(1, Math.ceil(jobs.length / JOBS_PER_PAGE));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-3 border-b-3 border-primary mx-auto mb-4" />
          <p className="text-text-muted text-lg">Loading jobs...</p>
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
                <span className="text-xs bg-primary text-white rounded-full px-2.5 py-0.5 font-bold">
                  {jobs.length}
                </span>
              </div>

              <div className="space-y-3">
                {paged.length === 0 ? (
                  <div className="text-center py-10 text-text-muted border-2 border-dashed border-cream-border bg-cream-dark rounded-xl">
                    <div className="text-3xl mb-2">{lane === 'trending' ? '👆' : lane === 'graduated' ? '🎯' : '⏳'}</div>
                    <p className="font-medium">
                      {lane === 'trending' ? 'Hit Quick Apply to get started!' : lane === 'graduated' ? 'Complete an application to see it here' : 'Jobs loading...'}
                    </p>
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
                      isDripping={drippingId === job.job_id}
                    />
                  ))
                )}
              </div>

              {tp > 1 && (
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    onClick={() => setPages(p => ({ ...p, [lane]: Math.max(0, p[lane] - 1) }))}
                    disabled={pages[lane] === 0}
                    className="px-4 py-1.5 text-sm rounded-lg border border-cream-border hover:bg-cream-dark disabled:opacity-30 transition-all font-bold"
                  >
                    ←
                  </button>
                  <span className="text-sm text-text-muted font-medium">{pages[lane] + 1} / {tp}</span>
                  <button
                    onClick={() => setPages(p => ({ ...p, [lane]: Math.min(tp - 1, p[lane] + 1) }))}
                    disabled={pages[lane] >= tp - 1}
                    className="px-4 py-1.5 text-sm rounded-lg border border-cream-border hover:bg-cream-dark disabled:opacity-30 transition-all font-bold"
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
    </div>
  );
}
