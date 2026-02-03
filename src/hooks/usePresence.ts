import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

/**
 * Hook for tracking connected users using Supabase Presence API
 * Returns live user count (number of connected users)
 *
 * Subscribes to 'lobby' channel for presence tracking
 * Anonymous tracking - no wallet/user identity included
 */
export function usePresence(): number {
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const channel = supabase.channel('lobby');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setUserCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.untrack();
      channel.unsubscribe();
    };
  }, []);

  return userCount;
}
