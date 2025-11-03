import { StyleSheet } from 'react-native';
import { Theme } from '@/presentation/contexts/theme.context';
import { EdgeInsets } from 'react-native-safe-area-context';

export const createStyles = (theme: Theme, insets?: EdgeInsets) => {
  const { colors, spacing, borderRadius, typography } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: insets?.top || 0
    },

    listContainer: {
      flexGrow: 1,
      paddingBottom: (insets?.bottom || 0) + spacing.medium
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

    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.small,
      marginBottom: spacing.tiny
    },
    headerTitle: {
      fontSize: typography.fontSize.xxlarge,
      fontWeight: typography.fontWeight.bold,
      color: colors.forest,
      textAlign: 'center',
      lineHeight: typography.lineHeight.xxlarge
    },

    headerSubtitle: {
      fontSize: typography.fontSize.small,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: typography.lineHeight.small
    },

    headerPlaceholder: {
      width: 48
    },
    statsContainer: {
      flexDirection: 'row',
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
      borderColor: colors.border,
      justifyContent: 'space-around'
    },

    statItem: {
      alignItems: 'center',
      flex: 1
    },

    statValue: {
      fontSize: typography.fontSize.xlarge,
      fontWeight: typography.fontWeight.bold,
      color: colors.forest,
      lineHeight: typography.lineHeight.xlarge
    },

    statLabel: {
      fontSize: typography.fontSize.small,
      color: colors.textSecondary,
      marginTop: spacing.tiny,
      lineHeight: typography.lineHeight.small
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: spacing.small,
      marginBottom: spacing.medium
    },

    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.tiny,
      paddingHorizontal: spacing.medium,
      paddingVertical: spacing.small,
      backgroundColor: colors.forest + '10',
      borderRadius: borderRadius.medium,
      borderWidth: 1,
      borderColor: colors.forest + '30'
    },

    actionButtonText: {
      fontSize: typography.fontSize.small,
      fontWeight: typography.fontWeight.medium,
      color: colors.forest,
      lineHeight: typography.lineHeight.small
    },

    dangerButton: {
      backgroundColor: colors.error + '10',
      borderColor: colors.error + '30'
    },

    dangerButtonText: {
      color: colors.error
    },
    filterContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.small,
      marginTop: spacing.medium,
      paddingHorizontal: spacing.small
    },

    filterTab: {
      flex: 1,
      minWidth: '45%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.small,
      paddingHorizontal: spacing.medium,
      borderRadius: borderRadius.medium,
      backgroundColor: colors.surfaceVariant,
      gap: spacing.tiny,
      borderWidth: 1,
      borderColor: colors.border
    },

    filterTabActive: {
      backgroundColor: colors.forest,
      borderColor: colors.forest
    },

    filterTabText: {
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.medium,
      color: colors.textSecondary,
      lineHeight: typography.lineHeight.medium
    },

    filterTabTextActive: {
      color: colors.textOnPrimary
    },

    filterBadge: {
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.forest + '20',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.tiny
    },

    filterBadgeActive: {
      backgroundColor: colors.textOnPrimary + '30'
    },

    filterBadgeText: {
      fontSize: 11,
      fontWeight: typography.fontWeight.bold,
      color: colors.forest
    },

    filterBadgeTextActive: {
      color: colors.textOnPrimary
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
      marginBottom: spacing.large,
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.forest + '10',
      justifyContent: 'center',
      alignItems: 'center'
    },

    emptyTitle: {
      fontSize: typography.fontSize.xlarge,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
      marginBottom: spacing.small,
      textAlign: 'center',
      lineHeight: typography.lineHeight.xlarge
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
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.medium
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.error + '10',
      padding: spacing.medium,
      borderRadius: borderRadius.medium,
      borderWidth: 1,
      borderColor: colors.error + '30',
      marginTop: spacing.small
    },

    errorText: {
      flex: 1,
      fontSize: typography.fontSize.medium,
      color: colors.error,
      marginLeft: spacing.small,
      lineHeight: typography.lineHeight.medium
    }
  });
};
