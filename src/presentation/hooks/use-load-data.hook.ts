import { useEffect } from 'react';
import { useCatalog } from '../contexts/catalog.context';
import { usePublications } from '../contexts/publication.context';

export function useLoadData() {
  const { fetchCatalog } = useCatalog();
  const { loadCounts } = usePublications();

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        if (!isMounted || !fetchCatalog || !loadCounts) return;

        await Promise.all([fetchCatalog(), loadCounts()]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
    //eslint-disable-next-line
  }, []);

  return null;
}
