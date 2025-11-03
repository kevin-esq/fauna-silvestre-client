import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '@/presentation/contexts/theme.context';

export interface ModalToggleProps {
  /**
   * Toggle label
   */
  label: string;

  /**
   * Toggle value (on/off)
   */
  value: boolean;

  /**
   * onToggle handler
   */
  onToggle: () => void;

  /**
   * Disable toggle
   */
  disabled?: boolean;
}

/**
 * Reusable toggle switch for modals
 *
 * Provides consistent toggle UI with custom theming support.
 * Used across catalog, publication, and user view preference modals.
 *
 * @example
 * <ModalToggle
 *   label="Show Images"
 *   value={showImages}
 *   onToggle={toggleImages}
 * />
 */
export const ModalToggle: React.FC<ModalToggleProps> = React.memo(
  ({ label, value, onToggle, disabled = false }) => {
    const { colors, spacing, typography } = useTheme();

    const styles = StyleSheet.create({
      container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.small,
        opacity: disabled ? 0.5 : 1
      },
      label: {
        fontSize: typography.fontSize.medium,
        fontWeight: typography.fontWeight.medium,
        color: disabled ? colors.textSecondary : colors.text
      },
      track: {
        width: 50,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        padding: 2,
        backgroundColor: value
          ? colors.primary
          : disabled
            ? colors.divider
            : colors.disabled
      },
      circle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.surface,
        alignSelf: value ? 'flex-end' : 'flex-start'
      }
    });

    return (
      <TouchableOpacity
        style={styles.container}
        onPress={disabled ? undefined : onToggle}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}
      >
        <Text style={styles.label}>{label}</Text>
        <View style={styles.track}>
          <View style={styles.circle} />
        </View>
      </TouchableOpacity>
    );
  }
);

ModalToggle.displayName = 'ModalToggle';
