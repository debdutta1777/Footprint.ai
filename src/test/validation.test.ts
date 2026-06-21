/**
 * Unit tests for input validation and sanitization utilities.
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeString,
  validateNumber,
  validateEnum,
  isValidName,
  validateTransportInput,
} from '../utils/validation';

describe('sanitizeString', () => {
  it('strips HTML tags', () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toBe('');
  });

  it('preserves plain text', () => {
    expect(sanitizeString('Hello World')).toBe('Hello World');
  });

  it('trims whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });

  it('handles non-string input', () => {
    expect(sanitizeString(null as unknown as string)).toBe('');
    expect(sanitizeString(123 as unknown as string)).toBe('');
  });
});

describe('validateNumber', () => {
  it('clamps to min', () => {
    expect(validateNumber(-10, 0, 100)).toBe(0);
  });

  it('clamps to max', () => {
    expect(validateNumber(200, 0, 100)).toBe(100);
  });

  it('returns value in range', () => {
    expect(validateNumber(50, 0, 100)).toBe(50);
  });

  it('returns default for NaN', () => {
    expect(validateNumber('abc', 0, 100, 42)).toBe(42);
  });

  it('handles Infinity', () => {
    expect(validateNumber(Infinity, 0, 100, 0)).toBe(0);
  });
});

describe('validateEnum', () => {
  it('returns valid value', () => {
    expect(validateEnum('petrol', ['petrol', 'diesel'] as const, 'petrol')).toBe('petrol');
  });

  it('returns default for invalid value', () => {
    expect(validateEnum('nuclear', ['petrol', 'diesel'] as const, 'petrol')).toBe('petrol');
  });

  it('returns default for non-string', () => {
    expect(validateEnum(42, ['petrol', 'diesel'] as const, 'petrol')).toBe('petrol');
  });
});

describe('isValidName', () => {
  it('accepts valid names', () => {
    expect(isValidName('John')).toBe(true);
    expect(isValidName('A')).toBe(true);
  });

  it('rejects empty names', () => {
    expect(isValidName('')).toBe(false);
  });

  it('rejects non-strings', () => {
    expect(isValidName(null as unknown as string)).toBe(false);
  });
});

describe('validateTransportInput', () => {
  it('validates and clamps transport data', () => {
    const result = validateTransportInput({
      carKm: -50,
      carFuelType: 'invalid',
      publicTransportTrips: 999,
      shortFlightsPerYear: -1,
      longFlightsPerYear: 100,
    });
    expect(result.carKm).toBe(0);
    expect(result.carFuelType).toBe('petrol');
    expect(result.publicTransportTrips).toBe(100);
    expect(result.shortFlightsPerYear).toBe(0);
    expect(result.longFlightsPerYear).toBe(50);
  });
});
