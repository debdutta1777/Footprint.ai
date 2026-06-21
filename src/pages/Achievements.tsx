/**
 * Achievements & badges page.
 * Displays unlocked and locked achievement badges with overall progress summary.
 */

import { useAppContext } from '../context/AppContext';
import { formatDate } from '../utils/formatters';

/** Achievements & badges page. */
export default function Achievements() {
  const { state, totalActionsCompleted, currentStreak } = useAppContext();
  const unlockedCount = state.achievements.filter(a => a.unlocked).length;

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <h1>Achievements</h1>
        <p>Earn badges as you progress on your sustainability journey</p>
      </div>

      {/* Progress Summary */}
      <div className="card achievement-summary">
        <div className="achievement-count">
          {unlockedCount} / {state.achievements.length}
        </div>
        <div className="text-secondary mb-4">Achievements Unlocked</div>
        <div className="progress-bar achievement-progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(unlockedCount / state.achievements.length) * 100}%` }}
          />
        </div>
        <div className="achievement-stats">
          <div className="achievement-stat-item">
            <div className="font-700 text-xl">{totalActionsCompleted}</div>
            <div className="text-sm text-secondary">Actions Done</div>
          </div>
          <div className="achievement-stat-item">
            <div className="font-700 text-xl">{currentStreak}</div>
            <div className="text-sm text-secondary">Day Streak</div>
          </div>
          <div className="achievement-stat-item">
            <div className="font-700 text-xl">{state.entries.length}</div>
            <div className="text-sm text-secondary">Calculations</div>
          </div>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-3" role="list" aria-label="Achievement badges">
        {state.achievements.map(achievement => (
          <div
            key={achievement.id}
            className={`card achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            role="listitem"
            aria-label={`${achievement.title}: ${achievement.unlocked ? 'Unlocked' : 'Locked'}`}
          >
            <div className="achievement-icon" aria-hidden="true">{achievement.icon}</div>
            <div className="achievement-title">{achievement.title}</div>
            <div className="achievement-desc">{achievement.description}</div>
            {achievement.unlocked ? (
              <div className="badge badge-success mt-3">
                ✓ Unlocked {achievement.unlockedDate ? formatDate(achievement.unlockedDate) : ''}
              </div>
            ) : (
              <div className="mt-3 text-xs text-muted">
                🔒 {achievement.condition}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
