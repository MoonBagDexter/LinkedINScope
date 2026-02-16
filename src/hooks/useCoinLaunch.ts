import { useCallback, useSyncExternalStore } from 'react';

const DEGEN_PHRASES = [
  'wagmi ser', 'lfg to the moon', 'ape in or cry later', 'diamond hands only',
  'ngmi if you skip this', 'touch grass after this bag', 'ser this is a Wendy\'s',
  'flipping burgers to flipping bags', 'minimum wage maximum gains',
  'from fry cook to whale', 'burger flipper billionaire', 'cash register to crypto',
];

export interface CoinLaunch {
  id: string;
  application_id: string;
  job_id: string;
  wallet_address: string;
  coin_name: string;
  coin_phrase: string;
  status: 'pending' | 'approved' | 'rejected';
  contract_address?: string;
  created_at: string;
}

const STORAGE_KEY = 'linkedinscope_coins';
let cached: { raw: string; parsed: CoinLaunch[] } = { raw: '', parsed: [] };

function getCoins(): CoinLaunch[] {
  const raw = localStorage.getItem(STORAGE_KEY) || '[]';
  if (raw !== cached.raw) {
    try { cached = { raw, parsed: JSON.parse(raw) }; } catch { cached = { raw, parsed: [] }; }
  }
  return cached.parsed;
}

function saveCoins(coins: CoinLaunch[]) {
  const raw = JSON.stringify(coins);
  cached = { raw, parsed: coins };
  localStorage.setItem(STORAGE_KEY, raw);
  window.dispatchEvent(new Event('coins-updated'));
}

const subscribe = (cb: () => void) => {
  window.addEventListener('coins-updated', cb);
  window.addEventListener('storage', cb);
  return () => { window.removeEventListener('coins-updated', cb); window.removeEventListener('storage', cb); };
};

const getSnapshot = () => localStorage.getItem(STORAGE_KEY) || '[]';

export function useCoinLaunch() {
  const createCoinMetadata = useCallback(async (params: {
    applicationId: string; jobId: string; walletAddress: string; employerName: string;
  }) => {
    const shortAddr = params.walletAddress.slice(0, 6);
    const phrase = DEGEN_PHRASES[Math.floor(Math.random() * DEGEN_PHRASES.length)];
    const coinName = `${params.employerName.split(' ')[0]}x${shortAddr}`;
    const coin: CoinLaunch = {
      id: crypto.randomUUID(), application_id: params.applicationId, job_id: params.jobId,
      wallet_address: params.walletAddress, coin_name: coinName, coin_phrase: phrase,
      status: 'pending', created_at: new Date().toISOString(),
    };
    saveCoins([...getCoins(), coin]);
    return coin;
  }, []);

  return { createCoinMetadata };
}

export function useAllCoins(): CoinLaunch[] {
  useSyncExternalStore(subscribe, getSnapshot);
  return getCoins();
}

export function updateCoin(id: string, updates: Partial<CoinLaunch>) {
  const all = getCoins();
  const idx = all.findIndex(c => c.id === id);
  if (idx !== -1) {
    all[idx] = { ...all[idx], ...updates };
    saveCoins(all);
  }
}
