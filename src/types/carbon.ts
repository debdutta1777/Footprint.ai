/**
 * Core type definitions for the CarbonWise application.
 * All carbon values are in kg CO₂ equivalent (kgCO₂e).
 */

/** Transport-related carbon data */
export interface TransportData {
  /** Weekly car kilometers driven */
  carKm: number;
  /** Car fuel type */
  carFuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric' | 'none';
  /** Weekly public transport trips */
  publicTransportTrips: number;
  /** Number of short-haul flights per year (< 3 hours) */
  shortFlightsPerYear: number;
  /** Number of long-haul flights per year (> 3 hours) */
  longFlightsPerYear: number;
}

/** Home energy usage data */
export interface EnergyData {
  /** Monthly electricity usage in kWh */
  electricityKwh: number;
  /** Monthly natural gas usage in kWh */
  gasKwh: number;
  /** Whether user has renewable energy */
  renewableEnergy: boolean;
  /** Number of people in household */
  householdSize: number;
}

/** Food and diet data */
export interface FoodData {
  /** Diet type classification */
  dietType: 'vegan' | 'vegetarian' | 'pescatarian' | 'low-meat' | 'medium-meat' | 'high-meat';
  /** Whether user prioritizes local food */
  localFood: boolean;
  /** Weekly food waste level */
  foodWaste: 'none' | 'low' | 'medium' | 'high';
}

/** Shopping and consumption data */
export interface ShoppingData {
  /** Monthly clothing purchases */
  clothingItems: number;
  /** Monthly electronics purchases */
  electronicsPurchases: number;
  /** Whether user buys second-hand */
  secondHand: boolean;
  /** Recycling habit level */
  recyclingLevel: 'none' | 'some' | 'most' | 'all';
}

/** A complete carbon footprint entry */
export interface CarbonEntry {
  /** Unique identifier */
  id: string;
  /** ISO date string */
  date: string;
  /** Transport carbon data */
  transport: TransportData;
  /** Energy carbon data */
  energy: EnergyData;
  /** Food carbon data */
  food: FoodData;
  /** Shopping carbon data */
  shopping: ShoppingData;
  /** Breakdown of CO₂ by category in kgCO₂e/year */
  breakdown: CarbonBreakdown;
  /** Total annual carbon footprint in kgCO₂e */
  totalKgCO2: number;
}

/** Carbon breakdown by category */
export interface CarbonBreakdown {
  transport: number;
  energy: number;
  food: number;
  shopping: number;
}

/** An eco-action that users can complete */
export interface EcoAction {
  /** Unique identifier */
  id: string;
  /** Action title */
  title: string;
  /** Action description */
  description: string;
  /** Category of action */
  category: 'transport' | 'energy' | 'food' | 'shopping' | 'lifestyle';
  /** CO₂ savings per completion in kgCO₂e */
  impactKgCO2: number;
  /** Difficulty level */
  difficulty: 'easy' | 'medium' | 'hard';
  /** Icon emoji */
  icon: string;
  /** Dates completed */
  completedDates: string[];
}

/** Achievement badge */
export interface Achievement {
  /** Unique identifier */
  id: string;
  /** Badge title */
  title: string;
  /** Badge description */
  description: string;
  /** Icon emoji */
  icon: string;
  /** Whether unlocked */
  unlocked: boolean;
  /** Date unlocked (ISO string) */
  unlockedDate?: string;
  /** Unlock condition description */
  condition: string;
}

/** User profile and settings */
export interface UserProfile {
  /** Display name */
  name: string;
  /** Account creation date */
  createdAt: string;
  /** User preferences */
  settings: UserSettings;
}

/** User preferences */
export interface UserSettings {
  /** Preferred unit system */
  units: 'metric' | 'imperial';
  /** Enable notifications */
  notifications: boolean;
  /** Weekly goal in kgCO₂e reduction */
  weeklyGoal: number;
}

/** Application state */
export interface AppState {
  /** User profile */
  profile: UserProfile | null;
  /** Carbon footprint entries */
  entries: CarbonEntry[];
  /** Eco actions list */
  actions: EcoAction[];
  /** Achievements */
  achievements: Achievement[];
  /** Whether onboarding is complete */
  onboardingComplete: boolean;
  /** Current calculator step */
  calculatorStep: number;
  /** Weekly CO₂ reduction goal in kgCO₂e (0 = no goal set) */
  weeklyGoalKgCO2: number;
}

/** Action types for state reducer */
export type AppAction =
  | { type: 'SET_PROFILE'; payload: UserProfile }
  | { type: 'ADD_ENTRY'; payload: CarbonEntry }
  | { type: 'UPDATE_ENTRY'; payload: CarbonEntry }
  | { type: 'DELETE_ENTRY'; payload: string }
  | { type: 'COMPLETE_ACTION'; payload: { actionId: string; date: string } }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'SET_CALCULATOR_STEP'; payload: number }
  | { type: 'SET_WEEKLY_GOAL'; payload: number }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  | { type: 'RESET_STATE' };
