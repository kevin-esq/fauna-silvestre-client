import { StyleSheet, Platform } from 'react-native';
import { Theme } from '../../contexts/theme.context';

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32
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

export const createPublicationScreenStyles = (theme: Theme) =>
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
      color: '#FFFFFF',
      fontSize: FONT_SIZE.sm,
      fontWeight: '600'
    },

    searchContainer: {
      marginBottom: SPACING.md
    },

    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: BORDER_RADIUS.md,
      paddingHorizontal: SPACING.md,
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
      marginRight: SPACING.sm,
      color: theme.colors.textSecondary
    },

    searchInput: {
      flex: 1,
      paddingVertical: SPACING.md,
      fontSize: FONT_SIZE.md,
      color: theme.colors.text
    },

    clearButton: {
      padding: SPACING.xs,
      marginLeft: SPACING.xs
    },

    clearIcon: {
      color: theme.colors.textSecondary
    },

    searchResultsCount: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: SPACING.sm,
      paddingHorizontal: SPACING.xs
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
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.md,
      borderRadius: BORDER_RADIUS.sm,
      backgroundColor: theme.colors.surfaceVariant
    },

    clearSearchText: {
      fontSize: FONT_SIZE.sm,
      color: theme.colors.primary,
      fontWeight: '500'
    },

    filterContainer: {
      marginBottom: SPACING.md,
      overflow: 'hidden'
    },

    filterHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.xs
    },

    filterHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm
    },

    filterToggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.sm,
      borderRadius: BORDER_RADIUS.sm,
      backgroundColor: theme.colors.surfaceVariant
    },

    filterToggleText: {
      fontSize: FONT_SIZE.sm,
      color: theme.colors.text,
      fontWeight: '500'
    },

    filterIcon: {
      fontSize: FONT_SIZE.md
    },

    activeFiltersCount: {
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      paddingHorizontal: SPACING.xs,
      paddingVertical: 2,
      minWidth: 20,
      alignItems: 'center',
      justifyContent: 'center'
    },

    activeFiltersCountText: {
      fontSize: FONT_SIZE.xs,
      color: '#FFFFFF',
      fontWeight: '700'
    },

    clearFiltersButton: {
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.sm,
      borderRadius: BORDER_RADIUS.sm
    },

    clearFiltersText: {
      fontSize: FONT_SIZE.sm,
      color: theme.colors.error,
      fontWeight: '500'
    },

    filterContent: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.md,
      marginTop: SPACING.sm
    },

    filterSection: {
      marginBottom: SPACING.md
    },

    filterSectionLast: {
      marginBottom: 0
    },

    filterSectionTitle: {
      fontSize: FONT_SIZE.sm,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: SPACING.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5
    },

    filterOptions: {
      gap: SPACING.sm
    },

    filterOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: BORDER_RADIUS.md,
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
      fontSize: FONT_SIZE.md,
      color: theme.colors.text,
      fontWeight: '500'
    },

    filterOptionTextSelected: {
      color: '#FFFFFF',
      fontWeight: '600'
    },

    filterOptionIcon: {
      fontSize: FONT_SIZE.lg,
      marginRight: SPACING.sm
    },

    filterCheckbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.sm
    },

    filterCheckboxSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary
    },

    filterCheckmark: {
      color: '#FFFFFF',
      fontSize: FONT_SIZE.sm,
      fontWeight: '700'
    },

    sortOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.sm
    },

    sortOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: BORDER_RADIUS.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border
    },

    sortOptionSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary
    },

    sortOptionText: {
      fontSize: FONT_SIZE.sm,
      color: theme.colors.text,
      fontWeight: '500'
    },

    sortOptionTextSelected: {
      color: '#FFFFFF',
      fontWeight: '600'
    },

    floatingHeaderButton: {
      position: 'absolute',
      right: SPACING.md,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: BORDER_RADIUS.lg,
      gap: SPACING.xs,
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
      fontSize: FONT_SIZE.sm,
      fontWeight: '700'
    },

    floatingHeaderButtonText: {
      color: '#FFFFFF',
      fontSize: FONT_SIZE.sm,
      fontWeight: '600'
    },

    tabsContainer: {
      flexDirection: 'row',
      gap: SPACING.sm
    },

    tabWrapper: {
      flex: 1
    },

    tab: {
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.sm,
      borderRadius: BORDER_RADIUS.md,
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
      gap: SPACING.xs
    },

    tabLabel: {
      fontSize: FONT_SIZE.md,
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
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: BORDER_RADIUS.lg,
      minWidth: 40
    },

    tabBadgeActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)'
    },

    tabBadgeText: {
      fontSize: FONT_SIZE.xs,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center'
    },

    tabBadgeTextActive: {
      color: '#FFFFFF'
    },

    tabLoadingIndicator: {
      position: 'absolute',
      top: SPACING.xs,
      right: SPACING.xs
    },

    contentContainer: {
      flex: 1
    },

    listContent: {
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
      paddingVertical: SPACING.xxl
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
    titleContainer: {
      marginBottom: SPACING.md,
      marginStart: SPACING.xxl,
      paddingEnd: SPACING.lg
    },

    title: {
      fontSize: FONT_SIZE.xxl,
      fontWeight: '700',
      color: theme.colors.primary,
      lineHeight: FONT_SIZE.xxl * 1.3,
      letterSpacing: -0.5
    },

    titleMain: {
      fontSize: FONT_SIZE.xxl,
      fontWeight: '700',
      color: theme.colors.primary
    },

    titleStatus: {
      fontSize: FONT_SIZE.lg,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginTop: SPACING.xs
    }
  });
