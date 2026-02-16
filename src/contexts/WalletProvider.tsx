import { createContext, useContext, type ReactNode } from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { toSolanaWalletConnectors, useWallets } from '@privy-io/react-auth/solana';

interface WalletCtx {
  address: string | null;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletCtx>({ address: null, connect: () => {}, disconnect: () => {} });
export const useWallet = () => useContext(WalletContext);

const solanaConnectors = toSolanaWalletConnectors({ shouldAutoConnect: true });

function PrivyBridge({ children }: { children: ReactNode }) {
  const { login, authenticated, logout, ready } = usePrivy();
  const { wallets } = useWallets();
  const address = ready && authenticated && wallets[0] ? wallets[0].address : null;
  return (
    <WalletContext.Provider value={{
      address,
      connect: login,
      disconnect: logout,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function WalletProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        loginMethods: ['wallet'],
        appearance: {
          walletChainType: 'solana-only',
          showWalletLoginFirst: true,
        },
        externalWallets: {
          solana: { connectors: solanaConnectors },
        },
      }}
    >
      <PrivyBridge>{children}</PrivyBridge>
    </PrivyProvider>
  );
}
