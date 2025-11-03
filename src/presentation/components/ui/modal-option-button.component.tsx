import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '@/presentation/contexts/theme.context';

export interface ModalOptionButtonProps {
  /**
   * Option value/key
   */
  value: string;

  /**
   * Display label
   */
  label: string;

  /**
   * Icon name
   */
  icon: string;

  /**
   * Icon library type
   */
  iconType?: 'ionicons' | 'material';

  /**
   * Is this option currently active/selected
   */
  isActive: boolean;

  /**
   * onPress handler
   */
  onPress: () => void;

  /**
   * Custom button style
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Custom text style
   */
  textStyle?: StyleProp<TextStyle>;

  /**
   * Minimum width for button
   */
  minWidth?: number;
}

/**
 * Reusable option button for modals
 *
 * Provides consistent styling for selectable options in bottom sheet modals.
 * Used across catalog, publication, and user view selectors.
 *
 * @example
 * <ModalOptionButton
 *   value="list"
 *   label="Lista"
 *   icon="list"
 *   isActive={currentView === 'list'}
 *   onPress={() => setView('list')}
 * />
 */
export const ModalOptionButton: React.FC<ModalOptionButtonProps> = React.memo(
  ({
    value,
    label,
    icon,
    iconType = 'ionicons',
    isActive,
    onPress,
    style,
    textStyle,
    minWidth = 100
  }) => {
    const { colors, spacing, typography, borderRadius } = useTheme();

    const IconComponent =
      iconType === 'material' ? MaterialCommunityIcons : Ionicons;

    const styles = StyleSheet.create({
      button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.medium,
        paddingVertical: spacing.small + 2,
        borderRadius: borderRadius.medium,
        borderWidth: 1.5,
        borderColor: isActive ? colors.primary : colors.border,
        backgroundColor: isActive ? colors.primary + '15' : colors.background,
        minWidth
      },
      icon: {
        marginRight: spacing.tiny
      },
      text: {
        fontSize: typography.fontSize.small,
        fontWeight: isActive
          ? typography.fontWeight.bold
          : typography.fontWeight.medium,
        color: isActive ? colors.primary : colors.text,
        flex: 1
      }
    });

    return (
      <TouchableOpacity
        key={value}
        style={[styles.button, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <IconComponent
          name={icon as never}
          size={18}
          color={isActive ? colors.primary : colors.textSecondary}
          style={styles.icon}
        />
        <Text style={[styles.text, textStyle]}>{label}</Text>
      </TouchableOpacity>
    );
  }
);

ModalOptionButton.displayName = 'ModalOptionButton';
