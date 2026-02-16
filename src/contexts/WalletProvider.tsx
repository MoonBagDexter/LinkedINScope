import { createContext, useContext, useState, type ReactNode } from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { toSolanaWalletConnectors, useWallets } from '@privy-io/react-auth/solana';

interface WalletCtx {
  address: string | null;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletCtx>({ address: null, connect: () => {}, disconnect: () => {} });
export const useWallet = () => useContext(WalletContext);

const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;
const isPrivyConfigured = !!privyAppId && privyAppId !== 'YOUR_PRIVY_APP_ID_HERE' && privyAppId !== 'placeholder';

const solanaConnectors = toSolanaWalletConnectors({ shouldAutoConnect: true });

// Bridge: reads Privy hooks, writes to our unified context
function PrivyBridge({ children }: { children: ReactNode }) {
  const { connectWallet, authenticated, logout } = usePrivy();
  const { wallets } = useWallets();
  const address = authenticated && wallets[0] ? wallets[0].address : null;
  return (
    <WalletContext.Provider value={{
      address,
      connect: () => connectWallet({ walletList: ['phantom'] }),
      disconnect: logout,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

function MockProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  return (
    <WalletContext.Provider value={{
      address,
      connect: () => setAddress('DEMO' + Math.random().toString(36).slice(2, 10).toUpperCase()),
      disconnect: () => setAddress(null),
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function WalletProviderWrapper({ children }: { children: ReactNode }) {
  if (!isPrivyConfigured) {
    return <MockProvider>{children}</MockProvider>;
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: { walletChainType: 'solana-only' },
        externalWallets: { solana: { connectors: solanaConnectors } },
      }}
    >
      <PrivyBridge>{children}</PrivyBridge>
    </PrivyProvider>
  );
}
