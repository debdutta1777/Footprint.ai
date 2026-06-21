/**
 * Custom React hooks for reusable logic.
 *
 * useLocalStorage — Type-safe localStorage with automatic JSON serialization.
 * useCarbonData — Derived carbon footprint calculations memoized for performance.
 * useDebounce — Delays value updates to reduce re-renders.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getStorageItem, setStorageItem } from '../utils/storage';
import type { AppState, CarbonBreakdown } from '../types/carbon';
import { getFootprintRating, getPersonalizedInsights } from '../utils/carbonCalculator';
import { formatCO2 } from '../utils/formatters';

/**
 * Hook for reading and writing a value to localStorage.
 * Automatically serializes/deserializes JSON.
 * Falls back to defaultValue on errors.
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    return getStorageItem<T>(key, defaultValue);
  });

  const setValue = useCallback((value: T) => {
    setState(value);
    setStorageItem(key, value);
  }, [key]);

  return [state, setValue];
}

/**
 * Hook that derives computed carbon data from app state.
 * All calculations are memoized to avoid recomputation.
 */
export function useCarbonData(state: AppState) {
  const latestEntry = state.entries[state.entries.length - 1] ?? null;

  const breakdown = useMemo<CarbonBreakdown | null>(() => {
    return latestEntry?.breakdown ?? null;
  }, [latestEntry]);

  const rating = useMemo(() => {
    if (!latestEntry) return null;
    return getFootprintRating(latestEntry.totalKgCO2);
  }, [latestEntry]);

  const insights = useMemo(() => {
    if (!breakdown) return [];
    return getPersonalizedInsights(breakdown);
  }, [breakdown]);

  const formattedTotal = useMemo(() => {
    if (!latestEntry) return '0 kg CO₂e';
    return formatCO2(latestEntry.totalKgCO2);
  }, [latestEntry]);

  const comparisons = useMemo(() => {
    if (!latestEntry) return null;
    const total = latestEntry.totalKgCO2;
    const worldAvg = 4700;
    return {
      vsWorldAvg: Math.round(((total - worldAvg) / worldAvg) * 100),
      treesNeeded: Math.round(total / 21),
      drivingKmEquiv: Math.round(total / 0.171),
    };
  }, [latestEntry]);

  return {
    latestEntry,
    breakdown,
    rating,
    insights,
    formattedTotal,
    comparisons,
    entryCount: state.entries.length,
    hasData: state.entries.length > 0,
  };
}

/**
 * Hook that delays updates to a value.
 * Useful for debouncing user input before triggering expensive operations.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
