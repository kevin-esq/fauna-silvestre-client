import { StyleSheet } from 'react-native';
import { ThemeVariablesType } from '@/presentation/contexts/theme.context';

export const createStyles = (vars: ThemeVariablesType) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#000000'
    },
    full: {
      flex: 1,
      backgroundColor: '#000000'
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000000',
      padding: 20
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: '#ffffff',
      textAlign: 'center',
      lineHeight: 22,
      fontWeight: '500'
    },
    permissionButton: {
      marginTop: 32,
      backgroundColor: vars['--primary'],
      borderRadius: 28,
      paddingVertical: 14,
      paddingHorizontal: 32,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      minHeight: 48,
      minWidth: 140,
      justifyContent: 'center',
      alignItems: 'center'
    },
    permissionButtonText: {
      color: vars['--text-on-primary'],
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center'
    },
    controlsOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'space-between',
      zIndex: 10
    },
    bottomControls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingHorizontal: 24,
      paddingTop: 20,
      backgroundColor: 'rgba(0,0,0,0.4)',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      minHeight: 120
    },
    captureButtonContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8
    },
    captureRing: {
      position: 'absolute',
      borderWidth: 3,
      borderColor: 'rgba(255,255,255,0.8)',
      borderRadius: 42,
      width: 84,
      height: 84,
      zIndex: -1
    },
    buttonPressed: {
      opacity: 0.7,
      transform: [{ scale: 0.95 }]
    },
    thumbnailContainer: {
      position: 'absolute',
      left: 16,
      right: 16,
      zIndex: 10,
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 20,
      paddingVertical: 12,
      paddingHorizontal: 16,
      elevation: 10
    },
    thumbnailItem: {
      marginRight: 12,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: 'transparent',
      overflow: 'hidden'
    },
    thumbnailItemActive: {
      borderColor: vars['--primary'],
      shadowColor: vars['--primary'],
      shadowOffset: {
        width: 0,
        height: 0
      },
      shadowOpacity: 0.5,
      shadowRadius: 4,
      elevation: 8
    },
    modalContent: {
      flex: 1,
      backgroundColor: vars['--background'],
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 8
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)'
    },
    modalContainer: {
      backgroundColor: 'transparent'
    },
    contentWrapper: {
      flex: 1,
      minHeight: '100%'
    }
  });
