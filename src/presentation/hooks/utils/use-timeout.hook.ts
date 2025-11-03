import { useEffect, useRef, useCallback, useState } from 'react';

export interface UseTimeoutReturn {
  start: () => void;
  clear: () => void;
  isActive: boolean;
}

/**
 * Generic hook for setTimeout with automatic cleanup
 * Prevents memory leaks and provides control over timeout state
 *
 * @param callback - Function to execute after delay
 * @param delay - Delay in milliseconds
 * @returns Object with start, clear, and isActive
 *
 * @example
 * const { start, clear, isActive } = useTimeout(() => {
 *   console.log('Executed after 2 seconds');
 * }, 2000);
 *
 * // Start the timeout
 * start();
 *
 * // Clear if needed
 * if (isActive) {
 *   clear();
 * }
 *
 * @example
 * const { start } = useTimeout(() => {
 *   navigation.goBack();
 * }, 1000);
 *
 * // Delay navigation
 * handleSave().then(() => start());
 */
export const useTimeout = (
  callback: () => void,
  delay: number
): UseTimeoutReturn => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  const [isActive, setIsActive] = useState(false);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setIsActive(false);
    }
  }, []);

  const start = useCallback(() => {
    clear();
    setIsActive(true);
    timeoutRef.current = setTimeout(() => {
      callbackRef.current();
      setIsActive(false);
    }, delay);
  }, [delay, clear]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clear();
    };
  }, [clear]);

  return { start, clear, isActive };
};
