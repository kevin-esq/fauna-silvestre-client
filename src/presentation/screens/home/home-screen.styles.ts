import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Theme } from '../../contexts/theme.context';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - 48) / 2;

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
) =>
  Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: opacity,
      shadowRadius: elevation * 1.5
    },
    android: {
      elevation
    }
  }) || {};

const createSurface = (theme: Theme, elevation: number = ELEVATION.md) => ({
  backgroundColor: theme.colors.surface,
  borderRadius: 18,
  ...createShadow(
    elevation,
    theme.colors.shadow || '#000',
    theme.colors.primary ? 0.08 : 0.1
  )
});

export const createStyles = (theme: Theme) => {
  const vars = theme.colors;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: vars.background
    },
    scrollView: {
      flex: 1,
      backgroundColor: vars.background
    },
    bottomSpacer: {
      height: 120
    },

    headerGradient: {
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      ...createShadow(ELEVATION.lg, '#000', 0.15)
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
      fontSize: 36,
      marginRight: SPACING.md
    },
    greetingTextContainer: {
      flex: 1
    },
    greeting: {
      fontSize: 20,
      fontWeight: '700',
      color: vars.textOnPrimary || '#FFFFFF',
      marginBottom: 4,
      letterSpacing: 0.2
    },
    subGreeting: {
      fontSize: 13,
      fontWeight: '500',
      color: vars.textOnPrimary || '#FFFFFF',
      opacity: 0.9,
      letterSpacing: 0.3
    },
    logoutButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4
        },
        android: {
          elevation: 2
        }
      })
    },
    logoutIcon: {
      fontSize: 22,
      color: vars.textOnPrimary || '#FFFFFF'
    },

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
      borderRadius: 14,
      gap: SPACING.xs
    },
    infoChipText: {
      fontSize: 12,
      color: vars.textOnPrimary || '#FFFFFF',
      fontWeight: '600',
      letterSpacing: 0.2
    },

    sectionTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: vars.text,
      marginBottom: SPACING.lg,
      letterSpacing: 0.3
    },

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
      justifyContent: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: vars.border
    },
    statIconContainer: {
      width: 52,
      height: 52,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.md
    },
    statNumber: {
      fontSize: 28,
      fontWeight: '800',
      color: vars.text,
      marginBottom: 4,
      letterSpacing: -0.5
    },
    statLabel: {
      fontSize: 13,
      color: vars.textSecondary,
      textAlign: 'center',
      fontWeight: '600',
      letterSpacing: 0.3
    },

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
      padding: SPACING.lg,
      borderRadius: 18,
      alignItems: 'center',
      minHeight: 130,
      justifyContent: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.1,
          shadowRadius: 8
        },
        android: {
          elevation: 4
        }
      })
    },
    quickActionPrimary: {
      backgroundColor: vars.primary
    },
    quickActionSecondary: {
      backgroundColor: vars.surface,
      borderWidth: 2,
      borderColor: vars.forest || vars.primary
    },
    quickActionTertiary: {
      backgroundColor: vars.surface,
      borderWidth: 2,
      borderColor: vars.info || vars.primary
    },
    quickActionIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.md
    },
    quickActionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: vars.textOnPrimary,
      textAlign: 'center',
      marginBottom: 4,
      letterSpacing: 0.2
    },
    quickActionSubtitle: {
      fontSize: 11,
      color: vars.textOnPrimary,
      opacity: 0.9,
      textAlign: 'center',
      fontWeight: '500',
      letterSpacing: 0.2
    },

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

    filterContainer: {
      marginBottom: SPACING.lg,
      zIndex: 1000,
      elevation: 1000
    },
    filterContainerOpen: {
      zIndex: 99999,
      elevation: 99999
    },
    resultsInfo: {
      ...createSurface(theme, ELEVATION.sm),
      padding: SPACING.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: vars.border
    },
    resultsCount: {
      flex: 1
    },
    resultsNumber: {
      fontSize: 26,
      color: vars.primary,
      fontWeight: '800',
      letterSpacing: -0.5
    },
    resultsLabel: {
      fontSize: 13,
      color: vars.textSecondary,
      marginTop: 4,
      fontWeight: '500',
      letterSpacing: 0.2
    },
    toggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      backgroundColor: vars.primaryLight || vars.surfaceVariant,
      borderRadius: 14,
      gap: SPACING.xs,
      ...Platform.select({
        ios: {
          shadowColor: vars.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4
        },
        android: {
          elevation: 2
        }
      })
    },
    toggleButtonText: {
      fontSize: 13,
      fontWeight: '700',
      color: vars.primary,
      letterSpacing: 0.3
    },

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

    loadingSection: {
      paddingHorizontal: SPACING.sm,
      paddingTop: SPACING.xl
    },
    loadingTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: vars.text,
      textAlign: 'center',
      marginBottom: SPACING.lg,
      letterSpacing: 0.2
    },
    skeletonGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.lg,
      justifyContent: 'space-between'
    },

    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.huge,
      paddingHorizontal: SPACING.xl
    },
    emptyIconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: vars.surfaceVariant || '#F5F5F5',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.xl,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4
        },
        android: {
          elevation: 2
        }
      })
    },
    emptyStateTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: vars.text,
      textAlign: 'center',
      marginBottom: SPACING.md,
      letterSpacing: 0.2
    },
    emptyStateText: {
      fontSize: 14,
      color: vars.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      opacity: 0.8,
      maxWidth: 280,
      fontWeight: '500',
      letterSpacing: 0.2
    }
  });
};

export {
  SPACING,
  BORDER_RADIUS,
  ELEVATION,
  TYPOGRAPHY,
  createShadow,
  createSurface
};
