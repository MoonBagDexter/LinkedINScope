import { VersionedTransaction, Connection, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { getSettings } from '../hooks/useSettings';

const RPC_URL = import.meta.env.VITE_HELIUS_RPC || 'https://api.mainnet-beta.solana.com';
const PLATFORM_KEY = import.meta.env.VITE_PLATFORM_WALLET_KEY || '';

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
  employerLogo?: string;
}): Promise<PumpFunResult> {
  try {
    if (!PLATFORM_KEY) throw new Error('Platform wallet key not configured');

    const settings = getSettings();
    const signerKeypair = Keypair.fromSecretKey(bs58.decode(PLATFORM_KEY));
    const mintKeypair = Keypair.generate();

    // Step 1: Upload metadata to pump.fun IPFS
    const formData = new FormData();

    // Fetch company logo as image file
    if (params.employerLogo) {
      try {
        const logoRes = await fetch(params.employerLogo);
        if (logoRes.ok) {
          const blob = await logoRes.blob();
          formData.append('file', blob, 'logo.png');
        }
      } catch { /* skip logo if fetch fails */ }
    }

    // If no logo, create a simple placeholder
    if (!formData.has('file')) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#0055A4';
      ctx.fillRect(0, 0, 256, 256);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(params.coinTicker.slice(0, 4), 128, 128);
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), 'image/png'));
      formData.append('file', blob, 'token.png');
    }

    formData.append('name', params.coinName.slice(0, 32));
    formData.append('symbol', params.coinTicker.slice(0, 13));
    formData.append('description', params.description.slice(0, 200));
    formData.append('twitter', settings.twitterHandle || '');
    formData.append('website', settings.siteUrl || '');
    formData.append('showName', 'true');

    console.log('[pump.fun] Uploading metadata to IPFS...');
    const ipfsRes = await fetch('https://pump.fun/api/ipfs', { method: 'POST', body: formData });
    if (!ipfsRes.ok) throw new Error(`IPFS upload failed: ${ipfsRes.status}`);
    const ipfsData = await ipfsRes.json();

    // Step 2: Get local transaction from PumpPortal
    console.log('[pump.fun] Getting transaction from PumpPortal...');
    const tradeRes = await fetch('https://pumpportal.fun/api/trade-local', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publicKey: signerKeypair.publicKey.toBase58(),
        action: 'create',
        tokenMetadata: {
          name: ipfsData.metadata?.name || params.coinName,
          symbol: ipfsData.metadata?.symbol || params.coinTicker,
          uri: ipfsData.metadataUri,
        },
        mint: mintKeypair.publicKey.toBase58(),
        denominatedInSol: 'true',
        amount: 0.001, // minimal dev buy
        slippage: 10,
        priorityFee: 0.0005,
        pool: 'pump',
      }),
    });

    if (!tradeRes.ok) {
      const errText = await tradeRes.text();
      throw new Error(`PumpPortal error: ${tradeRes.status} ${errText}`);
    }

    // Step 3: Sign and submit transaction
    console.log('[pump.fun] Signing transaction...');
    const txData = await tradeRes.arrayBuffer();
    const tx = VersionedTransaction.deserialize(new Uint8Array(txData));
    tx.sign([mintKeypair, signerKeypair]);

    console.log('[pump.fun] Submitting to Solana...');
    const connection = new Connection(RPC_URL, 'confirmed');
    const signature = await connection.sendTransaction(tx);

    console.log('[pump.fun] Success! TX:', signature);
    console.log('[pump.fun] Mint:', mintKeypair.publicKey.toBase58());

    return {
      success: true,
      signature,
      mintAddress: mintKeypair.publicKey.toBase58(),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[pump.fun] Launch failed:', msg);
    return { success: false, error: msg };
  }
}
