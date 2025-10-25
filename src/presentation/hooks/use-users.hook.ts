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
  loadUsers: (page?: number, size?: number) => Promise<void>;
  refreshUsers: () => Promise<void>;
  deactivateUser: (userId: number) => Promise<void>;
}

export const useUsers = (
  initialPage: number = 1,
  initialSize: number = 4
): UseUsersReturn => {
  const [state, setState] = useState<UseUsersState>({
    users: [],
    isLoading: false,
    isRefreshing: false,
    error: null,
    pagination: null
  });

  const loadUsers = useCallback(
    async (page: number = initialPage, size: number = initialSize) => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const response: UsersResponse = await userService.getAllUsers({
          page,
          size
        });

        setState(prev => ({
          ...prev,
          users: response.users,
          pagination: response.pagination,
          isLoading: false,
          error: null
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error ? error.message : 'Error al cargar usuarios'
        }));
      }
    },
    [initialPage, initialSize]
  );

  const refreshUsers = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isRefreshing: true, error: null }));

      const response: UsersResponse = await userService.getAllUsers({
        page: state.pagination?.page || initialPage,
        size: state.pagination?.size || initialSize
      });

      setState(prev => ({
        ...prev,
        users: response.users,
        pagination: response.pagination,
        isRefreshing: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isRefreshing: false,
        error:
          error instanceof Error ? error.message : 'Error al refrescar usuarios'
      }));
    }
  }, [state.pagination, initialPage, initialSize]);

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
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : 'Error al desactivar usuario'
        }));
        throw error;
      }
    },
    [loadUsers, state.pagination, initialPage, initialSize]
  );

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    ...state,
    loadUsers,
    refreshUsers,
    deactivateUser
  };
};
