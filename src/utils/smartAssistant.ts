/**
 * Smart EcoAssistant — Context-aware recommendation engine.
 * 
 * Analyzes user's footprint data, action history, time patterns,
 * and streak status to generate dynamic, personalized suggestions.
 * This is the "smart, dynamic assistant" that makes logical decisions
 * based on user context.
 */

import type { AppState, CarbonBreakdown } from '../types/carbon';

/** A smart tip with priority and category context */
export interface SmartTip {
  id: string;
  message: string;
  category: 'greeting' | 'insight' | 'nudge' | 'celebration' | 'challenge' | 'tip';
  priority: number;     // Higher = more relevant
  actionId?: string;    // Suggested eco-action to complete
  icon: string;
}

/**
 * Generate context-aware tips based on complete user state.
 * Uses time of day, streak data, footprint breakdown, and action history
 * to produce relevant, personalized recommendations.
 */
export function generateSmartTips(
  state: AppState,
  totalActionsCompleted: number,
  currentStreak: number,
  totalCO2Saved: number
): SmartTip[] {
  const tips: SmartTip[] = [];
  const hour = new Date().getHours();
  const latestEntry = state.entries[state.entries.length - 1];

  // ── Time-based greetings ──
  if (hour >= 5 && hour < 12) {
    tips.push({
      id: 'morning-greeting',
      message: 'Good morning! 🌅 Start your day with an eco-friendly action. Even small changes add up over time.',
      category: 'greeting',
      priority: 1,
      icon: '☀️',
    });
  } else if (hour >= 12 && hour < 17) {
    tips.push({
      id: 'afternoon-greeting',
      message: 'Good afternoon! How about a meatless lunch today? It could save about 2.5 kg of CO₂.',
      category: 'greeting',
      priority: 1,
      icon: '🌤️',
      actionId: 'meatless-meal',
    });
  } else if (hour >= 17 && hour < 21) {
    tips.push({
      id: 'evening-greeting',
      message: 'Good evening! Before relaxing, consider unplugging devices you\'re not using tonight.',
      category: 'greeting',
      priority: 1,
      icon: '🌆',
      actionId: 'unplug-devices',
    });
  } else {
    tips.push({
      id: 'night-greeting',
      message: 'Burning the midnight oil? Remember to turn off lights in rooms you\'re not in!',
      category: 'greeting',
      priority: 1,
      icon: '🌙',
      actionId: 'lights-off',
    });
  }

  // ── New user guidance ──
  if (!latestEntry) {
    tips.push({
      id: 'new-user',
      message: 'Welcome to CarbonWise! Start by calculating your carbon footprint — it takes less than 2 minutes and gives you a personalized baseline.',
      category: 'nudge',
      priority: 10,
      icon: '👋',
    });
    return tips.sort((a, b) => b.priority - a.priority);
  }

  const breakdown = latestEntry.breakdown;
  const total = latestEntry.totalKgCO2;

  // ── Streak-based nudges ──
  if (currentStreak === 0) {
    tips.push({
      id: 'start-streak',
      message: 'You don\'t have an active streak yet. Complete any eco-action today to start building momentum!',
      category: 'nudge',
      priority: 8,
      icon: '🔥',
    });
  } else if (currentStreak >= 7) {
    tips.push({
      id: 'streak-celebration',
      message: `Amazing! You're on a ${currentStreak}-day streak! 🔥 You've saved ${totalCO2Saved.toFixed(1)} kgCO₂e through your actions. Keep it up!`,
      category: 'celebration',
      priority: 7,
      icon: '🎉',
    });
  } else if (currentStreak >= 3) {
    tips.push({
      id: 'streak-growing',
      message: `${currentStreak}-day streak and counting! You're building great habits. Don't break the chain!`,
      category: 'celebration',
      priority: 5,
      icon: '💪',
    });
  }

  // ── Footprint-aware recommendations ──
  const highestCategory = getHighestCategory(breakdown);

  if (highestCategory === 'transport' && breakdown.transport > 2000) {
    const hasCompletedBike = state.actions.find(a => a.id === 'bike-commute')?.completedDates.length ?? 0;
    if (hasCompletedBike === 0) {
      tips.push({
        id: 'try-biking',
        message: `Transport is your biggest emission source (${Math.round(breakdown.transport / total * 100)}%). Have you considered cycling for short trips? It could save 2.4 kgCO₂e each time.`,
        category: 'insight',
        priority: 9,
        icon: '🚲',
        actionId: 'bike-commute',
      });
    } else {
      tips.push({
        id: 'keep-biking',
        message: `Great work cycling! You've biked ${hasCompletedBike} times already. Each ride saves 2.4 kgCO₂e. Can you make it a daily habit?`,
        category: 'tip',
        priority: 6,
        icon: '🚲',
        actionId: 'bike-commute',
      });
    }
  }

  if (highestCategory === 'energy' && breakdown.energy > 1500) {
    tips.push({
      id: 'energy-tip',
      message: `Energy makes up ${Math.round(breakdown.energy / total * 100)}% of your footprint. Quick win: adjust your thermostat by just 2°C — it saves 1.2 kgCO₂e daily!`,
      category: 'insight',
      priority: 9,
      icon: '⚡',
      actionId: 'thermostat-adjust',
    });
  }

  if (highestCategory === 'food' && breakdown.food > 2000) {
    const meatlessCount = state.actions.find(a => a.id === 'meatless-meal')?.completedDates.length ?? 0;
    tips.push({
      id: 'food-tip',
      message: meatlessCount > 0
        ? `You've had ${meatlessCount} meatless meals so far — saving ${(meatlessCount * 2.5).toFixed(0)} kgCO₂e! Try to hit 10 to earn the Green Eater badge.`
        : `Food is ${Math.round(breakdown.food / total * 100)}% of your footprint. Try one meatless meal today — it saves 2.5 kgCO₂e per meal!`,
      category: 'insight',
      priority: 9,
      icon: '🥗',
      actionId: 'meatless-meal',
    });
  }

  if (highestCategory === 'shopping' && breakdown.shopping > 1000) {
    tips.push({
      id: 'shopping-tip',
      message: `Shopping accounts for ${Math.round(breakdown.shopping / total * 100)}% of your emissions. Consider repairing items instead of replacing them — it saves 5 kgCO₂e each time!`,
      category: 'insight',
      priority: 9,
      icon: '🔧',
      actionId: 'repair-item',
    });
  }

  // ── Progress milestones ──
  if (totalActionsCompleted >= 5 && totalActionsCompleted < 20) {
    tips.push({
      id: 'milestone-progress',
      message: `You're making progress! ${totalActionsCompleted} actions done, ${20 - totalActionsCompleted} more to unlock the Planet Champion badge.`,
      category: 'challenge',
      priority: 4,
      icon: '🏆',
    });
  }

  if (total > 4700) {
    const reductionNeeded = total - 4700;
    tips.push({
      id: 'below-average-challenge',
      message: `Challenge: Reduce your footprint by ${(reductionNeeded / 1000).toFixed(1)}t to get below the world average. Focus on ${highestCategory} for the biggest impact!`,
      category: 'challenge',
      priority: 6,
      icon: '🎯',
    });
  } else if (total > 2500) {
    tips.push({
      id: 'paris-target',
      message: `You're below the world average — great! Next target: reduce ${((total - 2500) / 1000).toFixed(1)}t more to reach the Paris Agreement sustainable level of 2.5t/year.`,
      category: 'challenge',
      priority: 5,
      icon: '🌍',
    });
  }

  // ── Uncompleted category suggestions ──
  const completedCategories = new Set(
    state.actions.filter(a => a.completedDates.length > 0).map(a => a.category)
  );
  const allCategories = ['transport', 'energy', 'food', 'shopping', 'lifestyle'] as const;
  const missingCategories = allCategories.filter(c => !completedCategories.has(c));

  if (missingCategories.length > 0 && completedCategories.size >= 2) {
    const missing = missingCategories[0];
    const suggestedAction = state.actions.find(a => a.category === missing && a.difficulty === 'easy');
    if (suggestedAction) {
      tips.push({
        id: 'category-diversity',
        message: `Try something in the ${missing} category! "${suggestedAction.title}" is an easy action to get started. Complete all 5 categories to earn the Well-Rounded badge.`,
        category: 'tip',
        priority: 5,
        icon: '🎯',
        actionId: suggestedAction.id,
      });
    }
  }

  // ── CO₂ equivalence fun fact ──
  if (totalCO2Saved > 0) {
    const treeEquivalent = (totalCO2Saved / 21).toFixed(0); // ~21 kgCO₂ absorbed per tree/year
    tips.push({
      id: 'co2-equivalent',
      message: `Your ${totalCO2Saved.toFixed(1)} kgCO₂e saved is equivalent to what ${treeEquivalent} trees absorb in a year! 🌳`,
      category: 'celebration',
      priority: 3,
      icon: '🌳',
    });
  }

  return tips.sort((a, b) => b.priority - a.priority);
}

/** Find the highest-emission category from a breakdown */
function getHighestCategory(breakdown: CarbonBreakdown): keyof CarbonBreakdown {
  const entries = Object.entries(breakdown) as [keyof CarbonBreakdown, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}
