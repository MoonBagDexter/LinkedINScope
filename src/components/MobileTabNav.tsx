import type { Lane } from '../types/kanban';

interface MobileTabNavProps {
  activeLane: Lane;
  onLaneChange: (lane: Lane) => void;
}

const LANE_LABELS: Record<Lane, string> = {
  new: 'New Listings',
  trending: 'In Progress',
  graduated: 'Applied',
};

export function MobileTabNav({ activeLane, onLaneChange }: MobileTabNavProps) {
  const lanes: Lane[] = ['new', 'trending', 'graduated'];

  return (
    <div className="md:hidden border-b border-cream-border mb-6">
      <div className="flex">
        {lanes.map((lane) => {
          const isActive = lane === activeLane;
          return (
            <button
              key={lane}
              onClick={() => onLaneChange(lane)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors duration-200 relative ${
                isActive
                  ? 'text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {LANE_LABELS[lane]}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
