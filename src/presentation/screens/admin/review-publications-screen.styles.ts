import { StyleSheet, Platform } from 'react-native';
import { Theme } from '@/presentation/contexts/theme.context';

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24
};

const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16
};

const FONT_SIZE = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20
};

export const createReviewStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },

    header: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: SPACING.md,
      paddingBottom: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3
        },
        android: {
          elevation: 4
        }
      })
    },

    collapseHeaderButton: {
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.md,
      borderRadius: BORDER_RADIUS.lg,
      marginBottom: SPACING.sm,
      gap: SPACING.xs,
      borderWidth: 1,
      borderColor: theme.colors.border
    },

    collapseHeaderIcon: {
      fontSize: FONT_SIZE.xs,
      color: theme.colors.textSecondary,
      fontWeight: '700'
    },

    collapseHeaderText: {
      fontSize: FONT_SIZE.sm,
      color: theme.colors.textSecondary,
      fontWeight: '500'
    },

    floatingHeaderButton: {
      position: 'absolute',
      right: SPACING.md,
      zIndex: 999
    },

    floatingHeaderButtonInner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: BORDER_RADIUS.lg,
      gap: SPACING.xs,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6
        },
        android: {
          elevation: 8
        }
      })
    },

    floatingHeaderButtonIcon: {
      color: '#FFFFFF',
      fontSize: FONT_SIZE.sm,
      fontWeight: '700'
    },

    floatingHeaderButtonText: {
      color: '#FFFFFF',
      fontSize: FONT_SIZE.sm,
      fontWeight: '600'
    },

    searchContainer: {
      marginBottom: SPACING.md
    },

    statsContainer: {
      flexDirection: 'row',
      gap: SPACING.sm,
      marginBottom: SPACING.md
    },

    statCard: {
      flex: 1,
      backgroundColor: theme.colors.surfaceVariant,
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border
    },

    statNumber: {
      fontSize: FONT_SIZE.xxl,
      fontWeight: '700',
      color: theme.colors.primary,
      marginBottom: SPACING.xs
    },

    statLabel: {
      fontSize: FONT_SIZE.sm,
      color: theme.colors.textSecondary,
      fontWeight: '500'
    },

    contentContainer: {
      flex: 1
    },

    listContent: {
      flexGrow: 1,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md
    },

    listContentEmpty: {
      flexGrow: 1
    },

    emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.xl * 2
    },

    emptyStateContent: {
      alignItems: 'center',
      maxWidth: 320
    },

    emptyStateIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.lg
    },

    emptyStateIcon: {
      fontSize: 40
    },

    emptyStateTitle: {
      fontSize: FONT_SIZE.xl,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: SPACING.sm
    },

    emptyStateDescription: {
      fontSize: FONT_SIZE.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20
    },

    skeletonContainer: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm
    },

    skeletonItem: {
      marginBottom: SPACING.md
    },

    listFooter: {
      paddingVertical: SPACING.lg,
      paddingHorizontal: SPACING.md
    },

    footerLoadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.md,
      paddingVertical: SPACING.md
    },

    footerLoadingText: {
      fontSize: FONT_SIZE.md,
      color: theme.colors.textSecondary
    },

    footerErrorContainer: {
      alignItems: 'center',
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: BORDER_RADIUS.md,
      borderWidth: 1,
      borderColor: theme.colors.error
    },

    errorIconContainer: {
      marginBottom: SPACING.sm
    },

    errorIcon: {
      fontSize: 32
    },

    footerErrorText: {
      fontSize: FONT_SIZE.md,
      color: theme.colors.error,
      textAlign: 'center',
      marginBottom: SPACING.md,
      lineHeight: 20
    },

    retryButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xl,
      borderRadius: BORDER_RADIUS.md,
      minWidth: 120,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 3
        },
        android: {
          elevation: 2
        }
      })
    },

    retryButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: FONT_SIZE.md,
      fontWeight: '600',
      textAlign: 'center'
    },

    footerEndContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.md,
      paddingVertical: SPACING.lg
    },

    endDivider: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.divider
    },

    footerEndText: {
      fontSize: FONT_SIZE.sm,
      color: theme.colors.textSecondary,
      fontWeight: '500'
    },

    resultsContainer: {
      alignItems: 'center',
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md
    },

    resultsBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: BORDER_RADIUS.lg,
      gap: SPACING.xs,
      borderWidth: 1,
      borderColor: theme.colors.border
    },

    resultsIcon: {
      fontSize: FONT_SIZE.md
    },

    resultText: {
      fontSize: FONT_SIZE.sm,
      color: theme.colors.textSecondary,
      fontWeight: '600'
    },

    resultHighlight: {
      color: theme.colors.primary,
      fontWeight: '700'
    },

    connectionBanner: {
      backgroundColor: theme.colors.warning,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      marginBottom: SPACING.sm,
      borderRadius: BORDER_RADIUS.md
    },

    connectionBannerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.sm
    },

    connectionBannerText: {
      color: theme.colors.textOnPrimary,
      fontSize: FONT_SIZE.sm,
      fontWeight: '500'
    },

    tabLoadingIndicator: {
      marginLeft: SPACING.xs
    },

    errorStateContainer: {
      padding: SPACING.lg,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: BORDER_RADIUS.md,
      borderWidth: 1,
      borderColor: theme.colors.error,
      margin: SPACING.md
    },

    errorStateContent: {
      alignItems: 'center'
    },

    errorStateIcon: {
      fontSize: 48,
      marginBottom: SPACING.md
    },

    errorStateTitle: {
      fontSize: FONT_SIZE.lg,
      fontWeight: '600',
      color: theme.colors.error,
      marginBottom: SPACING.sm,
      textAlign: 'center'
    },

    errorStateDescription: {
      fontSize: FONT_SIZE.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: SPACING.lg,
      lineHeight: 20
    },

    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: BORDER_RADIUS.lg,
      paddingHorizontal: SPACING.md,
      borderWidth: 1,
      borderColor: theme.colors.border
    },

    searchInputFocused: {
      borderColor: theme.colors.primary
    },

    searchIcon: {
      fontSize: FONT_SIZE.md,
      color: theme.colors.textSecondary,
      marginRight: SPACING.sm
    },

    searchInput: {
      flex: 1,
      paddingVertical: SPACING.md,
      fontSize: FONT_SIZE.md,
      color: theme.colors.text
    },

    clearButton: {
      padding: SPACING.xs
    },

    clearIcon: {
      fontSize: FONT_SIZE.md,
      color: theme.colors.textSecondary
    },

    searchResultsCount: {
      marginTop: SPACING.sm,
      alignItems: 'center'
    },

    searchResultsText: {
      fontSize: FONT_SIZE.sm,
      color: theme.colors.textSecondary
    },

    searchResultsHighlight: {
      color: theme.colors.primary,
      fontWeight: '600'
    },

    clearSearchButton: {
      marginTop: SPACING.sm,
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.md
    },

    clearSearchText: {
      fontSize: FONT_SIZE.sm,
      color: theme.colors.primary,
      fontWeight: '500'
    }
  });
