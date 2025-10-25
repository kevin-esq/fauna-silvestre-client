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
import { useTheme } from '../../contexts/theme.context';
import { useDeviceOrientation } from '../../hooks/use-device-orientation.hook';

type Props = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export const GalleryButton: React.FC<Props> = ({ onPress, style }) => {
  const { colors, iconSizes, borderRadius } = useTheme();
  const { iconRotation } = useDeviceOrientation();

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
        iconWrapper: {
          transform: [{ rotate: iconRotation }]
        }
      }),
    [colors, borderRadius, iconRotation]
  );

  return (
    <TouchableOpacity
      onPress={() => {
        ReactNativeHapticFeedback.trigger('impactLight', {
          ignoreAndroidSystemSettings: true
        });
        onPress();
      }}
      style={[styles.button, style]}
      activeOpacity={0.7}
      accessibilityLabel="Abrir galería"
      accessibilityRole="button"
    >
      <View style={styles.iconWrapper}>
        <MaterialCommunityIcons
          name="image-multiple"
          size={iconSizes.large}
          color="#FFFFFF"
        />
      </View>
    </TouchableOpacity>
  );
};
