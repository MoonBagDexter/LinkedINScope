import { useState } from 'react';
import { useAllCoins, updateCoin, type CoinLaunch } from '../hooks/useCoinLaunch';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin';

export function AdminPanel({ onBack }: { onBack: () => void }) {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-cream-dark border border-cream-border rounded-2xl p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold mb-4">Admin Panel 🔐</h1>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && password === ADMIN_PASSWORD && setAuthed(true)}
            placeholder="Password"
            className="w-full px-3 py-2 rounded-lg border border-cream-border bg-cream text-text-primary mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex gap-2">
            <button onClick={onBack} className="flex-1 px-4 py-2 rounded-lg border border-cream-border text-text-secondary hover:bg-cream transition-colors">Back</button>
            <button onClick={() => password === ADMIN_PASSWORD && setAuthed(true)} className="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover transition-colors">Login</button>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard onBack={onBack} />;
}

function AdminDashboard({ onBack }: { onBack: () => void }) {
  const coins = useAllCoins();
  const [editingCA, setEditingCA] = useState<{ id: string; value: string } | null>(null);
  const [, forceUpdate] = useState(0);

  const handleUpdate = (id: string, updates: Partial<CoinLaunch>) => {
    updateCoin(id, updates);
    forceUpdate(n => n + 1);
  };

  const pending = coins.filter(c => c.status === 'pending');
  const approved = coins.filter(c => c.status === 'approved');
  const rejected = coins.filter(c => c.status === 'rejected');

  const statusColor = (s: string) =>
    s === 'pending' ? 'bg-yellow-100 text-yellow-800' :
    s === 'approved' ? 'bg-green-100 text-green-800' :
    'bg-red-100 text-red-800';

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Panel 🛠️</h1>
        <button onClick={onBack} className="text-sm text-primary hover:underline">← Back to app</button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-700">{pending.length}</div>
          <div className="text-sm text-yellow-600">Pending</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{approved.length}</div>
          <div className="text-sm text-green-600">Approved</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-700">{rejected.length}</div>
          <div className="text-sm text-red-600">Rejected</div>
        </div>
      </div>

      {coins.length === 0 ? (
        <p className="text-text-muted text-center py-8">No coin launches yet. Apply to a job to generate one.</p>
      ) : (
        <div className="space-y-3">
          {coins.map(coin => (
            <div key={coin.id} className="bg-cream-dark border border-cream-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-text-primary">{coin.coin_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(coin.status)}`}>{coin.status}</span>
                  </div>
                  <p className="text-sm text-text-secondary italic">"{coin.coin_phrase}"</p>
                  <p className="text-xs text-text-muted mt-1">Wallet: {coin.wallet_address.slice(0, 8)}...{coin.wallet_address.slice(-4)}</p>
                  <p className="text-xs text-text-muted">{new Date(coin.created_at).toLocaleString()}</p>

                  {coin.status === 'approved' && (
                    <div className="mt-2 flex gap-2">
                      {editingCA?.id === coin.id ? (
                        <>
                          <input
                            value={editingCA.value}
                            onChange={e => setEditingCA({ ...editingCA, value: e.target.value })}
                            placeholder="Enter contract address"
                            className="flex-1 px-2 py-1 text-xs rounded border border-cream-border bg-cream focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <button
                            onClick={() => { handleUpdate(coin.id, { contract_address: editingCA.value }); setEditingCA(null); }}
                            className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary-hover"
                          >Save</button>
                        </>
                      ) : (
                        <button onClick={() => setEditingCA({ id: coin.id, value: coin.contract_address || '' })} className="text-xs text-primary hover:underline">
                          {coin.contract_address ? `CA: ${coin.contract_address.slice(0, 12)}... (edit)` : '+ Add Contract Address'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {coin.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(coin.id, { status: 'approved' })} className="px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors">✓ Approve</button>
                    <button onClick={() => handleUpdate(coin.id, { status: 'rejected' })} className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors">✗ Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
