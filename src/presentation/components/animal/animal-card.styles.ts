import { StyleSheet } from 'react-native';
import { Theme } from '../../contexts/theme.context';

// Función mejorada para sombras con mejor rendimiento
const createNatureShadow = (
  elevation: number,
  color = '#007A33',
  opacity = 0.15
) => ({
  shadowColor: color,
  shadowOffset: {
    width: 0,
    height: Math.max(1, elevation / 2)
  },
  shadowOpacity: Math.min(0.3, opacity + elevation * 0.015),
  shadowRadius: Math.max(1, elevation * 1.2),
  elevation: elevation + 1
});

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    animalCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.large,
      marginVertical: theme.spacing.medium,
      marginHorizontal: theme.spacing.small,
      overflow: 'hidden',
      borderLeftWidth: theme.borderWidths.small,
      borderLeftColor: theme.colors.forest,
      borderBottomWidth: theme.borderWidth.hairline,
      borderBottomColor: theme.colors.surfaceVariant,
      transform: [{ scale: 1 }],
      ...createNatureShadow(6, theme.colors.forest, 0.12)
    },

    animalImageContainer: {
      height: 200,
      position: 'relative',
      backgroundColor: theme.colors.surfaceVariant,
      borderTopLeftRadius: theme.borderRadius.large,
      borderTopRightRadius: theme.borderRadius.large,
      overflow: 'hidden'
    },

    animalImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover'
    },

    animalImagePlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      borderTopLeftRadius: theme.borderRadius.large,
      borderTopRightRadius: theme.borderRadius.large
    },

    animalImageOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: `linear-gradient(transparent, ${theme.colors.forest})`, // Gradiente mejorado
      paddingVertical: theme.spacing.medium,
      paddingHorizontal: theme.spacing.large
    },

    imageOverlayContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },

    overlayAnimalName: {
      color: theme.colors.textOnPrimary,
      flex: 1,
      marginRight: theme.spacing.medium,
      textShadowColor: theme.colors.textSecondary,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2
    },

    imageActions: {
      flexDirection: 'row',
      gap: theme.spacing.small
    },

    overlayActionButton: {
      width: theme.iconSizes.xlarge,
      height: theme.iconSizes.xlarge,
      borderRadius: theme.iconSizes.xlarge / 2,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.textSecondary
    },

    animalImageBadge: {
      position: 'absolute',
      top: theme.spacing.medium,
      right: theme.spacing.medium,
      backgroundColor: theme.colors.leaf,
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small,
      borderRadius: theme.borderRadius.medium,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.textSecondary,
      ...createNatureShadow(3, theme.colors.leaf, 0.2)
    },

    animalImageBadgeText: {
      color: theme.colors.textOnPrimary,
      fontSize: theme.typography.fontSize.small,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      textShadowColor: theme.colors.textSecondary,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 1
    },

    animalCardContent: {
      padding: theme.spacing.large,
      paddingTop: theme.spacing.xlarge,
      backgroundColor: theme.colors.surface
    },

    animalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.large
    },

    animalInfo: {
      flex: 1,
      marginRight: theme.spacing.medium
    },

    animalName: {
      fontSize: theme.typography.fontSize.large,
      fontWeight: '800',
      color: theme.colors.forest,
      marginBottom: theme.spacing.small,
      letterSpacing: -0.3,
      lineHeight: theme.typography.lineHeight.large
    },

    animalSpecies: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.small,
      paddingHorizontal: theme.spacing.small,
      paddingVertical: theme.spacing.tiny,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.small,
      alignSelf: 'flex-start'
    },

    animalSpeciesText: {
      fontSize: theme.typography.fontSize.medium,
      fontStyle: 'italic',
      marginLeft: theme.spacing.small,
      fontWeight: '500',
      lineHeight: theme.typography.lineHeight.medium,
      color: theme.colors.textSecondary
    },

    animalCategoryContainer: {
      alignSelf: 'flex-start'
    },

    animalCategory: {
      fontSize: theme.typography.fontSize.small,
      fontWeight: '600',
      color: theme.colors.leaf,
      textTransform: 'capitalize',
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small,
      borderRadius: theme.borderRadius.medium,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.textSecondary,
      letterSpacing: 0.3
    },

    animalActions: {
      flexDirection: 'row',
      gap: theme.spacing.small,
      alignItems: 'flex-start'
    },

    actionButton: {
      width: theme.iconSizes.xlarge,
      height: theme.iconSizes.xlarge,
      borderRadius: theme.iconSizes.xlarge / 2,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden', // Para ripple effect
      ...createNatureShadow(4, theme.colors.textSecondary, 0.1)
    },

    editButton: {
      backgroundColor: theme.colors.water,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.textSecondary
    },

    imageButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: theme.borderWidths.medium,
      borderColor: theme.colors.forest
    },

    deleteButton: {
      backgroundColor: theme.colors.error,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.textSecondary
    },

    animalDescription: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.textSecondary,
      lineHeight: theme.typography.lineHeight.medium,
      marginBottom: theme.spacing.large,
      fontWeight: '400',
      paddingHorizontal: theme.spacing.small,
      textAlign: 'justify'
    },

    animalMetadata: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.large,
      paddingTop: theme.spacing.medium,
      borderTopWidth: theme.borderWidths.hairline,
      borderTopColor: theme.colors.textSecondary
    },

    animalStats: {
      flex: 1
    },

    animalStatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.small,
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small,
      borderRadius: theme.borderRadius.medium,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.textSecondary
    },

    animalStatText: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.small,
      flex: 1,
      fontWeight: '500',
      lineHeight: theme.typography.lineHeight.small
    },

    animalIdBadge: {
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small,
      borderRadius: theme.borderRadius.large,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.textSecondary,
      ...createNatureShadow(1, theme.colors.forest, 0.05)
    },

    animalIdText: {
      fontSize: theme.typography.fontSize.small,
      fontWeight: '700',
      color: theme.colors.forest,
      letterSpacing: 0.8,
      textTransform: 'uppercase'
    },

    animalInfoChips: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.medium
    },

    infoChip: {
      flex: 1,
      maxWidth: '48%',
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.medium,
      borderRadius: theme.borderRadius.large,
      borderWidth: theme.borderWidths.medium,
      backgroundColor: theme.colors.surface,
      minHeight: theme.iconSizes.large,
      ...createNatureShadow(2, theme.colors.textSecondary, 0.06)
    },

    infoChipEmoji: {
      fontSize: theme.typography.fontSize.large,
      marginRight: theme.spacing.small
    },

    infoChipContent: {
      flex: 1
    },

    infoChipLabel: {
      fontSize: theme.typography.fontSize.small,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
      opacity: 0.8,
      color: theme.colors.textSecondary
    },

    infoChipText: {
      fontSize: theme.typography.fontSize.small,
      fontWeight: '600',
      letterSpacing: 0.2,
      lineHeight: theme.typography.lineHeight.small,
      color: theme.colors.textSecondary
    },

    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: theme.borderRadius.large
    },

    loadingText: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.small,
      fontWeight: '500'
    },

    emptyImageContainer: {
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: theme.borderWidths.medium,
      borderColor: theme.colors.textSecondary,
      borderStyle: 'dashed',
      borderRadius: theme.borderRadius.medium,
      margin: theme.spacing.small
    },

    emptyImageText: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.small,
      fontWeight: '500',
      lineHeight: theme.typography.lineHeight.medium
    },

    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.medium,
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.medium,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.forest
    },

    retryButtonText: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.forest,
      marginLeft: theme.spacing.tiny,
      fontWeight: '600'
    }
  });
