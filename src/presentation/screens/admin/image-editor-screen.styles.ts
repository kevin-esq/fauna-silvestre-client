import { StyleSheet } from 'react-native';
import { Theme } from '../../contexts/theme.context';
import { EdgeInsets } from 'react-native-safe-area-context';

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

export const createStyles = (theme: Theme, insets?: EdgeInsets) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: insets?.top || 0
    },
    content: {
      flex: 1
    },
    scrollContent: {
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.xxxl + (insets?.bottom || 0)
    },
    bottomSpacer: {
      height: SPACING.xxxl
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      ...createShadow(ELEVATION.sm)
    },
    headerContent: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: SPACING.lg
    },
    headerTitle: {
      ...TYPOGRAPHY.h3,
      color: theme.colors.text
    },
    headerSubtitle: {
      ...TYPOGRAPHY.body2,
      color: theme.colors.textSecondary,
      marginTop: SPACING.xs
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
      backgroundColor: theme.colors.surfaceVariant,
      opacity: 0.6
    },

    sectionTitle: {
      ...TYPOGRAPHY.h3,
      color: theme.colors.primary,
      marginBottom: SPACING.lg,
      paddingBottom: SPACING.sm,
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.primaryLight
    },
    previewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.md
    },
    layoutSelector: {
      flexDirection: 'row',
      gap: SPACING.xs,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.xs
    },
    layoutButton: {
      width: 36,
      height: 36,
      borderRadius: BORDER_RADIUS.sm,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent'
    },
    layoutButtonActive: {
      backgroundColor: theme.colors.primary
    },

    imageEditContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.lg,
      marginTop: SPACING.lg,
      ...createShadow(ELEVATION.sm)
    },
    animalCardContainer: {
      marginBottom: SPACING.lg,
      alignItems: 'center',
      justifyContent: 'center'
    },

    imageControlsContainer: {
      marginBottom: SPACING.lg
    },
    imagePreviewContainer: {
      position: 'relative',
      alignItems: 'center'
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
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      ...createShadow(ELEVATION.md)
    },
    noImageContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      height: 200,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: BORDER_RADIUS.lg,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderStyle: 'dashed'
    },
    noImageText: {
      ...TYPOGRAPHY.body2,
      color: theme.colors.textSecondary,
      marginTop: SPACING.sm
    },

    cameraActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: SPACING.md,
      marginTop: SPACING.lg
    },
    cameraButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.lg,
      paddingHorizontal: SPACING.md,
      backgroundColor: theme.colors.primary,
      borderRadius: BORDER_RADIUS.lg,
      ...createShadow(ELEVATION.md)
    },
    cameraButtonText: {
      ...TYPOGRAPHY.button,
      color: theme.colors.textOnPrimary,
      marginLeft: SPACING.sm
    },
    galleryButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.lg,
      paddingHorizontal: SPACING.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.forest,
      borderRadius: BORDER_RADIUS.lg,
      ...createShadow(ELEVATION.sm)
    },
    galleryButtonText: {
      ...TYPOGRAPHY.button,
      color: theme.colors.forest,
      marginLeft: SPACING.sm
    },
    helpText: {
      ...TYPOGRAPHY.body2,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: SPACING.md,
      lineHeight: 20,
      fontStyle: 'italic'
    },

    infoContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.lg,
      marginTop: SPACING.lg,
      ...createShadow(ELEVATION.sm)
    },
    infoGrid: {
      gap: SPACING.md
    },
    infoItem: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingBottom: SPACING.md,
      marginBottom: SPACING.md
    },
    infoLabel: {
      ...TYPOGRAPHY.caption,
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      fontWeight: '600',
      letterSpacing: 0.5,
      marginBottom: SPACING.xs
    },
    infoValue: {
      ...TYPOGRAPHY.body1,
      color: theme.colors.text,
      lineHeight: 22
    },

    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING.xl
    },
    errorTitle: {
      ...TYPOGRAPHY.h2,
      color: theme.colors.error,
      textAlign: 'center',
      marginTop: SPACING.lg,
      marginBottom: SPACING.xl
    },
    errorButton: {
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.md,
      backgroundColor: theme.colors.primary,
      borderRadius: BORDER_RADIUS.lg,
      ...createShadow(ELEVATION.md)
    },
    errorButtonText: {
      ...TYPOGRAPHY.button,
      color: theme.colors.textOnPrimary
    },

    placeholderContainer: {
      alignItems: 'center',
      paddingVertical: SPACING.xxxl,
      paddingHorizontal: SPACING.xl,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: BORDER_RADIUS.lg,
      marginVertical: SPACING.lg
    },
    placeholderTitle: {
      ...TYPOGRAPHY.h3,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: SPACING.lg,
      marginBottom: SPACING.sm
    },
    placeholderText: {
      ...TYPOGRAPHY.body1,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: SPACING.sm
    },
    placeholderSubtext: {
      ...TYPOGRAPHY.body2,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic'
    },
    sectionContainer: {
      marginTop: SPACING.xl,
      marginBottom: SPACING.lg
    },
    imageSelector: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primaryLight,
      borderRadius: BORDER_RADIUS.md,
      paddingVertical: SPACING.xl,
      paddingHorizontal: SPACING.xl,
      marginBottom: SPACING.lg,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed'
    },
    imageSelectorText: {
      ...TYPOGRAPHY.body1,
      color: theme.colors.primary,
      marginTop: SPACING.md,
      fontWeight: '500',
      textAlign: 'center'
    },
    imageSelectorSubtext: {
      ...TYPOGRAPHY.caption,
      color: theme.colors.textSecondary,
      marginTop: SPACING.xs,
      textAlign: 'center',
      fontStyle: 'italic'
    },
    fieldLabel: {
      ...TYPOGRAPHY.body1,
      color: theme.colors.text,
      marginBottom: SPACING.sm,
      fontWeight: '500'
    },
    textInput: {
      ...TYPOGRAPHY.body2,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: BORDER_RADIUS.md,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      minHeight: 120,
      textAlignVertical: 'top',
      fontFamily: 'monospace',
      fontSize: 12,
      ...createShadow(ELEVATION.sm)
    },
    infoTitle: {
      ...TYPOGRAPHY.h3,
      color: theme.colors.text,
      marginBottom: SPACING.md
    },
    infoText: {
      ...TYPOGRAPHY.body2,
      color: theme.colors.textSecondary,
      marginBottom: SPACING.sm
    },
    imageEditSectionTitle: {
      ...TYPOGRAPHY.h3,
      color: theme.colors.forest,
      marginBottom: SPACING.lg,
      textAlign: 'center',
      paddingHorizontal: SPACING.lg
    },
    imageEditHelpText: {
      ...TYPOGRAPHY.body2,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: SPACING.md,
      marginHorizontal: SPACING.lg,
      lineHeight: 20,
      fontStyle: 'italic'
    }
  });
