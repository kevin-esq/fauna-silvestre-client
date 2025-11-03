import { useState, useCallback } from 'react';

export interface UseToggleReturn {
  value: boolean;
  setTrue: () => void;
  setFalse: () => void;
  toggle: () => void;
  setValue: (value: boolean) => void;
}

/**
 * Generic hook for managing boolean state with convenient toggle methods
 *
 * @param initialValue - Initial boolean value (default: false)
 * @returns Object with value, setTrue, setFalse, toggle, and setValue methods
 *
 * @example
 * const modal = useToggle();
 * modal.setTrue(); // Open modal
 * modal.setFalse(); // Close modal
 * modal.toggle(); // Toggle modal
 *
 * @example
 * const { value: isVisible, setTrue: show, setFalse: hide } = useToggle(true);
 */
export const useToggle = (initialValue = false): UseToggleReturn => {
  const [value, setValue] = useState(initialValue);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);

  return {
    value,
    setTrue,
    setFalse,
    toggle,
    setValue
  };
};
