import { StyleSheet, Platform } from 'react-native';
import { Theme } from '../../contexts/theme.context';

const createShadow = (elevation: number) => {
  if (Platform.OS === 'ios') {
    return {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: elevation / 2
      },
      shadowOpacity: 0.1 + elevation * 0.02,
      shadowRadius: elevation
    };
  }
  return {
    elevation
  };
};

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    content: {
      flex: 1
    },
    listContainer: {
      paddingHorizontal: theme.spacing.large,
      paddingTop: theme.spacing.medium,
      paddingBottom: theme.spacing.xxlarge + 80
    },
    skeletonCard: {
      marginHorizontal: theme.spacing.large,
      marginVertical: theme.spacing.small,
      borderRadius: theme.borderRadius.large
    },

    cleanHeader: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingHorizontal: theme.spacing.large,
      paddingBottom: theme.spacing.medium,
      ...createShadow(2)
    },
    collapseHeaderButton: {
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      paddingVertical: theme.spacing.small,
      paddingHorizontal: theme.spacing.large,
      borderRadius: theme.borderRadius.xlarge,
      marginBottom: theme.spacing.medium,
      gap: theme.spacing.small,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...createShadow(2)
    },
    collapseHeaderIcon: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontWeight: theme.typography.fontWeight.bold
    },
    collapseHeaderText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: theme.typography.fontWeight.medium
    },
    headerBadge: {
      backgroundColor: theme.colors.error,
      borderRadius: 999,
      minWidth: 18,
      height: 18,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
      marginLeft: theme.spacing.small,
      ...createShadow(2)
    },
    headerBadgeText: {
      fontSize: 10,
      color: theme.colors.textOnPrimary,
      fontWeight: theme.typography.fontWeight.bold
    },
    cleanHeaderCenter: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.medium
    },
    cleanHeaderTitle: {
      fontSize: 24,
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: 30,
      color: theme.colors.primary,
      textAlign: 'center'
    },
    cleanHeaderSubtitle: {
      fontSize: 14,
      fontWeight: theme.typography.fontWeight.regular,
      lineHeight: 20,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.small,
      textAlign: 'center'
    },

    floatingFilterButton: {
      position: 'absolute',
      left: theme.spacing.large,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.medium,
      paddingHorizontal: theme.spacing.large,
      borderRadius: theme.borderRadius.xlarge,
      gap: theme.spacing.small,
      zIndex: 999,
      ...createShadow(12)
    },
    floatingButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: 14,
      fontWeight: theme.typography.fontWeight.bold
    },
    floatingButtonBadge: {
      backgroundColor: theme.colors.error,
      borderRadius: 999,
      minWidth: 18,
      height: 18,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
      marginLeft: theme.spacing.small,
      borderWidth: 2,
      borderColor: theme.colors.primary
    },
    floatingButtonBadgeText: {
      fontSize: 10,
      color: theme.colors.textOnPrimary,
      fontWeight: theme.typography.fontWeight.bold
    },
    floatingAddButton: {
      position: 'absolute',
      right: theme.spacing.large,
      width: 56,
      height: 56,
      borderRadius: theme.borderRadius.xlarge,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...createShadow(12)
    },

    quickFiltersBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.large,
      paddingVertical: theme.spacing.small,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border
    },
    quickFiltersScroll: {
      flex: 1
    },
    quickFiltersContent: {
      flexDirection: 'row',
      gap: theme.spacing.small,
      paddingRight: theme.spacing.medium
    },
    quickFilterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: theme.spacing.small,
      ...createShadow(2)
    },
    quickFilterChipText: {
      fontSize: 12,
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: 16,
      color: theme.colors.primary
    },
    clearAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small,
      borderRadius: 999,
      backgroundColor: theme.colors.surfaceVariant,
      gap: theme.spacing.small,
      ...createShadow(2)
    },

    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xlarge,
      paddingVertical: theme.spacing.xxlarge,
      minHeight: 400
    },
    emptyIcon: {
      width: 120,
      height: 120,
      borderRadius: 999,
      backgroundColor: theme.colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.xlarge,
      ...createShadow(4)
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: 30,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.medium
    },
    emptySubtitle: {
      fontSize: 16,
      fontWeight: theme.typography.fontWeight.regular,
      lineHeight: 24,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xlarge
    },

    footerError: {
      alignItems: 'center',
      paddingVertical: theme.spacing.large,
      paddingHorizontal: theme.spacing.xlarge,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.large,
      marginHorizontal: theme.spacing.large,
      borderWidth: 1,
      borderColor: theme.colors.error,
      ...createShadow(2)
    },
    errorIconContainer: {
      marginBottom: theme.spacing.medium
    },
    footerErrorText: {
      fontSize: 16,
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: 24,
      color: theme.colors.error,
      textAlign: 'center',
      marginBottom: theme.spacing.medium
    },
    footerRetryButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.xlarge,
      paddingVertical: theme.spacing.medium,
      borderRadius: theme.borderRadius.large,
      minWidth: 120,
      ...createShadow(4)
    },
    footerRetryText: {
      fontSize: 16,
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: 20,
      color: theme.colors.textOnPrimary,
      textAlign: 'center'
    },
    footerLoading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.medium,
      paddingVertical: theme.spacing.large
    },
    footerLoadingText: {
      fontSize: 14,
      fontWeight: theme.typography.fontWeight.regular,
      lineHeight: 20,
      color: theme.colors.textSecondary
    },
    footerEnd: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.medium,
      paddingVertical: theme.spacing.xlarge
    },
    footerEndDivider: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border
    },
    footerEndText: {
      fontSize: 14,
      fontWeight: theme.typography.fontWeight.medium,
      lineHeight: 20,
      color: theme.colors.textSecondary
    }
  });
