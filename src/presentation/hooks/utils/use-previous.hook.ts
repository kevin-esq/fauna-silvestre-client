import { useRef, useEffect } from 'react';

/**
 * Generic hook to get the previous value of a state or prop
 * Useful for comparing values and detecting changes
 *
 * @template T - Type of value to track
 * @param value - Current value
 * @returns Previous value (undefined on first render)
 *
 * @example
 * const [count, setCount] = useState(0);
 * const previousCount = usePrevious(count);
 *
 * useEffect(() => {
 *   if (previousCount !== undefined && count > previousCount) {
 *     console.log('Count increased');
 *   }
 * }, [count, previousCount]);
 *
 * @example
 * const previousUser = usePrevious(user);
 * if (previousUser?.id !== user?.id) {
 *   // User changed
 *   loadUserData(user.id);
 * }
 */
export const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};
