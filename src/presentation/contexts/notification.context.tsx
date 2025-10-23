import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  ReactNode
} from 'react';
import {
  NotificationModel,
  NotificationStatus
} from '../../domain/models/notification.models';

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_NOTIFICATIONS: NotificationModel[] = [
  {
    id: '1',
    type: 'approval',
    title: 'Publicación Aprobada',
    message:
      'Tu publicación de "Jaguar" ha sido aprobada por el administrador.',
    status: 'unread',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // hace 2 horas
    publicationId: 123,
    animalName: 'Jaguar'
  },
  {
    id: '2',
    type: 'rejection',
    title: 'Publicación Rechazada',
    message:
      'Tu publicación de "Guacamaya Roja" fue rechazada. Motivo: La imagen no es clara.',
    status: 'unread',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // hace 5 horas
    publicationId: 124,
    animalName: 'Guacamaya Roja'
  },
  {
    id: '3',
    type: 'announcement',
    title: 'Nuevo Animal en el Catálogo',
    message: 'Se ha agregado "Tucán" al catálogo de animales disponibles.',
    status: 'unread',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // hace 1 día
    animalName: 'Tucán'
  },
  {
    id: '4',
    type: 'system',
    title: 'Actualización del Sistema',
    message:
      'La aplicación ha sido actualizada a la versión 2.0 con nuevas funcionalidades.',
    status: 'read',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // hace 2 días
  },
  {
    id: '5',
    type: 'approval',
    title: 'Publicación Aprobada',
    message: 'Tu publicación de "Oso Hormiguero" ha sido aprobada.',
    status: 'read',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // hace 3 días
    publicationId: 125,
    animalName: 'Oso Hormiguero'
  }
];

// ============================================================================
// TYPES
// ============================================================================

interface NotificationState {
  readonly notifications: NotificationModel[];
  readonly isLoading: boolean;
  readonly isRefreshing: boolean;
  readonly error: string | null;
  readonly unreadCount: number;
}

type NotificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_NOTIFICATIONS'; payload: NotificationModel[] }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_UNREAD_COUNT' };

interface NotificationContextType {
  readonly state: NotificationState;
  readonly loadNotifications: () => Promise<void>;
  readonly refreshNotifications: () => Promise<void>;
  readonly markAsRead: (id: string) => Promise<void>;
  readonly markAllAsRead: () => Promise<void>;
  readonly deleteNotification: (id: string) => Promise<void>;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: NotificationState = {
  notifications: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  unreadCount: 0
};

// ============================================================================
// REDUCER
// ============================================================================

const notificationReducer = (
  state: NotificationState,
  action: NotificationAction
): NotificationState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_REFRESHING':
      return { ...state, isRefreshing: action.payload };

    case 'SET_NOTIFICATIONS': {
      const unreadCount = action.payload.filter(
        n => n.status === 'unread'
      ).length;
      return {
        ...state,
        notifications: action.payload,
        unreadCount,
        error: null
      };
    }

    case 'MARK_AS_READ': {
      const notifications = state.notifications.map(notification =>
        notification.id === action.payload
          ? { ...notification, status: 'read' as NotificationStatus }
          : notification
      );
      const unreadCount = notifications.filter(
        n => n.status === 'unread'
      ).length;
      return { ...state, notifications, unreadCount };
    }

    case 'MARK_ALL_AS_READ': {
      const notifications = state.notifications.map(notification => ({
        ...notification,
        status: 'read' as NotificationStatus
      }));
      return { ...state, notifications, unreadCount: 0 };
    }

    case 'DELETE_NOTIFICATION': {
      const notifications = state.notifications.filter(
        n => n.id !== action.payload
      );
      const unreadCount = notifications.filter(
        n => n.status === 'unread'
      ).length;
      return { ...state, notifications, unreadCount };
    }

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'UPDATE_UNREAD_COUNT': {
      const unreadCount = state.notifications.filter(
        n => n.status === 'unread'
      ).length;
      return { ...state, unreadCount };
    }

    default:
      return state;
  }
};

// ============================================================================
// CONTEXT
// ============================================================================

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// ============================================================================
// PROVIDER
// ============================================================================

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Simular carga inicial
  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================================
  // LOAD NOTIFICATIONS (Mock)
  // ============================================================================

  const loadNotifications = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Simular delay de red
      await new Promise<void>(resolve => setTimeout(resolve, 800));

      // Cargar datos mock
      dispatch({ type: 'SET_NOTIFICATIONS', payload: MOCK_NOTIFICATIONS });
    } catch {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Error al cargar notificaciones'
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // ============================================================================
  // REFRESH NOTIFICATIONS (Mock)
  // ============================================================================

  const refreshNotifications = useCallback(async () => {
    dispatch({ type: 'SET_REFRESHING', payload: true });

    try {
      // Simular delay de red
      await new Promise<void>(resolve => setTimeout(resolve, 1000));

      // Recargar datos mock
      dispatch({ type: 'SET_NOTIFICATIONS', payload: MOCK_NOTIFICATIONS });
    } catch {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Error al actualizar notificaciones'
      });
    } finally {
      dispatch({ type: 'SET_REFRESHING', payload: false });
    }
  }, []);

  // ============================================================================
  // MARK AS READ (Mock)
  // ============================================================================

  const markAsRead = useCallback(async (id: string) => {
    try {
      // Simular delay de red
      await new Promise<void>(resolve => setTimeout(resolve, 300));

      dispatch({ type: 'MARK_AS_READ', payload: id });
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  }, []);

  // ============================================================================
  // MARK ALL AS READ (Mock)
  // ============================================================================

  const markAllAsRead = useCallback(async () => {
    try {
      // Simular delay de red
      await new Promise<void>(resolve => setTimeout(resolve, 500));

      dispatch({ type: 'MARK_ALL_AS_READ' });
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  }, []);

  // ============================================================================
  // DELETE NOTIFICATION (Mock)
  // ============================================================================

  const deleteNotification = useCallback(async (id: string) => {
    try {
      // Simular delay de red
      await new Promise<void>(resolve => setTimeout(resolve, 300));

      dispatch({ type: 'DELETE_NOTIFICATION', payload: id });
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue = useMemo<NotificationContextType>(
    () => ({
      state,
      loadNotifications,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification
    }),
    [
      state,
      loadNotifications,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification
    ]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useNotificationContext = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotificationContext must be used within NotificationProvider'
    );
  }
  return context;
};

export default NotificationContext;
