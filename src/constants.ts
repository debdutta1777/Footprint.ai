/**
 * Application-wide constants.
 * Centralizes magic numbers, limits, and configuration values
 * for maintainability and discoverability.
 */

/** Storage key prefix for all localStorage items */
export const STORAGE_PREFIX = 'carbonwise_' as const;

/** Main app state storage key */
export const STORAGE_KEY = 'app_state' as const;

/** Maximum completions allowed per action per day (rate limiting) */
export const MAX_DAILY_ACTION_COMPLETIONS = 50;

/** Weekly CO₂ goal limits */
export const WEEKLY_GOAL_MIN = 0;
export const WEEKLY_GOAL_MAX = 200;

/** Default weekly goal in kgCO₂e */
export const DEFAULT_WEEKLY_GOAL = 10;

/** World average annual carbon footprint in kgCO₂e */
export const WORLD_AVERAGE_FOOTPRINT_KG = 4700;

/** Paris Agreement 2030 target in kgCO₂e per person */
export const PARIS_TARGET_FOOTPRINT_KG = 2500;

/** Max footprint for chart scaling (12 tonnes) */
export const MAX_CHART_FOOTPRINT_KG = 12000;

/** CO₂ absorbed by one mature tree per year in kg */
export const CO2_PER_TREE_KG = 21;

/** Application routes for type-safe navigation */
export const ROUTES = {
  HOME: '/',
  CALCULATOR: '/calculator',
  DASHBOARD: '/dashboard',
  ACTIONS: '/actions',
  ACHIEVEMENTS: '/achievements',
} as const;

/** Calculator step labels */
export const CALCULATOR_STEPS = ['Transport', 'Energy', 'Food', 'Shopping', 'Results'] as const;

/** Category colors used across charts and UI */
export const CATEGORY_COLORS = {
  transport: '#3b82f6',
  energy: '#f59e0b',
  food: '#22c55e',
  shopping: '#a855f7',
} as const;

/** Footprint rating thresholds */
export const RATING_THRESHOLDS = {
  EXCELLENT: 2500,
  GOOD: 4700,
  AVERAGE: 7000,
  HIGH: 10000,
} as const;

/** Animation durations in milliseconds */
export const ANIMATION = {
  TOAST_DURATION: 3000,
  TRANSITION_BASE: 200,
  TRANSITION_SLOW: 500,
} as const;
