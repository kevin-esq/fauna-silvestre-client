import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/theme.context';
import { useDeviceOrientation } from '../../hooks/common/use-device-orientation.hook';

interface ZoomControlsProps {
  currentZoom: number;
  minZoom: number;
  maxZoom: number;
  neutralZoom: number;
  onZoomChange: (zoom: number) => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = React.memo(
  ({ currentZoom, minZoom, maxZoom, neutralZoom, onZoomChange }) => {
    const { colors, spacing, typography, borderRadius } = useTheme();
    const { iconRotation } = useDeviceOrientation();

    const handleZoomIn = useCallback(() => {
      console.log(
        '🔍 [ZOOM] Botón + presionado. Current:',
        currentZoom,
        'Max:',
        maxZoom
      );
      const newZoom = Math.min(maxZoom, currentZoom + 0.2);
      console.log('🔍 [ZOOM] Nuevo zoom calculado:', newZoom);
      onZoomChange(newZoom);
    }, [currentZoom, maxZoom, onZoomChange]);

    const handleZoomOut = useCallback(() => {
      console.log(
        '🔍 [ZOOM] Botón - presionado. Current:',
        currentZoom,
        'Min:',
        minZoom
      );
      const newZoom = Math.max(minZoom, currentZoom - 0.2);
      console.log('🔍 [ZOOM] Nuevo zoom calculado:', newZoom);
      onZoomChange(newZoom);
    }, [currentZoom, minZoom, onZoomChange]);

    const handleResetZoom = useCallback(() => {
      console.log('🔍 [ZOOM] Botón reset presionado. Neutral:', neutralZoom);
      onZoomChange(neutralZoom);
    }, [neutralZoom, onZoomChange]);

    const styles = useMemo(() => {
      return StyleSheet.create({
        container: {
          position: 'absolute',
          right: spacing.small,
          top: '35%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderRadius: borderRadius.xlarge,
          paddingVertical: spacing.tiny,
          paddingHorizontal: spacing.tiny,
          gap: spacing.tiny,
          zIndex: 1000,
          elevation: 10,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4
        } as ViewStyle,
        button: {
          width: 36,
          height: 36,
          borderRadius: borderRadius.medium,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.15)'
        },
        buttonActive: {
          backgroundColor: colors.forest,
          borderColor: colors.leaf
        },
        zoomIndicator: {
          paddingVertical: 2,
          paddingHorizontal: spacing.tiny,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: borderRadius.small,
          alignItems: 'center' as const,
          minWidth: 36
        },
        zoomText: {
          color: '#FFFFFF',
          fontSize: 10,
          fontWeight: typography.fontWeight.bold,
          transform: [{ rotate: iconRotation }]
        },
        iconWrapper: {
          transform: [{ rotate: iconRotation }]
        }
      });
    }, [colors, spacing, typography, borderRadius, iconRotation]);

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleZoomIn}
          activeOpacity={0.7}
          accessibilityLabel="Acercar zoom"
          accessibilityRole="button"
        >
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <View style={styles.zoomIndicator}>
          <Text style={styles.zoomText}>
            {(currentZoom / neutralZoom).toFixed(1)}x
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleResetZoom}
          activeOpacity={0.7}
          accessibilityLabel="Restablecer zoom"
          accessibilityRole="button"
        >
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons name="refresh" size={18} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleZoomOut}
          activeOpacity={0.7}
          accessibilityLabel="Alejar zoom"
          accessibilityRole="button"
        >
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons name="minus" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>
    );
  }
);

ZoomControls.displayName = 'ZoomControls';
