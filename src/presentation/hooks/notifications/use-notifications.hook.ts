import { useCallback, useMemo } from 'react';
import { useNotificationContext } from '@/presentation/contexts/notification.context';
import { NotificationModel } from '@/domain/models/notification.models';

export const useNotifications = () => {
  const {
    state,
    loadNotifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotificationContext();

  const hasUnread = useMemo(() => state.unreadCount > 0, [state.unreadCount]);

  const hasNotifications = useMemo(
    () => state.notifications.length > 0,
    [state.notifications.length]
  );

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

  const getNotificationsByStatus = useCallback(
    (status: 'read' | 'unread'): NotificationModel[] => {
      return state.notifications.filter(n => n.status === status);
    },
    [state.notifications]
  );

  const unreadNotifications = useMemo(
    () => getNotificationsByStatus('unread'),
    [getNotificationsByStatus]
  );

  const readNotifications = useMemo(
    () => getNotificationsByStatus('read'),
    [getNotificationsByStatus]
  );

  return {
    notifications: state.notifications,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    error: state.error,
    unreadCount: state.unreadCount,

    hasUnread,
    hasNotifications,
    unreadNotifications,
    readNotifications,

    loadNotifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,

    getRelativeTime,
    getNotificationsByStatus
  };
};

export default useNotifications;
