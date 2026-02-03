import type { Lane } from '../types/kanban';

interface ProgressBarProps {
  current: number;
  lane: Lane;
}

// Get thresholds from environment
const THRESHOLD_NEW_TO_TRENDING = parseInt(import.meta.env.VITE_THRESHOLD_NEW_TO_TRENDING || '5', 10);
const THRESHOLD_TRENDING_TO_GRADUATED = parseInt(import.meta.env.VITE_THRESHOLD_TRENDING_TO_GRADUATED || '20', 10);

/**
 * Progress bar showing click progress toward next lane migration
 * Shows current clicks with visual progress indicator
 * Thresholds not revealed to users per CONTEXT.md
 */
export function ProgressBar({ current, lane }: ProgressBarProps) {
  // Graduated lane has no progress bar
  if (lane === 'graduated') {
    return (
      <div className="mt-2 px-2 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded text-xs text-purple-300 font-semibold text-center">
        Graduated
      </div>
    );
  }

  // Calculate progress based on current lane
  const threshold = lane === 'new' ? THRESHOLD_NEW_TO_TRENDING : THRESHOLD_TRENDING_TO_GRADUATED;
  const percentage = Math.min((current / threshold) * 100, 100);

  // Check if near threshold (80%+ progress) for visual emphasis
  const isNearThreshold = percentage >= 80;

  // Color gradient based on lane and threshold proximity
  const gradientClass = isNearThreshold
    ? lane === 'new'
      ? 'from-yellow-500 to-orange-500'
      : 'from-orange-500 to-red-500'
    : lane === 'new'
      ? 'from-blue-600 to-purple-600'
      : 'from-purple-600 to-pink-600';

  // Background gradient with glow effect when near threshold
  const bgGradientClass = isNearThreshold
    ? 'from-yellow-500/20 to-orange-500/20 border-yellow-500/40'
    : lane === 'new'
      ? 'from-blue-500/20 to-purple-500/20'
      : 'from-purple-500/20 to-pink-500/20';

  return (
    <div className={`mt-2 px-2 py-1.5 bg-gradient-to-r ${bgGradientClass} border border-purple-500/20 rounded`}>
      {/* Progress bar track */}
      <div className="w-full bg-gray-800/50 rounded-full h-1.5 mb-1">
        <div
          className={`bg-gradient-to-r ${gradientClass} h-1.5 rounded-full transition-all duration-500 ${isNearThreshold ? 'animate-pulse' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Click count label with excitement when near threshold */}
      <div className={`text-xs text-center ${isNearThreshold ? 'text-yellow-400 font-bold' : 'text-gray-300'}`}>
        {current} {current === 1 ? 'click' : 'clicks'}
        {isNearThreshold && ' - Almost there!'}
      </div>
    </div>
  );
}
