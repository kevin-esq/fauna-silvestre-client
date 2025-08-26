import { useEffect } from 'react';
import { useCatalog } from '../contexts/catalog.context';
import { usePublications } from '../contexts/publication.context';

export function useLoadData() {
  const { fetchCatalog } = useCatalog();
  const { actions } = usePublications();

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        if (!isMounted || !fetchCatalog || !actions.loadCounts) return;

        await Promise.all([fetchCatalog(), actions.loadCounts()]);
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
