import { useState, useEffect } from 'react';

/**
 * Generic hook to debounce a value with configurable delay
 * Useful for search inputs, auto-save, filters, etc.
 *
 * @template T - Type of value to debounce
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500)
 * @returns Debounced value
 *
 * @example
 * const [searchQuery, setSearchQuery] = useState('');
 * const debouncedQuery = useDebounce(searchQuery, 300);
 *
 * useEffect(() => {
 *   // API call with debounced value
 *   searchAPI(debouncedQuery);
 * }, [debouncedQuery]);
 *
 * @example
 * const debouncedEmail = useDebounce(email, 500);
 * // Auto-save after 500ms of no typing
 */
export const useDebounce = <T,>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
