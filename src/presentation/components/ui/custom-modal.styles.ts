import { StyleSheet } from 'react-native';
import { Theme } from '@/presentation/contexts/theme.context';

export const createModalStyles = (theme: Theme, width: number) =>
  StyleSheet.create({
    modal: {
      margin: theme.spacing.medium,
      alignItems: 'center',
      justifyContent: 'center'
    },
    modalFull: {
      margin: 0
    },
    modalContent: {
      backgroundColor: theme.colors.modalBackground,
      borderRadius: theme.borderRadius.xlarge,
      width: '100%',
      maxHeight: '85%',
      overflow: 'hidden',
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 12
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.large,
      paddingTop: theme.spacing.large,
      paddingBottom: theme.spacing.medium,
      borderBottomWidth: theme.borderWidths.hairline,
      borderBottomColor: theme.colors.divider
    },
    headerWithoutBorder: {
      borderBottomWidth: 0,
      paddingBottom: theme.spacing.large
    },
    title: {
      fontSize: theme.typography.fontSize.xlarge,
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: theme.typography.lineHeight.xlarge,
      color: theme.colors.text,
      flex: 1,
      marginRight: theme.spacing.medium,
      letterSpacing: -0.5,
      maxWidth: '100%'
    },
    closeButton: {
      width: theme.spacing.xlarge,
      height: theme.spacing.xlarge,
      borderRadius: theme.borderRadius.medium,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceVariant
    },
    closeButtonPressed: {
      opacity: 0.7,
      transform: [{ scale: 0.95 }]
    },
    closeButtonDisabled: {
      opacity: 0.4,
      backgroundColor: theme.colors.disabled
    },
    closeButtonIcon: {
      fontSize: theme.typography.fontSize.xlarge,
      color: theme.colors.textSecondary,
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: theme.typography.fontSize.xlarge
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
      maxHeight: theme.spacing.xxlarge * 10.5
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
    description: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.regular,
      lineHeight: theme.typography.lineHeight.large,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      letterSpacing: 0.2,
      maxWidth: '100%',
      width: '100%'
    },

    inputContainer: {
      width: '100%',
      maxWidth: '100%'
    },
    textAreaWrapper: {
      height: 140,
      width: width - theme.spacing.medium * 5
    },
    label: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.medium,
      lineHeight: theme.typography.lineHeight.medium,
      color: theme.colors.text,
      marginBottom: theme.spacing.small,
      letterSpacing: 0.1,
      maxWidth: '100%'
    },
    input: {
      width: '100%',
      maxWidth: '100%',
      borderWidth: theme.borderWidths.small,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.medium,
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.medium,
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.regular,
      lineHeight: theme.typography.lineHeight.large,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
      minHeight: theme.spacing.xxlarge
    },
    inputFocused: {
      borderColor: theme.colors.primary,
      borderWidth: theme.borderWidths.small,
      backgroundColor: theme.colors.modalBackground,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2
    },
    inputDisabled: {
      backgroundColor: theme.colors.disabled,
      opacity: 0.6,
      borderColor: theme.colors.border,
      color: theme.colors.textSecondary
    },
    textArea: {
      height: '100%',
      width: '100%',
      flex: 1
    },
    inputDescription: {
      fontSize: theme.typography.fontSize.small,
      fontWeight: theme.typography.fontWeight.regular,
      lineHeight: theme.typography.lineHeight.small,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.tiny,
      letterSpacing: 0.1,
      maxWidth: '100%'
    },
    characterCount: {
      fontSize: theme.typography.fontSize.small,
      fontWeight: theme.typography.fontWeight.medium,
      lineHeight: theme.typography.lineHeight.small,
      color: theme.colors.textSecondary,
      textAlign: 'right',
      marginTop: theme.spacing.tiny,
      maxWidth: '100%'
    },
    characterCountWarning: {
      color: theme.colors.warning
    },
    characterCountError: {
      color: theme.colors.error
    },

    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.large,
      paddingTop: theme.spacing.medium,
      paddingBottom: theme.spacing.large,
      borderTopWidth: theme.borderWidths.hairline,
      borderTopColor: theme.colors.divider,
      gap: theme.spacing.medium,
      backgroundColor: theme.colors.surfaceVariant,
      width: '100%',
      maxWidth: '100%'
    },
    footerWithoutBorder: {
      borderTopWidth: 0,
      backgroundColor: 'transparent'
    },
    footerEnd: {
      justifyContent: 'flex-end'
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
      paddingHorizontal: theme.spacing.large,
      borderRadius: theme.borderRadius.medium,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: theme.spacing.xlarge * 3,
      minHeight: theme.spacing.xlarge + theme.spacing.medium,
      flex: 1,
      maxWidth: '100%'
    },
    buttonPrimary: {
      backgroundColor: theme.colors.primaryButton,
      shadowColor: theme.colors.primaryButton,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3
    },
    buttonSecondary: {
      backgroundColor: theme.colors.secondaryButton,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2
    },
    buttonDanger: {
      backgroundColor: theme.colors.error,
      shadowColor: theme.colors.error,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3
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
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.small
    },
    buttonText: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.medium,
      lineHeight: theme.typography.lineHeight.medium,
      letterSpacing: 0.2,
      flexShrink: 1,
      textAlign: 'center'
    },
    buttonTextPrimary: {
      color: theme.colors.primaryButtonText,
      fontWeight: theme.typography.fontWeight.bold
    },
    buttonTextSecondary: {
      color: theme.colors.secondaryButtonText,
      fontWeight: theme.typography.fontWeight.bold
    },
    buttonTextDanger: {
      color: '#FFFFFF',
      fontWeight: theme.typography.fontWeight.bold
    },
    buttonTextOutline: {
      color: theme.colors.text,
      fontWeight: theme.typography.fontWeight.medium
    },

    loadingIndicator: {
      marginLeft: theme.spacing.small
    }
  });
