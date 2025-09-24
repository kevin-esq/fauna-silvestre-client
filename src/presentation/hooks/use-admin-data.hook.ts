import { useCallback, useEffect, useState } from 'react';
import { usePublications } from '../contexts/publication.context';
import { UserModel, getAllUsers } from '@/shared/utils/fakeData';

interface AdminDataState {
  users: UserModel[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

interface AdminDataActions {
  loadUsers: (isRefreshing?: boolean) => Promise<void>;
  handleRefresh: () => void;
  retryLoad: () => void;
}

interface AdminDataReturn {
  state: AdminDataState;
  actions: AdminDataActions;
  publicationCounts: {
    total: number;
    users: number;
    isLoading: boolean;
  };
}

export const useAdminData = (): AdminDataReturn => {
  const { state: publicationState, loadCounts } = usePublications();

  const [state, setState] = useState<AdminDataState>({
    users: [],
    loading: true,
    refreshing: false,
    error: null
  });

  const loadUsers = useCallback(async (isRefreshing = false) => {
    try {
      setState(prev => ({
        ...prev,
        loading: !isRefreshing,
        refreshing: isRefreshing,
        error: null
      }));

      await new Promise(resolve => setTimeout(resolve, 800));

      const users = getAllUsers();

      setState(prev => ({
        ...prev,
        users,
        loading: false,
        refreshing: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        refreshing: false,
        error:
          error instanceof Error ? error.message : 'Error al cargar usuarios'
      }));
    }
  }, []);

  const handleRefresh = useCallback(() => {
    loadUsers(true);
    loadCounts();
  }, [loadUsers, loadCounts]);
  const retryLoad = useCallback(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadUsers();
    loadCounts();
  }, [loadUsers, loadCounts]);
  const actions: AdminDataActions = {
    loadUsers,
    handleRefresh,
    retryLoad
  };

  const publicationCounts = {
    total: publicationState.counts?.data?.records || 0,
    users: publicationState.counts?.data?.users || 0,
    isLoading: publicationState.counts?.isLoading || false
  };

  return {
    state,
    actions,
    publicationCounts
  };
};
