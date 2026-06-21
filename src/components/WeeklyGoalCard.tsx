/**
 * WeeklyGoalCard — displays and edits the user's weekly CO₂ reduction goal.
 *
 * Shows a progress bar for the current week's actions vs. the goal,
 * with an inline edit mode for setting a new target.
 * Memoized to prevent re-renders when unrelated dashboard state changes.
 */

import { useState, memo, useCallback } from 'react';
import { WEEKLY_GOAL_MIN, WEEKLY_GOAL_MAX } from '@/constants';

/** Props for the WeeklyGoalCard component */
interface WeeklyGoalCardProps {
  /** The current weekly goal in kgCO₂e */
  goal: number;
  /** Progress toward the goal this week in kgCO₂e saved */
  progress: number;
  /** Callback when the user sets a new goal */
  onGoalChange: (goal: number) => void;
}

/** Displays weekly CO₂ reduction goal with progress bar and edit functionality. */
const WeeklyGoalCard = memo(function WeeklyGoalCard({ goal, progress, onGoalChange }: WeeklyGoalCardProps) {
  const [editing, setEditing] = useState(false);
  const [draftGoal, setDraftGoal] = useState(goal);

  const percentage = goal > 0 ? Math.min((progress / goal) * 100, 100) : 0;
  const isGoalMet = progress >= goal && goal > 0;

  const handleSave = useCallback(() => {
    onGoalChange(draftGoal);
    setEditing(false);
  }, [draftGoal, onGoalChange]);

  const handleEdit = useCallback(() => {
    setDraftGoal(goal);
    setEditing(true);
  }, [goal]);

  return (
    <div className="card mb-6" role="region" aria-label="Weekly CO₂ reduction goal">
      <div className="flex-between mb-4">
        <h2 className="section-heading" style={{ marginBottom: 0 }}>🎯 Weekly Goal</h2>
        {editing ? (
          <div className="flex-start gap-2">
            <input
              type="number"
              min={WEEKLY_GOAL_MIN}
              max={WEEKLY_GOAL_MAX}
              value={draftGoal}
              onChange={e => setDraftGoal(Number(e.target.value))}
              className="form-input"
              style={{ width: 80 }}
              aria-label="Weekly goal in kgCO₂e"
            />
            <span className="text-sm text-secondary">kgCO₂e</span>
            <button className="btn btn-sm btn-primary" onClick={handleSave}>Set</button>
          </div>
        ) : (
          <button className="btn btn-sm btn-secondary" onClick={handleEdit}>
            ✏️ Edit Goal
          </button>
        )}
      </div>

      <div
        className="progress-bar goal-progress-bar"
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Weekly goal progress: ${Math.round(percentage)}%`}
      >
        <div
          className="progress-fill"
          style={{
            width: `${percentage}%`,
            background: isGoalMet
              ? 'linear-gradient(90deg, var(--color-primary), #06b6d4)'
              : 'linear-gradient(90deg, var(--color-accent), var(--color-primary))',
          }}
        />
      </div>

      <div className="goal-progress-text">
        <span className="text-secondary">
          {progress.toFixed(1)} / {goal} kgCO₂e saved this week
        </span>
        <span
          className="font-600"
          style={{ color: isGoalMet ? 'var(--color-primary)' : 'var(--color-accent)' }}
        >
          {isGoalMet ? '✅ Goal met!' : `${Math.round(percentage)}%`}
        </span>
      </div>
    </div>
  );
});

export default WeeklyGoalCard;
