import { useEffect, useRef, useCallback, useState } from 'react';

export interface UseIntervalReturn {
  start: () => void;
  stop: () => void;
  isRunning: boolean;
}

/**
 * Generic hook for setInterval with automatic cleanup
 * Provides control over interval state and prevents memory leaks
 *
 * @param callback - Function to execute repeatedly
 * @param delay - Delay between executions in milliseconds
 * @param autoStart - Whether to start immediately (default: false)
 * @returns Object with start, stop, and isRunning
 *
 * @example
 * const { start, stop, isRunning } = useInterval(() => {
 *   console.log('Executed every second');
 * }, 1000);
 *
 * // Start the interval
 * start();
 *
 * // Stop when needed
 * if (isRunning) {
 *   stop();
 * }
 *
 * @example
 * // Auto-start clock
 * const { isRunning } = useInterval(() => {
 *   setTime(new Date());
 * }, 1000, true);
 */
export const useInterval = (
  callback: () => void,
  delay: number,
  autoStart: boolean = false
): UseIntervalReturn => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callbackRef = useRef(callback);
  const [isRunning, setIsRunning] = useState(autoStart);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsRunning(false);
    }
  }, []);

  const start = useCallback(() => {
    stop();
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      callbackRef.current();
    }, delay);
  }, [delay, stop]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart) {
      start();
    }
  }, [autoStart, start]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { start, stop, isRunning };
};
