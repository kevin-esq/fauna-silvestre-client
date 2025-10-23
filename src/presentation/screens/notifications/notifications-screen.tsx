import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ListRenderItem
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NotificationModel } from '../../../domain/models/notification.models';
import { useTheme } from '../../contexts/theme.context';
import { useNotifications } from '../../hooks/use-notifications.hook';
import NotificationCard from '../../components/notification/notification-card.component';
import NotificationSkeleton from '../../components/ui/notification-skeleton.component';
import { createStyles } from './notifications-screen.styles';

const ITEM_HEIGHT = 140;

const NotificationsScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets);

  const {
    notifications,
    isLoading,
    isRefreshing,
    unreadCount,
    hasNotifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getRelativeTime
  } = useNotifications();

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleNotificationPress = useCallback(
    async (notification: NotificationModel) => {
      if (notification.status === 'unread') {
        await markAsRead(notification.id);
      }
      // TODO: Navegar a detalles cuando el backend esté listo
      console.log('Notification pressed:', notification);
    },
    [markAsRead]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    if (unreadCount > 0) {
      await markAllAsRead();
    }
  }, [unreadCount, markAllAsRead]);

  const handleRefresh = useCallback(async () => {
    await refreshNotifications();
  }, [refreshNotifications]);

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteNotification(id);
    },
    [deleteNotification]
  );

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderItem: ListRenderItem<NotificationModel> = useCallback(
    ({ item }) => (
      <NotificationCard
        notification={item}
        onPress={handleNotificationPress}
        onDelete={handleDelete}
        getRelativeTime={getRelativeTime}
      />
    ),
    [handleNotificationPress, handleDelete, getRelativeTime]
  );

  const renderHeader = useCallback(() => {
    if (!hasNotifications || isLoading) return null;

    return (
      <View style={styles.listHeader}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Notificaciones</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
            accessibilityRole="button"
            accessibilityLabel="Marcar todas como leídas"
          >
            <Ionicons
              name="checkmark-done"
              size={18}
              color={theme.colors.forest}
            />
            <Text style={styles.markAllText}>Marcar todas</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [
    hasNotifications,
    isLoading,
    unreadCount,
    handleMarkAllAsRead,
    styles,
    theme
  ]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <NotificationSkeleton count={5} />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons
            name="notifications-off-outline"
            size={80}
            color={theme.colors.textSecondary}
          />
        </View>
        <Text style={styles.emptyTitle}>No tienes notificaciones</Text>
        <Text style={styles.emptyMessage}>
          Aquí aparecerán las actualizaciones sobre tus publicaciones y anuncios
          importantes.
        </Text>
      </View>
    );
  }, [isLoading, styles, theme]);

  const keyExtractor = useCallback(
    (item: NotificationModel) => `notification-${item.id}`,
    []
  );

  const getItemLayout = useCallback(
    (
      _data: ArrayLike<NotificationModel> | null | undefined,
      index: number
    ) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index
    }),
    []
  );

  // ============================================================================
  // REFRESH CONTROL
  // ============================================================================

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        colors={[theme.colors.forest]}
        tintColor={theme.colors.forest}
        title="Actualizando..."
        titleColor={theme.colors.textSecondary}
      />
    ),
    [isRefreshing, handleRefresh, theme]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={refreshControl}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        // Performance optimizations
        getItemLayout={getItemLayout}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
      />
    </View>
  );
};

NotificationsScreen.displayName = 'NotificationsScreen';

export default React.memo(NotificationsScreen);
