import { StyleSheet, Platform } from 'react-native';
import { Theme } from '@/presentation/contexts/theme.context';

export const createReviewStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },

    compactHeader: {
      paddingHorizontal: theme.spacing.small,
      paddingTop: theme.spacing.tiny,
      paddingBottom: theme.spacing.tiny
    },

    searchRow: {
      flexDirection: 'row',
      alignItems: 'center'
    },

    header: {
      backgroundColor: theme.colors.surface,
      paddingTop: theme.spacing.tiny,
      borderBottomWidth: 0
    },

    collapseHeaderButton: {
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      paddingVertical: theme.spacing.tiny,
      paddingHorizontal: theme.spacing.medium,
      borderRadius: theme.borderRadius.large,
      marginBottom: theme.spacing.small,
      gap: theme.spacing.tiny,
      borderWidth: 1,
      borderColor: theme.colors.border
    },

    collapseHeaderIcon: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontWeight: '700'
    },

    collapseHeaderText: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.textSecondary,
      fontWeight: '500'
    },

    floatingHeaderButton: {
      position: 'absolute',
      right: theme.spacing.medium,
      zIndex: 1
    },

    floatingHeaderButtonInner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.small,
      paddingHorizontal: theme.spacing.medium,
      borderRadius: theme.borderRadius.large,
      gap: theme.spacing.tiny,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4
        },
        android: {
          elevation: 2
        }
      })
    },

    floatingHeaderButtonIcon: {
      color: '#FFFFFF',
      fontSize: theme.typography.fontSize.small,
      fontWeight: '700'
    },

    floatingHeaderButtonText: {
      color: '#FFFFFF',
      fontSize: theme.typography.fontSize.small,
      fontWeight: '600'
    },

    searchContainer: {
      marginBottom: theme.spacing.medium
    },

    statsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.small,
      marginBottom: theme.spacing.medium
    },

    statCard: {
      flex: 1,
      backgroundColor: theme.colors.surfaceVariant,
      padding: theme.spacing.medium,
      borderRadius: theme.borderRadius.medium,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border
    },

    statNumber: {
      fontSize: theme.typography.fontSize.xlarge,
      fontWeight: '700',
      color: theme.colors.primary,
      marginBottom: theme.spacing.tiny
    },

    statLabel: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.textSecondary,
      fontWeight: '500'
    },

    contentContainer: {
      flex: 1
    },

    listContent: {
      flexGrow: 1,
      paddingVertical: theme.spacing.small,
      paddingHorizontal: theme.spacing.medium
    },

    listContentEmpty: {
      flexGrow: 1
    },

    emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xlarge,
      paddingVertical: theme.spacing.xlarge * 2
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
      marginBottom: theme.spacing.large
    },

    emptyStateIcon: {
      fontSize: 40
    },

    emptyStateTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.small
    },

    emptyStateDescription: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20
    },

    skeletonContainer: {
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small
    },

    skeletonItem: {
      marginBottom: theme.spacing.medium
    },

    listFooter: {
      paddingVertical: theme.spacing.large,
      paddingHorizontal: theme.spacing.medium
    },

    footerLoadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.medium,
      paddingVertical: theme.spacing.medium
    },

    footerLoadingText: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.textSecondary
    },

    footerErrorContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.medium,
      paddingHorizontal: theme.spacing.large,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.medium,
      borderWidth: 1,
      borderColor: theme.colors.error
    },

    errorIconContainer: {
      marginBottom: theme.spacing.small
    },

    errorIcon: {
      fontSize: 32
    },

    footerErrorText: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.error,
      textAlign: 'center',
      marginBottom: theme.spacing.medium,
      lineHeight: 20
    },

    retryButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.medium,
      paddingHorizontal: theme.spacing.xlarge,
      borderRadius: theme.borderRadius.medium,
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
      fontSize: theme.typography.fontSize.medium,
      fontWeight: '600',
      textAlign: 'center'
    },

    footerEndContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.medium,
      paddingVertical: theme.spacing.large
    },

    endDivider: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.divider
    },

    footerEndText: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.textSecondary,
      fontWeight: '500'
    },

    resultsContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.small,
      paddingHorizontal: theme.spacing.medium
    },

    resultsBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small,
      borderRadius: theme.borderRadius.large,
      gap: theme.spacing.tiny,
      borderWidth: 1,
      borderColor: theme.colors.border
    },

    resultsIcon: {
      fontSize: theme.typography.fontSize.medium
    },

    resultText: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.textSecondary,
      fontWeight: '600'
    },

    resultHighlight: {
      color: theme.colors.primary,
      fontWeight: '700'
    },

    connectionBanner: {
      backgroundColor: theme.colors.warning,
      paddingVertical: theme.spacing.small,
      paddingHorizontal: theme.spacing.medium,
      marginBottom: theme.spacing.small,
      borderRadius: theme.borderRadius.medium
    },

    connectionBannerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.small
    },

    connectionBannerText: {
      color: theme.colors.textOnPrimary,
      fontSize: theme.typography.fontSize.small,
      fontWeight: '500'
    },

    tabLoadingIndicator: {
      marginLeft: theme.spacing.tiny
    },

    errorStateContainer: {
      padding: theme.spacing.large,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.medium,
      borderWidth: 1,
      borderColor: theme.colors.error,
      margin: theme.spacing.medium
    },

    errorStateContent: {
      alignItems: 'center'
    },

    errorStateIcon: {
      fontSize: 48,
      marginBottom: theme.spacing.medium
    },

    errorStateTitle: {
      fontSize: theme.typography.fontSize.large,
      fontWeight: '600',
      color: theme.colors.error,
      marginBottom: theme.spacing.small,
      textAlign: 'center'
    },

    errorStateDescription: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.large,
      lineHeight: 20
    },

    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.large,
      paddingHorizontal: theme.spacing.medium,
      borderWidth: 1,
      borderColor: theme.colors.border
    },

    searchInputFocused: {
      borderColor: theme.colors.primary
    },

    searchIcon: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.textSecondary,
      marginRight: theme.spacing.small
    },

    searchInput: {
      flex: 1,
      paddingVertical: theme.spacing.medium,
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.text
    },

    clearButton: {
      padding: theme.spacing.tiny
    },

    clearIcon: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.textSecondary
    },

    searchResultsCount: {
      marginTop: theme.spacing.small,
      alignItems: 'center'
    },

    searchResultsText: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.textSecondary
    },

    searchResultsHighlight: {
      color: theme.colors.primary,
      fontWeight: '600'
    },

    clearSearchButton: {
      marginTop: theme.spacing.small,
      paddingVertical: theme.spacing.tiny,
      paddingHorizontal: theme.spacing.medium
    },

    clearSearchText: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.primary,
      fontWeight: '500'
    }
  });
