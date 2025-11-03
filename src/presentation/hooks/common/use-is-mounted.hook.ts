import { useRef, useEffect } from 'react';

/**
 * Generic hook to track if a component is currently mounted
 * Useful for preventing state updates on unmounted components
 *
 * @returns MutableRefObject with current mounted status
 *
 * @example
 * const isMountedRef = useIsMounted();
 *
 * const fetchData = async () => {
 *   const data = await api.getData();
 *   if (isMountedRef.current) {
 *     setState(data);
 *   }
 * };
 *
 * @example
 * const mounted = useIsMounted();
 * setTimeout(() => {
 *   if (mounted.current) {
 *     // Safe to update state
 *   }
 * }, 1000);
 */
export const useIsMounted = () => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMountedRef;
};
