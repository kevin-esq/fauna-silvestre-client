import { StyleSheet } from 'react-native';
import { Theme } from '@/presentation/contexts/theme.context';

export const createAnimalDetailsStyles = (
  theme: Theme,
  insets: { top: number; bottom: number; left: number; right: number }
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },

    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: insets.top + 12,
      paddingBottom: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.97)',
      zIndex: 100,
      elevation: 8,
      shadowColor: theme.colors.forest,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 122, 51, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(0, 122, 51, 0.2)'
    },

    headerTitleContainer: {
      flex: 1,
      marginHorizontal: 16,
      alignItems: 'center'
    },

    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center'
    },

    headerActionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 122, 51, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(0, 122, 51, 0.2)'
    },

    headerBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 122, 51, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(0, 122, 51, 0.2)'
    },

    scrollView: {
      flex: 1
    },

    scrollContent: {
      paddingTop: 0,
      paddingBottom: insets.bottom + 24
    },

    heroImageContainer: {
      position: 'relative',
      height: 400,
      marginBottom: 20
    },

    heroGradientOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '75%',
      zIndex: 1
    },

    heroContentOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20,
      paddingBottom: 24,
      zIndex: 2,
      gap: 12
    },

    imageCard: {
      width: '100%',
      height: '100%'
    },

    cardImage: {
      width: '100%',
      height: '100%'
    },

    imageTopAligned: {
      resizeMode: 'cover'
    },

    categoryBadge: {
      flexDirection: 'row',
      alignSelf: 'flex-start',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 24,
      gap: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.97)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8
    },

    categoryText: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.leaf,
      letterSpacing: 0.3
    },

    heroTitleContainer: {
      gap: 8
    },

    heroTitle: {
      fontSize: 32,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: -0.5,
      lineHeight: 38,
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 12
    },

    heroSubtitle: {
      fontSize: 16,
      fontWeight: '500',
      color: 'rgba(255, 255, 255, 0.98)',
      letterSpacing: 0.2,
      fontStyle: 'italic',
      textShadowColor: 'rgba(0, 0, 0, 0.7)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 8
    },

    imageActionsRow: {
      position: 'absolute',
      top: insets.top + 72,
      right: 16,
      flexDirection: 'row',
      gap: 12,
      zIndex: 99
    },

    imageActionButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6
    },

    expandButton: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2,
      elevation: 4,
      shadowColor: theme.colors.forest,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8
    },

    shareImageButton: {
      width: 44,
      height: 44,
      borderRadius: 22
    },

    downloadImageButton: {
      width: 44,
      height: 44,
      borderRadius: 22
    },

    contentSection: {
      paddingHorizontal: 20
    },

    infoSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 24,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderLeftWidth: 5,
      borderLeftColor: theme.colors.forest,
      elevation: 2,
      shadowColor: theme.colors.forest,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 12
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14
    },

    sectionTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      flex: 1,
      letterSpacing: -0.2
    },

    sectionContent: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      lineHeight: 26,
      paddingLeft: 60,
      letterSpacing: 0.1
    },

    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center'
    },

    expandButtonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border
    },

    expandButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.primary
    },

    actionButtonsContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 24,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderLeftWidth: 5,
      borderLeftColor: theme.colors.forest,
      elevation: 2,
      shadowColor: theme.colors.forest,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 12
    },

    downloadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: theme.colors.forest,
      paddingHorizontal: 28,
      paddingVertical: 14,
      borderRadius: 16,
      elevation: 4,
      shadowColor: theme.colors.forest,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12
    },

    actionButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: 15,
      fontWeight: '600',
      lineHeight: 22
    },

    downloadProgressText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#FFFFFF',
      opacity: 0.9
    },

    mapSubtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 4
    },

    mapContainer: {
      borderRadius: 16,
      overflow: 'hidden',
      marginTop: 12,
      elevation: 3,
      shadowColor: theme.colors.forest,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8
    },

    mapLoadingContainer: {
      padding: theme.spacing.xlarge,
      alignItems: 'center',
      gap: theme.spacing.medium
    },

    mapLoadingText: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.textSecondary
    },

    mapErrorContainer: {
      padding: theme.spacing.xlarge,
      alignItems: 'center',
      gap: theme.spacing.medium
    },

    mapErrorText: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.error,
      textAlign: 'center'
    },

    mapErrorSubtext: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.textSecondary,
      textAlign: 'center'
    },

    mapEmptyContainer: {
      padding: theme.spacing.xlarge,
      alignItems: 'center',
      gap: theme.spacing.medium
    },

    mapEmptyText: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.textSecondary,
      textAlign: 'center'
    },

    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.95)'
    },

    modalBackground: {
      flex: 1
    },

    modalContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },

    closeButton: {
      position: 'absolute',
      top: insets.top + 20,
      right: 20,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10
    },

    modalInfo: {
      position: 'absolute',
      bottom: insets.bottom + 40,
      left: 20,
      right: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: theme.spacing.large,
      borderRadius: theme.borderRadius.medium,
      gap: theme.spacing.small
    },

    modalTitle: {
      fontSize: theme.typography.fontSize.xlarge,
      fontWeight: theme.typography.fontWeight.bold,
      color: '#FFFFFF'
    },

    modalSubtitle: {
      fontSize: theme.typography.fontSize.medium,
      color: '#E0E0E0',
      fontStyle: 'italic'
    }
  });
