import { StyleSheet } from 'react-native';
import { Theme } from '../../contexts/theme.context';

// Design System Constants
const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32
} as const;

const BORDER_RADIUS = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24
} as const;

const ELEVATION = {
  sm: 2,
  md: 4,
  lg: 6,
  xl: 8,
  xxl: 12
} as const;

const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 24, fontWeight: '600' as const },
  h3: { fontSize: 20, fontWeight: '600' as const },
  body1: { fontSize: 16, fontWeight: '400' as const },
  body2: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  button: { fontSize: 16, fontWeight: '600' as const }
} as const;

// Helper functions
const createShadow = (elevation: number) => ({
  shadowColor: '#000',
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
    // ==================== LAYOUT ====================
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
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.xxxl
    },
    bottomSpacer: {
      height: 100
    },

    // ==================== HEADER ====================
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.secondary,
      ...createShadow(ELEVATION.sm)
    },
    headerTitle: {
      ...TYPOGRAPHY.h2,
      color: theme.colors.text,
      flex: 1,
      textAlign: 'center',
      marginHorizontal: SPACING.lg
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: BORDER_RADIUS.lg,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant
    },
    saveButton: {
      width: 44,
      height: 44,
      borderRadius: BORDER_RADIUS.lg,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      ...createShadow(ELEVATION.md)
    },
    saveButtonDisabled: {
      backgroundColor: theme.colors.disabled,
      opacity: 0.6
    },

    // ==================== FORM SECTIONS ====================
    sectionContainer: {
      marginTop: SPACING.xl,
      marginBottom: SPACING.lg
    },
    sectionTitle: {
      ...TYPOGRAPHY.h3,
      color: theme.colors.primary,
      marginBottom: SPACING.lg,
      paddingBottom: SPACING.sm,
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.primaryLight
    },

    // ==================== FORM FIELDS ====================
    fieldContainer: {
      marginBottom: SPACING.lg
    },
    fieldLabel: {
      ...TYPOGRAPHY.body1,
      color: theme.colors.text,
      marginBottom: SPACING.sm,
      fontWeight: '500'
    },
    requiredMark: {
      color: theme.colors.error,
      fontWeight: '600'
    },
    textInput: {
      ...TYPOGRAPHY.body1,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: BORDER_RADIUS.md,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      minHeight: 48,
      ...createShadow(ELEVATION.sm)
    },
    textInputMultiline: {
      minHeight: 80,
      textAlignVertical: 'top',
      paddingTop: SPACING.md
    },
    textInputError: {
      borderColor: theme.colors.error,
      borderWidth: 2
    },
    errorText: {
      ...TYPOGRAPHY.caption,
      color: theme.colors.error,
      marginTop: SPACING.xs,
      marginLeft: SPACING.sm
    },
    characterCount: {
      ...TYPOGRAPHY.caption,
      color: theme.colors.textSecondary,
      textAlign: 'right',
      marginTop: SPACING.xs
    },

    // ==================== IMAGE SELECTOR ====================
    imageSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: BORDER_RADIUS.md,
      paddingVertical: SPACING.lg,
      paddingHorizontal: SPACING.xl,
      marginBottom: SPACING.md,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed'
    },
    imageSelectorText: {
      ...TYPOGRAPHY.body1,
      color: theme.colors.primary,
      marginLeft: SPACING.md,
      fontWeight: '500'
    },
    imageInput: {
      minHeight: 100,
      fontSize: 12,
      fontFamily: 'monospace'
    },

    // ==================== PREVIEW SECTION ====================
    previewContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.lg,
      marginBottom: SPACING.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      ...createShadow(ELEVATION.sm)
    },
    previewTitle: {
      ...TYPOGRAPHY.h3,
      color: theme.colors.forest,
      textAlign: 'center',
      marginBottom: SPACING.md
    },
    previewNote: {
      ...TYPOGRAPHY.caption,
      color: theme.colors.water,
      textAlign: 'center',
      marginTop: SPACING.md,
      fontStyle: 'italic'
    },
    previewPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.xxl,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: theme.colors.border,
      borderRadius: BORDER_RADIUS.lg,
      backgroundColor: theme.colors.surfaceVariant
    },
    previewPlaceholderText: {
      ...TYPOGRAPHY.body2,
      color: theme.colors.placeholder,
      textAlign: 'center',
      marginTop: SPACING.sm
    },

    // Selección de imagen
    imagePreviewContainer: {
      position: 'relative',
      alignItems: 'center',
      marginBottom: SPACING.md
    },
    imagePreview: {
      width: 200,
      height: 200,
      borderRadius: BORDER_RADIUS.lg,
      backgroundColor: theme.colors.surfaceVariant
    },
    removeImageButton: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      ...createShadow(ELEVATION.sm)
    },
    imageSelectionContainer: {
      alignItems: 'center',
      padding: SPACING.lg,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: theme.colors.border,
      borderRadius: BORDER_RADIUS.lg,
      backgroundColor: theme.colors.surfaceVariant
    },
    imageSelectionText: {
      ...TYPOGRAPHY.body1,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: SPACING.lg
    },
    imageButtonsContainer: {
      flexDirection: 'row',
      gap: SPACING.md
    },
    cameraButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.forest,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderRadius: BORDER_RADIUS.lg,
      gap: SPACING.sm,
      ...createShadow(ELEVATION.sm)
    },
    cameraButtonText: {
      ...TYPOGRAPHY.button,
      color: theme.colors.textOnPrimary
    },
    galleryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.forest,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderRadius: BORDER_RADIUS.lg,
      gap: SPACING.sm,
      ...createShadow(ELEVATION.sm)
    },
    galleryButtonText: {
      ...TYPOGRAPHY.button,
      color: theme.colors.forest
    }
  });
