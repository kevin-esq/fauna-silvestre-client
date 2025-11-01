import { StyleSheet, Platform } from 'react-native';
import { Theme } from '../../contexts/theme.context';

export const createPublicationScreenStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },

    header: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.medium,
      paddingBottom: theme.spacing.medium,
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

    compactHeader: {
      paddingHorizontal: theme.spacing.small,
      paddingTop: theme.spacing.tiny,
      paddingBottom: theme.spacing.tiny
    },

    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.tiny
    },

    statusPills: {
      flexDirection: 'row',
      gap: theme.spacing.tiny,
      paddingTop: theme.spacing.tiny
    },

    pill: {
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.tiny + 2,
      borderRadius: theme.borderRadius.large,
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1,
      borderColor: 'transparent',
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.tiny
    },

    pillActive: {
      backgroundColor: theme.colors.primary + '15',
      borderColor: theme.colors.primary
    },

    pillText: {
      fontSize: theme.typography.fontSize.small,
      fontWeight: '500',
      color: theme.colors.textSecondary
    },

    pillTextActive: {
      color: theme.colors.primary,
      fontWeight: '600'
    },

    pillBadge: {
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      paddingHorizontal: theme.spacing.tiny,
      paddingVertical: 2,
      minWidth: 20,
      alignItems: 'center',
      justifyContent: 'center'
    },

    pillBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#FFFFFF'
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
      color: '#FFFFFF',
      fontSize: theme.typography.fontSize.small,
      fontWeight: '600'
    },

    searchContainer: {
      marginBottom: theme.spacing.medium
    },

    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.medium,
      paddingHorizontal: theme.spacing.medium,
      borderWidth: 1,
      borderColor: theme.colors.border
    },

    searchInputFocused: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4
        },
        android: {
          elevation: 3
        }
      })
    },

    searchIcon: {
      marginRight: theme.spacing.small,
      color: theme.colors.textSecondary
    },

    searchInput: {
      flex: 1,
      paddingVertical: theme.spacing.medium,
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.text
    },

    clearButton: {
      padding: theme.spacing.tiny,
      marginLeft: theme.spacing.tiny
    },

    clearIcon: {
      color: theme.colors.textSecondary
    },

    searchResultsCount: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.small,
      paddingHorizontal: theme.spacing.tiny
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
      paddingVertical: theme.spacing.tiny,
      paddingHorizontal: theme.spacing.medium,
      borderRadius: theme.borderRadius.small,
      backgroundColor: theme.colors.surfaceVariant
    },

    clearSearchText: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.primary,
      fontWeight: '500'
    },

    filterContainer: {
      marginBottom: theme.spacing.medium,
      overflow: 'hidden'
    },

    filterHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.small,
      paddingHorizontal: theme.spacing.tiny
    },

    filterHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.small
    },

    filterToggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.tiny,
      paddingVertical: theme.spacing.tiny,
      paddingHorizontal: theme.spacing.small,
      borderRadius: theme.borderRadius.small,
      backgroundColor: theme.colors.surfaceVariant
    },

    filterToggleText: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.text,
      fontWeight: '500'
    },

    filterIcon: {
      fontSize: theme.typography.fontSize.medium
    },

    activeFiltersCount: {
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      paddingHorizontal: theme.spacing.tiny,
      paddingVertical: 2,
      minWidth: 20,
      alignItems: 'center',
      justifyContent: 'center'
    },

    activeFiltersCountText: {
      fontSize: 11,
      color: '#FFFFFF',
      fontWeight: '700'
    },

    clearFiltersButton: {
      paddingVertical: theme.spacing.tiny,
      paddingHorizontal: theme.spacing.small,
      borderRadius: theme.borderRadius.small
    },

    clearFiltersText: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.error,
      fontWeight: '500'
    },

    filterContent: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.medium,
      padding: theme.spacing.medium,
      marginTop: theme.spacing.small
    },

    filterSection: {
      marginBottom: theme.spacing.medium
    },

    filterSectionLast: {
      marginBottom: 0
    },

    filterSectionTitle: {
      fontSize: theme.typography.fontSize.small,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.small,
      textTransform: 'uppercase',
      letterSpacing: 0.5
    },

    filterOptions: {
      gap: theme.spacing.small
    },

    filterOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.small,
      paddingHorizontal: theme.spacing.medium,
      borderRadius: theme.borderRadius.medium,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border
    },

    filterOptionSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3
        },
        android: {
          elevation: 2
        }
      })
    },

    filterOptionText: {
      flex: 1,
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.text,
      fontWeight: '500'
    },

    filterOptionTextSelected: {
      color: '#FFFFFF',
      fontWeight: '600'
    },

    filterOptionIcon: {
      fontSize: theme.typography.fontSize.large,
      marginRight: theme.spacing.small
    },

    filterCheckbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.small
    },

    filterCheckboxSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary
    },

    filterCheckmark: {
      color: '#FFFFFF',
      fontSize: theme.typography.fontSize.small,
      fontWeight: '700'
    },

    sortOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.small
    },

    sortOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.small,
      paddingHorizontal: theme.spacing.medium,
      borderRadius: theme.borderRadius.large,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border
    },

    sortOptionSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary
    },

    sortOptionText: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.text,
      fontWeight: '500'
    },

    sortOptionTextSelected: {
      color: '#FFFFFF',
      fontWeight: '600'
    },

    floatingHeaderButton: {
      position: 'absolute',
      right: theme.spacing.medium,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.small,
      paddingHorizontal: theme.spacing.medium,
      borderRadius: theme.borderRadius.large,
      gap: theme.spacing.tiny,
      zIndex: 999,
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
      fontSize: theme.typography.fontSize.small,
      fontWeight: '700'
    },

    floatingHeaderButtonText: {
      color: '#FFFFFF',
      fontSize: theme.typography.fontSize.small,
      fontWeight: '600'
    },

    tabsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.small
    },

    tabWrapper: {
      flex: 1
    },

    tab: {
      paddingVertical: theme.spacing.medium,
      paddingHorizontal: theme.spacing.small,
      borderRadius: theme.borderRadius.medium,
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 56
    },

    tabActive: {
      borderColor: 'transparent',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 3
        },
        android: {
          elevation: 3
        }
      })
    },

    tabError: {
      borderColor: theme.colors.error,
      borderWidth: 2
    },

    tabContent: {
      alignItems: 'center',
      gap: theme.spacing.tiny
    },

    tabLabel: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      textAlign: 'center'
    },

    tabLabelActive: {
      color: '#FFFFFF',
      fontWeight: '700'
    },

    tabBadge: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.small,
      paddingVertical: theme.spacing.tiny,
      borderRadius: theme.borderRadius.large,
      minWidth: 40
    },

    tabBadgeActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)'
    },

    tabBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center'
    },

    tabBadgeTextActive: {
      color: '#FFFFFF'
    },

    tabLoadingIndicator: {
      position: 'absolute',
      top: theme.spacing.tiny,
      right: theme.spacing.tiny
    },

    contentContainer: {
      flex: 1
    },

    listContent: {
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
      paddingVertical: theme.spacing.xxlarge
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
    titleContainer: {
      marginBottom: theme.spacing.medium,
      marginStart: theme.spacing.xxlarge,
      paddingEnd: theme.spacing.large
    },

    title: {
      fontSize: theme.typography.fontSize.xlarge,
      fontWeight: '700',
      color: theme.colors.primary,
      lineHeight: theme.typography.fontSize.xlarge * 1.3,
      letterSpacing: -0.5
    },

    titleMain: {
      fontSize: theme.typography.fontSize.xlarge,
      fontWeight: '700',
      color: theme.colors.primary
    },

    titleStatus: {
      fontSize: theme.typography.fontSize.large,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.tiny
    }
  });
