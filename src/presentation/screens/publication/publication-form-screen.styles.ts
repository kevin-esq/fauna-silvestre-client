import { ThemeVariablesType } from '@/presentation/contexts/theme.context';
import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';

export const createStyles = (
  vars: ThemeVariablesType,
  width: number,
  height: number,
  insets: EdgeInsets
) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: vars['--background']
    },
    container: {
      flex: 1,
      backgroundColor: vars['--background']
    },
    scrollContainer: {
      paddingBottom: 120 + insets.bottom,
      paddingHorizontal: 20,
      paddingTop: 80 + insets.top
    },
    scrollContainerKeyboard: {
      paddingBottom: insets.bottom
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: insets.top + 12,
      paddingBottom: 16,
      backgroundColor: vars['--background'],
      borderBottomColor: vars['--border'],
      borderBottomWidth: 1,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.08,
      shadowRadius: 4
    },
    backButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: vars['--surface-variant']
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: vars['--text'],
      textAlign: 'center',
      flex: 1
    },
    imageContainer: {
      position: 'relative',
      marginBottom: 24,
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.1,
      shadowRadius: 4
    },
    image: {
      width: '100%',
      height: width * 0.7,
      backgroundColor: vars['--surface-variant']
    },
    expandIconContainer: {
      position: 'absolute',
      bottom: 16,
      right: 16,
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: 10,
      borderRadius: 25,
      elevation: 2
    },
    imageOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center'
    },
    imageOverlayText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '500'
    },
    formContainer: {
      gap: 24
    },
    fieldContainer: {
      gap: 8
    },
    label: {
      fontWeight: '600',
      color: vars['--text'],
      fontSize: 16,
      marginBottom: 4
    },
    textArea: {
      backgroundColor: vars['--surface'],
      padding: 16,
      borderRadius: 12,
      fontSize: 16,
      color: vars['--text'],
      height: 120,
      textAlignVertical: 'top',
      borderWidth: 2,
      borderColor: vars['--border'],
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      lineHeight: 22
    },
    textAreaValid: {
      borderColor: '#4CAF50'
    },
    textAreaInvalid: {
      borderColor: '#FF9800'
    },
    characterCounter: {
      alignItems: 'flex-end',
      marginTop: 4
    },
    characterCountText: {
      fontSize: 12,
      fontWeight: '500'
    },
    validText: {
      color: '#4CAF50'
    },
    invalidText: {
      color: '#FF9800'
    },
    loadingContainer: {
      backgroundColor: vars['--surface'],
      padding: 20,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: vars['--border'],
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8
    },
    loadingText: {
      color: vars['--text-secondary'],
      fontSize: 14,
      fontWeight: '500'
    },
    errorContainer: {
      backgroundColor: '#FFF3E0',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#FF9800',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12
    },
    errorText: {
      color: '#F57C00',
      fontSize: 14,
      fontWeight: '500',
      flex: 1
    },
    stateSelectorContainer: {
      flexDirection: 'row',
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: vars['--border'],
      elevation: 1,
      backgroundColor: vars['--surface']
    },
    stateOption: {
      flex: 1,
      paddingVertical: 16,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
      borderWidth: 1,
      borderColor: 'transparent'
    },
    stateIcon: {
      fontSize: 16
    },
    stateLabel: {
      fontSize: 15,
      fontWeight: '500'
    },
    locationContainer: {
      backgroundColor: vars['--surface'],
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E8F5E8',
      gap: 8
    },
    locationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8
    },
    locationTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: vars['--text']
    },
    locationText: {
      color: vars['--text'],
      fontSize: 14,
      fontWeight: '500',
      fontFamily: 'monospace'
    },
    locationSubtext: {
      color: vars['--text-secondary'],
      fontSize: 12,
      fontStyle: 'italic'
    },
    validationContainer: {
      backgroundColor: '#FFF8E1',
      padding: 12,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderLeftWidth: 4,
      borderLeftColor: '#FF9800'
    },
    validationText: {
      color: '#F57C00',
      fontSize: 14,
      fontWeight: '500',
      flex: 1
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 20,
      paddingBottom: 20 + insets.bottom,
      backgroundColor: vars['--background'],
      borderTopWidth: 1,
      borderTopColor: vars['--border'],
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -2
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      gap: 12
    },
    cancelButton: {
      backgroundColor: vars['--surface-variant'],
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
      borderWidth: 1,
      borderColor: vars['--border']
    },
    cancelButtonText: {
      color: vars['--text'],
      fontWeight: '600',
      fontSize: 16
    },
    submitButton: {
      backgroundColor: vars['--primary'],
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.15,
      shadowRadius: 3
    },
    submitButtonDisabled: {
      backgroundColor: vars['--disabled'],
      elevation: 0,
      shadowOpacity: 0
    },
    submitButtonText: {
      color: vars['--text-on-primary'],
      fontWeight: '700',
      fontSize: 16
    },
    submitButtonTextDisabled: {
      color: vars['--disabled-text']
    },
    modalCloseButton: {
      position: 'absolute',
      top: 60,
      right: 24,
      zIndex: 10,
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 25,
      padding: 12,
      elevation: 5
    },

    customAnimalContainer: {
      marginTop: 12,
      padding: 16,
      backgroundColor: vars['--surface-variant'] || '#F5F5F5',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: vars['--border'] || '#E0E0E0'
    },

    customAnimalLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: vars['--text'],
      marginBottom: 8
    },

    customAnimalInput: {
      borderWidth: 1,
      borderColor: vars['--border'],
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: vars['--text'],
      backgroundColor: vars['--surface'],
      minHeight: 48
    },

    customAnimalHint: {
      fontSize: 12,
      color: vars['--text-secondary'],
      marginTop: 6,
      fontStyle: 'italic',
      lineHeight: 16
    }
  });
