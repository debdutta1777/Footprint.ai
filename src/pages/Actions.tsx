import { useState, useCallback, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatCO2 } from '../utils/formatters';

type CategoryFilter = 'all' | 'transport' | 'energy' | 'food' | 'shopping' | 'lifestyle';

/** Eco Actions tracking page. */
export default function Actions() {
  const { state, dispatch, totalCO2Saved } = useAppContext();
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [toast, setToast] = useState<string | null>(null);

  const filteredActions = useMemo(() => {
    if (filter === 'all') return state.actions;
    return state.actions.filter(a => a.category === filter);
  }, [state.actions, filter]);

  const handleComplete = useCallback((actionId: string, actionTitle: string) => {
    // Rate limiting: max 50 completions per action per day
    const todayStr = new Date().toISOString().split('T')[0];
    const action = state.actions.find(a => a.id === actionId);
    if (action) {
      const todayCount = action.completedDates.filter(d => d.startsWith(todayStr)).length;
      if (todayCount >= 50) {
        setToast(`⚠️ Daily limit reached for "${actionTitle}". Try again tomorrow!`);
        setTimeout(() => setToast(null), 3000);
        return;
      }
    }
    const today = new Date().toISOString();
    dispatch({ type: 'COMPLETE_ACTION', payload: { actionId, date: today } });
    setToast(`✅ "${actionTitle}" completed! Great job!`);
    setTimeout(() => setToast(null), 3000);
  }, [dispatch, state.actions]);

  const categories: { value: CategoryFilter; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: '🌍' },
    { value: 'transport', label: 'Transport', icon: '🚗' },
    { value: 'energy', label: 'Energy', icon: '⚡' },
    { value: 'food', label: 'Food', icon: '🥗' },
    { value: 'shopping', label: 'Shopping', icon: '🛍️' },
    { value: 'lifestyle', label: 'Lifestyle', icon: '🌱' },
  ];

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <h1>Eco Actions</h1>
        <p>Small steps that make a big difference — track your daily eco-friendly actions</p>
      </div>

      {/* Summary */}
      <div className="grid grid-3" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="card stat-card">
          <div className="stat-icon" aria-hidden="true">✅</div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
            {state.actions.reduce((s, a) => s + a.completedDates.length, 0)}
          </div>
          <div className="stat-label">Total Completions</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" aria-hidden="true">💚</div>
          <div className="stat-value" style={{ color: 'var(--color-secondary)' }}>
            {formatCO2(totalCO2Saved)}
          </div>
          <div className="stat-label">Total CO₂ Saved</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" aria-hidden="true">🎯</div>
          <div className="stat-value" style={{ color: 'var(--color-accent)' }}>
            {state.actions.filter(a => a.completedDates.length > 0).length}/{state.actions.length}
          </div>
          <div className="stat-label">Actions Tried</div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="filter-tabs" role="tablist" aria-label="Filter actions by category">
        {categories.map(cat => (
          <button
            key={cat.value}
            className={`filter-tab ${filter === cat.value ? 'active' : ''}`}
            onClick={() => setFilter(cat.value)}
            role="tab"
            aria-selected={filter === cat.value}
            aria-controls="actions-list"
          >
            <span aria-hidden="true">{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Actions List */}
      <div id="actions-list" role="tabpanel" className="grid grid-2" aria-label="Eco actions list">
        {filteredActions.map(action => (
          <div key={action.id} className="card action-card">
            <div className="action-icon" style={{
              background: action.completedDates.length > 0
                ? 'rgba(34,197,94,0.15)'
                : 'var(--color-primary-subtle)',
            }} aria-hidden="true">
              {action.icon}
            </div>
            <div className="action-content">
              <div className="action-title">{action.title}</div>
              <div className="action-desc">{action.description}</div>
              <div className="action-meta">
                <span className="action-impact">
                  -{action.impactKgCO2} kgCO₂e
                </span>
                <span className={`action-difficulty difficulty-${action.difficulty}`}>
                  {action.difficulty}
                </span>
                {action.completedDates.length > 0 && (
                  <span className="badge badge-success">
                    ✓ {action.completedDates.length}x done
                  </span>
                )}
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleComplete(action.id, action.title)}
              aria-label={`Complete action: ${action.title}`}
              style={{ flexShrink: 0, alignSelf: 'center' }}
            >
              ✓ Done
            </button>
          </div>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast-container" role="status" aria-live="polite">
          <div className="toast toast-success">{toast}</div>
        </div>
      )}
    </div>
  );
}
