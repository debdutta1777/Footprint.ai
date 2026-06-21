/**
 * Carbon footprint calculation engine.
 * 
 * All emission factors are sourced from widely-accepted averages:
 * - UK DEFRA 2023 conversion factors
 * - EPA greenhouse gas equivalencies
 * - IPCC AR6 emission factor guidelines
 * 
 * All outputs are in kg CO₂ equivalent per year.
 */

import type { TransportData, EnergyData, FoodData, ShoppingData, CarbonBreakdown } from '../types/carbon';

/* ──────────────────────────────────────────────
 * Emission Factor Constants (kgCO₂e per unit)
 * ────────────────────────────────────────────── */

/** Transport emission factors (kgCO₂e per km) */
const TRANSPORT_FACTORS = {
  car: {
    petrol: 0.171,    // Average petrol car
    diesel: 0.168,    // Average diesel car
    hybrid: 0.105,    // Hybrid vehicle
    electric: 0.047,  // BEV (grid average)
    none: 0,
  },
  publicTransport: 0.089,   // kgCO₂e per trip (avg bus/train mix)
  shortFlight: 255,         // kgCO₂e per short-haul flight (round trip)
  longFlight: 1100,         // kgCO₂e per long-haul flight (round trip)
} as const;

/** Energy emission factors */
const ENERGY_FACTORS = {
  electricity: 0.233,   // kgCO₂e per kWh (global average)
  gas: 0.184,           // kgCO₂e per kWh (natural gas)
  renewableDiscount: 0.85, // 85% reduction for renewable energy
} as const;

/** Diet emission factors (kgCO₂e per year) */
const DIET_FACTORS: Record<FoodData['dietType'], number> = {
  vegan: 1500,
  vegetarian: 1700,
  pescatarian: 1900,
  'low-meat': 2300,
  'medium-meat': 2800,
  'high-meat': 3500,
} as const;

/** Food waste emission factors (kgCO₂e per year additional) */
const FOOD_WASTE_FACTORS: Record<FoodData['foodWaste'], number> = {
  none: 0,
  low: 150,
  medium: 350,
  high: 600,
} as const;

/** Shopping emission factors */
const SHOPPING_FACTORS = {
  clothing: 25,          // kgCO₂e per item
  electronics: 200,      // kgCO₂e per purchase
  secondHandDiscount: 0.7, // 70% reduction for second-hand
  recyclingReduction: {
    none: 0,
    some: 50,
    most: 150,
    all: 250,
  },
} as const;

/** World average carbon footprint for comparison (kgCO₂e/year) */
export const WORLD_AVERAGE_FOOTPRINT = 4700;

/** Recommended target carbon footprint (kgCO₂e/year) — Paris Agreement aligned */
export const TARGET_FOOTPRINT = 2500;

/* ──────────────────────────────────────────────
 * Calculation Functions
 * ────────────────────────────────────────────── */

/**
 * Calculate annual transport carbon emissions.
 * Validates input ranges and clamps to reasonable bounds.
 */
export function calculateTransportEmissions(data: TransportData): number {
  const weeklyCarKm = Math.max(0, Math.min(data.carKm, 5000)); // Cap at 5000 km/week
  const carEmissions = weeklyCarKm * TRANSPORT_FACTORS.car[data.carFuelType] * 52;

  const weeklyTrips = Math.max(0, Math.min(data.publicTransportTrips, 100));
  const publicTransportEmissions = weeklyTrips * TRANSPORT_FACTORS.publicTransport * 52;

  const shortFlights = Math.max(0, Math.min(data.shortFlightsPerYear, 100));
  const longFlights = Math.max(0, Math.min(data.longFlightsPerYear, 50));
  const flightEmissions =
    shortFlights * TRANSPORT_FACTORS.shortFlight +
    longFlights * TRANSPORT_FACTORS.longFlight;

  return Math.round(carEmissions + publicTransportEmissions + flightEmissions);
}

/**
 * Calculate annual home energy carbon emissions.
 * Adjusts per capita based on household size.
 */
export function calculateEnergyEmissions(data: EnergyData): number {
  const householdSize = Math.max(1, Math.min(data.householdSize, 20));
  const monthlyElectricity = Math.max(0, Math.min(data.electricityKwh, 10000));
  const monthlyGas = Math.max(0, Math.min(data.gasKwh, 10000));

  let electricityEmissions = monthlyElectricity * ENERGY_FACTORS.electricity * 12;
  let gasEmissions = monthlyGas * ENERGY_FACTORS.gas * 12;

  // Apply renewable energy discount
  if (data.renewableEnergy) {
    electricityEmissions *= (1 - ENERGY_FACTORS.renewableDiscount);
  }

  // Per-capita share
  const perCapita = (electricityEmissions + gasEmissions) / householdSize;
  return Math.round(perCapita);
}

/**
 * Calculate annual food-related carbon emissions.
 */
export function calculateFoodEmissions(data: FoodData): number {
  let emissions = DIET_FACTORS[data.dietType];

  // Local food reduces transport emissions by ~10%
  if (data.localFood) {
    emissions *= 0.9;
  }

  // Add food waste emissions
  emissions += FOOD_WASTE_FACTORS[data.foodWaste];

  return Math.round(emissions);
}

/**
 * Calculate annual shopping/consumption carbon emissions.
 */
export function calculateShoppingEmissions(data: ShoppingData): number {
  const clothingItems = Math.max(0, Math.min(data.clothingItems, 100));
  const electronics = Math.max(0, Math.min(data.electronicsPurchases, 50));

  let clothingEmissions = clothingItems * SHOPPING_FACTORS.clothing * 12;
  let electronicsEmissions = electronics * SHOPPING_FACTORS.electronics * 12;

  // Second-hand discount
  if (data.secondHand) {
    clothingEmissions *= (1 - SHOPPING_FACTORS.secondHandDiscount);
    electronicsEmissions *= (1 - SHOPPING_FACTORS.secondHandDiscount);
  }

  // Recycling reduction
  const recyclingReduction = SHOPPING_FACTORS.recyclingReduction[data.recyclingLevel];

  return Math.round(Math.max(0, clothingEmissions + electronicsEmissions - recyclingReduction));
}

/**
 * Calculate complete carbon breakdown across all categories.
 * Returns both individual category totals and overall total.
 */
export function calculateTotalFootprint(
  transport: TransportData,
  energy: EnergyData,
  food: FoodData,
  shopping: ShoppingData
): { breakdown: CarbonBreakdown; total: number } {
  const breakdown: CarbonBreakdown = {
    transport: calculateTransportEmissions(transport),
    energy: calculateEnergyEmissions(energy),
    food: calculateFoodEmissions(food),
    shopping: calculateShoppingEmissions(shopping),
  };

  const total = breakdown.transport + breakdown.energy + breakdown.food + breakdown.shopping;

  return { breakdown, total };
}

/**
 * Get a human-friendly rating based on total annual footprint.
 */
export function getFootprintRating(totalKgCO2: number): {
  label: string;
  color: string;
  description: string;
} {
  if (totalKgCO2 <= 2000) {
    return {
      label: 'Excellent',
      color: 'var(--color-success)',
      description: 'Your footprint is well below the sustainable target. Keep it up!',
    };
  }
  if (totalKgCO2 <= 4000) {
    return {
      label: 'Good',
      color: 'var(--color-primary)',
      description: 'You\'re below the world average. Small changes can make you excellent!',
    };
  }
  if (totalKgCO2 <= 6000) {
    return {
      label: 'Average',
      color: 'var(--color-warning)',
      description: 'Your footprint is around the world average. Let\'s find ways to reduce it.',
    };
  }
  if (totalKgCO2 <= 10000) {
    return {
      label: 'High',
      color: 'var(--color-accent)',
      description: 'Your footprint is above average. Check our eco-actions for reduction tips.',
    };
  }
  return {
    label: 'Very High',
    color: 'var(--color-danger)',
    description: 'Your footprint is significantly above average. Major changes can help.',
  };
}

/**
 * Get personalized insight messages based on the user's carbon breakdown.
 */
export function getPersonalizedInsights(breakdown: CarbonBreakdown): string[] {
  const insights: string[] = [];
  const total = breakdown.transport + breakdown.energy + breakdown.food + breakdown.shopping;

  if (total === 0) return ['Complete the calculator to get personalized insights.'];

  // Find largest contributor
  const categories = Object.entries(breakdown) as [keyof CarbonBreakdown, number][];
  categories.sort((a, b) => b[1] - a[1]);
  const [topCategory, topValue] = categories[0];
  const topPercent = Math.round((topValue / total) * 100);

  insights.push(
    `Your largest carbon source is **${topCategory}** at ${topPercent}% of your total footprint.`
  );

  // Category-specific insights
  if (breakdown.transport > 3000) {
    insights.push('🚗 Consider carpooling, cycling, or public transport to cut transport emissions significantly.');
  }
  if (breakdown.energy > 2000) {
    insights.push('⚡ Switching to a renewable energy provider could reduce your energy emissions by up to 85%.');
  }
  if (breakdown.food > 2500) {
    insights.push('🥗 Reducing meat consumption even by one day per week can save ~500 kgCO₂e annually.');
  }
  if (breakdown.shopping > 1500) {
    insights.push('🛍️ Buying second-hand and recycling can reduce shopping emissions by up to 70%.');
  }

  // Comparison insight
  if (total < WORLD_AVERAGE_FOOTPRINT) {
    insights.push(`🌍 Great job! Your footprint is ${Math.round(((WORLD_AVERAGE_FOOTPRINT - total) / WORLD_AVERAGE_FOOTPRINT) * 100)}% below the world average.`);
  } else {
    insights.push(`🌍 Your footprint is ${Math.round(((total - WORLD_AVERAGE_FOOTPRINT) / WORLD_AVERAGE_FOOTPRINT) * 100)}% above the world average of ${(WORLD_AVERAGE_FOOTPRINT / 1000).toFixed(1)}t CO₂e/year.`);
  }

  return insights;
}
