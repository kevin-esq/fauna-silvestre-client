import { StyleSheet, Platform } from 'react-native';
import { Theme } from '../../contexts/theme.context';

const createShadow = (elevation: number, color: string = '#000') => {
  if (Platform.OS === 'ios') {
    return {
      shadowColor: color,
      shadowOffset: {
        width: 0,
        height: elevation / 2
      },
      shadowOpacity: 0.15 + elevation * 0.015,
      shadowRadius: elevation * 0.8
    };
  }
  return {
    elevation
  };
};

const createNatureShadow = (elevation: number, theme: Theme) => {
  return createShadow(elevation, theme.colors.forest);
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
      borderBottomWidth: theme.borderWidths.hairline,
      borderBottomColor: theme.colors.divider,
      paddingHorizontal: theme.spacing.medium,
      paddingBottom: theme.spacing.small,
      ...createShadow(3)
    },
    collapseHeaderButton: {
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.small + 2,
      paddingHorizontal: theme.spacing.large,
      borderRadius: theme.borderRadius.xlarge,
      gap: theme.spacing.small,
      borderWidth: 0,
      ...createNatureShadow(4, theme)
    },
    collapseHeaderIcon: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.textOnPrimary,
      fontWeight: theme.typography.fontWeight.bold
    },
    collapseHeaderText: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.textOnPrimary,
      fontWeight: theme.typography.fontWeight.bold,
      letterSpacing: 0.3
    },
    headerBadge: {
      backgroundColor: theme.colors.error,
      borderRadius: 999,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.tiny,
      marginLeft: theme.spacing.small,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      ...createShadow(2)
    },
    headerBadgeText: {
      fontSize: theme.typography.fontSize.small - 1,
      color: theme.colors.textOnPrimary,
      fontWeight: theme.typography.fontWeight.black
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
      left: theme.spacing.medium,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.forest,
      paddingVertical: theme.spacing.medium,
      paddingHorizontal: theme.spacing.large,
      borderRadius: theme.borderRadius.xlarge,
      gap: theme.spacing.small,
      zIndex: 999,
      ...createNatureShadow(8, theme)
    },
    floatingButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.bold,
      letterSpacing: 0.5
    },
    floatingButtonBadge: {
      backgroundColor: theme.colors.error,
      borderRadius: 999,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.tiny,
      marginLeft: theme.spacing.tiny,
      borderWidth: 2,
      borderColor: theme.colors.forest
    },
    floatingButtonBadgeText: {
      fontSize: theme.typography.fontSize.small - 1,
      color: theme.colors.textOnPrimary,
      fontWeight: theme.typography.fontWeight.black
    },
    floatingAddButton: {
      position: 'absolute',
      right: theme.spacing.medium,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.leaf,
      justifyContent: 'center',
      alignItems: 'center',
      ...createNatureShadow(10, theme)
    },

    quickFiltersBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small + 2,
      backgroundColor: theme.colors.surfaceVariant,
      borderBottomWidth: theme.borderWidths.hairline,
      borderBottomColor: theme.colors.divider
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
      backgroundColor: theme.colors.chipBackground,
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small + 2,
      borderRadius: theme.borderRadius.xlarge,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.forest,
      gap: theme.spacing.tiny,
      ...createShadow(2)
    },
    quickFilterChipText: {
      fontSize: theme.typography.fontSize.small,
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: theme.typography.lineHeight.small,
      color: theme.colors.forest,
      letterSpacing: 0.3
    },
    clearAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small + 2,
      borderRadius: theme.borderRadius.xlarge,
      backgroundColor: theme.colors.secondary,
      gap: theme.spacing.tiny,
      ...createShadow(3)
    },
    clearAllButtonText: {
      fontSize: theme.typography.fontSize.small,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.textOnPrimary,
      letterSpacing: 0.3
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
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.chipBackground,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.large,
      borderWidth: 3,
      borderColor: theme.colors.forest,
      ...createNatureShadow(4, theme)
    },
    emptyTitle: {
      fontSize: theme.typography.fontSize.xxlarge,
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: theme.typography.lineHeight.xxlarge,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.small,
      letterSpacing: 0.5
    },
    emptySubtitle: {
      fontSize: theme.typography.fontSize.large,
      fontWeight: theme.typography.fontWeight.regular,
      lineHeight: theme.typography.lineHeight.large,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xlarge,
      maxWidth: 300
    },

    footerError: {
      alignItems: 'center',
      paddingVertical: theme.spacing.large,
      paddingHorizontal: theme.spacing.xlarge,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.large,
      marginHorizontal: theme.spacing.medium,
      marginVertical: theme.spacing.medium,
      borderWidth: 2,
      borderColor: theme.colors.error,
      ...createShadow(3)
    },
    errorIconContainer: {
      marginBottom: theme.spacing.small
    },
    footerErrorText: {
      fontSize: theme.typography.fontSize.large,
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: theme.typography.lineHeight.large,
      color: theme.colors.error,
      textAlign: 'center',
      marginBottom: theme.spacing.medium
    },
    footerRetryButton: {
      backgroundColor: theme.colors.forest,
      paddingHorizontal: theme.spacing.xlarge,
      paddingVertical: theme.spacing.medium,
      borderRadius: theme.borderRadius.large,
      minWidth: 140,
      ...createNatureShadow(4, theme)
    },
    footerRetryText: {
      fontSize: theme.typography.fontSize.large,
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: theme.typography.lineHeight.large,
      color: theme.colors.textOnPrimary,
      textAlign: 'center',
      letterSpacing: 0.5
    },
    footerLoading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.medium,
      paddingVertical: theme.spacing.large
    },
    footerLoadingText: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.medium,
      lineHeight: theme.typography.lineHeight.medium,
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
      height: theme.borderWidths.hairline,
      backgroundColor: theme.colors.divider
    },
    footerEndText: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.medium,
      lineHeight: theme.typography.lineHeight.medium,
      color: theme.colors.textSecondary,
      letterSpacing: 0.3
    }
  });
