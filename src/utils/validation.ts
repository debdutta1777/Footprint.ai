/**
 * Input validation and sanitization utilities.
 * 
 * Provides defense against XSS, injection, and invalid data
 * by validating and sanitizing all user inputs before processing.
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize a string input to prevent XSS attacks.
 * Strips all HTML tags and dangerous content.
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim();
}

/**
 * Validate and clamp a number within a range.
 * Returns the default value if input is not a valid number.
 */
export function validateNumber(
  input: unknown,
  min: number,
  max: number,
  defaultValue: number = min
): number {
  const num = Number(input);
  if (isNaN(num) || !isFinite(num)) return defaultValue;
  return Math.max(min, Math.min(max, num));
}

/**
 * Validate that a value is one of the allowed options.
 */
export function validateEnum<T extends string>(
  input: unknown,
  allowedValues: readonly T[],
  defaultValue: T
): T {
  if (typeof input !== 'string') return defaultValue;
  return allowedValues.includes(input as T) ? (input as T) : defaultValue;
}

/**
 * Validate an email address format.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validate a display name.
 * Must be 1-50 characters, alphanumeric with spaces.
 */
export function isValidName(name: string): boolean {
  if (typeof name !== 'string') return false;
  const sanitized = sanitizeString(name);
  return sanitized.length >= 1 && sanitized.length <= 50;
}

/**
 * Create a validated transport data object from raw form inputs.
 */
export function validateTransportInput(raw: Record<string, unknown>) {
  return {
    carKm: validateNumber(raw.carKm, 0, 5000, 0),
    carFuelType: validateEnum(
      raw.carFuelType,
      ['petrol', 'diesel', 'hybrid', 'electric', 'none'] as const,
      'petrol'
    ),
    publicTransportTrips: validateNumber(raw.publicTransportTrips, 0, 100, 0),
    shortFlightsPerYear: validateNumber(raw.shortFlightsPerYear, 0, 100, 0),
    longFlightsPerYear: validateNumber(raw.longFlightsPerYear, 0, 50, 0),
  };
}

/**
 * Create a validated energy data object from raw form inputs.
 */
export function validateEnergyInput(raw: Record<string, unknown>) {
  return {
    electricityKwh: validateNumber(raw.electricityKwh, 0, 10000, 200),
    gasKwh: validateNumber(raw.gasKwh, 0, 10000, 0),
    renewableEnergy: Boolean(raw.renewableEnergy),
    householdSize: validateNumber(raw.householdSize, 1, 20, 1),
  };
}

/**
 * Create a validated food data object from raw form inputs.
 */
export function validateFoodInput(raw: Record<string, unknown>) {
  return {
    dietType: validateEnum(
      raw.dietType,
      ['vegan', 'vegetarian', 'pescatarian', 'low-meat', 'medium-meat', 'high-meat'] as const,
      'medium-meat'
    ),
    localFood: Boolean(raw.localFood),
    foodWaste: validateEnum(
      raw.foodWaste,
      ['none', 'low', 'medium', 'high'] as const,
      'medium'
    ),
  };
}

/**
 * Create a validated shopping data object from raw form inputs.
 */
export function validateShoppingInput(raw: Record<string, unknown>) {
  return {
    clothingItems: validateNumber(raw.clothingItems, 0, 100, 2),
    electronicsPurchases: validateNumber(raw.electronicsPurchases, 0, 50, 0),
    secondHand: Boolean(raw.secondHand),
    recyclingLevel: validateEnum(
      raw.recyclingLevel,
      ['none', 'some', 'most', 'all'] as const,
      'some'
    ),
  };
}
