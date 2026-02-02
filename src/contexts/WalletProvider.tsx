import { useMemo, type ReactNode } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletProviderWrapperProps {
  children: ReactNode;
}

/**
 * Provides Solana wallet context to the application
 * - Uses mainnet-beta for production
 * - Configures Phantom wallet adapter
 * - autoConnect enabled for session persistence across page refreshes
 */
export function WalletProviderWrapper({ children }: WalletProviderWrapperProps) {
  // Use mainnet-beta for real Solana network
  const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), []);

  // Configure wallet adapters - only Phantom for now
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
