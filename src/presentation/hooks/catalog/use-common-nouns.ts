import { useState, useEffect } from 'react';
import { CommonNounResponse } from '../../../domain/models/animal.models';
import { catalogService } from '../../../services/catalog/catalog.service';

interface UseCommonNounsReturn {
  commonNouns: CommonNounResponse[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCommonNouns = (): UseCommonNounsReturn => {
  const [commonNouns, setCommonNouns] = useState<CommonNounResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommonNouns = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await catalogService.getCommonNouns();
      setCommonNouns(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Error desconocido al cargar nombres comunes';
      setError(errorMessage);
      console.error('[useCommonNouns] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    await fetchCommonNouns();
  };

  useEffect(() => {
    fetchCommonNouns();
  }, []);

  return {
    commonNouns,
    isLoading,
    error,
    refetch
  };
};
