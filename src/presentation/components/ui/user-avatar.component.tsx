import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Theme } from '@/presentation/contexts/theme.context';

interface UserAvatarProps {
  name: string;
  lastName: string;
  size?: number;
  showInitials?: boolean;
  isDeactivated?: boolean;
  theme: Theme;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  lastName,
  size = 56,
  showInitials = true,
  isDeactivated = false,
  theme
}) => {
  const initials = useMemo(() => {
    const firstInitial = name.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  }, [name, lastName]);

  const backgroundColor = useMemo(() => {
    if (isDeactivated) {
      return theme.colors.error;
    }

    const colors = [
      theme.colors.forest,
      theme.colors.leaf,
      theme.colors.earth,
      theme.colors.water,
      theme.colors.primary
    ];

    const charCode = name.charCodeAt(0) + lastName.charCodeAt(0);
    const colorIndex = charCode % colors.length;
    return colors[colorIndex];
  }, [name, lastName, isDeactivated, theme.colors]);

  const fontSize = useMemo(() => {
    return size * 0.4;
  }, [size]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          position: 'relative'
        },
        avatar: {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        },
        initials: {
          fontSize,
          fontWeight: '700',
          color: theme.colors.textOnPrimary,
          letterSpacing: 0.5
        },
        badge: {
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: size * 0.32,
          height: size * 0.32,
          borderRadius: (size * 0.32) / 2,
          backgroundColor: isDeactivated
            ? theme.colors.error
            : theme.colors.leaf,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: theme.colors.surface,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 4
        }
      }),
    [size, backgroundColor, fontSize, isDeactivated, theme.colors]
  );

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        {showInitials ? (
          <Text style={styles.initials}>{initials}</Text>
        ) : (
          <Ionicons
            name="person"
            size={size * 0.5}
            color={theme.colors.textOnPrimary}
          />
        )}
      </View>
      <View style={styles.badge}>
        <Ionicons
          name={isDeactivated ? 'close-circle' : 'shield-checkmark'}
          size={size * 0.18}
          color={theme.colors.textOnPrimary}
        />
      </View>
    </View>
  );
};
