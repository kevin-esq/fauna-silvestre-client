import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  NotificationModel,
  NotificationType
} from '../../../domain/models/notification.models';
import { useTheme } from '@/presentation/contexts/theme.context';
import { createStyles } from './notification-card.styles';

interface NotificationCardProps {
  notification: NotificationModel;
  onPress?: (notification: NotificationModel) => void;
  onDelete?: (id: string) => void;
  getRelativeTime: (date: Date) => string;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
  onDelete,
  getRelativeTime
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const getIconConfig = useCallback(
    (
      type: NotificationType
    ): { name: string; color: string; bgColor: string } => {
      switch (type) {
        case 'approval':
          return {
            name: 'checkmark-circle',
            color: theme.colors.leaf,
            bgColor: `${theme.colors.leaf}15`
          };
        case 'rejection':
          return {
            name: 'close-circle',
            color: theme.colors.error,
            bgColor: `${theme.colors.error}15`
          };
        case 'announcement':
          return {
            name: 'megaphone',
            color: theme.colors.water,
            bgColor: `${theme.colors.water}15`
          };
        case 'system':
          return {
            name: 'information-circle',
            color: theme.colors.forest,
            bgColor: `${theme.colors.forest}15`
          };
        default:
          return {
            name: 'notifications',
            color: theme.colors.textSecondary,
            bgColor: theme.colors.surfaceVariant
          };
      }
    },
    [theme]
  );

  const iconConfig = getIconConfig(notification.type);
  const isUnread = notification.status === 'unread';

  const handlePress = useCallback(() => {
    onPress?.(notification);
  }, [notification, onPress]);

  const handleDelete = useCallback(() => {
    onDelete?.(notification.id);
  }, [notification.id, onDelete]);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isUnread && styles.unreadContainer,
        { borderLeftColor: iconConfig.color }
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Notificación: ${notification.title}`}
      accessibilityHint={isUnread ? 'No leída' : 'Leída'}
    >
      {isUnread && <View style={styles.unreadDot} />}

      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: iconConfig.bgColor }
          ]}
        >
          <Ionicons name={iconConfig.name} size={24} color={iconConfig.color} />
        </View>

        <View style={styles.headerContent}>
          <Text
            style={[styles.title, isUnread && styles.titleUnread]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text style={styles.time}>
            {getRelativeTime(notification.createdAt)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Eliminar notificación"
        >
          <Ionicons
            name="trash-outline"
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.message} numberOfLines={2}>
        {notification.message}
      </Text>

      {notification.animalName && (
        <View style={styles.animalTag}>
          <Ionicons name="paw" size={12} color={theme.colors.forest} />
          <Text style={styles.animalName}>{notification.animalName}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default React.memo(NotificationCard);
