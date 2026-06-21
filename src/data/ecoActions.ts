/**
 * Predefined eco-actions that users can track.
 * Each action has a measurable CO₂ impact.
 */

import type { EcoAction } from '../types/carbon';

export const DEFAULT_ECO_ACTIONS: Omit<EcoAction, 'completedDates'>[] = [
  // Transport actions
  {
    id: 'bike-commute',
    title: 'Bike to Work/School',
    description: 'Replace a car trip with cycling for your daily commute.',
    category: 'transport',
    impactKgCO2: 2.4,
    difficulty: 'medium',
    icon: '🚲',
  },
  {
    id: 'public-transport',
    title: 'Take Public Transport',
    description: 'Use bus or train instead of driving for a trip today.',
    category: 'transport',
    impactKgCO2: 1.8,
    difficulty: 'easy',
    icon: '🚌',
  },
  {
    id: 'carpool',
    title: 'Carpool with Others',
    description: 'Share a ride with colleagues or neighbors.',
    category: 'transport',
    impactKgCO2: 1.5,
    difficulty: 'easy',
    icon: '🚗',
  },
  {
    id: 'walk-short',
    title: 'Walk Short Distances',
    description: 'Walk instead of driving for trips under 2km.',
    category: 'transport',
    impactKgCO2: 0.8,
    difficulty: 'easy',
    icon: '🚶',
  },

  // Energy actions
  {
    id: 'lights-off',
    title: 'Turn Off Unused Lights',
    description: 'Switch off lights in rooms you\'re not using.',
    category: 'energy',
    impactKgCO2: 0.3,
    difficulty: 'easy',
    icon: '💡',
  },
  {
    id: 'cold-wash',
    title: 'Cold Water Laundry',
    description: 'Wash clothes in cold water to save heating energy.',
    category: 'energy',
    impactKgCO2: 0.6,
    difficulty: 'easy',
    icon: '🧺',
  },
  {
    id: 'unplug-devices',
    title: 'Unplug Idle Devices',
    description: 'Unplug chargers and devices when not in use to prevent phantom energy use.',
    category: 'energy',
    impactKgCO2: 0.4,
    difficulty: 'easy',
    icon: '🔌',
  },
  {
    id: 'thermostat-adjust',
    title: 'Adjust Thermostat 2°C',
    description: 'Lower heating by 2°C in winter or raise AC by 2°C in summer.',
    category: 'energy',
    impactKgCO2: 1.2,
    difficulty: 'medium',
    icon: '🌡️',
  },

  // Food actions
  {
    id: 'meatless-meal',
    title: 'Eat a Meatless Meal',
    description: 'Choose a plant-based meal instead of meat.',
    category: 'food',
    impactKgCO2: 2.5,
    difficulty: 'easy',
    icon: '🥗',
  },
  {
    id: 'local-food',
    title: 'Buy Local Produce',
    description: 'Shop at a farmers market or buy locally-sourced food.',
    category: 'food',
    impactKgCO2: 0.8,
    difficulty: 'medium',
    icon: '🥕',
  },
  {
    id: 'reduce-waste',
    title: 'Zero Food Waste Day',
    description: 'Plan meals to use all ingredients with no food waste today.',
    category: 'food',
    impactKgCO2: 1.0,
    difficulty: 'medium',
    icon: '♻️',
  },
  {
    id: 'bring-bottle',
    title: 'Use Reusable Bottle',
    description: 'Carry a reusable water bottle instead of buying plastic.',
    category: 'food',
    impactKgCO2: 0.2,
    difficulty: 'easy',
    icon: '🍶',
  },

  // Shopping actions
  {
    id: 'repair-item',
    title: 'Repair Instead of Replace',
    description: 'Fix a broken item instead of buying a new one.',
    category: 'shopping',
    impactKgCO2: 5.0,
    difficulty: 'hard',
    icon: '🔧',
  },
  {
    id: 'secondhand',
    title: 'Buy Second-Hand',
    description: 'Purchase a pre-owned item instead of new.',
    category: 'shopping',
    impactKgCO2: 3.5,
    difficulty: 'medium',
    icon: '🏷️',
  },
  {
    id: 'bring-bag',
    title: 'Use Reusable Bags',
    description: 'Bring your own bags when shopping.',
    category: 'shopping',
    impactKgCO2: 0.1,
    difficulty: 'easy',
    icon: '🛍️',
  },

  // Lifestyle actions
  {
    id: 'plant-tree',
    title: 'Plant a Tree or Plant',
    description: 'Add greenery to your space — even a potted plant helps!',
    category: 'lifestyle',
    impactKgCO2: 10.0,
    difficulty: 'medium',
    icon: '🌳',
  },
  {
    id: 'digital-cleanup',
    title: 'Clean Up Digital Storage',
    description: 'Delete old emails, files, and photos to reduce cloud energy usage.',
    category: 'lifestyle',
    impactKgCO2: 0.5,
    difficulty: 'easy',
    icon: '📱',
  },
  {
    id: 'share-knowledge',
    title: 'Educate Someone',
    description: 'Share carbon footprint awareness with a friend or family member.',
    category: 'lifestyle',
    impactKgCO2: 0.0,
    difficulty: 'easy',
    icon: '📢',
  },
];

/**
 * Default achievements that users can unlock.
 */
export const DEFAULT_ACHIEVEMENTS = [
  {
    id: 'first-calc',
    title: 'Carbon Curious',
    description: 'Complete your first carbon footprint calculation.',
    icon: '🔍',
    condition: 'Complete the carbon calculator',
  },
  {
    id: 'first-action',
    title: 'First Step',
    description: 'Complete your first eco-action.',
    icon: '👣',
    condition: 'Complete any eco-action',
  },
  {
    id: 'five-actions',
    title: 'Eco Warrior',
    description: 'Complete 5 different eco-actions.',
    icon: '⚔️',
    condition: 'Complete 5 eco-actions',
  },
  {
    id: 'twenty-actions',
    title: 'Planet Champion',
    description: 'Complete 20 eco-actions total.',
    icon: '🏆',
    condition: 'Complete 20 eco-actions',
  },
  {
    id: 'week-streak',
    title: 'Week Warrior',
    description: 'Complete at least one action every day for 7 days.',
    icon: '🔥',
    condition: '7-day action streak',
  },
  {
    id: 'below-average',
    title: 'Below Average',
    description: 'Achieve a carbon footprint below the world average (4.7t CO₂e/year).',
    icon: '🌍',
    condition: 'Footprint below 4,700 kgCO₂e',
  },
  {
    id: 'green-diet',
    title: 'Green Eater',
    description: 'Log 10 meatless meals.',
    icon: '🥬',
    condition: 'Complete 10 meatless meals',
  },
  {
    id: 'all-categories',
    title: 'Well-Rounded',
    description: 'Complete at least one action from every category.',
    icon: '🎯',
    condition: 'Actions from all 5 categories',
  },
];
