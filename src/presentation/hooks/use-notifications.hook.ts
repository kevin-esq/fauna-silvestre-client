import { useCallback, useMemo } from 'react';
import { useNotificationContext } from '../contexts/notification.context';
import { NotificationModel } from '../../domain/models/notification.models';

/**
 * Custom hook para gestionar notificaciones
 * Proporciona acceso al estado y funciones del NotificationContext
 */
export const useNotifications = () => {
  const {
    state,
    loadNotifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotificationContext();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasUnread = useMemo(() => state.unreadCount > 0, [state.unreadCount]);

  const hasNotifications = useMemo(
    () => state.notifications.length > 0,
    [state.notifications.length]
  );

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Formatea la fecha de la notificación en tiempo relativo
   */
  const getRelativeTime = useCallback((date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Ahora';
    } else if (diffInMinutes < 60) {
      return `hace ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    } else if (diffInDays < 7) {
      return `hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      });
    }
  }, []);

  /**
   * Filtra notificaciones por estado
   */
  const getNotificationsByStatus = useCallback(
    (status: 'read' | 'unread'): NotificationModel[] => {
      return state.notifications.filter(n => n.status === status);
    },
    [state.notifications]
  );

  /**
   * Obtiene notificaciones no leídas
   */
  const unreadNotifications = useMemo(
    () => getNotificationsByStatus('unread'),
    [getNotificationsByStatus]
  );

  /**
   * Obtiene notificaciones leídas
   */
  const readNotifications = useMemo(
    () => getNotificationsByStatus('read'),
    [getNotificationsByStatus]
  );

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // State
    notifications: state.notifications,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    error: state.error,
    unreadCount: state.unreadCount,

    // Computed
    hasUnread,
    hasNotifications,
    unreadNotifications,
    readNotifications,

    // Actions
    loadNotifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,

    // Helpers
    getRelativeTime,
    getNotificationsByStatus
  };
};

export default useNotifications;
