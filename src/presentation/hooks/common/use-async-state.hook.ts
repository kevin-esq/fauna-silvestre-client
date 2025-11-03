import { useState, useCallback } from 'react';

export interface UseAsyncStateReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  execute: (asyncFn: () => Promise<T>) => Promise<T>;
  reset: () => void;
  setData: (data: T | null) => void;
}

/**
 * Generic hook for managing async operations with loading and error states
 *
 * @template T - Type of data returned by async operation
 * @returns Object with data, isLoading, error, execute, reset, and setData
 *
 * @example
 * const { data, isLoading, error, execute } = useAsyncState<User[]>();
 *
 * const loadUsers = async () => {
 *   await execute(() => userService.getAll());
 * };
 *
 * @example
 * const asyncState = useAsyncState<Publication>();
 * await asyncState.execute(() => api.fetch());
 * if (asyncState.error) {
 *   console.error(asyncState.error);
 * }
 */
export const useAsyncState = <T>(): UseAsyncStateReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (asyncFn: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
    setData
  };
};
