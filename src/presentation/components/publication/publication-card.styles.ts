import { StyleSheet } from 'react-native';
import { Theme } from '@/presentation/contexts/theme.context';

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

    presentationCard: {
      marginHorizontal: theme.spacing.large,
      borderRadius: theme.borderRadius.xlarge,
      ...createShadow(8, theme, 0.1)
    },

    imageContainer: {
      borderTopLeftRadius: theme.borderRadius.large,
      borderTopRightRadius: theme.borderRadius.large,
      overflow: 'hidden',
      backgroundColor: theme.colors.surfaceVariant
    },

    cardContent: {
      padding: theme.spacing.medium,
      backgroundColor: theme.colors.surface
    },

    contentContainer: {
      gap: theme.spacing.small
    },

    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: theme.spacing.small,
      marginBottom: theme.spacing.tiny
    },

    titleText: {
      fontSize: theme.typography.fontSize.xlarge,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      flex: 1,
      lineHeight: theme.typography.lineHeight.xlarge,
      letterSpacing: -0.5
    },

    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.tiny,
      marginBottom: theme.spacing.tiny
    },

    dateText: {
      fontSize: theme.typography.fontSize.small,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.textSecondary,
      opacity: 0.7,
      letterSpacing: 0.1
    },

    descriptionText: {
      fontSize: theme.typography.fontSize.medium,
      lineHeight: theme.typography.lineHeight.medium,
      fontWeight: theme.typography.fontWeight.regular,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.small
    },

    rejectedReasonContainer: {
      backgroundColor: theme.colors.error + '10',
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.error,
      borderRadius: theme.borderRadius.small,
      padding: theme.spacing.small,
      marginBottom: theme.spacing.small
    },

    rejectedReasonHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.tiny,
      marginBottom: theme.spacing.tiny
    },

    rejectedReasonTitle: {
      fontSize: theme.typography.fontSize.small,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.error,
      letterSpacing: 0.2
    },

    rejectedReasonText: {
      fontSize: theme.typography.fontSize.small,
      lineHeight: theme.typography.lineHeight.small,
      color: theme.colors.textSecondary,
      fontStyle: 'italic'
    },

    statusBadge: {
      paddingHorizontal: theme.spacing.small,
      paddingVertical: theme.spacing.tiny,
      borderRadius: theme.borderRadius.small,
      borderWidth: theme.borderWidths.hairline,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.tiny,
      alignSelf: 'flex-start',
      minHeight: 24
    },

    statusBadgeIcon: {
      marginRight: 2
    },

    statusBadgeText: {
      fontSize: theme.typography.fontSize.small - 1,
      fontWeight: theme.typography.fontWeight.bold,
      textTransform: 'uppercase',
      letterSpacing: 0.5
    },

    statusRowsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.small,
      flexWrap: 'wrap'
    },

    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.small,
      paddingVertical: theme.spacing.tiny,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.small,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.border,
      gap: theme.spacing.tiny
    },

    statusIconContainer: {
      width: 16,
      alignItems: 'center',
      justifyContent: 'center'
    },

    statusText: {
      fontWeight: theme.typography.fontWeight.bold,
      fontSize: theme.typography.fontSize.small,
      letterSpacing: 0.2
    },

    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.medium,
      paddingTop: theme.spacing.medium,
      gap: theme.spacing.small,
      borderTopWidth: theme.borderWidths.hairline,
      borderTopColor: theme.colors.border
    },

    actionButton: {
      flex: 1,
      paddingVertical: theme.spacing.medium,
      borderRadius: theme.borderRadius.medium,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.small,
      minHeight: 44,
      ...createShadow(3, theme, 0.08)
    },

    rejectButton: {
      backgroundColor: theme.colors.error,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.error
    },

    approveButton: {
      backgroundColor: theme.colors.success,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.success
    },

    disabledButton: {
      opacity: 0.5
    },

    buttonIcon: {
      marginRight: 0
    },

    buttonText: {
      color: theme.colors.textOnPrimary,
      fontWeight: theme.typography.fontWeight.bold,
      fontSize: theme.typography.fontSize.medium,
      letterSpacing: 0.5
    },

    processingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: theme.borderRadius.large,
      zIndex: 10
    },

    processingContent: {
      alignItems: 'center',
      padding: theme.spacing.large,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.medium,
      gap: theme.spacing.medium,
      minWidth: 140,
      ...createShadow(8, theme, 0.2)
    },

    processingText: {
      fontWeight: theme.typography.fontWeight.bold,
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.text,
      letterSpacing: 0.3,
      textAlign: 'center'
    }
  });
