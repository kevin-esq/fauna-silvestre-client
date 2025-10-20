import { StyleSheet } from 'react-native';
import { Theme } from '@/presentation/contexts/theme.context';

export const createAnimalDetailsStyles = (
  theme: Theme,
  insets: { top: number; bottom: number; left: number; right: number }
) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background
    },

    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: theme.borderWidth.hairline,
      borderBottomColor: theme.colors.border,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.medium,
      backgroundColor: theme.colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center'
    },

    headerCenter: {
      flex: 1,
      paddingHorizontal: theme.spacing.medium
    },

    headerTitle: {
      fontSize: theme.typography.fontSize.large,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      textAlign: 'center'
    },

    headerActionButton: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.medium,
      backgroundColor: theme.colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center'
    },

    headerActionButtonActive: {
      backgroundColor: '#FEE2E2'
    },

    imageCard: {
      margin: theme.spacing.medium,
      borderRadius: theme.borderRadius.large,
      overflow: 'hidden',
      backgroundColor: theme.colors.surface,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5
    },

    cardImage: {
      width: '100%',
      height: 300,
      resizeMode: 'cover'
    },

    imageTopAligned: {
      resizeMode: 'cover'
    },

    imageOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.3)'
    },

    imageContent: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: theme.spacing.large
    },

    categoryBadge: {
      position: 'absolute',
      top: theme.spacing.medium,
      right: theme.spacing.medium,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small,
      borderRadius: theme.borderRadius.large,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 3
    },

    categoryText: {
      fontSize: theme.typography.fontSize.small,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.textOnPrimary,
      textTransform: 'uppercase',
      letterSpacing: 0.5
    },

    imageTitleContainer: {
      gap: theme.spacing.tiny
    },

    imageCommonName: {
      fontSize: 28,
      fontWeight: theme.typography.fontWeight.bold,
      color: '#FFFFFF',
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4
    },

    imageScientificName: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.regular,
      color: '#F0F0F0',
      fontStyle: 'italic',
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3
    },

    imageZoomIndicator: {
      position: 'absolute',
      top: theme.spacing.medium,
      left: theme.spacing.medium,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center'
    },

    contentCard: {
      marginHorizontal: theme.spacing.medium,
      marginBottom: theme.spacing.medium,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.large,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3
    },

    section: {
      marginBottom: theme.spacing.large
    },

    sectionTitle: {
      fontSize: theme.typography.fontSize.large,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
      marginBottom: theme.spacing.medium
    },

    description: {
      fontSize: theme.typography.fontSize.medium,
      lineHeight: theme.typography.lineHeight.large,
      color: theme.colors.text,
      textAlign: 'justify'
    },

    infoGrid: {
      gap: theme.spacing.medium
    },

    infoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.medium,
      backgroundColor: theme.colors.surfaceVariant,
      padding: theme.spacing.medium,
      borderRadius: theme.borderRadius.medium
    },

    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.medium,
      justifyContent: 'center',
      alignItems: 'center'
    },

    infoContent: {
      flex: 1,
      gap: theme.spacing.tiny
    },

    infoLabel: {
      fontSize: theme.typography.fontSize.small,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5
    },

    infoValue: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.regular,
      color: theme.colors.text,
      lineHeight: theme.typography.lineHeight.medium
    },

    expandButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.small,
      paddingVertical: theme.spacing.medium,
      borderTopWidth: theme.borderWidth.hairline,
      borderTopColor: theme.colors.border,
      marginTop: theme.spacing.small
    },

    expandButtonText: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.primary
    },

    downloadButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.medium,
      marginTop: theme.spacing.medium,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
      overflow: 'hidden'
    },

    downloadButtonDisabled: {
      opacity: 0.9
    },

    downloadButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.small,
      paddingVertical: theme.spacing.medium,
      paddingHorizontal: theme.spacing.large
    },

    downloadTextContainer: {
      flexDirection: 'column',
      alignItems: 'flex-start'
    },

    downloadButtonText: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.textOnPrimary
    },

    downloadProgressText: {
      fontSize: theme.typography.fontSize.small,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.textOnPrimary,
      opacity: 0.9
    },

    progressBarContainer: {
      height: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      width: '100%'
    },

    progressBar: {
      height: '100%',
      borderRadius: 2
    },

    mapSection: {
      marginHorizontal: theme.spacing.medium,
      marginBottom: theme.spacing.medium,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.large,
      overflow: 'hidden',
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3
    },

    mapHeader: {
      padding: theme.spacing.large,
      borderBottomWidth: theme.borderWidth.hairline,
      borderBottomColor: theme.colors.border
    },

    mapTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.medium
    },

    mapTitleTextContainer: {
      flex: 1,
      gap: theme.spacing.tiny
    },

    mapTitle: {
      fontSize: theme.typography.fontSize.large,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text
    },

    mapSubtitle: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.textSecondary
    },

    mapContainer: {
      backgroundColor: theme.colors.surfaceVariant
    },

    mapWrapper: {
      marginBottom: 0
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
