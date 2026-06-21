/**
 * Application state management using React Context + useReducer.
 * Provides centralized state with type-safe actions and automatic persistence.
 */

import { createContext, useContext, useReducer, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { AppState, AppAction, EcoAction, Achievement } from '../types/carbon';
import { DEFAULT_ECO_ACTIONS, DEFAULT_ACHIEVEMENTS } from '../data/ecoActions';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { STORAGE_KEY, DEFAULT_WEEKLY_GOAL, WEEKLY_GOAL_MAX, WEEKLY_GOAL_MIN } from '../constants';

/** Initial application state */
const initialState: AppState = {
  profile: null,
  entries: [],
  actions: DEFAULT_ECO_ACTIONS.map(a => ({ ...a, completedDates: [] })),
  achievements: DEFAULT_ACHIEVEMENTS.map(a => ({ ...a, unlocked: false })),
  onboardingComplete: false,
  calculatorStep: 0,
  weeklyGoalKgCO2: DEFAULT_WEEKLY_GOAL,
};

/**
 * State reducer — handles all application state mutations.
 * Each case returns a new state object (immutable updates).
 */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };

    case 'ADD_ENTRY':
      return { ...state, entries: [...state.entries, action.payload] };

    case 'UPDATE_ENTRY':
      return {
        ...state,
        entries: state.entries.map(e =>
          e.id === action.payload.id ? action.payload : e
        ),
      };

    case 'DELETE_ENTRY':
      return {
        ...state,
        entries: state.entries.filter(e => e.id !== action.payload),
      };

    case 'COMPLETE_ACTION': {
      const { actionId, date } = action.payload;
      return {
        ...state,
        actions: state.actions.map(a =>
          a.id === actionId
            ? { ...a, completedDates: [...a.completedDates, date] }
            : a
        ),
      };
    }

    case 'UNLOCK_ACHIEVEMENT':
      return {
        ...state,
        achievements: state.achievements.map(a =>
          a.id === action.payload
            ? { ...a, unlocked: true, unlockedDate: new Date().toISOString() }
            : a
        ),
      };

    case 'SET_CALCULATOR_STEP':
      return { ...state, calculatorStep: action.payload };

    case 'SET_WEEKLY_GOAL':
      return { ...state, weeklyGoalKgCO2: Math.max(WEEKLY_GOAL_MIN, Math.min(action.payload, WEEKLY_GOAL_MAX)) };

    case 'COMPLETE_ONBOARDING':
      return { ...state, onboardingComplete: true };

    case 'LOAD_STATE':
      return { ...state, ...action.payload };

    case 'RESET_STATE':
      return { ...initialState };

    default:
      return state;
  }
}

/** Context type */
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  /** Get total actions completed count */
  totalActionsCompleted: number;
  /** Get current streak in days */
  currentStreak: number;
  /** Get total CO₂ saved from actions */
  totalCO2Saved: number;
  /** CO₂ saved this week toward weekly goal */
  weeklyProgress: number;
}

const AppContext = createContext<AppContextType | null>(null);

/** Storage key for persisted state — imported from constants */
const APP_STORAGE_KEY = STORAGE_KEY;

/**
 * AppProvider wraps the application with state context.
 * Automatically loads from and saves to localStorage.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState, (initial) => {
    // Load persisted state on initialization
    const saved = getStorageItem<Partial<AppState>>(APP_STORAGE_KEY, {});
    if (saved && Object.keys(saved).length > 0) {
      return { ...initial, ...saved };
    }
    return initial;
  });

  // Persist state changes to localStorage
  useEffect(() => {
    const { calculatorStep, ...persistable } = state;
    void calculatorStep; // intentionally not persisted
    setStorageItem(APP_STORAGE_KEY, persistable);
  }, [state]);

  // Calculate derived values
  const totalActionsCompleted = state.actions.reduce(
    (sum, action) => sum + action.completedDates.length,
    0
  );

  const totalCO2Saved = state.actions.reduce(
    (sum, action) => sum + action.completedDates.length * action.impactKgCO2,
    0
  );

  const currentStreak = useCallback(() => {
    const allDates = new Set<string>();
    state.actions.forEach(a => {
      a.completedDates.forEach(d => {
        allDates.add(d.split('T')[0]);
      });
    });

    const sortedDates = Array.from(allDates).sort().reverse();
    if (sortedDates.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Streak must include today or yesterday
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = (prev.getTime() - curr.getTime()) / 86400000;

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [state.actions])();

  // Calculate CO₂ saved this week (Mon-Sun)
  const weeklyProgress = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);
    const mondayStr = monday.toISOString();

    return state.actions.reduce((sum, action) => {
      const thisWeekCompletions = action.completedDates.filter(d => d >= mondayStr).length;
      return sum + thisWeekCompletions * action.impactKgCO2;
    }, 0);
  }, [state.actions]);

  // Check and unlock achievements
  useEffect(() => {
    const checkAchievements = () => {
      // First calculation
      if (state.entries.length >= 1 && !state.achievements.find(a => a.id === 'first-calc')?.unlocked) {
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'first-calc' });
      }

      // First action
      if (totalActionsCompleted >= 1 && !state.achievements.find(a => a.id === 'first-action')?.unlocked) {
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'first-action' });
      }

      // 5 unique actions
      const uniqueCompleted = state.actions.filter(a => a.completedDates.length > 0).length;
      if (uniqueCompleted >= 5 && !state.achievements.find(a => a.id === 'five-actions')?.unlocked) {
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'five-actions' });
      }

      // 20 total actions
      if (totalActionsCompleted >= 20 && !state.achievements.find(a => a.id === 'twenty-actions')?.unlocked) {
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'twenty-actions' });
      }

      // 7-day streak
      if (currentStreak >= 7 && !state.achievements.find(a => a.id === 'week-streak')?.unlocked) {
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'week-streak' });
      }

      // Below average footprint
      const latestEntry = state.entries[state.entries.length - 1];
      if (latestEntry && latestEntry.totalKgCO2 < 4700 && !state.achievements.find(a => a.id === 'below-average')?.unlocked) {
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'below-average' });
      }

      // Green eater (10 meatless meals)
      const meatlessAction = state.actions.find(a => a.id === 'meatless-meal');
      if (meatlessAction && meatlessAction.completedDates.length >= 10 && !state.achievements.find(a => a.id === 'green-diet')?.unlocked) {
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'green-diet' });
      }

      // All categories
      const categories = new Set(state.actions.filter(a => a.completedDates.length > 0).map(a => a.category));
      if (categories.size >= 5 && !state.achievements.find(a => a.id === 'all-categories')?.unlocked) {
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'all-categories' });
      }
    };

    checkAchievements();
  }, [state.entries, state.actions, totalActionsCompleted, currentStreak, state.achievements]);

  return (
    <AppContext.Provider value={{ state, dispatch, totalActionsCompleted, currentStreak, totalCO2Saved, weeklyProgress }}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Hook to access application state and dispatch.
 * Must be used within an AppProvider.
 */
export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// Re-export types for convenience
export type { EcoAction, Achievement };
