// publication-form-screen.styles.ts
import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';

export const createStyles = (
  vars: Record<string, string>,
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
      paddingBottom: 120 + insets.bottom, // Espacio para el footer sticky
      paddingHorizontal: 16
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: insets.top + 8,
      paddingBottom: 12,
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
      shadowOpacity: 0.1,
      shadowRadius: 3.84
    },
    backButton: {
      padding: 4,
      marginRight: 8
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: vars['--text']
    },
    image: {
      width: '100%',
      height: width * 0.7,
      borderRadius: 14,
      marginBottom: 16,
      backgroundColor: vars['--surface-variant'],
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1
      },
      shadowOpacity: 0.22,
      shadowRadius: 2.22
    },
    expandIconContainer: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: 6,
      borderRadius: 20
    },
    formContainer: {
      // paddingHorizontal removido porque ya está en scrollContainer
    },
    label: {
      fontWeight: '600',
      marginBottom: 8,
      color: vars['--text'],
      fontSize: 16
    },
    textArea: {
      backgroundColor: vars['--surface'],
      padding: 14,
      borderRadius: 10,
      marginBottom: 20,
      fontSize: 15,
      color: vars['--text'],
      height: 120,
      textAlignVertical: 'top',
      borderWidth: 1,
      borderColor: vars['--border'],
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: vars['--border']
    },
    locationText: {
      marginLeft: 8,
      color: vars['--text-secondary'],
      fontSize: 14
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 16,
      paddingBottom: 16 + insets.bottom,
      backgroundColor: vars['--background'],
      borderTopWidth: 1,
      borderTopColor: vars['--border'],
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -2
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84
    },
    cancelButton: {
      backgroundColor: vars['--surface-variant'],
      padding: 16,
      borderRadius: 10,
      flex: 1,
      marginRight: 12,
      alignItems: 'center',
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
      padding: 16,
      borderRadius: 10,
      flex: 1,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center'
    },
    submitButtonText: {
      color: vars['--text-on-primary'],
      fontWeight: '600',
      fontSize: 16
    },
    sendIcon: {
      marginLeft: 8
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.9)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    modalCloseButton: {
      position: 'absolute',
      top: 50,
      right: 20,
      zIndex: 10,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 20,
      padding: 8
    },
    expandedImage: {
      width: width,
      height: height * 0.8
    },
    stateSelectorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: vars['--border']
    },
    loadingContainer: {
      backgroundColor: vars['--surface'],
      padding: 16,
      borderRadius: 10,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: vars['--border'],
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 60
    },
    loadingText: {
      color: vars['--text-secondary'],
      fontSize: 14,
      marginTop: 8
    },
    errorContainer: {
      backgroundColor: vars['--error-container'],
      padding: 12,
      borderRadius: 8,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: vars['--error']
    },
    errorText: {
      color: vars['--on-error-container'],
      fontSize: 14,
      textAlign: 'center'
    }
  });
