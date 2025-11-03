import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '@/presentation/contexts/theme.context';

interface CameraRestrictedOverlayProps {
  message: string;
  isRetrying: boolean;
  onRetry: () => void;
}

export const CameraRestrictedOverlay: React.FC<
  CameraRestrictedOverlayProps
> = ({ message, isRetrying, onRetry }) => {
  const { colors, spacing, typography, borderRadius } = useTheme();

  const styles = StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.large,
      zIndex: 999
    },
    content: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xlarge,
      padding: spacing.xlarge,
      alignItems: 'center',
      maxWidth: 320,
      width: '100%'
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.error + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.medium
    },
    title: {
      fontSize: typography.fontSize.xlarge,
      fontWeight: typography.fontWeight.bold,
      color: colors.error,
      marginBottom: spacing.small,
      textAlign: 'center'
    },
    message: {
      fontSize: typography.fontSize.medium,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.large,
      lineHeight: typography.lineHeight.large
    },
    retryButton: {
      backgroundColor: colors.forest,
      paddingHorizontal: spacing.xlarge,
      paddingVertical: spacing.medium,
      borderRadius: borderRadius.large,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.small,
      minWidth: 160,
      justifyContent: 'center'
    },
    retryButtonDisabled: {
      backgroundColor: colors.surfaceVariant,
      opacity: 0.6
    },
    retryButtonText: {
      color: '#FFFFFF',
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.bold
    }
  });

  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="camera-off"
            size={40}
            color={colors.error}
          />
        </View>

        <Text style={styles.title}>Cámara Restringida</Text>
        <Text style={styles.message}>{message}</Text>

        <TouchableOpacity
          style={[styles.retryButton, isRetrying && styles.retryButtonDisabled]}
          onPress={onRetry}
          disabled={isRetrying}
          activeOpacity={0.8}
        >
          {isRetrying ? (
            <>
              <MaterialCommunityIcons
                name="loading"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.retryButtonText}>Reintentando...</Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons
                name="refresh"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
