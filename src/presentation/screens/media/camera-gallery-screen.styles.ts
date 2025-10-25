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
      padding: vars['--spacing-large']
    },
    loadingText: {
      marginTop: vars['--spacing-medium'],
      fontSize: vars['--font-size-large'],
      color: '#FFFFFF',
      textAlign: 'center',
      lineHeight: vars['--line-height-large'],
      fontWeight: vars['--font-weight-medium']
    },
    permissionButton: {
      marginTop: vars['--spacing-xlarge'],
      backgroundColor: vars['--forest'],
      borderRadius: vars['--border-radius-xlarge'] * 2,
      paddingVertical: vars['--spacing-medium'],
      paddingHorizontal: vars['--spacing-xlarge'],
      elevation: 6,
      shadowColor: vars['--shadow'],
      shadowOffset: {
        width: 0,
        height: 4
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      minHeight: 56,
      minWidth: 160,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: vars['--leaf']
    },
    permissionButtonText: {
      color: vars['--text-on-primary'],
      fontSize: vars['--font-size-large'],
      fontWeight: vars['--font-weight-bold'],
      textAlign: 'center',
      letterSpacing: 0.5
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
      paddingHorizontal: vars['--spacing-large'],
      paddingTop: vars['--spacing-large'],
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderTopLeftRadius: vars['--border-radius-xlarge'] * 2,
      borderTopRightRadius: vars['--border-radius-xlarge'] * 2,
      minHeight: 140,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.1)'
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
      left: vars['--spacing-medium'],
      right: vars['--spacing-medium'],
      zIndex: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: vars['--border-radius-xlarge'],
      paddingVertical: vars['--spacing-medium'],
      paddingHorizontal: vars['--spacing-medium'],
      elevation: 12,
      shadowColor: vars['--shadow'],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)'
    },
    thumbnailItem: {
      marginRight: vars['--spacing-medium'],
      borderRadius: vars['--border-radius-large'],
      borderWidth: 3,
      borderColor: 'transparent',
      overflow: 'hidden'
    },
    thumbnailItemActive: {
      borderColor: vars['--forest'],
      shadowColor: vars['--forest'],
      shadowOffset: {
        width: 0,
        height: 0
      },
      shadowOpacity: 0.6,
      shadowRadius: 6,
      elevation: 10
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
