/**
 * Unit tests for the carbon calculation engine.
 * Tests cover all four emission categories, edge cases, and rating system.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateTransportEmissions,
  calculateEnergyEmissions,
  calculateFoodEmissions,
  calculateShoppingEmissions,
  calculateTotalFootprint,
  getFootprintRating,
  getPersonalizedInsights,
} from '../utils/carbonCalculator';

describe('calculateTransportEmissions', () => {
  it('returns 0 for no transport', () => {
    expect(calculateTransportEmissions({
      carKm: 0, carFuelType: 'none', publicTransportTrips: 0,
      shortFlightsPerYear: 0, longFlightsPerYear: 0,
    })).toBe(0);
  });

  it('calculates car emissions correctly', () => {
    const result = calculateTransportEmissions({
      carKm: 100, carFuelType: 'petrol', publicTransportTrips: 0,
      shortFlightsPerYear: 0, longFlightsPerYear: 0,
    });
    // 100km * 0.171 kgCO2/km * 52 weeks = 889.2 → rounded to 889
    expect(result).toBe(889);
  });

  it('includes flight emissions', () => {
    const result = calculateTransportEmissions({
      carKm: 0, carFuelType: 'none', publicTransportTrips: 0,
      shortFlightsPerYear: 2, longFlightsPerYear: 1,
    });
    // 2 * 255 + 1 * 1100 = 1610
    expect(result).toBe(1610);
  });

  it('clamps negative inputs to zero', () => {
    const result = calculateTransportEmissions({
      carKm: -100, carFuelType: 'petrol', publicTransportTrips: -5,
      shortFlightsPerYear: -1, longFlightsPerYear: -1,
    });
    expect(result).toBe(0);
  });

  it('clamps excessive inputs', () => {
    const capped = calculateTransportEmissions({
      carKm: 99999, carFuelType: 'petrol', publicTransportTrips: 0,
      shortFlightsPerYear: 0, longFlightsPerYear: 0,
    });
    const atMax = calculateTransportEmissions({
      carKm: 5000, carFuelType: 'petrol', publicTransportTrips: 0,
      shortFlightsPerYear: 0, longFlightsPerYear: 0,
    });
    expect(capped).toBe(atMax);
  });
});

describe('calculateEnergyEmissions', () => {
  it('calculates basic energy emissions', () => {
    const result = calculateEnergyEmissions({
      electricityKwh: 300, gasKwh: 200, renewableEnergy: false, householdSize: 1,
    });
    // (300 * 0.233 * 12) + (200 * 0.184 * 12) = 838.8 + 441.6 = 1280.4 → 1280
    expect(result).toBe(1280);
  });

  it('applies renewable energy discount', () => {
    const withRenewable = calculateEnergyEmissions({
      electricityKwh: 300, gasKwh: 0, renewableEnergy: true, householdSize: 1,
    });
    const without = calculateEnergyEmissions({
      electricityKwh: 300, gasKwh: 0, renewableEnergy: false, householdSize: 1,
    });
    expect(withRenewable).toBeLessThan(without);
  });

  it('divides by household size', () => {
    const single = calculateEnergyEmissions({
      electricityKwh: 300, gasKwh: 0, renewableEnergy: false, householdSize: 1,
    });
    const family = calculateEnergyEmissions({
      electricityKwh: 300, gasKwh: 0, renewableEnergy: false, householdSize: 4,
    });
    expect(family).toBe(Math.round(single / 4));
  });
});

describe('calculateFoodEmissions', () => {
  it('returns higher emissions for meat diets', () => {
    const vegan = calculateFoodEmissions({ dietType: 'vegan', localFood: false, foodWaste: 'none' });
    const highMeat = calculateFoodEmissions({ dietType: 'high-meat', localFood: false, foodWaste: 'none' });
    expect(highMeat).toBeGreaterThan(vegan);
  });

  it('reduces emissions for local food', () => {
    const local = calculateFoodEmissions({ dietType: 'medium-meat', localFood: true, foodWaste: 'none' });
    const notLocal = calculateFoodEmissions({ dietType: 'medium-meat', localFood: false, foodWaste: 'none' });
    expect(local).toBeLessThan(notLocal);
  });

  it('adds food waste emissions', () => {
    const noWaste = calculateFoodEmissions({ dietType: 'vegan', localFood: false, foodWaste: 'none' });
    const highWaste = calculateFoodEmissions({ dietType: 'vegan', localFood: false, foodWaste: 'high' });
    expect(highWaste).toBeGreaterThan(noWaste);
  });
});

describe('calculateShoppingEmissions', () => {
  it('returns 0 for no purchases with max recycling', () => {
    const result = calculateShoppingEmissions({
      clothingItems: 0, electronicsPurchases: 0, secondHand: false, recyclingLevel: 'all',
    });
    expect(result).toBe(0);
  });

  it('applies second-hand discount', () => {
    const newItems = calculateShoppingEmissions({
      clothingItems: 5, electronicsPurchases: 1, secondHand: false, recyclingLevel: 'none',
    });
    const secondHand = calculateShoppingEmissions({
      clothingItems: 5, electronicsPurchases: 1, secondHand: true, recyclingLevel: 'none',
    });
    expect(secondHand).toBeLessThan(newItems);
  });
});

describe('calculateTotalFootprint', () => {
  it('returns sum of all categories', () => {
    const transport = { carKm: 0, carFuelType: 'none' as const, publicTransportTrips: 0, shortFlightsPerYear: 0, longFlightsPerYear: 0 };
    const energy = { electricityKwh: 0, gasKwh: 0, renewableEnergy: false, householdSize: 1 };
    const food = { dietType: 'vegan' as const, localFood: false, foodWaste: 'none' as const };
    const shopping = { clothingItems: 0, electronicsPurchases: 0, secondHand: false, recyclingLevel: 'all' as const };

    const { breakdown, total } = calculateTotalFootprint(transport, energy, food, shopping);
    expect(total).toBe(breakdown.transport + breakdown.energy + breakdown.food + breakdown.shopping);
  });
});

describe('getFootprintRating', () => {
  it('returns Excellent for very low footprint', () => {
    expect(getFootprintRating(1500).label).toBe('Excellent');
  });

  it('returns Very High for very high footprint', () => {
    expect(getFootprintRating(15000).label).toBe('Very High');
  });
});

describe('getPersonalizedInsights', () => {
  it('returns insights for a valid breakdown', () => {
    const insights = getPersonalizedInsights({ transport: 3500, energy: 2500, food: 2000, shopping: 1000 });
    expect(insights.length).toBeGreaterThan(0);
    expect(insights[0]).toContain('transport');
  });

  it('handles zero breakdown', () => {
    const insights = getPersonalizedInsights({ transport: 0, energy: 0, food: 0, shopping: 0 });
    expect(insights[0]).toContain('Complete the calculator');
  });
});
