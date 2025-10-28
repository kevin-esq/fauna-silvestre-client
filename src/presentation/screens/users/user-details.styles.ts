import { Theme } from '@/presentation/contexts/theme.context';
import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';

export const createStyles = (theme: Theme, insets?: EdgeInsets) => {
  const { colors, spacing, borderRadius, typography } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: insets?.top || 0
    },

    scrollContent: {
      paddingBottom: (insets?.bottom || 0) + spacing.large
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.medium,
      paddingVertical: spacing.small,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },

    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: borderRadius.medium,
      backgroundColor: colors.surfaceVariant
    },

    headerTitle: {
      flex: 1,
      marginLeft: spacing.small,
      fontSize: typography.fontSize.xlarge,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
      lineHeight: typography.lineHeight.xlarge
    },

    userHeaderSection: {
      backgroundColor: colors.surface,
      padding: spacing.large,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },

    avatarContainer: {
      position: 'relative',
      marginBottom: spacing.medium
    },

    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.forest,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6
    },

    roleBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.secondary,
      paddingHorizontal: spacing.small,
      paddingVertical: spacing.tiny,
      borderRadius: borderRadius.medium,
      borderWidth: 2,
      borderColor: colors.surface
    },

    roleText: {
      fontSize: typography.fontSize.small,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
      lineHeight: typography.lineHeight.small
    },

    userName: {
      fontSize: typography.fontSize.xxlarge,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.tiny,
      lineHeight: typography.lineHeight.xxlarge
    },

    userEmail: {
      fontSize: typography.fontSize.medium,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: typography.lineHeight.medium
    },

    contentSection: {
      padding: spacing.medium
    },

    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.large,
      padding: spacing.medium,
      marginBottom: spacing.small,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border
    },

    infoIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.small
    },

    infoContent: {
      flex: 1
    },

    infoLabel: {
      fontSize: typography.fontSize.small,
      color: colors.textSecondary,
      marginBottom: 2,
      lineHeight: typography.lineHeight.small
    },

    infoValue: {
      fontSize: typography.fontSize.large,
      fontWeight: typography.fontWeight.medium,
      color: colors.text,
      lineHeight: typography.lineHeight.large
    },

    sectionHeader: {
      marginBottom: spacing.medium,
      marginTop: spacing.large
    },

    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.small
    },

    sectionTitle: {
      fontSize: typography.fontSize.xlarge,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
      lineHeight: typography.lineHeight.xlarge
    },

    sectionSubtitle: {
      fontSize: typography.fontSize.medium,
      color: colors.textSecondary,
      marginTop: spacing.tiny,
      marginLeft: spacing.xlarge,
      lineHeight: typography.lineHeight.medium
    },

    comingSoonCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.large,
      padding: spacing.large,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed'
    },

    comingSoonIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.small
    },

    comingSoonTitle: {
      fontSize: typography.fontSize.large,
      fontWeight: typography.fontWeight.medium,
      color: colors.text,
      marginBottom: spacing.tiny,
      lineHeight: typography.lineHeight.large
    },

    comingSoonMessage: {
      fontSize: typography.fontSize.medium,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: typography.lineHeight.medium
    },

    actionButtonsContainer: {
      paddingHorizontal: spacing.medium,
      paddingVertical: spacing.large,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },

    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.medium,
      borderRadius: borderRadius.medium,
      gap: spacing.small,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
    },

    deactivateButton: {
      backgroundColor: colors.error
    },

    actionButtonText: {
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.medium,
      color: colors.textOnPrimary,
      lineHeight: typography.lineHeight.medium
    }
  });
};
