import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLaneJobs } from '../hooks/useLaneJobs';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { KanbanLane } from './KanbanLane';
import { MobileTabNav } from './MobileTabNav';
import type { Lane } from '../types/kanban';

export function KanbanBoard() {
  const queryClient = useQueryClient();

  useRealtimeSync();

  useEffect(() => {
    const handleOnline = () => {
      queryClient.invalidateQueries({ queryKey: ['cached-jobs'] });
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [queryClient]);

  const { jobsByLane, isLoading, error } = useLaneJobs();

  const [activeMobileLane, setActiveMobileLane] = useState<Lane>('new');

  const handleApplyClick = (_jobId: string, applyLink: string) => {
    window.open(applyLink, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-semibold">Failed to load jobs</p>
        <p className="text-sm mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  const lanes: Array<{ lane: Lane; title: string }> = [
    { lane: 'new', title: 'New Job Listings' },
    { lane: 'trending', title: 'Application in Progress' },
    { lane: 'graduated', title: 'Applied For' },
  ];

  return (
    <div>
      <MobileTabNav
        activeLane={activeMobileLane}
        onLaneChange={setActiveMobileLane}
      />

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
