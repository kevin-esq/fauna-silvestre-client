import { useCallback, useEffect } from 'react';
import { useCatalog } from '../contexts/catalog.context';
import { usePublications } from '../contexts/publication.context';

export function useLoadData() {
  const { fetchCatalog } = useCatalog();
  const { actions: actionsPub } = usePublications();

  const loadData = useCallback(() => {
    fetchCatalog();
    actionsPub.loadCounts();
  }, [fetchCatalog]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return null;
}
