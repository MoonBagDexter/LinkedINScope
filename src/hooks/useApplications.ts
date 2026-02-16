import { useCallback, useSyncExternalStore } from 'react';

export interface Application {
  id: string;
  job_id: string;
  wallet_address: string;
  status: 'in_progress' | 'applied';
  applicant_name?: string;
  applicant_age?: string;
  applicant_availability?: string;
  applicant_girth_size?: string;
  created_at: string;
}

const STORAGE_KEY = 'linkedinscope_applications';
let cached: { raw: string; parsed: Application[] } = { raw: '', parsed: [] };

function getApps(): Application[] {
  const raw = localStorage.getItem(STORAGE_KEY) || '[]';
  if (raw !== cached.raw) {
    try { cached = { raw, parsed: JSON.parse(raw) }; } catch { cached = { raw, parsed: [] }; }
  }
  return cached.parsed;
}

function saveApps(apps: Application[]) {
  const raw = JSON.stringify(apps);
  cached = { raw, parsed: apps };
  localStorage.setItem(STORAGE_KEY, raw);
  window.dispatchEvent(new Event('apps-updated'));
}

const subscribe = (cb: () => void) => {
  window.addEventListener('apps-updated', cb);
  window.addEventListener('storage', cb);
  return () => { window.removeEventListener('apps-updated', cb); window.removeEventListener('storage', cb); };
};

const getSnapshot = () => localStorage.getItem(STORAGE_KEY) || '[]';

export function useApplications(walletAddress: string | undefined) {
  useSyncExternalStore(subscribe, getSnapshot);

  const apps = walletAddress ? getApps().filter(a => a.wallet_address === walletAddress) : [];

  const quickApply = useCallback(async (jobId: string, walletAddr: string) => {
    const all = getApps();
    const existing = all.find(a => a.job_id === jobId && a.wallet_address === walletAddr);
    if (existing) return existing;
    const app: Application = {
      id: crypto.randomUUID(), job_id: jobId, wallet_address: walletAddr,
      status: 'in_progress', created_at: new Date().toISOString(),
    };
    saveApps([...all, app]);
    return app;
  }, []);

  const submitApplication = useCallback(async (params: {
    jobId: string; walletAddr: string; name: string; age: string; availability: string; girthSize: string;
  }) => {
    const all = getApps();
    const idx = all.findIndex(a => a.job_id === params.jobId && a.wallet_address === params.walletAddr);
    if (idx === -1) throw new Error('Application not found');
    all[idx] = { ...all[idx], status: 'applied', applicant_name: params.name, applicant_age: params.age, applicant_availability: params.availability, applicant_girth_size: params.girthSize };
    saveApps(all);
    return all[idx];
  }, []);

  const getStatus = useCallback((jobId: string): 'none' | 'in_progress' | 'applied' => {
    return apps.find(a => a.job_id === jobId)?.status ?? 'none';
  }, [apps]);

  return { applications: apps, quickApply, submitApplication, getStatus };
}
