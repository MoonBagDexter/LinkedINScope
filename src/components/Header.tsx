import { useWallet } from '../contexts/WalletProvider';
import { truncateAddress } from '../utils/formatting';
import { usePresence } from '../hooks/usePresence';

export function Header() {
  const { address, connect, disconnect } = useWallet();
  const userCount = usePresence();

  return (
    <header className="w-full border-b border-cream-border bg-cream sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex flex-col">
          <img src="/logo.png" alt="LinkedInScope" className="h-10 w-auto object-contain" />
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-primary font-medium">
            {userCount} {userCount === 1 ? 'degen' : 'degens'} online
          </span>

          {address ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-secondary font-mono hidden sm:block">
                {truncateAddress(address)}
              </span>
              <button
                onClick={disconnect}
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Connect Phantom
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
