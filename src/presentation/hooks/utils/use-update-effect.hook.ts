import { useEffect, useRef, DependencyList, EffectCallback } from 'react';

/**
 * Generic hook that works like useEffect but skips the first render (mount)
 * Only runs on updates, not on initial mount
 *
 * @param effect - Effect callback to run on updates
 * @param deps - Dependency array
 *
 * @example
 * useUpdateEffect(() => {
 *   console.log('User changed (not on mount)');
 *   loadUserData();
 * }, [user]);
 *
 * @example
 * useUpdateEffect(() => {
 *   // Save form only on updates, not initial load
 *   saveForm(formData);
 * }, [formData]);
 */
export const useUpdateEffect = (
  effect: EffectCallback,
  deps?: DependencyList
): void => {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
