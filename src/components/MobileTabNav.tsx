import type { Lane } from '../types/kanban';

interface MobileTabNavProps {
  activeLane: Lane;
  onLaneChange: (lane: Lane) => void;
}

const LANE_LABELS: Record<Lane, string> = {
  new: 'New',
  trending: 'Trending',
  graduated: 'Graduated',
};

/**
 * Mobile tab navigation for switching between lanes
 * Only visible on mobile (md:hidden)
 */
export function MobileTabNav({ activeLane, onLaneChange }: MobileTabNavProps) {
  const lanes: Lane[] = ['new', 'trending', 'graduated'];

  return (
    <div className="md:hidden border-b border-purple-500/30 mb-6">
      <div className="flex">
        {lanes.map((lane) => {
          const isActive = lane === activeLane;
          return (
            <button
              key={lane}
              onClick={() => onLaneChange(lane)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors duration-200 relative ${
                isActive
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {LANE_LABELS[lane]}
              {/* Active underline */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
