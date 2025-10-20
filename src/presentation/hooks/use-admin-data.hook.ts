import { useCallback, useEffect, useState, useMemo } from 'react';
import { usePublications } from '../contexts/publication.context';
import { UserModel, getAllUsers } from '@/shared/utils/fakeData';

interface AdminDataState {
  readonly users: UserModel[];
  readonly loading: boolean;
  readonly refreshing: boolean;
  readonly error: string | null;
}

interface AdminDataActions {
  readonly loadUsers: (isRefreshing?: boolean) => Promise<void>;
  readonly handleRefresh: () => void;
  readonly retryLoad: () => void;
}

interface PublicationCounts {
  readonly total: number;
  readonly users: number;
  readonly isLoading: boolean;
}

interface AdminDataReturn {
  readonly state: AdminDataState;
  readonly actions: AdminDataActions;
  readonly publicationCounts: PublicationCounts;
}

export const useAdminData = (): AdminDataReturn => {
  const { state: publicationState, loadCounts } = usePublications();

  const [state, setState] = useState<AdminDataState>({
    users: [],
    loading: true,
    refreshing: false,
    error: null
  });

  const loadUsers = useCallback(async (isRefreshing = false): Promise<void> => {
    try {
      setState(prevState => ({
        ...prevState,
        loading: !isRefreshing,
        refreshing: isRefreshing,
        error: null
      }));

      await new Promise<void>(resolve => {
        setTimeout(() => {
          resolve();
        }, 800);
      });

      const users = getAllUsers();

      setState(prevState => ({
        ...prevState,
        users,
        loading: false,
        refreshing: false
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al cargar usuarios';

      setState(prevState => ({
        ...prevState,
        loading: false,
        refreshing: false,
        error: errorMessage
      }));
    }
  }, []);

  const handleRefresh = useCallback((): void => {
    void loadUsers(true);
    void loadCounts();
  }, [loadUsers, loadCounts]);

  const retryLoad = useCallback((): void => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    void loadUsers();
    void loadCounts();
  }, [loadUsers, loadCounts]);

  const actions: AdminDataActions = useMemo(
    () => ({
      loadUsers,
      handleRefresh,
      retryLoad
    }),
    [loadUsers, handleRefresh, retryLoad]
  );

  const publicationCounts: PublicationCounts = useMemo(
    () => ({
      total: publicationState.counts.data?.records ?? 0,
      users: publicationState.counts.data?.users ?? 0,
      isLoading: publicationState.counts.isLoading
    }),
    [publicationState.counts.data, publicationState.counts.isLoading]
  );

  return useMemo(
    () => ({
      state,
      actions,
      publicationCounts
    }),
    [state, actions, publicationCounts]
  );
};
