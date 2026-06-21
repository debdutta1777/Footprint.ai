/**
 * EcoAssistant — Floating smart assistant widget.
 * 
 * Displays context-aware tips and recommendations based on
 * the user's footprint data, action history, and behavior patterns.
 * Implements accessibility: focus trap, keyboard nav, live regions.
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { generateSmartTips, type SmartTip } from '../utils/smartAssistant';

export default function EcoAssistant() {
  const { state, totalActionsCompleted, currentStreak, totalCO2Saved } = useAppContext();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const tips = useMemo(() =>
    generateSmartTips(state, totalActionsCompleted, currentStreak, totalCO2Saved),
    [state, totalActionsCompleted, currentStreak, totalCO2Saved]
  );

  const currentTip: SmartTip | undefined = tips[currentTipIndex];

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus panel when opened
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  const handleActionClick = useCallback((actionId?: string) => {
    if (actionId) {
      navigate('/actions');
      setIsOpen(false);
    }
  }, [navigate]);

  const nextTip = useCallback(() => {
    setCurrentTipIndex(i => (i + 1) % tips.length);
  }, [tips.length]);

  const prevTip = useCallback(() => {
    setCurrentTipIndex(i => (i - 1 + tips.length) % tips.length);
  }, [tips.length]);

  const categoryStyles: Record<SmartTip['category'], string> = {
    greeting: 'assistant-tip-greeting',
    insight: 'assistant-tip-insight',
    nudge: 'assistant-tip-nudge',
    celebration: 'assistant-tip-celebration',
    challenge: 'assistant-tip-challenge',
    tip: 'assistant-tip-default',
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        ref={toggleRef}
        className="assistant-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close eco assistant' : 'Open eco assistant for personalized tips'}
        aria-expanded={isOpen}
        aria-controls="assistant-panel"
        id="eco-assistant-toggle"
      >
        <span className="assistant-toggle-icon" aria-hidden="true">
          {isOpen ? '✕' : '🌿'}
        </span>
        {!isOpen && currentStreak > 0 && (
          <span className="assistant-badge" aria-hidden="true">
            🔥{currentStreak}
          </span>
        )}
      </button>

      {/* Assistant Panel */}
      {isOpen && (
        <div
          id="assistant-panel"
          ref={panelRef}
          className="assistant-panel"
          role="dialog"
          aria-label="EcoAssistant — Your smart carbon reduction guide"
          aria-modal="false"
          tabIndex={-1}
        >
          <div className="assistant-header">
            <div className="assistant-avatar" aria-hidden="true">🌿</div>
            <div>
              <div className="assistant-name">EcoAssistant</div>
              <div className="assistant-status">
                {tips.length} tips based on your profile
              </div>
            </div>
          </div>

          <div className="assistant-body" aria-live="polite" aria-atomic="true">
            {currentTip && (
              <div className={`assistant-tip ${categoryStyles[currentTip.category]}`}>
                <span className="assistant-tip-icon" aria-hidden="true">{currentTip.icon}</span>
                <p className="assistant-tip-text">{currentTip.message}</p>
                {currentTip.actionId && (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleActionClick(currentTip.actionId)}
                    style={{ marginTop: 'var(--space-3)', width: '100%' }}
                  >
                    🌱 Go to this action
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="assistant-nav">
            <button
              className="btn btn-sm btn-secondary"
              onClick={prevTip}
              disabled={tips.length <= 1}
              aria-label="Previous tip"
            >
              ←
            </button>
            <span className="assistant-counter" aria-label={`Tip ${currentTipIndex + 1} of ${tips.length}`}>
              {currentTipIndex + 1} / {tips.length}
            </span>
            <button
              className="btn btn-sm btn-secondary"
              onClick={nextTip}
              disabled={tips.length <= 1}
              aria-label="Next tip"
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
