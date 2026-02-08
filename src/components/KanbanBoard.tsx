import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLaneJobs } from '../hooks/useLaneJobs';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { KanbanLane } from './KanbanLane';
import { MobileTabNav } from './MobileTabNav';
import type { Lane } from '../types/kanban';

/**
 * Main Kanban board component
 * Desktop: Three columns side-by-side
 * Mobile: Tabs to switch between lanes
 */
export function KanbanBoard() {
  const queryClient = useQueryClient();

  // Enable real-time sync - invalidates cache when new jobs are inserted
  useRealtimeSync();

  // Reconnect handling - refetch when coming back online
  useEffect(() => {
    const handleOnline = () => {
      queryClient.invalidateQueries({ queryKey: ['cached-jobs'] });
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [queryClient]);

  // Fetch jobs organized by lane
  const { jobsByLane, isLoading, error } = useLaneJobs();

  // Mobile lane state
  const [activeMobileLane, setActiveMobileLane] = useState<Lane>('new');

  // Handle apply click — just opens the link, no tracking for now
  const handleApplyClick = (_jobId: string, applyLink: string) => {
    window.open(applyLink, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
        <p className="font-semibold">Failed to load jobs</p>
        <p className="text-sm mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  const lanes: Array<{ lane: Lane; title: string }> = [
    { lane: 'new', title: 'New Listings' },
    { lane: 'trending', title: 'Trending' },
    { lane: 'graduated', title: 'Graduated' },
  ];

  return (
    <div>
      {/* Mobile tab navigation */}
      <MobileTabNav
        activeLane={activeMobileLane}
        onLaneChange={setActiveMobileLane}
      />

      {/* Desktop: 3 columns, Mobile: single column */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {lanes.map(({ lane, title }) => (
          <div
            key={lane}
            className={`${
              lane === activeMobileLane ? 'block' : 'hidden'
            } md:block`}
          >
            <KanbanLane
              lane={lane}
              jobs={jobsByLane[lane]}
              title={title}
              onApplyClick={handleApplyClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
