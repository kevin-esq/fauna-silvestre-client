import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  Animated,
  ActivityIndicator
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@/presentation/contexts/theme.context';
import { createStyles } from './user-card.styles';

export interface UserModel {
  id: string;
  name: string;
  userName: string;
  email: string;
  locality: string;
  role: string;
  avatarUrl?: string;
}

interface UserCardProps {
  user: UserModel;
  onPress: () => void;
}

const UserCard = React.memo<UserCardProps>(({ user, onPress }) => {
  const { theme, colors, iconSizes } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { name, userName, email, locality, role, avatarUrl } = user;

  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 100,
      friction: 8
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 7
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
    setImageError(true);
  }, []);

  const getRoleBadgeColor = useCallback(
    (role: string) => {
      switch (role.toLowerCase()) {
        case 'admin':
          return colors.error;
        case 'moderator':
          return colors.warning;
        case 'user':
          return colors.forest;
        default:
          return colors.textSecondary;
      }
    },
    [colors]
  );

  const animatedStyle = {
    transform: [{ scale: scaleAnim }]
  };

  const roleBadgeColor = getRoleBadgeColor(role);

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={styles.card}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={{ color: colors.primary + '10' }}
        accessibilityRole="button"
        accessibilityLabel={`Ver perfil de ${name}`}
        accessibilityHint="Toca para ver los detalles del usuario"
      >
        <View style={styles.imageContainer}>
          {avatarUrl && !imageError ? (
            <>
              <Image
                source={{ uri: avatarUrl }}
                style={styles.image}
                onLoad={handleImageLoad}
                onError={handleImageError}
                resizeMode="cover"
              />
              {imageLoading && (
                <View
                  style={[styles.imagePlaceholder, { position: 'absolute' }]}
                >
                  <ActivityIndicator size="large" color={colors.forest} />
                </View>
              )}
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons
                name="person-circle-outline"
                size={iconSizes.xxlarge}
                color={colors.placeholder}
              />
            </View>
          )}

          <View style={[styles.roleBadge, { backgroundColor: roleBadgeColor }]}>
            <Ionicons
              name="shield-checkmark"
              size={iconSizes.small}
              color={colors.textOnPrimary}
            />
            <Text style={styles.roleBadgeText}>{role}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.username} numberOfLines={1}>
              @{userName}
            </Text>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.water + '15' }
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={iconSizes.small}
                  color={colors.water}
                />
              </View>
              <Text style={styles.infoText} numberOfLines={1}>
                {email}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.forest + '15' }
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={iconSizes.small}
                  color={colors.forest}
                />
              </View>
              <Text style={styles.infoText} numberOfLines={1}>
                {locality}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Seguidos</Text>
              </View>
            </View>

            <View style={styles.viewButton}>
              <Text style={styles.viewButtonText}>Ver perfil</Text>
              <Ionicons
                name="arrow-forward"
                size={iconSizes.small}
                color={colors.textOnPrimary}
              />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

UserCard.displayName = 'UserCard';

export default UserCard;
