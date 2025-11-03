import React, { useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useTheme } from '@/presentation/contexts/theme.context';
import { useDeviceOrientation } from '@/presentation/hooks/common/use-device-orientation.hook';

type Props = {
  onBack: () => void;
  onToggleFlash: () => void;
  onFlip: () => void;
  flashMode: 'off' | 'on' | 'auto';
  showFlash: boolean;
  style?: StyleProp<ViewStyle>;
};

export const TopControls: React.FC<Props> = ({
  onBack,
  onToggleFlash,
  onFlip,
  flashMode,
  showFlash,
  style
}) => {
  const { colors, spacing, iconSizes, borderRadius } = useTheme();
  const { iconRotation } = useDeviceOrientation();

  const handlePress = (action: () => void) => {
    ReactNativeHapticFeedback.trigger('impactLight', {
      ignoreAndroidSystemSettings: true
    });
    action();
  };

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: spacing.medium,
          paddingVertical: spacing.small
        },
        button: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          width: 56,
          height: 56,
          borderRadius: borderRadius.xlarge,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          elevation: 4,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4
        },
        buttonActive: {
          backgroundColor: colors.forest,
          borderColor: colors.leaf
        },
        controlGroup: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.medium
        },
        iconWrapper: {
          transform: [{ rotate: iconRotation }]
        }
      }),
    [colors, spacing, borderRadius, iconRotation]
  );

  const getFlashIcon = () => {
    switch (flashMode) {
      case 'on':
        return 'flash';
      case 'auto':
        return 'flash-auto';
      default:
        return 'flash-off';
    }
  };

  return (
    <View style={[dynamicStyles.container, style]}>
      <TouchableOpacity
        onPress={() => handlePress(onBack)}
        style={dynamicStyles.button}
        activeOpacity={0.7}
        accessibilityLabel="Cerrar cámara"
        accessibilityRole="button"
      >
        <View style={dynamicStyles.iconWrapper}>
          <MaterialCommunityIcons
            name="close-circle"
            size={iconSizes.large}
            color="#FFFFFF"
          />
        </View>
      </TouchableOpacity>

      <View style={dynamicStyles.controlGroup}>
        {showFlash && (
          <TouchableOpacity
            onPress={() => handlePress(onToggleFlash)}
            style={[
              dynamicStyles.button,
              flashMode !== 'off' && dynamicStyles.buttonActive
            ]}
            activeOpacity={0.7}
            accessibilityLabel={`Flash ${flashMode}`}
            accessibilityRole="button"
          >
            <View style={dynamicStyles.iconWrapper}>
              <MaterialCommunityIcons
                name={getFlashIcon()}
                size={iconSizes.large}
                color="#FFFFFF"
              />
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => handlePress(onFlip)}
          style={dynamicStyles.button}
          activeOpacity={0.7}
          accessibilityLabel="Voltear cámara"
          accessibilityRole="button"
        >
          <View style={dynamicStyles.iconWrapper}>
            <MaterialCommunityIcons
              name="camera-flip"
              size={iconSizes.large}
              color="#FFFFFF"
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
