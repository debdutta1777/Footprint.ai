/**
 * Tests for the Smart EcoAssistant recommendation engine.
 */

import { describe, it, expect } from 'vitest';
import { generateSmartTips } from '../utils/smartAssistant';
import type { AppState } from '../types/carbon';
import { DEFAULT_ECO_ACTIONS, DEFAULT_ACHIEVEMENTS } from '../data/ecoActions';

/** Create a minimal AppState for testing */
function createTestState(overrides: Partial<AppState> = {}): AppState {
  return {
    profile: null,
    entries: [],
    actions: DEFAULT_ECO_ACTIONS.map(a => ({ ...a, completedDates: [] })),
    achievements: DEFAULT_ACHIEVEMENTS.map(a => ({ ...a, unlocked: false })),
    onboardingComplete: false,
    calculatorStep: 0,
    weeklyGoalKgCO2: 10,
    ...overrides,
  };
}

describe('generateSmartTips', () => {
  it('always includes a time-based greeting', () => {
    const state = createTestState();
    const tips = generateSmartTips(state, 0, 0, 0);
    const greetings = tips.filter(t => t.category === 'greeting');
    expect(greetings.length).toBeGreaterThanOrEqual(1);
  });

  it('shows new user guidance when no entries exist', () => {
    const state = createTestState();
    const tips = generateSmartTips(state, 0, 0, 0);
    const nudge = tips.find(t => t.id === 'new-user');
    expect(nudge).toBeDefined();
    expect(nudge!.message).toContain('Welcome');
  });

  it('suggests starting a streak when streak is 0 and entries exist', () => {
    const state = createTestState({
      entries: [{
        id: '1', date: new Date().toISOString(),
        transport: { carKm: 100, carFuelType: 'petrol', publicTransportTrips: 5, shortFlightsPerYear: 0, longFlightsPerYear: 0 },
        energy: { electricityKwh: 200, gasKwh: 100, renewableEnergy: false, householdSize: 2 },
        food: { dietType: 'medium-meat', localFood: false, foodWaste: 'medium' },
        shopping: { clothingItems: 2, electronicsPurchases: 0, secondHand: false, recyclingLevel: 'some' },
        breakdown: { transport: 3000, energy: 1500, food: 2800, shopping: 500 },
        totalKgCO2: 7800,
      }],
    });
    const tips = generateSmartTips(state, 0, 0, 0);
    const streakTip = tips.find(t => t.id === 'start-streak');
    expect(streakTip).toBeDefined();
  });

  it('celebrates long streaks', () => {
    const state = createTestState({
      entries: [{
        id: '1', date: new Date().toISOString(),
        transport: { carKm: 0, carFuelType: 'none', publicTransportTrips: 0, shortFlightsPerYear: 0, longFlightsPerYear: 0 },
        energy: { electricityKwh: 100, gasKwh: 0, renewableEnergy: true, householdSize: 1 },
        food: { dietType: 'vegan', localFood: true, foodWaste: 'none' },
        shopping: { clothingItems: 0, electronicsPurchases: 0, secondHand: true, recyclingLevel: 'all' },
        breakdown: { transport: 0, energy: 100, food: 1350, shopping: 0 },
        totalKgCO2: 1450,
      }],
    });
    const tips = generateSmartTips(state, 30, 10, 50);
    const celebration = tips.find(t => t.id === 'streak-celebration');
    expect(celebration).toBeDefined();
    expect(celebration!.message).toContain('10-day streak');
  });

  it('prioritizes tips by relevance score', () => {
    const state = createTestState();
    const tips = generateSmartTips(state, 0, 0, 0);
    // Tips should be sorted by priority (descending)
    for (let i = 1; i < tips.length; i++) {
      expect(tips[i - 1].priority).toBeGreaterThanOrEqual(tips[i].priority);
    }
  });

  it('provides footprint-specific insight for high transport', () => {
    const state = createTestState({
      entries: [{
        id: '1', date: new Date().toISOString(),
        transport: { carKm: 300, carFuelType: 'petrol', publicTransportTrips: 0, shortFlightsPerYear: 4, longFlightsPerYear: 2 },
        energy: { electricityKwh: 200, gasKwh: 100, renewableEnergy: false, householdSize: 2 },
        food: { dietType: 'medium-meat', localFood: false, foodWaste: 'medium' },
        shopping: { clothingItems: 2, electronicsPurchases: 0, secondHand: false, recyclingLevel: 'some' },
        breakdown: { transport: 5000, energy: 1500, food: 2800, shopping: 500 },
        totalKgCO2: 9800,
      }],
    });
    const tips = generateSmartTips(state, 0, 0, 0);
    const transportTip = tips.find(t => t.id === 'try-biking');
    expect(transportTip).toBeDefined();
    expect(transportTip!.actionId).toBe('bike-commute');
  });

  it('calculates tree equivalent for CO₂ saved', () => {
    const state = createTestState({
      entries: [{
        id: '1', date: new Date().toISOString(),
        transport: { carKm: 0, carFuelType: 'none', publicTransportTrips: 0, shortFlightsPerYear: 0, longFlightsPerYear: 0 },
        energy: { electricityKwh: 100, gasKwh: 0, renewableEnergy: true, householdSize: 1 },
        food: { dietType: 'vegan', localFood: true, foodWaste: 'none' },
        shopping: { clothingItems: 0, electronicsPurchases: 0, secondHand: true, recyclingLevel: 'all' },
        breakdown: { transport: 0, energy: 100, food: 1350, shopping: 0 },
        totalKgCO2: 1450,
      }],
    });
    const tips = generateSmartTips(state, 10, 3, 42);
    const treeTip = tips.find(t => t.id === 'co2-equivalent');
    expect(treeTip).toBeDefined();
    expect(treeTip!.message).toContain('trees');
  });
});
