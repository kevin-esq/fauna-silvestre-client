import { StyleSheet } from 'react-native';
import { Theme } from '../../contexts/theme.context';

const createShadow = (elevation: number, theme: Theme) => ({
  shadowColor: theme.colors.shadow,
  shadowOffset: {
    width: 0,
    height: elevation / 2
  },
  shadowOpacity: 0.1 + elevation * 0.02,
  shadowRadius: elevation,
  elevation
});

export const createStyles = (
  theme: Theme,
  insets: { top: number; bottom: number }
) =>
  StyleSheet.create({
    container: {
      top: insets.top,
      bottom: insets.bottom,
      flex: 1,
      backgroundColor: theme.colors.background
    },
    keyboardAvoid: {
      flex: 1
    },
    scrollView: {
      flex: 1
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.large,
      paddingBottom: theme.spacing.xxlarge
    },
    bottomSpacer: {
      height: 100
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.large,
      paddingVertical: theme.spacing.medium,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: theme.borderWidth.hairline,
      borderBottomColor: theme.colors.border,
      ...createShadow(2, theme)
    },
    headerTitle: {
      fontSize: theme.typography.fontSize.xlarge,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      flex: 1,
      textAlign: 'center',
      marginHorizontal: theme.spacing.medium
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: theme.borderRadius.large,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant
    },
    saveButton: {
      width: 44,
      height: 44,
      borderRadius: theme.borderRadius.large,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      ...createShadow(4, theme)
    },
    saveButtonDisabled: {
      backgroundColor: theme.colors.disabled,
      opacity: 0.6
    },

    sectionContainer: {
      marginTop: theme.spacing.xlarge,
      marginBottom: theme.spacing.large
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.large,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
      marginBottom: theme.spacing.medium,
      paddingBottom: theme.spacing.small,
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.primaryLight,
      flex: 1
    },

    fieldContainer: {
      marginBottom: theme.spacing.large
    },
    fieldLabel: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text,
      marginBottom: theme.spacing.small
    },
    requiredMark: {
      color: theme.colors.error,
      fontWeight: theme.typography.fontWeight.bold
    },
    textInput: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.medium,
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.medium,
      minHeight: 48,
      ...createShadow(1, theme)
    },
    textInputMultiline: {
      minHeight: 100,
      textAlignVertical: 'top',
      paddingTop: theme.spacing.medium
    },
    textInputError: {
      borderColor: theme.colors.error,
      borderWidth: 2
    },
    errorText: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.error,
      marginTop: theme.spacing.tiny,
      marginLeft: theme.spacing.small,
      fontWeight: theme.typography.fontWeight.medium
    },
    characterCount: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.textSecondary,
      textAlign: 'right',
      marginTop: theme.spacing.tiny
    },

    imageSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.medium,
      paddingVertical: theme.spacing.large,
      paddingHorizontal: theme.spacing.xlarge,
      marginBottom: theme.spacing.medium,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed'
    },
    imageSelectorText: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.primary,
      marginLeft: theme.spacing.medium,
      fontWeight: theme.typography.fontWeight.medium
    },

    imagePreviewContainer: {
      position: 'relative',
      alignItems: 'center',
      marginBottom: theme.spacing.medium,
      marginTop: theme.spacing.small
    },
    imagePreview: {
      width: 200,
      height: 200,
      borderRadius: theme.borderRadius.large,
      backgroundColor: theme.colors.surfaceVariant,
      ...createShadow(4, theme)
    },
    removeImageButton: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      ...createShadow(4, theme)
    },
    imageSelectionContainer: {
      alignItems: 'center',
      padding: theme.spacing.xlarge,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.large,
      backgroundColor: theme.colors.surfaceVariant
    },
    imageSelectionText: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.large
    },
    imageButtonsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.medium,
      marginTop: theme.spacing.small
    },
    cameraButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.forest,
      paddingHorizontal: theme.spacing.large,
      paddingVertical: theme.spacing.medium,
      borderRadius: theme.borderRadius.large,
      gap: theme.spacing.small,
      ...createShadow(3, theme)
    },
    cameraButtonText: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.textOnPrimary
    },
    galleryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.forest,
      paddingHorizontal: theme.spacing.large,
      paddingVertical: theme.spacing.medium,
      borderRadius: theme.borderRadius.large,
      gap: theme.spacing.small,
      ...createShadow(2, theme)
    },
    galleryButtonText: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.forest
    },

    classSelectorContainer: {
      marginBottom: theme.spacing.large,
      padding: theme.spacing.large,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.large,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.border,
      ...createShadow(2, theme)
    },
    classSelectorLabel: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      flex: 1
    },
    classSelectorSubtext: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.medium
    },
    classOptionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: theme.spacing.small
    },
    classOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.medium,
      paddingHorizontal: theme.spacing.medium,
      borderRadius: theme.borderRadius.medium,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      flex: 1,
      minWidth: '48%',
      ...createShadow(1, theme)
    },
    classOptionSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      borderWidth: 2,
      ...createShadow(3, theme)
    },
    classIcon: {
      fontSize: theme.typography.fontSize.large,
      marginRight: theme.spacing.small
    },
    classLabel: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text,
      flex: 1
    },
    classLabelSelected: {
      color: theme.colors.textOnPrimary,
      fontWeight: theme.typography.fontWeight.bold
    },

    previewContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.large,
      marginBottom: theme.spacing.medium,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      ...createShadow(2, theme)
    },
    previewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.medium
    },
    previewTitle: {
      fontSize: theme.typography.fontSize.large,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.forest
    },
    layoutSelector: {
      flexDirection: 'row',
      gap: theme.spacing.tiny,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.medium,
      padding: theme.spacing.tiny
    },
    layoutButton: {
      width: 36,
      height: 36,
      borderRadius: theme.borderRadius.small,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent'
    },
    layoutButtonActive: {
      backgroundColor: theme.colors.primary
    },
    previewNote: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.water,
      textAlign: 'center',
      marginTop: theme.spacing.medium,
      fontStyle: 'italic'
    },
    previewPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xxlarge,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.large,
      backgroundColor: theme.colors.surfaceVariant
    },
    previewPlaceholderText: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.placeholder,
      textAlign: 'center',
      marginTop: theme.spacing.small,
      fontWeight: theme.typography.fontWeight.regular
    }
  });
