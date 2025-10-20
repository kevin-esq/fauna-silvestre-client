import { StyleSheet, Platform } from 'react-native';
import { Theme } from '../../contexts/theme.context';
import { EdgeInsets } from 'react-native-safe-area-context';

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32
} as const;

const BORDER_RADIUS = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 999
} as const;

const ELEVATION = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 6,
  xl: 8,
  xxl: 12
} as const;

const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  h2: { fontSize: 24, fontWeight: '600' as const, lineHeight: 30 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 26 },
  h4: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body1: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  body2: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 20 },
  chip: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 }
} as const;

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

const createFocusStyle = (theme: Theme) => ({
  borderColor: theme.colors.primary,
  shadowColor: theme.colors.primary,
  shadowOpacity: 0.25
});

export const createStyles = (theme: Theme, insets?: EdgeInsets) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    content: {
      flex: 1
    },
    listContainer: {
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.md,
      paddingBottom: SPACING.xxxl + (insets?.bottom || 0)
    },
    skeletonCard: {
      marginHorizontal: SPACING.lg,
      marginVertical: SPACING.sm,
      borderRadius: BORDER_RADIUS.lg
    },

    header: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingHorizontal: SPACING.lg,
      paddingTop: (insets?.top || 0) + SPACING.md,
      paddingBottom: SPACING.md,
      ...createShadow(ELEVATION.sm)
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: SPACING.md
    },

    searchHeaderContainer: {
      flex: 1
    },
    searchHeaderInput: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: BORDER_RADIUS.full,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    searchHeaderInputActive: {
      ...createFocusStyle(theme),
      backgroundColor: theme.colors.surface,
      borderWidth: 2
    },
    searchHeaderIcon: {
      marginRight: SPACING.sm
    },
    searchHeaderText: {
      flex: 1,
      ...TYPOGRAPHY.body1,
      color: theme.colors.text,
      padding: 0
    },
    searchHeaderClear: {
      padding: SPACING.xs,
      marginLeft: SPACING.sm
    },

    toggleFiltersButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: BORDER_RADIUS.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginRight: SPACING.md
    },
    toggleFiltersButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      ...createShadow(ELEVATION.md)
    },
    filterButtonText: {
      ...TYPOGRAPHY.button,
      marginLeft: SPACING.xs,
      fontSize: 14
    },
    addButton: {
      width: 48,
      height: 48,
      backgroundColor: theme.colors.primary,
      borderRadius: BORDER_RADIUS.lg,
      justifyContent: 'center',
      alignItems: 'center',
      ...createShadow(ELEVATION.lg)
    },

    filtersSection: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      ...createShadow(ELEVATION.sm)
    },
    filtersSectionCollapsed: {
      height: 0
    },
    filtersHeader: {
      marginBottom: SPACING.lg,
      alignItems: 'center'
    },
    filtersTitle: {
      ...TYPOGRAPHY.h4,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: SPACING.xs
    },
    filtersSubtitle: {
      ...TYPOGRAPHY.body2,
      color: theme.colors.textSecondary,
      textAlign: 'center'
    },

    advancedSearchContainer: {
      marginBottom: SPACING.lg
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: BORDER_RADIUS.lg,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    searchActiveContainer: {
      ...createFocusStyle(theme),
      backgroundColor: theme.colors.surface,
      borderWidth: 2
    },
    searchIcon: {
      marginRight: SPACING.sm
    },
    searchInput: {
      flex: 1,
      ...TYPOGRAPHY.body1,
      color: theme.colors.text,
      padding: 0
    },
    clearButton: {
      padding: SPACING.xs,
      marginLeft: SPACING.sm
    },

    filtersGrid: {
      gap: SPACING.lg
    },
    filterContainer: {
      gap: SPACING.sm
    },
    filterLabel: {
      ...TYPOGRAPHY.body2,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5
    },
    quickFilterChipText: {
      ...TYPOGRAPHY.chip,
      color: theme.colors.primary,
      fontWeight: '600'
    },
    clearFiltersButton: {
      backgroundColor: theme.colors.error,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: BORDER_RADIUS.full,
      marginLeft: 'auto'
    },
    clearFiltersText: {
      ...TYPOGRAPHY.chip,
      color: theme.colors.textOnPrimary,
      fontWeight: '600'
    },

    animalInfoChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.xs,
      marginTop: SPACING.sm
    },
    infoChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: BORDER_RADIUS.md,
      borderWidth: 1,
      gap: SPACING.xs,
      ...createShadow(ELEVATION.sm)
    },
    infoChipText: {
      ...TYPOGRAPHY.caption,
      fontWeight: '500'
    },

    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.xxxl,
      minHeight: 400
    },
    emptyIcon: {
      width: 120,
      height: 120,
      borderRadius: BORDER_RADIUS.full,
      backgroundColor: theme.colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.xl,
      ...createShadow(ELEVATION.sm)
    },
    emptyTitle: {
      ...TYPOGRAPHY.h2,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: SPACING.md
    },
    emptySubtitle: {
      ...TYPOGRAPHY.body1,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: SPACING.xl
    },
    emptyButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.lg,
      borderRadius: BORDER_RADIUS.lg,
      ...createShadow(ELEVATION.md)
    },
    emptyButtonText: {
      ...TYPOGRAPHY.button,
      color: theme.colors.textOnPrimary
    },

    loadingContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: SPACING.xl,
      gap: SPACING.md
    },
    loadingText: {
      ...TYPOGRAPHY.body2,
      color: theme.colors.textSecondary,
      fontStyle: 'italic'
    },
    endContainer: {
      alignItems: 'center',
      paddingVertical: SPACING.xl,
      paddingHorizontal: SPACING.lg
    },
    endText: {
      ...TYPOGRAPHY.body2,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic'
    },

    errorDisplayContainer: {
      backgroundColor: theme.colors.error,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.lg,
      marginHorizontal: SPACING.lg,
      marginVertical: SPACING.md,
      borderWidth: 1,
      borderColor: theme.colors.error,
      alignItems: 'center'
    },
    errorDisplayText: {
      ...TYPOGRAPHY.body1,
      color: theme.colors.error,
      textAlign: 'center',
      marginBottom: SPACING.md
    },
    errorDisplayRetryButton: {
      ...TYPOGRAPHY.button,
      color: theme.colors.primary,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      backgroundColor: theme.colors.surface,
      borderRadius: BORDER_RADIUS.lg,
      textAlign: 'center',
      ...createShadow(ELEVATION.sm)
    },

    sectionTitle: {
      ...TYPOGRAPHY.h3,
      color: theme.colors.primary,
      marginBottom: SPACING.lg,
      paddingBottom: SPACING.sm,
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.primaryLight
    },
    imageEditContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.lg,
      marginTop: SPACING.lg,
      ...createShadow(ELEVATION.sm)
    },
    animalCardContainer: {
      marginBottom: SPACING.lg,
      alignItems: 'center',
      justifyContent: 'center'
    },
    imageControlsContainer: {
      marginBottom: SPACING.lg
    },
    imagePreviewContainer: {
      position: 'relative',
      alignItems: 'center'
    },
    imagePreview: {
      width: 200,
      height: 200,
      borderRadius: BORDER_RADIUS.lg,
      backgroundColor: theme.colors.surfaceVariant
    },
    removeImageButton: {
      position: 'absolute',
      top: -8,
      right: -8,
      width: 32,
      height: 32,
      borderRadius: BORDER_RADIUS.full,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      ...createShadow(ELEVATION.md)
    },
    noImageContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      height: 200,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: BORDER_RADIUS.lg,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderStyle: 'dashed'
    },
    noImageText: {
      ...TYPOGRAPHY.body2,
      color: theme.colors.textSecondary,
      marginTop: SPACING.sm
    },
    cameraActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: SPACING.md,
      marginTop: SPACING.lg
    },
    cameraButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.lg,
      paddingHorizontal: SPACING.md,
      backgroundColor: theme.colors.primary,
      borderRadius: BORDER_RADIUS.lg,
      ...createShadow(ELEVATION.md)
    },
    cameraButtonText: {
      ...TYPOGRAPHY.button,
      color: theme.colors.textOnPrimary,
      marginLeft: SPACING.sm
    },
    galleryButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.lg,
      paddingHorizontal: SPACING.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.forest,
      borderRadius: BORDER_RADIUS.lg,
      ...createShadow(ELEVATION.sm)
    },
    galleryButtonText: {
      ...TYPOGRAPHY.button,
      color: theme.colors.forest,
      marginLeft: SPACING.sm
    },
    helpText: {
      ...TYPOGRAPHY.body2,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: SPACING.md,
      lineHeight: 20,
      fontStyle: 'italic'
    },
    infoContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.lg,
      marginTop: SPACING.lg,
      ...createShadow(ELEVATION.sm)
    },
    infoGrid: {
      gap: SPACING.md
    },
    infoItem: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingBottom: SPACING.md,
      marginBottom: SPACING.md
    },
    infoLabel: {
      ...TYPOGRAPHY.caption,
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      fontWeight: '600',
      letterSpacing: 0.5,
      marginBottom: SPACING.xs
    },
    infoValue: {
      ...TYPOGRAPHY.body1,
      color: theme.colors.text,
      lineHeight: 22
    },

    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING.xl
    },
    errorTitle: {
      ...TYPOGRAPHY.h2,
      color: theme.colors.error,
      textAlign: 'center',
      marginTop: SPACING.lg,
      marginBottom: SPACING.xl
    },
    errorButton: {
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.md,
      backgroundColor: theme.colors.primary,
      borderRadius: BORDER_RADIUS.lg,
      ...createShadow(ELEVATION.md)
    },
    errorButtonText: {
      ...TYPOGRAPHY.button,
      color: theme.colors.textOnPrimary
    },

    placeholderContainer: {
      alignItems: 'center',
      paddingVertical: SPACING.xxxl,
      paddingHorizontal: SPACING.xl,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: BORDER_RADIUS.lg,
      marginVertical: SPACING.lg
    },
    placeholderTitle: {
      ...TYPOGRAPHY.h3,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: SPACING.lg,
      marginBottom: SPACING.sm
    },
    placeholderText: {
      ...TYPOGRAPHY.body1,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: SPACING.sm
    },
    placeholderSubtext: {
      ...TYPOGRAPHY.body2,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic'
    },
    sectionContainer: {
      marginTop: SPACING.xl,
      marginBottom: SPACING.lg
    },
    imageSelector: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primaryLight,
      borderRadius: BORDER_RADIUS.md,
      paddingVertical: SPACING.xl,
      paddingHorizontal: SPACING.xl,
      marginBottom: SPACING.lg,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed'
    },
    imageSelectorText: {
      ...TYPOGRAPHY.body1,
      color: theme.colors.primary,
      marginTop: SPACING.md,
      fontWeight: '500',
      textAlign: 'center'
    },
    imageSelectorSubtext: {
      ...TYPOGRAPHY.caption,
      color: theme.colors.textSecondary,
      marginTop: SPACING.xs,
      textAlign: 'center',
      fontStyle: 'italic'
    },
    fieldLabel: {
      ...TYPOGRAPHY.body1,
      color: theme.colors.text,
      marginBottom: SPACING.sm,
      fontWeight: '500'
    },
    textInput: {
      ...TYPOGRAPHY.body2,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: BORDER_RADIUS.md,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      minHeight: 120,
      textAlignVertical: 'top',
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      fontSize: 14,
      ...createShadow(ELEVATION.sm)
    },
    infoTitle: {
      ...TYPOGRAPHY.h3,
      color: theme.colors.text,
      marginBottom: SPACING.md
    },
    infoText: {
      ...TYPOGRAPHY.body2,
      color: theme.colors.textSecondary,
      marginBottom: SPACING.sm
    },
    imageEditSectionTitle: {
      ...TYPOGRAPHY.h3,
      color: theme.colors.forest,
      marginBottom: SPACING.lg,
      textAlign: 'center',
      paddingHorizontal: SPACING.lg
    },
    imageEditHelpText: {
      ...TYPOGRAPHY.body2,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: SPACING.md,
      marginHorizontal: SPACING.lg,
      lineHeight: 20,
      fontStyle: 'italic'
    },

    listItemSeparator: {
      height: SPACING.sm,
      backgroundColor: 'transparent'
    },

    skeletonShimmer: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: BORDER_RADIUS.md
    },

    focusIndicator: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderRadius: BORDER_RADIUS.md
    },

    compactHeader: {
      paddingVertical: SPACING.sm,
      paddingTop: (insets?.top || 0) + SPACING.sm
    },

    expandedFilters: {
      maxHeight: 400
    },

    collapsedFilters: {
      maxHeight: 0,
      overflow: 'hidden'
    },
    // Agrega estos estilos a tu createStyles function

    // Header styles
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.md
    },
    headerTitle: {
      ...TYPOGRAPHY.h2,
      color: theme.colors.text,
      fontWeight: '700'
    },

    // Filter badge
    filterBadge: {
      position: 'absolute',
      top: -6,
      right: -6,
      backgroundColor: theme.colors.error,
      borderRadius: BORDER_RADIUS.full,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      ...createShadow(ELEVATION.sm)
    },
    filterBadgeText: {
      ...TYPOGRAPHY.caption,
      color: theme.colors.textOnPrimary,
      fontWeight: '700',
      fontSize: 10
    },

    // Filter chips
    filterChipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.sm
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: BORDER_RADIUS.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: SPACING.xs,
      ...createShadow(ELEVATION.sm)
    },
    filterChipSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      ...createShadow(ELEVATION.sm)
    },
    filterChipText: {
      ...TYPOGRAPHY.caption,
      color: theme.colors.textSecondary,
      fontWeight: '500'
    },
    filterChipTextSelected: {
      color: theme.colors.textOnPrimary,
      fontWeight: '600'
    },

    // Filter sections
    filterSection: {
      marginBottom: SPACING.lg
    },
    filterSectionTitle: {
      ...TYPOGRAPHY.body1,
      color: theme.colors.text,
      fontWeight: '600',
      marginBottom: SPACING.md
    },
    filterSectionContent: {
      // Content styles are handled by filterChipsContainer
    },

    // Quick filters bar improvements
    quickFiltersBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border
    },
    quickFiltersScroll: {
      flex: 1
    },
    quickFiltersContent: {
      flexDirection: 'row',
      gap: SPACING.sm,
      paddingRight: SPACING.md
    },
    quickFilterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: BORDER_RADIUS.full,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: SPACING.xs,
      ...createShadow(ELEVATION.sm)
    },
    clearAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: BORDER_RADIUS.full,
      backgroundColor: theme.colors.surfaceVariant,
      gap: SPACING.xs,
      ...createShadow(ELEVATION.sm)
    },
    clearAllText: {
      ...TYPOGRAPHY.caption,
      color: theme.colors.error,
      fontWeight: '600'
    },

    // Filters section improvements
    filtersScroll: {
      maxHeight: 400
    },
    filtersContent: {
      padding: SPACING.lg,
      gap: SPACING.lg
    },

    // Search bar improvements
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: BORDER_RADIUS.lg,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...createShadow(ELEVATION.sm)
    },

    // Toggle filters button improvements
    toggleFiltersButtonWithBadge: {
      position: 'relative'
    }
  });
