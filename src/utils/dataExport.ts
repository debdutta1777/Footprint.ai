/**
 * Secure data export utilities.
 * 
 * Allows users to export their carbon data as sanitized JSON or CSV.
 * All string values are sanitized to prevent injection when opened in spreadsheet apps.
 */

import DOMPurify from 'dompurify';
import type { AppState } from '../types/carbon';

/** Sanitize a string for safe export (prevents CSV injection & XSS) */
function sanitizeExportString(value: string): string {
  // First, DOMPurify for XSS
  let clean = DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
  // Then prevent CSV injection (formulas starting with =, +, -, @, tab, CR)
  if (/^[=+\-@\t\r]/.test(clean)) {
    clean = `'${clean}`;
  }
  return clean;
}

/** Sanitize any value for export */
function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') return sanitizeExportString(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      sanitized[sanitizeExportString(k)] = sanitizeValue(v);
    }
    return sanitized;
  }
  return String(value);
}

/**
 * Export user data as a sanitized JSON file download.
 * All string values are sanitized to prevent XSS and injection.
 */
export function exportAsJSON(state: AppState): void {
  const exportData = {
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    entries: sanitizeValue(state.entries),
    actions: state.actions.map(a => ({
      id: a.id,
      title: sanitizeExportString(a.title),
      completions: a.completedDates.length,
      totalCO2Saved: a.completedDates.length * a.impactKgCO2,
    })),
    achievements: state.achievements
      .filter(a => a.unlocked)
      .map(a => ({
        title: sanitizeExportString(a.title),
        unlockedDate: a.unlockedDate ?? '',
      })),
  };

  const blob = new Blob(
    [JSON.stringify(exportData, null, 2)],
    { type: 'application/json;charset=utf-8' }
  );
  downloadBlob(blob, `carbonwise-data-${formatDateFilename()}.json`);
}

/**
 * Export carbon entries as a sanitized CSV file download.
 * Safe against CSV injection attacks.
 */
export function exportAsCSV(state: AppState): void {
  const headers = ['Date', 'Transport (kgCO₂e)', 'Energy (kgCO₂e)', 'Food (kgCO₂e)', 'Shopping (kgCO₂e)', 'Total (kgCO₂e)'];
  const rows = state.entries.map(entry => [
    sanitizeExportString(entry.date.split('T')[0]),
    entry.breakdown.transport,
    entry.breakdown.energy,
    entry.breakdown.food,
    entry.breakdown.shopping,
    entry.totalKgCO2,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  const blob = new Blob(
    [csvContent],
    { type: 'text/csv;charset=utf-8' }
  );
  downloadBlob(blob, `carbonwise-data-${formatDateFilename()}.csv`);
}

/** Trigger a file download from a Blob */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

/** Format current date for filenames */
function formatDateFilename(): string {
  return new Date().toISOString().split('T')[0];
}
