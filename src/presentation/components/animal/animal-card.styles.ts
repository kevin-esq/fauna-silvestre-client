import { StyleSheet } from 'react-native';
import { Theme } from '../../contexts/theme.context';

const createShadow = (elevation: number, theme: Theme, opacity = 0.08) => ({
  shadowColor: theme.colors.shadow,
  shadowOffset: {
    width: 0,
    height: Math.max(1, elevation / 2)
  },
  shadowOpacity: Math.min(0.3, opacity + elevation * 0.01),
  shadowRadius: Math.max(3, elevation * 1.2),
  elevation: elevation + 1
});

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.large,
      overflow: 'hidden',
      marginBottom: theme.spacing.medium,
      marginHorizontal: theme.spacing.small,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.border,
      ...createShadow(4, theme, 0.06)
    },

    imageContainer: {
      height: 200,
      position: 'relative',
      backgroundColor: theme.colors.surfaceVariant,
      overflow: 'hidden'
    },

    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover'
    },

    emptyImageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
      margin: theme.spacing.medium
    },

    emptyImageText: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.placeholder,
      marginTop: theme.spacing.small,
      fontWeight: theme.typography.fontWeight.medium
    },

    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'center',
      alignItems: 'center'
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
      borderColor: theme.colors.primary,
      gap: theme.spacing.tiny
    },

    retryButtonText: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.primary,
      fontWeight: theme.typography.fontWeight.bold
    },

    categoryBadge: {
      position: 'absolute',
      top: theme.spacing.medium,
      right: theme.spacing.medium,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small,
      borderRadius: theme.borderRadius.medium,
      borderWidth: theme.borderWidths.hairline,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      ...createShadow(3, theme, 0.15)
    },

    categoryBadgeText: {
      color: theme.colors.textOnPrimary,
      fontSize: theme.typography.fontSize.small,
      fontWeight: theme.typography.fontWeight.bold,
      textTransform: 'uppercase',
      letterSpacing: 0.8
    },

    content: {
      padding: theme.spacing.medium,
      gap: theme.spacing.small
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: theme.spacing.small,
      marginBottom: theme.spacing.tiny
    },

    titleContainer: {
      flex: 1,
      gap: theme.spacing.tiny
    },

    title: {
      fontSize: theme.typography.fontSize.xlarge,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      letterSpacing: -0.5,
      lineHeight: theme.typography.lineHeight.xlarge
    },

    specieContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.tiny,
      paddingHorizontal: theme.spacing.small,
      paddingVertical: 2,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.small,
      alignSelf: 'flex-start'
    },

    specie: {
      fontSize: theme.typography.fontSize.small,
      fontStyle: 'italic',
      color: theme.colors.forest,
      fontWeight: theme.typography.fontWeight.medium
    },

    actionsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.small
    },

    actionButton: {
      width: 51,
      height: 51,
      borderRadius: theme.borderRadius.xlarge,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      ...createShadow(2, theme, 0.08)
    },

    editButton: {
      backgroundColor: theme.colors.water,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.border
    },

    imageButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.primary
    },

    deleteButton: {
      backgroundColor: theme.colors.error,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.border
    },

    description: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.textSecondary,
      lineHeight: theme.typography.lineHeight.medium,
      fontWeight: theme.typography.fontWeight.regular
    },

    metadataRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: theme.spacing.small,
      borderTopWidth: theme.borderWidths.hairline,
      borderTopColor: theme.colors.border
    },

    metadataItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.tiny,
      flex: 1,
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: theme.spacing.small,
      paddingVertical: theme.spacing.tiny,
      borderRadius: theme.borderRadius.small,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.border,
      marginRight: theme.spacing.small
    },

    metadataText: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.textSecondary,
      fontWeight: theme.typography.fontWeight.medium,
      flex: 1
    },

    idBadge: {
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: theme.spacing.small,
      paddingVertical: theme.spacing.tiny,
      borderRadius: theme.borderRadius.small,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.border
    },

    idText: {
      fontSize: theme.typography.fontSize.small - 1,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
      letterSpacing: 0.5,
      textTransform: 'uppercase'
    },

    infoChipsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.small,
      flexWrap: 'wrap'
    },

    infoChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.tiny,
      paddingHorizontal: theme.spacing.small,
      paddingVertical: theme.spacing.tiny,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.small,
      borderWidth: theme.borderWidths.hairline,
      ...createShadow(1, theme, 0.04)
    },

    infoChipText: {
      fontSize: theme.typography.fontSize.small,
      fontWeight: theme.typography.fontWeight.bold,
      letterSpacing: 0.2
    }
  });
