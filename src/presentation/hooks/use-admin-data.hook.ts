import { useCallback, useEffect, useMemo } from 'react';
import { usePublications } from '../contexts/publication.context';
import { useUsers } from './use-users.hook';
import { UserData } from '@/domain/models/user.models';

interface AdminDataState {
  readonly users: UserData[];
  readonly loading: boolean;
  readonly refreshing: boolean;
  readonly error: string | null;
}

interface AdminDataActions {
  readonly loadUsers: () => Promise<void>;
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
  const {
    users,
    isLoading,
    isRefreshing,
    error,
    loadUsers: loadUsersFromService,
    refreshUsers
  } = useUsers(1, 4);

  const handleRefresh = useCallback((): void => {
    void refreshUsers();
    void loadCounts();
  }, [refreshUsers, loadCounts]);

  const retryLoad = useCallback((): void => {
    void loadUsersFromService();
  }, [loadUsersFromService]);

  useEffect(() => {
    void loadCounts();
  }, [loadCounts]);

  const state: AdminDataState = useMemo(
    () => ({
      users,
      loading: isLoading,
      refreshing: isRefreshing,
      error
    }),
    [users, isLoading, isRefreshing, error]
  );

  const actions: AdminDataActions = useMemo(
    () => ({
      loadUsers: loadUsersFromService,
      handleRefresh,
      retryLoad
    }),
    [loadUsersFromService, handleRefresh, retryLoad]
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
