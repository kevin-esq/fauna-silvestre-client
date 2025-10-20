import { StyleSheet } from 'react-native';
import { Theme } from '@/presentation/contexts/theme.context';

export const createLocationMapStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      marginBottom: theme.spacing.large
    },
    mapContainer: {
      height: 280,
      width: '100%',
      borderRadius: theme.borderRadius.large,
      overflow: 'hidden',
      borderWidth: theme.borderWidth.hairline,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      ...(theme.shadows.medium && {
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 6
      })
    },
    map: {
      ...StyleSheet.absoluteFillObject,
      minHeight: 280
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.large,
      backgroundColor: theme.colors.surface
    },
    errorIcon: {
      fontSize: 48,
      marginBottom: theme.spacing.medium,
      opacity: 0.5
    },
    errorText: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.error,
      textAlign: 'center',
      fontWeight: theme.typography.fontWeight.medium,
      marginBottom: theme.spacing.small
    },
    errorDescription: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: theme.typography.lineHeight.medium
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surface
    },
    loadingText: {
      marginTop: theme.spacing.medium,
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.textSecondary,
      fontWeight: theme.typography.fontWeight.regular
    },
    coordinatesLabel: {
      position: 'absolute',
      bottom: theme.spacing.small,
      left: theme.spacing.small,
      right: theme.spacing.small,
      backgroundColor: theme.modalBackground,
      paddingVertical: theme.spacing.small,
      paddingHorizontal: theme.spacing.medium,
      borderRadius: theme.borderRadius.medium,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...(theme.shadows.small && {
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3
      })
    },
    coordinatesText: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.textSecondary,
      fontWeight: theme.typography.fontWeight.regular,
      flex: 1
    },
    mapControls: {
      position: 'absolute',
      top: theme.spacing.small,
      right: theme.spacing.small,
      flexDirection: 'column',
      gap: theme.spacing.small
    },
    mapButton: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.medium,
      backgroundColor: theme.modalBackground,
      justifyContent: 'center',
      alignItems: 'center',
      ...(theme.shadows.small && {
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3
      })
    },
    mapButtonPressed: {
      opacity: 0.7,
      transform: [{ scale: 0.95 }]
    },
    mapButtonIcon: {
      fontSize: 18,
      color: theme.colors.primary,
      fontWeight: theme.typography.fontWeight.bold
    },

    calloutContainer: {
      minWidth: 120,
      padding: theme.spacing.small
    },
    calloutText: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.text,
      fontWeight: theme.typography.fontWeight.medium,
      marginBottom: theme.spacing.tiny
    },
    calloutCoords: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.textSecondary,
      fontWeight: theme.typography.fontWeight.regular
    }
  });
