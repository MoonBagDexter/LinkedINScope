import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { WalletProviderWrapper } from './contexts/WalletProvider';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';

// Configure QueryClient
// Frontend queries Supabase (not JSearch directly), so no API quota concern here.
// Real-time updates and polling keep the board fresh.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30s — matches polling interval for drip feed
      gcTime: 1000 * 60 * 60, // 1 hour
      refetchOnWindowFocus: true, // Catch up when user returns to tab
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProviderWrapper>
        <div className="min-h-screen bg-cream text-text-primary">
          <Header />

          {/* Main content area */}
          <main className="max-w-7xl mx-auto px-4 py-8">
            <KanbanBoard />
          </main>

          {/* Toast notifications */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 2000,
            }}
            visibleToasts={3}
            richColors
          />
        </div>
      </WalletProviderWrapper>
    </QueryClientProvider>
  );
}

export default App;
