/**
 * Unit tests for formatting utilities.
 */

import { describe, it, expect } from 'vitest';
import { formatCO2, formatNumber, formatPercent, getRelativeTime } from '../utils/formatters';

describe('formatCO2', () => {
  it('formats small values in kg', () => {
    expect(formatCO2(500)).toBe('500 kg CO₂e');
  });

  it('formats large values in tonnes', () => {
    expect(formatCO2(4700)).toBe('4.7t CO₂e');
  });

  it('formats zero', () => {
    expect(formatCO2(0)).toBe('0 kg CO₂e');
  });
});

describe('formatNumber', () => {
  it('adds thousands separator', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });
});

describe('formatPercent', () => {
  it('calculates percentage', () => {
    expect(formatPercent(50, 200)).toBe('25%');
  });

  it('handles zero total', () => {
    expect(formatPercent(50, 0)).toBe('0%');
  });
});

describe('getRelativeTime', () => {
  it('returns Today for current date', () => {
    expect(getRelativeTime(new Date().toISOString())).toBe('Today');
  });

  it('handles invalid date', () => {
    expect(getRelativeTime('not-a-date')).toBe('Unknown');
  });
});
