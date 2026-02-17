import { getSettings } from '../hooks/useSettings';

export interface PumpFunResult {
  success: boolean;
  signature?: string;
  mintAddress?: string;
  error?: string;
}

export async function launchOnPumpFun(params: {
  coinName: string;
  coinTicker: string;
  description: string;
  employerName: string;
}): Promise<PumpFunResult> {
  const settings = getSettings();
  console.log('[pump.fun] Calling /api/launch...', params.coinName, params.coinTicker);

  try {
    const res = await fetch('/api/launch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coinName: params.coinName,
        coinTicker: params.coinTicker,
        description: params.description,
        twitterHandle: settings.twitterHandle,
        siteUrl: settings.siteUrl,
      }),
    });

    const data = await res.json();
    console.log('[pump.fun] Response:', data);
    return data;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[pump.fun] Request failed:', msg);
    return { success: false, error: msg };
  }
}
