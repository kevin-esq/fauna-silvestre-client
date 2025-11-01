import { StyleSheet } from 'react-native';
import { Theme } from '../../contexts/theme.context';
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
      paddingHorizontal: spacing.medium,
      paddingTop: spacing.medium
    },

    headerTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: spacing.small,
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
      marginLeft: spacing.small
    },

    userCard: {
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
      minHeight: 90,
      borderLeftWidth: 4,
      borderLeftColor: colors.forest
    },

    userCardPressed: {
      transform: [{ scale: 0.98 }],
      backgroundColor: colors.surfaceVariant
    },

    userCardDeactivated: {
      borderLeftColor: colors.error,
      opacity: 0.7
    },

    userAvatarContainer: {
      position: 'relative',
      marginRight: spacing.medium
    },

    userAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.forest,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3
    },

    userAvatarDeactivated: {
      backgroundColor: colors.error
    },

    userRoleBadge: {
      position: 'absolute',
      bottom: -4,
      right: -4,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.background
    },

    userRoleBadgeDeactivated: {
      backgroundColor: colors.error + '20'
    },

    userInfo: {
      flex: 1
    },

    userName: {
      fontSize: typography.fontSize.large,
      fontWeight: typography.fontWeight.medium,
      color: colors.text,
      marginBottom: spacing.tiny,
      lineHeight: typography.lineHeight.large
    },

    userMetaContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.tiny
    },

    userMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.tiny,
      flex: 1
    },

    userMetaText: {
      fontSize: typography.fontSize.small,
      color: colors.textSecondary,
      flex: 1,
      lineHeight: typography.lineHeight.small
    },

    userLocationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.tiny
    },

    userLocationText: {
      fontSize: typography.fontSize.small,
      color: colors.earth,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.small
    },

    userActionContainer: {
      marginLeft: spacing.small,
      justifyContent: 'center',
      alignItems: 'center'
    },

    skeletonCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.medium,
      marginHorizontal: spacing.medium,
      marginBottom: spacing.small
    },

    skeletonInfo: {
      flex: 1,
      marginLeft: spacing.medium
    },

    skeletonContainer: {
      paddingTop: spacing.medium
    },

    loadingFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.large,
      gap: spacing.small
    },

    loadingText: {
      fontSize: typography.fontSize.medium,
      color: colors.textSecondary,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.medium
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

    filterContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: spacing.tiny,
      paddingHorizontal: spacing.medium
    },

    filterTab: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.small,
      paddingHorizontal: spacing.large,
      borderRadius: borderRadius.medium,
      backgroundColor: colors.surfaceVariant,
      gap: spacing.small,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: '60%'
    },

    filterTabActive: {
      backgroundColor: colors.forest,
      borderColor: colors.forest
    },

    filterTabActiveGreen: {
      backgroundColor: colors.forest,
      borderColor: colors.forest
    },

    filterTabActiveRed: {
      backgroundColor: colors.error,
      borderColor: colors.error
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

    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.small,
      marginTop: 0,
      marginBottom: -spacing.small
    },

    searchBarWrapper: {
      flex: 1,
      marginRight: -spacing.medium
    }
  });
};
