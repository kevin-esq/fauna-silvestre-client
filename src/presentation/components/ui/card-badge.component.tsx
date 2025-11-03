import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@/presentation/contexts/theme.context';

export interface CardBadgeProps {
  /**
   * Badge label text
   */
  label: string;

  /**
   * Optional icon name
   */
  icon?: string;

  /**
   * Badge color
   */
  color: string;

  /**
   * Badge variant
   */
  variant?: 'filled' | 'outlined';

  /**
   * Icon size
   */
  iconSize?: number;
}

/**
 * Reusable card badge component
 *
 * Used for status indicators, tags, and labels in cards.
 * Supports filled and outlined variants with optional icons.
 *
 * @example
 * <CardBadge
 *   label="Borrador"
 *   icon="create-outline"
 *   color={colors.water}
 *   variant="filled"
 * />
 */
export const CardBadge: React.FC<CardBadgeProps> = React.memo(
  ({ label, icon, color, variant = 'filled', iconSize = 14 }) => {
    const { spacing, typography, borderRadius } = useTheme();

    const styles = StyleSheet.create({
      container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.small,
        paddingVertical: spacing.small / 2,
        borderRadius: borderRadius.small,
        backgroundColor: variant === 'filled' ? `${color}15` : 'transparent',
        borderWidth: variant === 'outlined' ? 1.5 : 0,
        borderColor: color,
        alignSelf: 'flex-start'
      },
      icon: {
        marginRight: spacing.small / 2
      },
      label: {
        fontSize: typography.fontSize.small * 0.85,
        fontWeight: typography.fontWeight.bold,
        color
      }
    });

    return (
      <View style={styles.container}>
        {icon && (
          <Ionicons
            name={icon as never}
            size={iconSize}
            color={color}
            style={styles.icon}
          />
        )}
        <Text style={styles.label}>{label}</Text>
      </View>
    );
  }
);

CardBadge.displayName = 'CardBadge';
