import { StyleSheet } from 'react-native';
import { Theme } from '../../contexts/theme.context';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      gap: theme.spacing.medium
    },
    loadingText: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.textSecondary
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.medium,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border
    },
    backButton: {
      padding: theme.spacing.small
    },
    headerTitle: {
      fontSize: theme.typography.fontSize.large,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text
    },
    headerSpacer: {
      width: 40
    },
    scrollView: {
      flex: 1
    },
    scrollContent: {
      padding: theme.spacing.medium,
      paddingBottom: theme.spacing.xlarge
    },
    imageContainer: {
      width: '100%',
      height: 300,
      borderRadius: theme.borderRadius.large,
      overflow: 'hidden',
      marginBottom: theme.spacing.large,
      backgroundColor: theme.colors.border
    },
    image: {
      width: '100%',
      height: '100%'
    },
    section: {
      marginBottom: theme.spacing.large
    },
    label: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text,
      marginBottom: theme.spacing.small
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.medium,
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small + 4,
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    textArea: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.medium,
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.medium,
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minHeight: 120,
      textAlignVertical: 'top'
    },
    charCount: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.textSecondary,
      textAlign: 'right',
      marginTop: theme.spacing.tiny
    },
    stateButtons: {
      flexDirection: 'row',
      gap: theme.spacing.small
    },
    stateButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.small,
      paddingVertical: theme.spacing.medium,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.medium,
      borderWidth: 2,
      borderColor: theme.colors.border
    },
    stateButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary
    },
    stateButtonText: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text
    },
    stateButtonTextActive: {
      color: theme.colors.background
    },
    locationInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.small,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.medium,
      borderRadius: theme.borderRadius.medium,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    locationText: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.text,
      flex: 1
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.small,
      padding: theme.spacing.medium,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.small,
      paddingVertical: theme.spacing.medium,
      borderRadius: theme.borderRadius.medium,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2
    },
    saveButton: {
      backgroundColor: theme.colors.water
    },
    submitButton: {
      backgroundColor: theme.colors.primary
    },
    buttonText: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.background
    }
  });
