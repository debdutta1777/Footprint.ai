/**
 * Tests for localStorage storage utilities.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setStorageItem, getStorageItem, removeStorageItem, clearAllStorage } from '../utils/storage';

describe('storage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('setStorageItem', () => {
    it('stores a value with prefix', () => {
      setStorageItem('test', { value: 42 });
      const raw = localStorage.getItem('carbonwise_test');
      expect(raw).toBe('{"value":42}');
    });

    it('returns true on success', () => {
      expect(setStorageItem('key', 'value')).toBe(true);
    });

    it('handles storage errors gracefully', () => {
      // Mock localStorage.setItem to throw
      const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceeded');
      });
      expect(setStorageItem('key', 'value')).toBe(false);
      spy.mockRestore();
    });
  });

  describe('getStorageItem', () => {
    it('retrieves stored values', () => {
      localStorage.setItem('carbonwise_data', JSON.stringify({ a: 1 }));
      expect(getStorageItem('data', null)).toEqual({ a: 1 });
    });

    it('returns default for missing keys', () => {
      expect(getStorageItem('missing', 'default')).toBe('default');
    });

    it('returns default for corrupted JSON', () => {
      localStorage.setItem('carbonwise_bad', '{invalid json');
      expect(getStorageItem('bad', 'fallback')).toBe('fallback');
    });
  });

  describe('removeStorageItem', () => {
    it('removes the prefixed key', () => {
      localStorage.setItem('carbonwise_remove', '"test"');
      removeStorageItem('remove');
      expect(localStorage.getItem('carbonwise_remove')).toBeNull();
    });
  });

  describe('clearAllStorage', () => {
    it('clears only carbonwise-prefixed keys', () => {
      localStorage.setItem('carbonwise_a', '1');
      localStorage.setItem('carbonwise_b', '2');
      localStorage.setItem('other_key', '3');
      clearAllStorage();
      expect(localStorage.getItem('carbonwise_a')).toBeNull();
      expect(localStorage.getItem('carbonwise_b')).toBeNull();
      expect(localStorage.getItem('other_key')).toBe('3');
    });
  });
});
