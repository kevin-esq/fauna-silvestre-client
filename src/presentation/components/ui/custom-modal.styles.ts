import { StyleSheet } from 'react-native';
import { Theme } from '@/presentation/contexts/theme.context';

export const createModalStyles = (theme: Theme) =>
  StyleSheet.create({
    modalContent: {
      backgroundColor: theme.modalBackground,
      borderRadius: theme.borderRadius.xlarge,
      width: '100%',
      maxHeight: '85%',
      overflow: 'hidden',
      ...(theme.shadows.large && {
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 12
      })
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.large,
      paddingTop: theme.spacing.large,
      paddingBottom: theme.spacing.medium,
      borderBottomWidth: theme.borderWidth.hairline,
      borderBottomColor: theme.colors.divider
    },
    headerWithoutBorder: {
      borderBottomWidth: 0,
      paddingBottom: theme.spacing.large
    },
    title: {
      fontSize: theme.typography.fontSize.xlarge,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.textOnModalBackground,
      flex: 1,
      marginRight: theme.spacing.medium,
      letterSpacing: -0.5
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: theme.borderRadius.large,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceVariant
    },
    closeButtonPressable: {
      opacity: 0.7,
      transform: [{ scale: 0.95 }]
    },
    closeButtonIcon: {
      fontSize: 18,
      color: theme.colors.textSecondary,
      fontWeight: '600'
    },

    body: {
      width: '100%',
      flexGrow: 1,
      flexShrink: 1,
      overflow: 'hidden',
      paddingHorizontal: theme.spacing.large,
      paddingVertical: theme.spacing.large
    },
    bodyNoPadding: {
      padding: 0
    },
    bodyScrollable: {
      maxHeight: 500
    },
    contentCentered: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    iconContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.medium,
      paddingTop: theme.spacing.tiny
    },

    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingHorizontal: theme.spacing.large,
      paddingTop: theme.spacing.medium,
      paddingBottom: theme.spacing.large,
      borderTopWidth: theme.borderWidth.hairline,
      borderTopColor: theme.colors.divider,
      gap: theme.spacing.medium,
      backgroundColor: theme.colors.surfaceVariant
    },
    footerWithoutBorder: {
      borderTopWidth: 0,
      backgroundColor: 'transparent'
    },
    footerCenter: {
      justifyContent: 'center'
    },
    footerStart: {
      justifyContent: 'flex-start'
    },
    footerSpaceBetween: {
      justifyContent: 'space-between'
    },

    button: {
      paddingVertical: theme.spacing.medium,
      paddingHorizontal: theme.spacing.large + theme.spacing.small,
      borderRadius: theme.borderRadius.medium,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 100,
      minHeight: 44
    },
    buttonPrimary: {
      backgroundColor: theme.primaryButton,
      ...(theme.shadows.small && {
        shadowColor: theme.primaryButton,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3
      })
    },
    buttonSecondary: {
      backgroundColor: theme.secondaryButton,
      ...(theme.shadows.small && {
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
      })
    },
    buttonDanger: {
      backgroundColor: theme.colors.error,
      ...(theme.shadows.small && {
        shadowColor: theme.colors.error,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3
      })
    },
    buttonOutline: {
      backgroundColor: 'transparent',
      borderWidth: theme.borderWidths.small,
      borderColor: theme.colors.border
    },
    buttonPressed: {
      transform: [{ scale: 0.97 }],
      opacity: 0.9
    },
    buttonDisabled: {
      opacity: 0.5
    },
    buttonText: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.medium,
      letterSpacing: 0.2
    },
    buttonTextPrimary: {
      color: theme.textOnPrimaryButton
    },
    buttonTextSecondary: {
      color: theme.textOnSecondaryButton
    },
    buttonTextDanger: {
      color: '#FFFFFF'
    },
    buttonTextOutline: {
      color: theme.textOnModalBackground
    },

    input: {
      borderWidth: theme.borderWidths.small,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.medium,
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.medium,
      fontSize: theme.typography.fontSize.medium,
      color: theme.textOnModalBackground,
      backgroundColor: theme.colors.surface,
      minHeight: 48,
      width: '100%',
      maxWidth: '100%',
      flexShrink: 1,
      overflow: 'hidden'
    },
    inputFocused: {
      borderColor: theme.colors.primary,
      borderWidth: theme.borderWidths.small,
      backgroundColor: theme.modalBackground,
      ...(theme.shadows.small && {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2
      })
    },
    inputError: {
      borderColor: theme.colors.error,
      borderWidth: theme.borderWidths.small
    },
    textArea: {
      minHeight: 120,
      textAlignVertical: 'top',
      paddingTop: theme.spacing.medium
    },
    label: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.textOnModalBackground,
      marginBottom: theme.spacing.small,
      letterSpacing: 0.1
    },
    description: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.tiny,
      lineHeight: theme.typography.lineHeight.large,
      textAlign: 'center',
      letterSpacing: 0.2
    },
    errorText: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.error,
      marginTop: theme.spacing.tiny,
      lineHeight: theme.typography.lineHeight.small
    },

    characterCount: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.textSecondary,
      textAlign: 'right',
      marginTop: theme.spacing.tiny,
      fontWeight: theme.typography.fontWeight.medium
    },
    characterCountWarning: {
      color: theme.colors.warning
    },
    characterCountError: {
      color: theme.colors.error
    },

    loadingIndicator: {
      marginLeft: theme.spacing.small
    },
    divider: {
      height: theme.borderWidth.hairline,
      backgroundColor: theme.colors.divider,
      marginVertical: theme.spacing.medium
    }
  });
