import { StyleSheet } from 'react-native';
import { Theme } from '../../contexts/theme.context';
import { EdgeInsets } from 'react-native-safe-area-context';

export const createStyles = (theme: Theme, insets?: EdgeInsets) => {
  const { colors, spacing, borderRadius, typography } = theme;

  return StyleSheet.create({
    container: {
      top: insets?.top || 0,
      flex: 1,
      backgroundColor: colors.background
    },

    listContainer: {
      flexGrow: 1,
      paddingBottom: insets?.bottom || spacing.xxlarge
    },

    header: {
      marginBottom: spacing.large,
      paddingHorizontal: spacing.medium,
      paddingTop: spacing.medium
    },

    headerTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: spacing.medium,
      justifyContent: 'space-between'
    },

    backButton: {
      padding: spacing.small,
      borderRadius: borderRadius.medium,
      backgroundColor: colors.surfaceVariant,
      marginRight: spacing.small
    },

    headerCenter: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: spacing.small
    },

    headerTitle: {
      fontSize: typography.fontSize.xxlarge,
      fontWeight: typography.fontWeight.bold,
      color: colors.forest,
      textAlign: 'center',
      marginBottom: spacing.tiny
    },

    headerSubtitle: {
      fontSize: typography.fontSize.small,
      color: colors.textSecondary,
      textAlign: 'center'
    },

    headerPlaceholder: {
      width: 100
    },

    storageProgressContainer: {
      backgroundColor: colors.surface,
      padding: spacing.medium,
      borderRadius: borderRadius.large,
      marginBottom: spacing.medium,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border
    },

    storageProgressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.small
    },

    storageProgressTitle: {
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.medium,
      color: colors.text
    },

    storageProgressPercentage: {
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.bold,
      color: colors.forest
    },

    storageProgressBarContainer: {
      height: 8,
      backgroundColor: colors.surfaceVariant,
      borderRadius: borderRadius.small,
      overflow: 'hidden',
      marginBottom: spacing.small
    },

    storageProgressBar: {
      height: '100%',
      borderRadius: borderRadius.small,
      backgroundColor: colors.forest
    },

    storageProgressFooter: {
      alignItems: 'center'
    },

    storageProgressText: {
      fontSize: typography.fontSize.small,
      color: colors.textSecondary
    },

    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.error + '10',
      padding: spacing.medium,
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

    deleteAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.error + '10',
      paddingHorizontal: spacing.medium,
      paddingVertical: spacing.small,
      borderRadius: borderRadius.medium,
      borderWidth: 1,
      borderColor: colors.error + '30'
    },

    deleteAllText: {
      fontSize: typography.fontSize.small,
      fontWeight: typography.fontWeight.medium,
      color: colors.error,
      marginLeft: spacing.tiny
    },

    fileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: spacing.medium,
      marginHorizontal: spacing.medium,
      marginBottom: spacing.small,
      borderRadius: borderRadius.large,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 100
    },

    fileCardPressed: {
      transform: [{ scale: 0.98 }],
      backgroundColor: colors.surfaceVariant
    },

    cardProgressContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      borderTopLeftRadius: borderRadius.large,
      borderTopRightRadius: borderRadius.large,
      overflow: 'hidden'
    },

    cardProgressBackground: {
      flex: 1,
      backgroundColor: colors.forest + '20'
    },

    fileIconContainer: {
      width: 70,
      height: 70,
      borderRadius: borderRadius.medium,
      backgroundColor: colors.forest + '08',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.medium,
      borderWidth: 2,
      borderColor: colors.forest + '15'
    },

    fileTypeBadge: {
      position: 'absolute',
      bottom: -6,
      backgroundColor: colors.forest,
      paddingHorizontal: spacing.small,
      paddingVertical: 2,
      borderRadius: borderRadius.small
    },

    fileTypeText: {
      fontSize: typography.fontSize.small - 2,
      fontWeight: typography.fontWeight.bold,
      color: colors.textOnPrimary
    },

    fileInfo: {
      flex: 1
    },

    fileName: {
      fontSize: typography.fontSize.large,
      fontWeight: typography.fontWeight.medium,
      color: colors.text,
      marginBottom: spacing.small,
      lineHeight: typography.lineHeight.large
    },

    fileMetaContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.tiny,
      gap: spacing.medium
    },

    fileMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.tiny
    },

    fileMetaText: {
      fontSize: typography.fontSize.small,
      color: colors.textSecondary
    },

    fileDateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.tiny
    },

    fileDate: {
      fontSize: typography.fontSize.small,
      color: colors.textSecondary,
      fontStyle: 'italic'
    },

    actionButtons: {
      flexDirection: 'row',
      gap: spacing.tiny,
      marginLeft: spacing.small
    },

    actionButton: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.medium,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surfaceVariant
    },

    shareButton: {
      backgroundColor: colors.forest + '10'
    },

    deleteButton: {
      backgroundColor: colors.error + '10'
    },

    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing.xxlarge
    },

    loadingText: {
      marginTop: spacing.medium,
      fontSize: typography.fontSize.large,
      color: colors.textSecondary
    },

    footer: {
      alignItems: 'center',
      paddingVertical: spacing.xlarge,
      paddingHorizontal: spacing.medium,
      gap: spacing.small
    },

    footerText: {
      fontSize: typography.fontSize.medium,
      color: colors.textSecondary,
      textAlign: 'center'
    },

    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing.xxlarge,
      paddingHorizontal: spacing.xlarge,
      minHeight: 400
    },

    emptyIconContainer: {
      position: 'relative',
      marginBottom: spacing.large
    },

    emptyIconOverlay: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -20 }, { translateY: -20 }],
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.forest + '20',
      justifyContent: 'center',
      alignItems: 'center'
    },

    emptyTitle: {
      fontSize: typography.fontSize.xlarge,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
      marginBottom: spacing.small,
      textAlign: 'center'
    },

    emptySubtitle: {
      fontSize: typography.fontSize.medium,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xlarge,
      lineHeight: typography.lineHeight.large,
      paddingHorizontal: spacing.medium
    },

    emptyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.forest,
      paddingHorizontal: spacing.xlarge,
      paddingVertical: spacing.medium,
      borderRadius: borderRadius.medium,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
      gap: spacing.small
    },

    emptyButtonText: {
      color: colors.textOnPrimary,
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.medium
    }
  });
};
