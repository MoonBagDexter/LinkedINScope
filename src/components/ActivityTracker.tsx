import { useState, useSyncExternalStore } from 'react';

export interface ActivityEntry {
  id: string;
  wallet: string;
  action: string;
  jobTitle: string;
  employer: string;
  timestamp: string;
}

const STORAGE_KEY = 'linkedinscope_activity';

function getEntries(): ActivityEntry[] {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

export function addActivity(entry: Omit<ActivityEntry, 'id' | 'timestamp'>) {
  const all = getEntries();
  all.unshift({ ...entry, id: crypto.randomUUID(), timestamp: new Date().toISOString() });
  if (all.length > 50) all.length = 50;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event('activity-updated'));
}

const subscribe = (cb: () => void) => {
  window.addEventListener('activity-updated', cb);
  return () => window.removeEventListener('activity-updated', cb);
};
const getSnapshot = () => sessionStorage.getItem(STORAGE_KEY) || '[]';

export function ActivityTracker() {
  const [minimized, setMinimized] = useState(false);
  useSyncExternalStore(subscribe, getSnapshot);
  const entries = getEntries();

  return (
    <div className="fixed left-4 bottom-4 z-40 w-72">
      <button
        onClick={() => setMinimized(!minimized)}
        className="w-full flex items-center justify-between bg-cream-dark border border-cream-border rounded-t-lg px-3 py-2 text-sm font-bold text-text-primary hover:bg-cream transition-colors"
      >
        <span>Activity Feed ({entries.length})</span>
        <span className="text-text-muted">{minimized ? '+' : '_'}</span>
      </button>

      {!minimized && (
        <div className="bg-cream-dark border border-t-0 border-cream-border rounded-b-lg max-h-64 overflow-y-auto">
          {entries.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-4">No activity yet</p>
          ) : (
            entries.map(e => (
              <div key={e.id} className="px-3 py-2 border-b border-cream-border last:border-b-0 hover:bg-cream transition-colors">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono text-primary font-bold">
                    {e.wallet.slice(0, 4)}...{e.wallet.slice(-4)}
                  </span>
                  <span className="text-xs text-text-muted">{e.action}</span>
                </div>
                <p className="text-xs text-text-secondary truncate">{e.jobTitle} at {e.employer}</p>
                <p className="text-[10px] text-text-muted">{new Date(e.timestamp).toLocaleTimeString()}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
