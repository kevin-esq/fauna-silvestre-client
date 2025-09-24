import { StyleSheet, Dimensions } from 'react-native';
import { Theme } from '../../contexts/theme.context';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - 48) / 2;

// Design System Constants
const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40
} as const;

const BORDER_RADIUS = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
  huge: 32
} as const;

const ELEVATION = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 6,
  xl: 8,
  xxl: 12,
  huge: 16
} as const;

const TYPOGRAPHY = {
  h1: { fontSize: 32, fontWeight: '800' as const },
  h2: { fontSize: 28, fontWeight: '700' as const },
  h3: { fontSize: 24, fontWeight: '600' as const },
  h4: { fontSize: 20, fontWeight: '600' as const },
  h5: { fontSize: 18, fontWeight: '600' as const },
  body1: { fontSize: 16, fontWeight: '400' as const },
  body2: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  overline: { fontSize: 10, fontWeight: '600' as const },
  button: { fontSize: 16, fontWeight: '600' as const }
} as const;

const createShadow = (
  elevation: number,
  color: string = '#000',
  opacity: number = 0.1
) => ({
  elevation,
  shadowColor: color,
  shadowOffset: { width: 0, height: elevation / 2 },
  shadowOpacity: opacity,
  shadowRadius: elevation
});

const createSurface = (theme: Theme, elevation: number = ELEVATION.md) => ({
  backgroundColor: theme.colors.surface,
  borderRadius: BORDER_RADIUS.lg,
  ...createShadow(
    elevation,
    theme.colors.shadow || '#000',
    theme.colors.primary || '#000' ? 0.3 : 0.1
  )
});

export const createStyles = (theme: Theme) => {
  const vars = theme.colors;

  return StyleSheet.create({
    // ==================== LAYOUT BASE ====================
    container: {
      flex: 1,
      backgroundColor: vars.background
    },
    scrollView: {
      flex: 1,
      backgroundColor: vars.background
    },
    bottomSpacer: {
      height: 120 // Espacio para FAB
    },

    // ==================== HEADER MEJORADO ====================
    headerGradient: {
      borderBottomLeftRadius: BORDER_RADIUS.xxxl,
      borderBottomRightRadius: BORDER_RADIUS.xxxl,
      ...createShadow(ELEVATION.lg, '#000', 0.2)
    },
    headerContainer: {
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.xxl,
      paddingTop: SPACING.huge
    },
    headerTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: SPACING.xl
    },
    greetingSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1
    },
    greetingIcon: {
      fontSize: 32,
      marginRight: SPACING.md
    },
    greeting: {
      ...TYPOGRAPHY.h4,
      color: vars.textOnPrimary || '#FFFFFF',
      marginBottom: SPACING.xs
    },
    subGreeting: {
      ...TYPOGRAPHY.body2,
      color: vars.textOnPrimary || '#FFFFFF',
      opacity: 0.9
    },
    logoutButton: {
      width: 44,
      height: 44,
      borderRadius: BORDER_RADIUS.lg,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    logoutIcon: {
      fontSize: 20,
      color: vars.textOnPrimary || '#FFFFFF'
    },

    // ==================== TIME & LOCATION CHIPS ====================
    timeAndLocationContainer: {
      flexDirection: 'row',
      gap: SPACING.md,
      flexWrap: 'wrap'
    },
    infoChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: BORDER_RADIUS.xl,
      gap: SPACING.xs
    },
    infoChipText: {
      ...TYPOGRAPHY.caption,
      color: vars.textOnPrimary || '#FFFFFF',
      fontWeight: '500'
    },

    // ==================== SECTIONS ====================
    sectionTitle: {
      ...TYPOGRAPHY.h4,
      color: vars.text,
      marginBottom: SPACING.lg,
      textAlign: 'center'
    },

    // ==================== STATS MEJORADAS ====================
    statsSection: {
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.xxxl
    },
    statsContainer: {
      flexDirection: 'row',
      gap: SPACING.lg
    },
    statCard: {
      ...createSurface(theme, ELEVATION.md),
      flex: 1,
      padding: SPACING.xl,
      alignItems: 'center',
      minHeight: 140,
      justifyContent: 'center'
    },
    statIconContainer: {
      width: 48,
      height: 48,
      borderRadius: BORDER_RADIUS.lg,
      backgroundColor: vars.surfaceVariant || '#F5F5F5',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.md,
      ...createShadow(ELEVATION.sm)
    },
    statNumber: {
      ...TYPOGRAPHY.h2,
      color: vars.text,
      marginBottom: SPACING.xs,
      textAlign: 'center'
    },
    statLabel: {
      ...TYPOGRAPHY.body2,
      color: vars.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
      marginBottom: SPACING.sm
    },
    statTrend: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: vars.success || '#E8F5E8',
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: BORDER_RADIUS.md,
      gap: SPACING.xs
    },
    statTrendText: {
      ...TYPOGRAPHY.caption,
      color: vars.success || '#4CAF50',
      fontWeight: '600'
    },

    // ==================== QUICK ACTIONS ====================
    quickActionsSection: {
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.xxxl
    },
    quickActionsContainer: {
      flexDirection: 'row',
      gap: SPACING.lg
    },
    quickActionCard: {
      flex: 1,
      padding: SPACING.xl,
      borderRadius: BORDER_RADIUS.xl,
      alignItems: 'center',
      minHeight: 120,
      ...createShadow(ELEVATION.md)
    },
    quickActionPrimary: {
      backgroundColor: vars.primary
    },
    quickActionSecondary: {
      backgroundColor: vars.surface,
      borderWidth: 2,
      borderColor: vars.forest || vars.primary
    },
    quickActionIcon: {
      width: 48,
      height: 48,
      borderRadius: BORDER_RADIUS.lg,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.md
    },
    quickActionTitle: {
      ...TYPOGRAPHY.body1,
      fontWeight: '600',
      color: vars.textOnPrimary,
      textAlign: 'center',
      marginBottom: SPACING.xs
    },
    quickActionSubtitle: {
      ...TYPOGRAPHY.caption,
      color: vars.textOnPrimary,
      opacity: 0.9,
      textAlign: 'center'
    },

    // ==================== FILTERS SECTION ====================
    filtersSection: {
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.xxxl
    },
    filtersHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.lg
    },
    filterToggle: {
      width: 36,
      height: 36,
      borderRadius: BORDER_RADIUS.md,
      backgroundColor: vars.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center'
    },
    filterContainer: {
      marginBottom: SPACING.lg,
      zIndex: 1000,
      elevation: 1000
    },
    filterContainerOpen: {
      zIndex: 99999,
      elevation: 99999
    },

    // ==================== RESULTS INFO ====================
    resultsInfo: {
      ...createSurface(theme, ELEVATION.sm),
      padding: SPACING.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.xl
    },
    resultsCount: {
      flex: 1
    },
    resultsNumber: {
      ...TYPOGRAPHY.h3,
      color: vars.primary,
      fontWeight: '700'
    },
    resultsLabel: {
      ...TYPOGRAPHY.body2,
      color: vars.textSecondary,
      marginTop: SPACING.xs
    },
    toggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      backgroundColor: vars.primaryLight || vars.surfaceVariant,
      borderRadius: BORDER_RADIUS.xl,
      gap: SPACING.sm,
      ...createShadow(ELEVATION.sm)
    },
    toggleButtonText: {
      ...TYPOGRAPHY.body2,
      fontWeight: '600',
      color: vars.primary
    },

    // ==================== ANIMALS GRID ====================
    animalsGrid: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.sm
    },
    animalsContainer: {
      gap: SPACING.xl,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between'
    },
    animalsRow: {
      justifyContent: 'space-between',
      marginBottom: SPACING.lg
    },
    animalCardWrapper: {
      width: CARD_WIDTH
    },
    animalCardLeft: {
      marginRight: SPACING.sm
    },
    animalCardRight: {
      marginLeft: SPACING.sm
    },

    // ==================== LOADING STATES ====================
    loadingSection: {
      paddingHorizontal: SPACING.sm
    },
    loadingTitle: {
      ...TYPOGRAPHY.h5,
      color: vars.text,
      textAlign: 'center',
      marginBottom: SPACING.lg
    },
    skeletonGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.lg,
      justifyContent: 'space-between'
    },

    // ==================== EMPTY STATES MEJORADOS ====================
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.md
    },
    emptyIconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: vars.surfaceVariant || '#F5F5F5',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.xl,
      ...createShadow(ELEVATION.sm)
    },
    emptyStateTitle: {
      ...TYPOGRAPHY.h4,
      color: vars.text,
      textAlign: 'center',
      marginBottom: SPACING.md
    },
    emptyStateText: {
      ...TYPOGRAPHY.body2,
      color: vars.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      opacity: 0.8,
      maxWidth: 280
    },

    // ==================== LEGACY COMPATIBILITY ====================
    scrollContainer: {
      paddingBottom: 120,
      flexGrow: 1
    },
    section: {
      marginVertical: SPACING.lg,
      paddingHorizontal: SPACING.lg
    },
    imageSection: {
      marginTop: SPACING.xxl,
      paddingHorizontal: SPACING.lg
    },
    list: {
      paddingHorizontal: SPACING.lg,
      paddingBottom: 100
    },
    description: {
      ...TYPOGRAPHY.body1,
      color: vars.textSecondary,
      textAlign: 'center',
      marginBottom: SPACING.lg,
      alignSelf: 'stretch'
    },
    welcome: {
      ...TYPOGRAPHY.h3,
      color: vars.text,
      marginVertical: SPACING.lg
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SPACING.xxl
    },
    statCount: {
      ...TYPOGRAPHY.h3,
      color: vars.primary
    },
    statBox: {
      alignItems: 'center',
      flex: 1
    },
    statValue: {
      ...TYPOGRAPHY.h2,
      color: vars.primary
    },
    imagePlaceholder: {
      ...TYPOGRAPHY.body1,
      textAlign: 'center',
      color: vars.textSecondary,
      padding: SPACING.lg,
      backgroundColor: vars.surface,
      borderRadius: BORDER_RADIUS.md
    },
    statsCard: {
      ...createSurface(theme),
      width: '100%',
      padding: SPACING.lg,
      alignItems: 'center',
      marginBottom: SPACING.xxl
    },
    cardButtonContainer: {
      width: '100%',
      marginBottom: SPACING.xxl
    },
    cardButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...createSurface(theme),
      padding: SPACING.lg,
      marginBottom: SPACING.md
    },
    cardButtonText: {
      ...TYPOGRAPHY.body1,
      color: vars.text,
      fontWeight: '600'
    },
    buttonIcon: {
      marginLeft: SPACING.sm
    },
    emptyListContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.xxxl
    },
    emptyListText: {
      ...TYPOGRAPHY.body1,
      marginTop: SPACING.md,
      color: vars.textSecondary,
      textAlign: 'center'
    },
    catalogHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.lg
    },
    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: BORDER_RADIUS.md,
      backgroundColor: vars.surfaceVariant
    },
    viewAllButtonText: {
      ...TYPOGRAPHY.body2,
      fontWeight: '600',
      color: vars.primary,
      marginRight: SPACING.xs
    },
    timeAndLocationText: {
      ...TYPOGRAPHY.body2,
      color: vars.textSecondary,
      marginLeft: SPACING.sm
    },
    separator: {
      height: SPACING.lg,
      width: 1,
      backgroundColor: vars.border,
      marginHorizontal: SPACING.md,
      opacity: 0.5
    },
    activityIndicator: {
      marginLeft: SPACING.sm
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.xxxl * 2
    },
    loadingText: {
      ...TYPOGRAPHY.body2,
      color: vars.textSecondary,
      marginTop: SPACING.md,
      fontStyle: 'italic'
    },
    quickActionTertiary: {
      backgroundColor: vars.surface,
      borderWidth: 2,
      borderColor: vars.primary
    }
  });
};

// Export design system constants for reuse
export {
  SPACING,
  BORDER_RADIUS,
  ELEVATION,
  TYPOGRAPHY,
  createShadow,
  createSurface
};
