import { StyleSheet } from 'react-native';
import { Theme } from '@/presentation/contexts/theme.context';

// Función para crear sombras optimizadas
const createModernShadow = (
  elevation: number,
  color = '#000',
  opacity = 0.1
) => ({
  shadowColor: color,
  shadowOffset: {
    width: 0,
    height: Math.max(1, elevation / 2)
  },
  shadowOpacity: Math.min(0.25, opacity + elevation * 0.01),
  shadowRadius: Math.max(2, elevation * 1.5),
  elevation: elevation + 2
});

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    // Estilos principales del card
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.medium,
      overflow: 'hidden',
      marginBottom: theme.spacing.medium,
      marginHorizontal: theme.spacing.small,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      transform: [{ scale: 1 }], // Preparar para animaciones
      ...createModernShadow(6, theme.colors.shadow, 0.08)
    },

    presentationCard: {
      marginHorizontal: theme.spacing.large,
      borderRadius: theme.borderRadius.medium,
      ...createModernShadow(8, theme.colors.shadow, 0.12)
    },

    processingCard: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }]
    },

    imageContainer: {
      borderTopLeftRadius: theme.borderRadius.medium,
      borderTopRightRadius: theme.borderRadius.medium,
      overflow: 'hidden'
    },

    cardContent: {
      padding: theme.spacing.medium,
      flex: 1,
      backgroundColor: theme.colors.surface
    },

    // Estilos del contenido
    contentContainer: {
      flex: 1
    },

    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.small
    },

    titleText: {
      fontSize: theme.typography.fontSize.large,
      fontWeight: '800',
      flex: 1,
      marginRight: theme.spacing.small,
      lineHeight: theme.typography.fontSize.large,
      letterSpacing: -0.3
    },

    dateText: {
      fontSize: theme.typography.fontSize.small,
      fontWeight: '500',
      marginBottom: theme.spacing.small,
      opacity: 0.8,
      letterSpacing: 0.2
    },

    descriptionText: {
      fontSize: theme.typography.fontSize.medium,
      lineHeight: theme.typography.fontSize.medium,
      marginBottom: theme.spacing.medium,
      fontWeight: '400',
      textAlign: 'justify'
    },

    // Estilos del badge de estado
    statusBadge: {
      paddingHorizontal: theme.spacing.small,
      paddingVertical: theme.spacing.small,
      borderRadius: theme.borderRadius.small,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      ...createModernShadow(2, theme.colors.shadow, 0.05)
    },

    statusBadgeEmoji: {
      fontSize: theme.typography.fontSize.small,
      marginRight: theme.spacing.small
    },

    statusBadgeText: {
      fontSize: theme.typography.fontSize.small,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5
    },

    // Estilos de las filas de estado
    statusRowsContainer: {
      gap: theme.spacing.small
    },

    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.small,
      paddingVertical: theme.spacing.small,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.small,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border
    },

    statusIconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: theme.spacing.small,
      minWidth: theme.spacing.small
    },

    statusEmoji: {
      fontSize: theme.typography.fontSize.medium,
      marginRight: theme.spacing.small
    },

    statusText: {
      fontWeight: '600',
      fontSize: theme.typography.fontSize.medium,
      flex: 1,
      lineHeight: theme.typography.fontSize.medium
    },

    // Estilos de los botones de revisión
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.medium,
      paddingTop: theme.spacing.medium,
      gap: theme.spacing.small,
      borderTopWidth: StyleSheet.hairlineWidth
    },

    actionButton: {
      flex: 1,
      paddingVertical: theme.spacing.medium,
      borderRadius: theme.borderRadius.medium,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden', // Para ripple effect
      minHeight: theme.spacing.medium,
      ...createModernShadow(4, theme.colors.shadow, 0.1)
    },

    rejectButton: {
      backgroundColor: theme.colors.error,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.error
    },

    approveButton: {
      backgroundColor: theme.colors.success,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.success
    },

    disabledButton: {
      opacity: 0.6,
      transform: [{ scale: 0.98 }]
    },

    buttonEmoji: {
      fontSize: theme.typography.fontSize.medium,
      marginRight: theme.spacing.small
    },

    buttonIcon: {
      marginRight: theme.spacing.small
    },

    buttonText: {
      color: theme.colors.text,
      fontWeight: '700',
      fontSize: theme.typography.fontSize.medium,
      letterSpacing: 0.3
    },

    // Estilos del overlay de procesamiento
    processingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: theme.borderRadius.medium
    },

    processingContent: {
      alignItems: 'center',
      padding: theme.spacing.medium,
      backgroundColor: theme.colors.overlay,
      borderRadius: theme.borderRadius.medium,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      ...createModernShadow(3, theme.colors.shadow, 0.1)
    },

    processingText: {
      marginTop: theme.spacing.small,
      fontWeight: '600',
      fontSize: theme.typography.fontSize.medium,
      letterSpacing: 0.2,
      textAlign: 'center'
    },

    // Estilos adicionales para mejoras visuales
    cardHover: {
      transform: [{ scale: 1.02 }],
      ...createModernShadow(8, theme.colors.shadow, 0.15)
    },

    // Estilos para estados específicos
    acceptedCard: {
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.success
    },

    rejectedCard: {
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.error
    },

    pendingCard: {
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.info
    },

    // Estilos para animaciones
    fadeIn: {
      opacity: 1
    },

    fadeOut: {
      opacity: 0
    },

    slideUp: {
      transform: [{ translateY: 0 }]
    },

    slideDown: {
      transform: [{ translateY: 10 }]
    }
  });
