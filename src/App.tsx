import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletProviderWrapper } from './contexts/WalletProvider';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';

// Configure QueryClient with aggressive caching to conserve API quota
// JSearch free tier = 500 requests/month, so we cache heavily
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data considered fresh for 24 hours
      staleTime: 1000 * 60 * 60 * 24,
      // Keep cached data for 48 hours
      gcTime: 1000 * 60 * 60 * 48,
      // Don't refetch on window focus (preserves quota)
      refetchOnWindowFocus: false,
      // Don't refetch on mount if data exists (preserves quota)
      refetchOnMount: false,
      // Only retry failed requests once
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProviderWrapper>
        <div className="min-h-screen bg-black text-white">
          <Header />

          {/* Main content area */}
          <main className="max-w-7xl mx-auto px-4 py-8">
            <KanbanBoard />
          </main>
        </div>
      </WalletProviderWrapper>
    </QueryClientProvider>
  );
}

export default App;
