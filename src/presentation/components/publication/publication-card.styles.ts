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

    presentationCard: {
      marginHorizontal: theme.spacing.large,
      borderRadius: 24,
      ...createForestShadow(4, theme)
    },

    imageContainer: {
      borderTopLeftRadius: 19,
      borderTopRightRadius: 19,
      overflow: 'hidden',
      backgroundColor: theme.colors.surfaceVariant,
      height: 200
    },

    cardContent: {
      padding: 20,
      backgroundColor: theme.colors.surface,
      flex: 1
    },

    contentContainer: {
      gap: 12
    },

    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: theme.spacing.small,
      marginBottom: theme.spacing.tiny
    },

    titleText: {
      fontSize: 19,
      fontWeight: '800',
      color: theme.colors.text,
      flex: 1,
      lineHeight: 26,
      letterSpacing: -0.3,
      marginBottom: 4
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
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '400',
      color: theme.colors.textSecondary,
      marginBottom: 8,
      letterSpacing: 0.1
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
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1.5,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      minHeight: 28,
      backgroundColor: theme.colors.surface
    },

    statusBadgeIcon: {
      marginRight: 2
    },

    statusBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.4
    },

    statusRowsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.small,
      flexWrap: 'wrap'
    },

    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 7,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 6,
      alignSelf: 'flex-start'
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
      paddingVertical: 14,
      borderRadius: 14,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      minHeight: 48,
      elevation: 4,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 8
    },

    rejectButton: {
      backgroundColor: theme.colors.error,
      shadowColor: theme.colors.error
    },

    approveButton: {
      backgroundColor: theme.colors.forest,
      shadowColor: theme.colors.forest
    },

    disabledButton: {
      opacity: 0.5
    },

    buttonIcon: {
      marginRight: 0
    },

    buttonText: {
      color: theme.colors.textOnPrimary,
      fontWeight: '700',
      fontSize: 16,
      letterSpacing: 0.3
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
      borderRadius: 20,
      gap: theme.spacing.medium,
      minWidth: 150,
      ...createForestShadow(6, theme)
    },

    processingText: {
      fontWeight: theme.typography.fontWeight.bold,
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.text,
      letterSpacing: 0.3,
      textAlign: 'center'
    }
  });
