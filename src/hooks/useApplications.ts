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

function getApps(): Application[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function saveApps(apps: Application[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  window.dispatchEvent(new Event('apps-updated'));
}

// Subscribe to changes for reactivity
const subscribe = (cb: () => void) => {
  window.addEventListener('apps-updated', cb);
  window.addEventListener('storage', cb);
  return () => { window.removeEventListener('apps-updated', cb); window.removeEventListener('storage', cb); };
};

export function useApplications(walletAddress: string | undefined) {
  useSyncExternalStore(subscribe, () => localStorage.getItem(STORAGE_KEY));

  const apps = walletAddress ? getApps().filter(a => a.wallet_address === walletAddress) : [];

  const quickApply = useCallback(async (jobId: string, walletAddr: string) => {
    const all = getApps();
    const existing = all.find(a => a.job_id === jobId && a.wallet_address === walletAddr);
    if (existing) return existing;

    const app: Application = {
      id: crypto.randomUUID(),
      job_id: jobId,
      wallet_address: walletAddr,
      status: 'in_progress',
      created_at: new Date().toISOString(),
    };
    saveApps([...all, app]);
    return app;
  }, []);

  const submitApplication = useCallback(async (params: {
    jobId: string;
    walletAddr: string;
    name: string;
    age: string;
    availability: string;
    girthSize: string;
  }) => {
    const all = getApps();
    const idx = all.findIndex(a => a.job_id === params.jobId && a.wallet_address === params.walletAddr);
    if (idx === -1) throw new Error('Application not found');

    all[idx] = {
      ...all[idx],
      status: 'applied',
      applicant_name: params.name,
      applicant_age: params.age,
      applicant_availability: params.availability,
      applicant_girth_size: params.girthSize,
    };
    saveApps(all);
    return all[idx];
  }, []);

  const getStatus = useCallback((jobId: string): 'none' | 'in_progress' | 'applied' => {
    const app = apps.find(a => a.job_id === jobId);
    return app?.status ?? 'none';
  }, [apps]);

  return { applications: apps, quickApply, submitApplication, getStatus };
}
