import { ThemeVariablesType } from '@/presentation/contexts/theme.context';
import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_WIDTH = (screenWidth - CARD_MARGIN * 4) / 2;

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40
} as const;

const BORDER_RADIUS = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24
} as const;

const TYPOGRAPHY = {
  h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  h2: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  h3: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
  h4: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  h5: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body1: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  body2: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  overline: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 14,
    letterSpacing: 0.5
  },
  button: { fontSize: 14, fontWeight: '600' as const, lineHeight: 18 }
} as const;

const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12
  }
};

export const createStyles = (
  vars: ThemeVariablesType,
  insets: { top: number; bottom: number; left: number; right: number }
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: vars['--background'] || '#FAFAFA'
    },

    headerWrapper: {
      backgroundColor: vars['--surface'] || '#FFFFFF',
      paddingBottom: SPACING.md,
      ...SHADOWS.sm,
      borderBottomWidth: 1,
      borderBottomColor: vars['--border'] || '#E0E0E0'
    },

    headerContainer: {
      paddingHorizontal: SPACING.lg,
      paddingTop: insets.top + SPACING.md,
      paddingBottom: SPACING.lg
    },

    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.md
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: BORDER_RADIUS.lg,
      backgroundColor: vars['--surface-variant'] || '#F5F5F5',
      justifyContent: 'center',
      alignItems: 'center',
      ...SHADOWS.xs
    },

    headerContent: {
      flex: 1,
      marginHorizontal: SPACING.lg
    },

    headerTitle: {
      ...TYPOGRAPHY.h3,
      color: vars['--forest'] || '#2E7D32',
      marginBottom: SPACING.xs
    },

    headerSubtitle: {
      ...TYPOGRAPHY.body2,
      color: vars['--text-secondary'] || '#757575'
    },

    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm
    },

    headerActionButton: {
      width: 40,
      height: 40,
      borderRadius: BORDER_RADIUS.lg,
      backgroundColor: vars['--surface-variant'] || '#F5F5F5',
      justifyContent: 'center',
      alignItems: 'center',
      ...SHADOWS.xs
    },

    viewModeButton: {
      width: 40,
      height: 40,
      borderRadius: BORDER_RADIUS.lg,
      backgroundColor: vars['--surface-variant'] || '#F5F5F5',
      justifyContent: 'center',
      alignItems: 'center',
      ...SHADOWS.xs
    },

    viewModeButtonActive: {
      backgroundColor: vars['--primary'] || '#4CAF50'
    },

    controlsContainer: {
      backgroundColor: vars['--surface-variant'] || '#F5F5F5',
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.md,
      padding: SPACING.lg,
      borderRadius: BORDER_RADIUS.xl,
      ...SHADOWS.xs
    },

    controlsTitle: {
      ...TYPOGRAPHY.overline,
      color: vars['--text-secondary'] || '#757575',
      marginBottom: SPACING.md,
      textTransform: 'uppercase'
    },

    sortButtonsContainer: {
      flexDirection: 'row',
      gap: SPACING.sm,
      flexWrap: 'wrap'
    },

    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      borderRadius: BORDER_RADIUS.xl,
      backgroundColor: vars['--surface'] || '#FFFFFF',
      borderWidth: 1,
      borderColor: vars['--border'] || '#E0E0E0',
      gap: SPACING.xs,
      ...SHADOWS.xs
    },

    sortButtonActive: {
      backgroundColor: vars['--primary'] || '#4CAF50',
      borderColor: vars['--primary'] || '#4CAF50'
    },

    sortButtonText: {
      ...TYPOGRAPHY.button,
      color: vars['--text-secondary'] || '#757575'
    },

    sortButtonTextActive: {
      color: vars['--text-on-primary'] || '#FFFFFF'
    },

    list: {
      paddingHorizontal: SPACING.sm,
      paddingTop: SPACING.md,
      paddingBottom: SPACING.xxxl + insets.bottom
    },

    listEmpty: {
      flex: 1
    },

    row: {
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.sm
    },

    emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING.xxxxl,
      paddingVertical: SPACING.xxxxl,
      minHeight: screenHeight * 0.6
    },

    emptyIconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: vars['--surface'] || '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.xl,
      ...SHADOWS.md,
      borderWidth: 2,
      borderColor: vars['--border'] || '#E0E0E0'
    },

    emptyTitle: {
      ...TYPOGRAPHY.h4,
      color: vars['--text'] || '#212121',
      textAlign: 'center',
      marginBottom: SPACING.md
    },

    emptySubtitle: {
      ...TYPOGRAPHY.body1,
      color: vars['--text-secondary'] || '#757575',
      textAlign: 'center',
      marginBottom: SPACING.xl
    },

    suggestionContainer: {
      backgroundColor: vars['--surface'] || '#FFFFFF',
      padding: SPACING.lg,
      borderRadius: BORDER_RADIUS.xl,
      marginBottom: SPACING.xl,
      ...SHADOWS.sm,
      alignSelf: 'stretch',
      maxWidth: 300
    },

    suggestionTitle: {
      ...TYPOGRAPHY.button,
      color: vars['--text'] || '#212121',
      marginBottom: SPACING.sm
    },

    suggestionItem: {
      ...TYPOGRAPHY.body2,
      color: vars['--text-secondary'] || '#757575',
      marginBottom: SPACING.xs,
      paddingLeft: SPACING.sm
    },

    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: vars['--primary'] || '#4CAF50',
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.lg,
      borderRadius: BORDER_RADIUS.xl,
      ...SHADOWS.md,
      minWidth: 140
    },

    retryButtonText: {
      ...TYPOGRAPHY.button,
      color: vars['--text-on-primary'] || '#FFFFFF',
      marginLeft: SPACING.sm
    },

    catalogCard: {
      width: CARD_WIDTH,
      backgroundColor: vars['--surface'] || '#FFFFFF',
      borderRadius: BORDER_RADIUS.xl,
      marginBottom: SPACING.lg,
      overflow: 'hidden',
      ...SHADOWS.md,
      borderWidth: 1,
      borderColor: vars['--border'] || '#F0F0F0'
    },

    catalogCardList: {
      backgroundColor: vars['--surface'] || '#FFFFFF',
      borderRadius: BORDER_RADIUS.xl,
      marginBottom: SPACING.md,
      marginHorizontal: SPACING.sm,
      overflow: 'hidden',
      ...SHADOWS.sm,
      borderWidth: 1,
      borderColor: vars['--border'] || '#F0F0F0'
    },

    catalogCardTouchable: {
      position: 'relative'
    },

    catalogCardTouchableList: {
      flexDirection: 'row',
      position: 'relative'
    },

    catalogImageContainer: {
      height: 140,
      position: 'relative',
      overflow: 'hidden'
    },

    catalogImageContainerList: {
      width: 120,
      height: 100,
      position: 'relative',
      overflow: 'hidden'
    },

    catalogImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover'
    },

    catalogImagePlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: vars['--surface-variant'] || '#F5F5F5'
    },

    placeholderIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: vars['--surface'] || '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.sm,
      ...SHADOWS.xs
    },

    placeholderText: {
      ...TYPOGRAPHY.caption,
      color: vars['--text-secondary'] || '#757575',
      fontWeight: '500'
    },

    catalogImageLoading: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.9)'
    },

    loadingProgress: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: 2,
      backgroundColor: vars['--primary'] || '#4CAF50'
    },

    imageOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '30%',
      backgroundColor: 'rgba(0, 0, 0, 0.1)'
    },

    catalogBadge: {
      position: 'absolute',
      top: SPACING.sm,
      right: SPACING.sm,
      backgroundColor: vars['--forest'] || '#2E7D32',
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: BORDER_RADIUS.lg,
      ...SHADOWS.sm,
      borderWidth: 1,
      borderColor: vars['--surface'] || '#FFFFFF'
    },

    catalogBadgeText: {
      ...TYPOGRAPHY.overline,
      color: vars['--text-on-primary'] || '#FFFFFF'
    },

    newBadge: {
      position: 'absolute',
      top: SPACING.sm,
      left: SPACING.sm,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: vars['--error'] || '#FF5722',
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: BORDER_RADIUS.lg,
      ...SHADOWS.sm,
      gap: SPACING.xs,
      borderWidth: 1,
      borderColor: vars['--surface'] || '#FFFFFF'
    },

    newBadgeText: {
      ...TYPOGRAPHY.overline,
      color: vars['--text-on-primary'] || '#FFFFFF'
    },

    catalogContent: {
      padding: SPACING.lg,
      flex: 1
    },

    catalogContentList: {
      flex: 1,
      padding: SPACING.lg,
      justifyContent: 'center'
    },

    titleContainer: {
      marginBottom: SPACING.md
    },

    catalogTitle: {
      ...TYPOGRAPHY.h5,
      color: vars['--forest'] || '#2E7D32',
      marginBottom: SPACING.xs
    },

    catalogSpecies: {
      ...TYPOGRAPHY.body2,
      color: vars['--text-secondary'] || '#757575'
    },

    speciesLabel: {
      fontWeight: '500',
      color: vars['--text'] || '#212121'
    },

    catalogMeta: {
      gap: SPACING.sm
    },

    catalogMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm
    },

    catalogMetaText: {
      ...TYPOGRAPHY.caption,
      color: vars['--text-secondary'] || '#757575',
      fontWeight: '500'
    },

    actionButton: {
      position: 'absolute',
      bottom: SPACING.lg,
      right: SPACING.lg,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: vars['--primary'] || '#4CAF50',
      justifyContent: 'center',
      alignItems: 'center',
      ...SHADOWS.md,
      borderWidth: 2,
      borderColor: vars['--surface'] || '#FFFFFF'
    },

    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xl
    },

    loadingText: {
      ...TYPOGRAPHY.body1,
      marginTop: SPACING.lg,
      color: vars['--text-secondary'] || '#757575',
      textAlign: 'center'
    },

    emptyText: {
      ...TYPOGRAPHY.body1,
      textAlign: 'center',
      marginTop: SPACING.xl * 2,
      paddingHorizontal: SPACING.xl,
      color: vars['--text-secondary'] || '#757575'
    },

    searchInput: {
      padding: SPACING.lg,
      borderRadius: BORDER_RADIUS.xl,
      marginHorizontal: SPACING.lg,
      marginVertical: SPACING.md,
      fontSize: 16,
      borderWidth: 1,
      borderColor: vars['--border'] || '#E0E0E0',
      color: vars['--text'] || '#212121',
      backgroundColor: vars['--surface'] || '#FFFFFF',
      ...SHADOWS.xs
    },

    errorText: {
      ...TYPOGRAPHY.body2,
      textAlign: 'center',
      marginBottom: SPACING.md,
      marginHorizontal: SPACING.lg,
      color: vars['--error'] || '#D32F2F',
      backgroundColor: vars['--surface-variant'] || '#FFEBEE',
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.md
    },

    primary: {
      color: vars['--primary'] || '#4CAF50'
    },

    catalogDescription: {
      ...TYPOGRAPHY.body2,
      color: vars['--text-secondary'] || '#757575',
      lineHeight: 20,
      marginTop: SPACING.sm
    },

    focusedCard: {
      borderWidth: 2,
      borderColor: vars['--primary'] || '#4CAF50'
    },

    fadeIn: {
      opacity: 1
    },

    fadeOut: {
      opacity: 0.6
    },

    darkOverlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.05)'
    },

    lightOverlay: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)'
    },

    smallScreen: {
      paddingHorizontal: SPACING.md
    },

    largeScreen: {
      paddingHorizontal: SPACING.xl
    },
    headerActionButtonActive: {
      backgroundColor: vars['--primary'] || '#4CAF50'
    }
  });
