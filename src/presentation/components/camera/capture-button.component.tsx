import React, { useMemo } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '@/presentation/contexts/theme.context';

type Props = {
  onPress: () => void;
  disabled?: boolean;
  isActive?: boolean;
};

export const CaptureButton: React.FC<Props> = ({
  onPress,
  disabled,
  isActive
}) => {
  const { colors, iconSizes } = useTheme();

  const handlePress = () => {
    ReactNativeHapticFeedback.trigger('impactMedium', {
      ignoreAndroidSystemSettings: true
    });
    onPress();
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        captureButton: {
          width: 80,
          height: 80,
          borderRadius: 40,
          borderWidth: 4,
          borderColor: 'rgba(255, 255, 255, 0.9)',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          elevation: 8,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8
        },
        captureButtonInner: {
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: '#FFFFFF',
          justifyContent: 'center',
          alignItems: 'center'
        },
        captureButtonActive: {
          backgroundColor: colors.error,
          borderColor: colors.error
        },
        captureButtonDisabled: {
          opacity: 0.5,
          borderColor: 'rgba(255, 255, 255, 0.3)'
        }
      }),
    [colors]
  );

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.captureButton, disabled && styles.captureButtonDisabled]}
      accessibilityLabel="Capturar foto"
      accessibilityRole="button"
    >
      <View
        style={[
          styles.captureButtonInner,
          isActive && styles.captureButtonActive
        ]}
      >
        {isActive && (
          <MaterialCommunityIcons
            name="camera"
            size={iconSizes.large}
            color="#FFFFFF"
          />
        )}
      </View>
    </TouchableOpacity>
  );
};
