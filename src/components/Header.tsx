import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { truncateAddress } from '../utils/formatting';
import { usePresence } from '../hooks/usePresence';
import { setSimulatorPaused, isSimulatorPaused } from '../services/activitySimulator';

/**
 * Header component with wallet connection UI
 * - Displays app title and tagline
 * - Shows wallet connect button or connected address
 * - Degen aesthetic: dark bg, purple/pink accents, bold font
 */
export function Header() {
  const { publicKey, connected } = useWallet();
  const userCount = usePresence();
  const [simPaused, setSimPaused] = useState(isSimulatorPaused());

  return (
    <header className="w-full border-b border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo and tagline */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            LinkedInScope
          </h1>
          <p className="text-xs text-gray-500 italic">
            Solana nuked, time to flip burgers
          </p>
        </div>

        {/* Wallet connection area */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => { const next = !simPaused; setSimulatorPaused(next); setSimPaused(next); }}
            className={`text-xs px-2 py-1 rounded font-mono transition-colors ${simPaused ? 'bg-gray-700 text-gray-400' : 'bg-green-800 text-green-300'}`}
          >
            Bot {simPaused ? 'OFF' : 'ON'}
          </button>
          <span className="text-sm text-purple-300 font-medium">
            {userCount} {userCount === 1 ? 'degen' : 'degens'} online
          </span>
          {connected && publicKey && (
            <span className="text-sm text-gray-400 font-mono hidden sm:block">
              {truncateAddress(publicKey.toBase58())}
            </span>
          )}
          <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg !h-10 !font-semibold !transition-colors" />
        </div>
      </div>
    </header>
  );
}
