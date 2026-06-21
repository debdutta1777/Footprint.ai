/**
 * Barrel export for all utility modules.
 * Provides a single import point for consumers.
 *
 * @example
 * import { calculateTotalFootprint, formatCO2, sanitizeString } from '../utils';
 */

export { calculateTotalFootprint, getFootprintRating, getPersonalizedInsights, WORLD_AVERAGE_FOOTPRINT } from './carbonCalculator';
export { formatCO2, formatDate, getRelativeTime, formatPercent } from './formatters';
export { sanitizeString, validateTransportInput, validateEnergyInput, validateFoodInput, validateShoppingInput } from './validation';
export { getStorageItem, setStorageItem, removeStorageItem, clearAllStorage } from './storage';
export { generateSmartTips } from './smartAssistant';
export { exportAsJSON, exportAsCSV } from './dataExport';
