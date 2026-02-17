import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { VersionedTransaction, Connection, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const PLATFORM_KEY = process.env.PLATFORM_WALLET_KEY || '';
const HELIUS_RPC = process.env.HELIUS_RPC || 'https://api.mainnet-beta.solana.com';

app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

app.post('/api/launch', async (req, res) => {
  const { coinName, coinTicker, description, twitterHandle, siteUrl } = req.body;
  console.log('[launch] Starting:', { coinName, coinTicker });

  try {
    if (!PLATFORM_KEY) throw new Error('PLATFORM_WALLET_KEY not set');

    const signerKeypair = Keypair.fromSecretKey(bs58.decode(PLATFORM_KEY));
    const mintKeypair = Keypair.generate();
    console.log('[launch] Signer:', signerKeypair.publicKey.toBase58());
    console.log('[launch] Mint:', mintKeypair.publicKey.toBase58());

    // Step 1: Generate placeholder image
    const { createCanvas } = await import('canvas').catch(() => ({ createCanvas: null }));
    let fileBlob;
    if (createCanvas) {
      const c = createCanvas(256, 256);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#0055A4';
      ctx.fillRect(0, 0, 256, 256);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((coinTicker || '').slice(0, 4), 128, 128);
      fileBlob = new Blob([c.toBuffer('image/png')], { type: 'image/png' });
    } else {
      // Minimal 1x1 PNG if canvas not available
      const pngBuf = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==', 'base64');
      fileBlob = new Blob([pngBuf], { type: 'image/png' });
    }

    // Step 2: Upload metadata to pump.fun IPFS
    const formData = new FormData();
    formData.append('file', fileBlob, 'token.png');
    formData.append('name', (coinName || '').slice(0, 32));
    formData.append('symbol', (coinTicker || '').slice(0, 13));
    formData.append('description', (description || '').slice(0, 200));
    formData.append('twitter', twitterHandle || '');
    formData.append('website', siteUrl || '');
    formData.append('showName', 'true');

    console.log('[launch] Uploading to pump.fun IPFS...');
    const ipfsRes = await fetch('https://pump.fun/api/ipfs', { method: 'POST', body: formData });
    if (!ipfsRes.ok) {
      const errText = await ipfsRes.text();
      throw new Error(`IPFS upload failed: ${ipfsRes.status} ${errText}`);
    }
    const ipfsData = await ipfsRes.json();
    console.log('[launch] IPFS done:', ipfsData.metadataUri);

    // Step 3: Get local transaction from PumpPortal
    console.log('[launch] Getting tx from PumpPortal...');
    const tradeBody = {
      publicKey: signerKeypair.publicKey.toBase58(),
      action: 'create',
      tokenMetadata: {
        name: ipfsData.metadata?.name || coinName,
        symbol: ipfsData.metadata?.symbol || coinTicker,
        uri: ipfsData.metadataUri,
      },
      mint: mintKeypair.publicKey.toBase58(),
      denominatedInSol: 'true',
      amount: 0.001,
      slippage: 10,
      priorityFee: 0.0005,
      pool: 'pump',
    };
    const tradeRes = await fetch('https://pumpportal.fun/api/trade-local', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tradeBody),
    });
    if (!tradeRes.ok) {
      const errText = await tradeRes.text();
      throw new Error(`PumpPortal error: ${tradeRes.status} ${errText}`);
    }
    console.log('[launch] Got tx, signing...');

    // Step 4: Sign and submit
    const txData = await tradeRes.arrayBuffer();
    const tx = VersionedTransaction.deserialize(new Uint8Array(txData));
    tx.sign([mintKeypair, signerKeypair]);

    const connection = new Connection(HELIUS_RPC, 'confirmed');
    const signature = await connection.sendTransaction(tx);
    const mintAddress = mintKeypair.publicKey.toBase58();

    console.log('[launch] SUCCESS! TX:', signature);
    console.log('[launch] Mint address:', mintAddress);

    res.json({ success: true, signature, mintAddress });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[launch] FAILED:', msg);
    res.json({ success: false, error: msg });
  }
});

// SPA fallback
app.get('/{*splat}', (_req, res) => res.sendFile(join(__dirname, 'dist', 'index.html')));

app.listen(PORT, () => console.log(`[server] Running on port ${PORT}`));
