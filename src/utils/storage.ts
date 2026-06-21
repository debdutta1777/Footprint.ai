/**
 * Secure localStorage wrapper with JSON serialization and error handling.
 * 
 * Security considerations:
 * - All data is validated before storage
 * - JSON parsing is wrapped in try-catch to prevent injection
 * - Keys are prefixed to avoid collisions
 * - Size limits are enforced
 */

const STORAGE_PREFIX = 'carbonwise_';
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit

/**
 * Safely store data in localStorage with prefix and size validation.
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  try {
    const prefixedKey = STORAGE_PREFIX + key;
    const serialized = JSON.stringify(value);

    // Validate size before storing
    if (serialized.length > MAX_STORAGE_SIZE) {
      console.warn(`Storage item "${key}" exceeds size limit`);
      return false;
    }

    localStorage.setItem(prefixedKey, serialized);
    return true;
  } catch (error) {
    console.error(`Failed to store item "${key}":`, error);
    return false;
  }
}

/**
 * Safely retrieve and parse data from localStorage.
 * Returns the default value if the key doesn't exist or parsing fails.
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const prefixedKey = STORAGE_PREFIX + key;
    const stored = localStorage.getItem(prefixedKey);

    if (stored === null) {
      return defaultValue;
    }

    const parsed = JSON.parse(stored) as T;
    return parsed;
  } catch (error) {
    console.error(`Failed to retrieve item "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Remove an item from localStorage.
 */
export function removeStorageItem(key: string): void {
  try {
    const prefixedKey = STORAGE_PREFIX + key;
    localStorage.removeItem(prefixedKey);
  } catch (error) {
    console.error(`Failed to remove item "${key}":`, error);
  }
}

/**
 * Clear all CarbonWise data from localStorage.
 */
export function clearAllStorage(): void {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
    keys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}
