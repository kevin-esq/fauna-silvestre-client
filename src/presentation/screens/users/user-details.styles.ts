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
      flexDirection: 'row',
      gap: spacing.medium,
      paddingHorizontal: spacing.medium,
      paddingVertical: spacing.large,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },

    actionButton: {
      flex: 1,
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

    editButton: {
      backgroundColor: colors.water
    },

    blockButton: {
      backgroundColor: colors.error
    },

    actionButtonText: {
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.medium,
      color: colors.textOnPrimary,
      lineHeight: typography.lineHeight.medium
    },

    statusTabsContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.small,
      paddingVertical: spacing.small,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: spacing.small
    },

    statusTab: {
      flex: 1,
      paddingVertical: spacing.small,
      paddingHorizontal: spacing.medium,
      borderRadius: borderRadius.medium,
      alignItems: 'center',
      justifyContent: 'center'
    },

    statusTabActive: {
      backgroundColor: colors.forest
    },

    statusTabInactive: {
      backgroundColor: colors.surfaceVariant
    },

    statusTabText: {
      fontSize: typography.fontSize.small,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.small
    },

    statusTabTextActive: {
      color: colors.textOnPrimary
    },

    statusTabTextInactive: {
      color: colors.textSecondary
    },

    statusBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: spacing.tiny,
      paddingHorizontal: spacing.tiny
    },

    statusBadgeActive: {
      backgroundColor: colors.textOnPrimary + '30'
    },

    statusBadgeInactive: {
      backgroundColor: colors.forest + '20'
    },

    statusBadgeText: {
      fontSize: 10,
      fontWeight: typography.fontWeight.bold
    },

    statusBadgeTextActive: {
      color: colors.textOnPrimary
    },

    statusBadgeTextInactive: {
      color: colors.forest
    },

    publicationsContainer: {
      flex: 1,
      backgroundColor: colors.background
    },

    publicationsListContainer: {
      paddingTop: spacing.small
    },

    publicationCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.large,
      padding: spacing.medium,
      marginHorizontal: spacing.medium,
      marginBottom: spacing.small,
      borderLeftWidth: 4,
      borderLeftColor: colors.forest,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
    },

    publicationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.small
    },

    publicationTitle: {
      fontSize: typography.fontSize.large,
      fontWeight: typography.fontWeight.medium,
      color: colors.text,
      flex: 1,
      marginRight: spacing.small
    },

    publicationDate: {
      fontSize: typography.fontSize.small,
      color: colors.textSecondary
    },

    publicationDescription: {
      fontSize: typography.fontSize.medium,
      color: colors.textSecondary,
      lineHeight: typography.lineHeight.large,
      marginBottom: spacing.small
    },

    publicationFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.medium
    },

    publicationLocation: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.tiny,
      flex: 1
    },

    publicationLocationText: {
      fontSize: typography.fontSize.small,
      color: colors.earth
    },

    publicationStatusBadge: {
      paddingHorizontal: spacing.small,
      paddingVertical: spacing.tiny,
      borderRadius: borderRadius.small,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.tiny
    },

    statusAccepted: {
      backgroundColor: colors.leaf + '20'
    },

    statusRejected: {
      backgroundColor: colors.error + '20'
    },

    statusPending: {
      backgroundColor: colors.warning + '20'
    },

    publicationStatusText: {
      fontSize: typography.fontSize.small,
      fontWeight: typography.fontWeight.medium
    },

    statusTextAccepted: {
      color: colors.leaf
    },

    statusTextRejected: {
      color: colors.error
    },

    statusTextPending: {
      color: colors.warning
    },

    emptyPublicationsContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing.xxlarge,
      paddingHorizontal: spacing.large
    },

    emptyPublicationsIcon: {
      fontSize: 60,
      marginBottom: spacing.medium
    },

    emptyPublicationsTitle: {
      fontSize: typography.fontSize.large,
      fontWeight: typography.fontWeight.medium,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.small
    },

    emptyPublicationsMessage: {
      fontSize: typography.fontSize.medium,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: typography.lineHeight.large
    }
  });
};
