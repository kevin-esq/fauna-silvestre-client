import { StyleSheet } from 'react-native';
import { Theme } from '@/presentation/contexts/theme.context';

const createForestShadow = (elevation: number, theme: Theme) => ({
  shadowColor: theme.colors.forest,
  shadowOffset: {
    width: 0,
    height: elevation
  },
  shadowOpacity: 0.15,
  shadowRadius: elevation * 2,
  elevation: elevation
});

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      overflow: 'hidden',
      marginBottom: theme.spacing.medium + 4,
      marginHorizontal: theme.spacing.medium,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderLeftWidth: 5,
      borderLeftColor: theme.colors.forest,
      ...createForestShadow(3, theme)
    },

    imageContainer: {
      height: 180,
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
      top: 16,
      right: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.97)',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 18,
      borderWidth: 1.5,
      borderColor: theme.colors.leaf,
      ...createForestShadow(3, theme)
    },

    categoryBadgeText: {
      color: theme.colors.leaf,
      fontSize: 13,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5
    },

    content: {
      padding: 20,
      gap: 12
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
      fontSize: 19,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: -0.3,
      lineHeight: 26
    },

    specieContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: theme.colors.earth + '08',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.earth + '20',
      alignSelf: 'flex-start'
    },

    specie: {
      fontSize: 13,
      fontStyle: 'italic',
      color: theme.colors.earth,
      fontWeight: '600',
      letterSpacing: 0.1
    },

    actionsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.small
    },

    actionButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      ...createForestShadow(2, theme)
    },

    editButton: {
      backgroundColor: theme.colors.water
    },

    imageButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.forest
    },

    deleteButton: {
      backgroundColor: theme.colors.error
    },

    description: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      lineHeight: 22,
      fontWeight: '400',
      letterSpacing: 0.1
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
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 7,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border
    },

    infoChipText: {
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 0.2
    }
  });
