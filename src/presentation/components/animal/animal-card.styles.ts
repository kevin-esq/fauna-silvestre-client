import { StyleSheet } from 'react-native';
import { Theme } from '../../contexts/theme.context';

const createShadow = (elevation: number, theme: Theme, opacity = 0.15) => ({
  shadowColor: theme.colors.shadow,
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
      borderLeftColor: theme.colors.primary,
      borderBottomWidth: theme.borderWidth.hairline,
      borderBottomColor: theme.colors.border,
      ...createShadow(6, theme, 0.12)
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
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3
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
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: theme.borderWidths.hairline,
      borderColor: 'rgba(255, 255, 255, 0.3)'
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
      borderColor: 'rgba(255, 255, 255, 0.3)',
      ...createShadow(3, theme, 0.2)
    },

    animalImageBadgeText: {
      color: theme.colors.textOnPrimary,
      fontSize: theme.typography.fontSize.small,
      fontWeight: theme.typography.fontWeight.bold,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2
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
      fontWeight: theme.typography.fontWeight.black,
      color: theme.colors.primary,
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
      fontWeight: theme.typography.fontWeight.medium,
      lineHeight: theme.typography.lineHeight.medium,
      color: theme.colors.earth
    },

    animalCategoryContainer: {
      alignSelf: 'flex-start'
    },

    animalCategory: {
      fontSize: theme.typography.fontSize.small,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.leaf,
      textTransform: 'capitalize',
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small,
      borderRadius: theme.borderRadius.medium,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.border,
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
      overflow: 'hidden',
      ...createShadow(4, theme, 0.1)
    },

    editButton: {
      backgroundColor: theme.colors.water,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.border
    },

    imageButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: theme.borderWidths.medium,
      borderColor: theme.colors.primary
    },

    deleteButton: {
      backgroundColor: theme.colors.error,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.border
    },

    animalDescription: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.textSecondary,
      lineHeight: theme.typography.lineHeight.medium,
      marginBottom: theme.spacing.large,
      fontWeight: theme.typography.fontWeight.regular,
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
      borderTopColor: theme.colors.border
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
      borderColor: theme.colors.border
    },

    animalStatText: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.small,
      flex: 1,
      fontWeight: theme.typography.fontWeight.medium,
      lineHeight: theme.typography.lineHeight.small
    },

    animalIdBadge: {
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small,
      borderRadius: theme.borderRadius.large,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.border,
      ...createShadow(1, theme, 0.05)
    },

    animalIdText: {
      fontSize: theme.typography.fontSize.small,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
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
      ...createShadow(2, theme, 0.06)
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
      fontWeight: theme.typography.fontWeight.bold,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
      opacity: 0.8
    },

    infoChipText: {
      fontSize: theme.typography.fontSize.small,
      fontWeight: theme.typography.fontWeight.bold,
      letterSpacing: 0.2,
      lineHeight: theme.typography.lineHeight.small
    },

    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: theme.borderRadius.large
    },

    loadingText: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.text,
      marginTop: theme.spacing.small,
      fontWeight: theme.typography.fontWeight.medium
    },

    emptyImageContainer: {
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: theme.borderWidths.medium,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
      borderRadius: theme.borderRadius.medium,
      margin: theme.spacing.small
    },

    emptyImageText: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.placeholder,
      textAlign: 'center',
      marginTop: theme.spacing.small,
      fontWeight: theme.typography.fontWeight.medium,
      lineHeight: theme.typography.lineHeight.medium
    },

    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.medium,
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.medium,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.primary
    },

    retryButtonText: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.primary,
      marginLeft: theme.spacing.tiny,
      fontWeight: theme.typography.fontWeight.bold
    }
  });
