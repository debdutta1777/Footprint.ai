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
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
        <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>
          {unlockedCount} / {state.achievements.length}
        </div>
        <div style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
          Achievements Unlocked
        </div>
        <div className="progress-bar" style={{ maxWidth: 400, margin: '0 auto', height: 12 }}>
          <div className="progress-fill" style={{
            width: `${(unlockedCount / state.achievements.length) * 100}%`,
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-8)', marginTop: 'var(--space-6)' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-xl)' }}>{totalActionsCompleted}</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Actions Done</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-xl)' }}>{currentStreak}</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Day Streak</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-xl)' }}>{state.entries.length}</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Calculations</div>
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
              <div className="badge badge-success" style={{ marginTop: 'var(--space-3)' }}>
                ✓ Unlocked {achievement.unlockedDate ? formatDate(achievement.unlockedDate) : ''}
              </div>
            ) : (
              <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                🔒 {achievement.condition}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
