import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { usePublications } from '@/presentation/contexts/publication.context';
import { useUsers } from '@/presentation/hooks/users/use-users.hook';
import { UserData } from '@/domain/models/user.models';
import { userService } from '@/services/user/user.service';

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
  readonly pending: number;
  readonly accepted: number;
  readonly rejected: number;
  readonly totalUsers: number;
  readonly totalRecordsFromUsers: number;
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

  const [userCounts, setUserCounts] = useState({ users: 0, records: 0 });
  const [isLoadingUserCounts, setIsLoadingUserCounts] = useState(false);
  const hasLoadedCounts = useRef(false);

  const loadUserCounts = useCallback(async () => {
    if (isLoadingUserCounts) return;

    try {
      setIsLoadingUserCounts(true);
      const counts = await userService.getCounts();
      setUserCounts(counts);
    } catch (error) {
      console.error('Error loading user counts:', error);
    } finally {
      setIsLoadingUserCounts(false);
    }
  }, [isLoadingUserCounts]);

  const handleRefresh = useCallback((): void => {
    void refreshUsers();
    void loadCounts();
    void loadUserCounts();
  }, [refreshUsers, loadCounts, loadUserCounts]);

  const retryLoad = useCallback((): void => {
    void loadUsersFromService();
  }, [loadUsersFromService]);

  useEffect(() => {
    if (!hasLoadedCounts.current) {
      void loadCounts();
      void loadUserCounts();
      hasLoadedCounts.current = true;
    }
  }, [loadCounts, loadUserCounts]);

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
      total: publicationState.counts.data?.totalRecords ?? 0,
      pending: publicationState.counts.data?.pending ?? 0,
      accepted: publicationState.counts.data?.accepted ?? 0,
      rejected: publicationState.counts.data?.rejected ?? 0,
      totalUsers: userCounts.users,
      totalRecordsFromUsers: userCounts.records,
      isLoading: publicationState.counts.isLoading || isLoadingUserCounts
    }),
    [
      publicationState.counts.data,
      publicationState.counts.isLoading,
      userCounts,
      isLoadingUserCounts
    ]
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
