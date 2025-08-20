import { StyleSheet } from 'react-native';
import { ThemeVariablesType } from '@/presentation/contexts/theme.context';

export const createStyles = (vars: ThemeVariablesType, width: number) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: vars['--background'],
    },
    full: {
      flex: 1,
      backgroundColor: vars['--background'],
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: vars['--background'],
      padding: 20,
    },
    loadingText: {
      marginTop: 20,
      fontSize: 18,
      color: vars['--text-secondary'],
      textAlign: 'center',
      lineHeight: 24,
    },
    permissionButton: {
      marginTop: 30,
      backgroundColor: vars['--primary'],
      borderRadius: 25,
      paddingVertical: 12,
      paddingHorizontal: 30,
      elevation: 3,
    },
    permissionButtonText: {
      color: vars['--text-on-primary'],
      fontSize: 16,
      fontWeight: '600',
    },
    thumbnailContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      zIndex: 10,
      backgroundColor: 'rgba(0,0,0,0.3)',
      borderRadius: 16,
      marginHorizontal: 20,
      padding: 8,
    },
    modalContent: {
      flex: 1,
      backgroundColor: vars['--background'],
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    controlsOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'space-between',
      padding: 16,
    },
    buttonPressed: {
      opacity: 0.7,
      transform: [{ scale: 0.95 }],
    },
    thumbnailItem: {
      marginRight: 10,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    thumbnailItemActive: {
      borderColor: vars['--primary'],
    },

    captureButtonContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    captureRing: {
      position: 'absolute',
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.8)',
      borderRadius: 50,
      width: 80,
      height: 80,
    },
    bottomControls: {
      position: 'absolute',
      bottom: 0,
      width: width,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingHorizontal: 30,
      paddingVertical: 20,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      height: 150,
    },
  });
