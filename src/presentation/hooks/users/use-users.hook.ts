import { useState, useCallback, useEffect } from 'react';
import { UserData, UsersResponse } from '@/domain/models/user.models';
import { userService } from '@/services/user/user.service';

interface UseUsersState {
  users: UserData[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
}

interface UseUsersReturn extends UseUsersState {
  loadUsers: (page?: number, size?: number, active?: boolean) => Promise<void>;
  refreshUsers: () => Promise<void>;
  deactivateUser: (userId: number) => Promise<void>;
  setActiveFilter: (active: boolean) => void;
  activeFilter: boolean;
}

export const useUsers = (
  initialPage: number = 1,
  initialSize: number = 4,
  initialActive: boolean = true
): UseUsersReturn => {
  const [state, setState] = useState<UseUsersState>({
    users: [],
    isLoading: false,
    isRefreshing: false,
    error: null,
    pagination: null
  });
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const [activeFilter, setActiveFilter] = useState(initialActive);

  const loadUsers = useCallback(
    async (
      page: number = initialPage,
      size: number = initialSize,
      active: boolean = activeFilter
    ) => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const response: UsersResponse = await userService.getAllUsers({
          page,
          size,
          active
        });

        setState(prev => ({
          ...prev,
          users: response.users,
          pagination: response.pagination,
          isLoading: false,
          error: null
        }));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error al cargar usuarios';
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage
        }));
      }
    },
    [initialPage, initialSize, activeFilter]
  );

  const refreshUsers = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isRefreshing: true, error: null }));

      const response: UsersResponse = await userService.getAllUsers({
        page: state.pagination?.page || initialPage,
        size: state.pagination?.size || initialSize,
        active: activeFilter
      });

      setState(prev => ({
        ...prev,
        users: response.users,
        pagination: response.pagination,
        isRefreshing: false,
        error: null
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al refrescar usuarios';
      setState(prev => ({
        ...prev,
        isRefreshing: false,
        error: errorMessage
      }));
    }
  }, [state.pagination, initialPage, initialSize, activeFilter]);

  const deactivateUser = useCallback(
    async (userId: number) => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        await userService.deactivateUser(userId);

        await loadUsers(
          state.pagination?.page || initialPage,
          state.pagination?.size || initialSize
        );

        setState(prev => ({ ...prev, isLoading: false, error: null }));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error al desactivar usuario';
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage
        }));
        throw err;
      }
    },
    [loadUsers, state.pagination, initialPage, initialSize]
  );

  useEffect(() => {
    if (!hasAttemptedLoad) {
      setHasAttemptedLoad(true);
      void loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...state,
    loadUsers,
    refreshUsers,
    deactivateUser,
    setActiveFilter,
    activeFilter
  };
};
