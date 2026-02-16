import { useCallback, useSyncExternalStore } from 'react';

const DEGEN_TICKERS = [
  'WAGMI', 'LFG', 'APE', 'DGEN', 'MOON', 'BAG', 'FLIP', 'GRIND',
  'FRYCOOK', 'WHALE', 'NGMI', 'COPE', 'HODL',
];

const DEGEN_PHRASES = [
  'wagmi ser', 'lfg to the moon', 'ape in or cry later', 'diamond hands only',
  'ngmi if you skip', 'touch grass after', 'ser this is a Wendys',
  'flipping burgers to bags', 'min wage max gains',
  'fry cook to whale', 'burger flipper billionaire', 'cash register to crypto',
];

export interface CoinLaunch {
  id: string;
  application_id: string;
  job_id: string;
  wallet_address: string;
  coin_name: string;
  coin_phrase: string;
  coin_ticker: string;
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
    const shortAddr = params.walletAddress.slice(0, 4);
    const employer = params.employerName.replace(/[^a-zA-Z0-9 ]/g, '').split(' ')[0];
    const ticker = DEGEN_TICKERS[Math.floor(Math.random() * DEGEN_TICKERS.length)];
    const phrase = DEGEN_PHRASES[Math.floor(Math.random() * DEGEN_PHRASES.length)];
    // pump.fun limits: name max 32, ticker max 13
    const coinName = `${employer}x${shortAddr} ${phrase}`.slice(0, 32);
    const coinTicker = `${employer.slice(0, 8)}${ticker}`.slice(0, 13).toUpperCase();

    const coin: CoinLaunch = {
      id: crypto.randomUUID(), application_id: params.applicationId, job_id: params.jobId,
      wallet_address: params.walletAddress, coin_name: coinName, coin_phrase: phrase,
      coin_ticker: coinTicker, status: 'pending', created_at: new Date().toISOString(),
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
