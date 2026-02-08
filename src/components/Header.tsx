import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { truncateAddress } from '../utils/formatting';
import { usePresence } from '../hooks/usePresence';

export function Header() {
  const { publicKey, connected } = useWallet();
  const userCount = usePresence();

  return (
    <header className="w-full border-b border-cream-border bg-cream sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex flex-col">
          <img src="/logo.png" alt="LinkedInScope" className="h-10 w-auto object-contain" />
          {/* Resume & Presets placeholder */}
          <div className="flex items-center gap-2 mt-1">
            <select className="text-xs bg-cream-dark border border-cream-border rounded px-2 py-0.5 text-text-secondary" disabled>
              <option>Resume v1</option>
            </select>
            <span className="text-xs text-text-muted">Presets</span>
            <div className="flex gap-1">
              {['S1', 'S2', 'S3'].map((s) => (
                <button key={s} className="text-xs px-2 py-0.5 rounded-full border border-cream-border text-text-muted hover:bg-cream-dark transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Wallet connection area */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-primary font-medium">
            {userCount} {userCount === 1 ? 'degen' : 'degens'} online
          </span>
          {connected && publicKey && (
            <span className="text-sm text-text-secondary font-mono hidden sm:block">
              {truncateAddress(publicKey.toBase58())}
            </span>
          )}
          <WalletMultiButton className="!bg-primary hover:!bg-primary-hover !rounded-lg !h-10 !font-semibold !transition-colors" />
        </div>
      </div>
    </header>
  );
}
