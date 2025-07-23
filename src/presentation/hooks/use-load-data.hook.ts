import { useCallback, useEffect } from 'react';
import { useCatalog } from '../contexts/catalog-context';

export function useLoadData() {
  const { fetchCatalog } = useCatalog();

  const loadData = useCallback(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return null;
}