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
  const [editing, setEditing] = useState<{ id: string; coin_name: string; coin_phrase: string; contract_address: string } | null>(null);
  const [, forceUpdate] = useState(0);

  const handleUpdate = (id: string, updates: Partial<CoinLaunch>) => {
    updateCoin(id, updates);
    forceUpdate(n => n + 1);
  };

  const startEdit = (coin: CoinLaunch) => {
    setEditing({ id: coin.id, coin_name: coin.coin_name, coin_phrase: coin.coin_phrase, contract_address: coin.contract_address || '' });
  };

  const saveEdit = () => {
    if (!editing) return;
    handleUpdate(editing.id, { coin_name: editing.coin_name, coin_phrase: editing.coin_phrase, contract_address: editing.contract_address || undefined });
    setEditing(null);
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
          {coins.map(coin => {
            const isEditing = editing?.id === coin.id;

            return (
              <div key={coin.id} className="bg-cream-dark border border-cream-border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-2 mb-2">
                        <div>
                          <label className="text-xs text-text-muted">Coin Name</label>
                          <input
                            value={editing.coin_name}
                            onChange={e => setEditing({ ...editing, coin_name: e.target.value })}
                            className="w-full px-2 py-1 text-sm rounded border border-cream-border bg-cream focus:outline-none focus:ring-1 focus:ring-primary font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-text-muted">Phrase / Ticker</label>
                          <input
                            value={editing.coin_phrase}
                            onChange={e => setEditing({ ...editing, coin_phrase: e.target.value })}
                            className="w-full px-2 py-1 text-sm rounded border border-cream-border bg-cream focus:outline-none focus:ring-1 focus:ring-primary italic"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-text-muted">Contract Address</label>
                          <input
                            value={editing.contract_address}
                            onChange={e => setEditing({ ...editing, contract_address: e.target.value })}
                            placeholder="Enter after launching coin"
                            className="w-full px-2 py-1 text-sm rounded border border-cream-border bg-cream focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={saveEdit} className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary-hover">Save</button>
                          <button onClick={() => setEditing(null)} className="px-3 py-1 text-xs border border-cream-border rounded hover:bg-cream">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-text-primary">{coin.coin_name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(coin.status)}`}>{coin.status}</span>
                        </div>
                        <p className="text-sm text-text-secondary italic">"{coin.coin_phrase}"</p>
                        {coin.contract_address && <p className="text-xs text-primary font-mono mt-1">CA: {coin.contract_address}</p>}
                        <p className="text-xs text-text-muted mt-1">Wallet: {coin.wallet_address.slice(0, 8)}...{coin.wallet_address.slice(-4)}</p>
                        <p className="text-xs text-text-muted">{new Date(coin.created_at).toLocaleString()}</p>
                        <button onClick={() => startEdit(coin)} className="text-xs text-primary hover:underline mt-1">✏️ Edit metadata</button>
                      </>
                    )}
                  </div>

                  {!isEditing && coin.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdate(coin.id, { status: 'approved' })} className="px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors">✓ Approve</button>
                      <button onClick={() => handleUpdate(coin.id, { status: 'rejected' })} className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors">✗ Reject</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
