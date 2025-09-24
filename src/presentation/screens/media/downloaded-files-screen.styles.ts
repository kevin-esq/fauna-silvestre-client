import { StyleSheet } from 'react-native';
import { Theme } from '../../contexts/theme.context';
import { EdgeInsets } from 'react-native-safe-area-context';

export const createStyles = (theme: Theme, insets?: EdgeInsets) => {
  const { colors, spacing, borderRadius, typography } = theme;

  return StyleSheet.create({
    // Main container
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: insets?.top || spacing.medium
    },

    // List container
    listContainer: {
      padding: spacing.medium,
      paddingBottom: insets?.bottom || spacing.xxlarge + spacing.medium
    },

    // Header
    header: {
      marginBottom: spacing.large
    },

    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.small,
      justifyContent: 'space-between'
    },

    backButton: {
      padding: spacing.small,
      borderRadius: borderRadius.medium,
      backgroundColor: 'transparent',
      marginRight: spacing.medium
    },

    headerCenter: {
      flex: 1,
      alignItems: 'center'
    },

    headerPlaceholder: {
      width: 100,
      height: 24
    },

    headerTitle: {
      fontSize: typography.fontSize.xxlarge,
      color: colors.forest
    },

    // Storage info
    storageInfo: {
      backgroundColor: colors.surface,
      padding: spacing.small,
      borderRadius: borderRadius.medium,
      marginBottom: spacing.small,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2
    },

    storageText: {
      fontSize: typography.fontSize.medium,
      color: colors.textSecondary,
      textAlign: 'center'
    },

    // Error container
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.error + '10',
      padding: spacing.small,
      borderRadius: borderRadius.medium,
      borderWidth: 1,
      borderColor: colors.error + '30'
    },

    errorText: {
      flex: 1,
      fontSize: typography.fontSize.medium,
      color: colors.error,
      marginLeft: spacing.small
    },

    clearErrorButton: {
      padding: spacing.tiny,
      marginLeft: spacing.tiny
    },

    // Delete all button
    deleteAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.error + '10',
      paddingHorizontal: spacing.small,
      paddingVertical: spacing.tiny,
      borderRadius: borderRadius.small,
      borderWidth: 1,
      borderColor: colors.error + '30'
    },

    deleteAllText: {
      fontSize: typography.fontSize.small,
      color: colors.error,
      marginLeft: spacing.tiny
    },

    // File card
    fileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: spacing.medium,
      marginBottom: spacing.small,
      borderRadius: borderRadius.medium,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border
    },

    fileIconContainer: {
      width: 60,
      height: 60,
      borderRadius: borderRadius.medium,
      backgroundColor: colors.forest + '10',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.medium
    },

    fileInfo: {
      flex: 1
    },

    fileName: {
      fontSize: typography.fontSize.large,
      color: colors.text,
      marginBottom: spacing.tiny
    },

    fileDetails: {
      fontSize: typography.fontSize.medium,
      color: colors.textSecondary,
      marginBottom: spacing.tiny
    },

    fileDate: {
      fontSize: typography.fontSize.small,
      color: colors.textSecondary
    },

    deleteButton: {
      padding: spacing.small,
      borderRadius: borderRadius.medium,
      backgroundColor: 'transparent'
    },

    shareButton: {
      padding: spacing.small,
      borderRadius: borderRadius.medium,
      backgroundColor: 'transparent',
      marginLeft: spacing.small
    },

    // Loading states
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing.xxlarge
    },

    loadingText: {
      marginTop: spacing.medium,
      fontSize: typography.fontSize.large,
      color: colors.textSecondary
    },

    // Footer
    footer: {
      alignItems: 'center',
      paddingVertical: spacing.large,
      paddingBottom: insets?.bottom || spacing.large
    },

    footerText: {
      fontSize: typography.fontSize.medium,
      color: colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic'
    },

    // Empty state
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing.xxlarge,
      paddingHorizontal: spacing.xlarge
    },

    emptyIcon: {
      marginBottom: spacing.large
    },

    emptyTitle: {
      fontSize: typography.fontSize.xlarge,
      color: colors.text,
      marginBottom: spacing.small,
      textAlign: 'center'
    },

    emptySubtitle: {
      fontSize: typography.fontSize.large,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xlarge,
      lineHeight: typography.lineHeight.large * 1.2
    },

    emptyButton: {
      backgroundColor: colors.forest,
      paddingHorizontal: spacing.xlarge,
      paddingVertical: spacing.medium,
      borderRadius: borderRadius.medium,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    },

    emptyButtonText: {
      color: colors.textOnPrimary,
      fontSize: typography.fontSize.medium
    }
  });
};
