import { ThemeVariablesType } from '@/presentation/contexts/theme.context';
import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';

export const createStyles = (vars: ThemeVariablesType, insets: EdgeInsets) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: vars['--background']
    },

    header: {
      position: 'absolute',
      top: insets.top + 16,
      left: 20,
      right: 20,
      zIndex: 30,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    closeButton: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: vars['--shadow'],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)'
    },

    statusIndicator: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center'
    },
    statusText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '500',
      marginLeft: 4
    },

    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      width: '100%',
      backgroundColor: vars['--surface'],
      paddingTop: 24,
      paddingBottom: Math.max(insets.bottom + 16, 24),
      paddingHorizontal: 24,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      shadowColor: vars['--shadow'],
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 12,
      borderTopWidth: 1,
      borderTopColor: vars['--border']
    },

    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: vars['--surface-variant'],
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: vars['--border']
    },
    locationIcon: {
      marginRight: 8
    },
    locationText: {
      color: vars['--text'],
      fontSize: 14,
      fontWeight: '500',
      flex: 1
    },
    locationLabel: {
      color: vars['--text-secondary'],
      fontSize: 12,
      fontWeight: '400',
      marginBottom: 2
    },

    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      gap: 12
    },
    button: {
      flex: 1,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      minHeight: 52,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    },
    buttonPrimary: {
      backgroundColor: vars['--primary'],
      shadowColor: vars['--primary']
    },
    buttonSecondary: {
      backgroundColor: vars['--surface'],
      borderWidth: 2,
      borderColor: vars['--border'],
      shadowColor: vars['--shadow']
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.5
    },
    buttonTextPrimary: {
      color: vars['--text-on-primary']
    },
    buttonTextSecondary: {
      color: vars['--text']
    },
    buttonIcon: {
      marginLeft: 8
    },

    buttonPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }]
    },

    loadingContainer: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -20 }, { translateY: -20 }],
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center'
    },

    touchableArea: {
      minWidth: 44,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center'
    },

    imageInfo: {
      backgroundColor: vars['--surface-variant'],
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: vars['--border']
    },
    imageInfoText: {
      color: vars['--text-secondary'],
      fontSize: 12,
      textAlign: 'center'
    },

    fadeContainer: {
      flex: 1
    },
    slideUpContainer: {
      transform: [{ translateY: 0 }]
    },

    darkOverlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.9)'
    },
    lightOverlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)'
    },

    divider: {
      height: 1,
      backgroundColor: vars['--divider'],
      marginVertical: 16,
      marginHorizontal: -8
    },

    contentContainer: {
      flex: 1,
      justifyContent: 'space-between'
    },

    compactLayout: {
      paddingHorizontal: 16
    },
    regularLayout: {
      paddingHorizontal: 24
    }
  });
