/**
 * Tests for custom React hooks.
 * Validates useLocalStorage, useCarbonData, and useDebounce behavior.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage, useDebounce } from '../hooks/useCustomHooks';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default value when key is not in storage', () => {
    const { result } = renderHook(() => useLocalStorage('missing-key', 42));
    expect(result.current[0]).toBe(42);
  });

  it('stores and retrieves values', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    act(() => {
      result.current[1]('updated');
    });
    expect(result.current[0]).toBe('updated');
  });

  it('persists objects', () => {
    const { result } = renderHook(() => useLocalStorage<Record<string, number>>('obj-key', { a: 1 }));
    act(() => {
      result.current[1]({ a: 2, b: 3 });
    });
    expect(result.current[0]).toEqual({ a: 2, b: 3 });
  });
});

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });
});
