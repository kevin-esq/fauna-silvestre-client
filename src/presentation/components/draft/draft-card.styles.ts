import { StyleSheet } from 'react-native';
import { Theme } from '@/presentation/contexts/theme.context';

export const createStyles = (theme: Theme) => {
  const { colors, spacing, typography, borderRadius } = theme;

  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.large,
      marginHorizontal: spacing.medium,
      marginBottom: spacing.medium,
      overflow: 'hidden',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4
    },
    imageContainer: {
      width: '100%',
      height: 200,
      backgroundColor: colors.surfaceVariant,
      position: 'relative'
    },

    image: {
      width: '100%',
      height: '100%'
    },

    imagePlaceholder: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surfaceVariant
    },
    content: {
      padding: spacing.medium
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.small
    },

    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.small,
      flex: 1
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.tiny,
      paddingHorizontal: spacing.small,
      paddingVertical: spacing.tiny,
      borderRadius: borderRadius.medium
    },

    statusText: {
      fontSize: typography.fontSize.small,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.small
    },
    date: {
      fontSize: typography.fontSize.small,
      fontWeight: typography.fontWeight.regular,
      color: colors.textSecondary,
      lineHeight: typography.lineHeight.small,
      flex: 1
    },
    description: {
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.regular,
      color: colors.text,
      lineHeight: typography.lineHeight.medium,
      marginBottom: spacing.small
    },
    animalInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.tiny,
      marginBottom: spacing.small,
      paddingHorizontal: spacing.small,
      paddingVertical: spacing.tiny,
      backgroundColor: colors.forest + '10',
      borderRadius: borderRadius.small,
      alignSelf: 'flex-start'
    },

    animalName: {
      fontSize: typography.fontSize.small,
      fontWeight: typography.fontWeight.medium,
      color: colors.forest,
      lineHeight: typography.lineHeight.small
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.tiny,
      backgroundColor: colors.error + '10',
      padding: spacing.small,
      borderRadius: borderRadius.medium,
      marginBottom: spacing.small,
      borderWidth: 1,
      borderColor: colors.error + '30'
    },

    errorText: {
      fontSize: typography.fontSize.small,
      fontWeight: typography.fontWeight.regular,
      color: colors.error,
      lineHeight: typography.lineHeight.small,
      flex: 1
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.small,
      marginTop: spacing.medium,
      paddingTop: spacing.small,
      borderTopWidth: 1,
      borderTopColor: colors.divider
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.tiny,
      paddingHorizontal: spacing.medium,
      paddingVertical: spacing.small,
      borderRadius: borderRadius.medium,
      minHeight: 40
    },

    submitButton: {
      backgroundColor: colors.forest,
      flex: 1,
      shadowColor: colors.forest,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3
    },

    submitButtonText: {
      color: colors.textOnPrimary,
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.medium
    },

    deleteButton: {
      backgroundColor: colors.error + '15',
      paddingHorizontal: spacing.medium,
      borderWidth: 1,
      borderColor: colors.error + '30'
    },
    uploadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.small,
      flex: 1,
      paddingHorizontal: spacing.medium
    },

    uploadingText: {
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.medium,
      color: colors.forest,
      lineHeight: typography.lineHeight.medium
    },

    retryButton: {
      backgroundColor: colors.warning + '15',
      borderWidth: 1,
      borderColor: colors.warning + '30'
    }
  });
};
