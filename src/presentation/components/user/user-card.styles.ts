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
      height: 180,
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

    roleBadge: {
      position: 'absolute',
      top: spacing.small,
      right: spacing.small,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.small,
      paddingVertical: spacing.tiny,
      borderRadius: borderRadius.medium,
      gap: spacing.tiny
    },

    roleBadgeText: {
      fontSize: typography.fontSize.small,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.small,
      color: colors.textOnPrimary
    },

    content: {
      padding: spacing.medium
    },

    header: {
      marginBottom: spacing.small
    },

    name: {
      fontSize: typography.fontSize.large,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
      lineHeight: typography.lineHeight.large,
      marginBottom: spacing.tiny
    },

    username: {
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.regular,
      color: colors.textSecondary,
      lineHeight: typography.lineHeight.medium
    },

    infoContainer: {
      marginTop: spacing.small,
      gap: spacing.small
    },

    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.small
    },

    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center'
    },

    infoText: {
      flex: 1,
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.regular,
      color: colors.text,
      lineHeight: typography.lineHeight.medium
    },

    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.medium,
      paddingTop: spacing.medium,
      borderTopWidth: 1,
      borderTopColor: colors.divider
    },

    statsContainer: {
      flexDirection: 'row',
      gap: spacing.medium
    },

    statItem: {
      alignItems: 'center'
    },

    statValue: {
      fontSize: typography.fontSize.large,
      fontWeight: typography.fontWeight.bold,
      color: colors.forest,
      lineHeight: typography.lineHeight.large
    },

    statLabel: {
      fontSize: typography.fontSize.small,
      fontWeight: typography.fontWeight.regular,
      color: colors.textSecondary,
      lineHeight: typography.lineHeight.small
    },

    viewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.medium,
      paddingVertical: spacing.small,
      borderRadius: borderRadius.medium,
      backgroundColor: colors.forest,
      gap: spacing.tiny
    },

    viewButtonText: {
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.medium,
      color: colors.textOnPrimary,
      lineHeight: typography.lineHeight.medium
    }
  });
};
