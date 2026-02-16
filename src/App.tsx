import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { WalletProviderWrapper } from './contexts/WalletProvider';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { AdminPanel } from './components/AdminPanel';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      gcTime: 1000 * 60 * 60,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

function App() {
  const [page, setPage] = useState<'main' | 'admin'>(() =>
    window.location.hash === '#admin' ? 'admin' : 'main'
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProviderWrapper>
        <div className="min-h-screen bg-cream text-text-primary">
          {page === 'admin' ? (
            <AdminPanel onBack={() => { setPage('main'); window.location.hash = ''; }} />
          ) : (
            <>
              <Header />
              <main className="max-w-7xl mx-auto px-4 py-8">
                <KanbanBoard />
              </main>
              <button
                onClick={() => { setPage('admin'); window.location.hash = 'admin'; }}
                className="fixed bottom-4 right-4 text-xs text-text-muted hover:text-text-secondary opacity-30 hover:opacity-100 transition-opacity"
              >
                Admin
              </button>
            </>
          )}
          <Toaster position="top-center" toastOptions={{ duration: 2000 }} visibleToasts={3} richColors />
        </div>
      </WalletProviderWrapper>
    </QueryClientProvider>
  );
}

export default App;
