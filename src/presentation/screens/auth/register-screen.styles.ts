import { ThemeVariablesType } from '@/presentation/contexts/theme.context';
import { StyleSheet } from 'react-native';

export const createStyles = (variables: ThemeVariablesType) => {
  return StyleSheet.create({
    stepTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: variables['--text'] || '#212121',
      textAlign: 'center',
      marginBottom: 8
    },
    stepDescription: {
      fontSize: 14,
      color: variables['--text-secondary'] || '#616161',
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20
    },

    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 24,
      gap: 12
    },

    backButton: {
      flex: 1,
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: variables['--border'] || '#E0E0E0'
    },
    nextButton: {
      flex: 1,
      backgroundColor: variables['--primary'] || '#007A33'
    },
    submitButton: {
      flex: 1,
      backgroundColor: variables['--success'] || '#388E3C'
    },

    loginButton: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: variables['--primary'] || '#007A33',
      marginBottom: 0
    },

    orText: {
      textAlign: 'center',
      fontSize: 15,
      color: variables['--text-secondary'] || '#616161',
      marginTop: 32,
      marginBottom: 16,
      fontWeight: '500'
    },

    formContainer: {
      flex: 1,
      justifyContent: 'space-between'
    },

    stepContent: {
      opacity: 1,
      transform: [{ translateX: 0 }]
    },
    stepContentEntering: {
      opacity: 0,
      transform: [{ translateX: 20 }]
    },
    stepContentExiting: {
      opacity: 0,
      transform: [{ translateX: -20 }]
    },

    inputContainer: {
      marginBottom: 16
    },

    requiredIndicator: {
      color: variables['--error'] || '#C62828',
      fontSize: 16,
      marginLeft: 4
    },

    helpText: {
      fontSize: 12,
      color: variables['--text-secondary'] || '#616161',
      fontStyle: 'italic',
      marginBottom: 8,
      textAlign: 'center'
    },

    summaryContainer: {
      backgroundColor: variables['--surface-variant'] || '#EEEEEE',
      padding: 16,
      borderRadius: 12,
      marginBottom: 20
    },
    summaryTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: variables['--text'] || '#212121',
      marginBottom: 8
    },
    summaryText: {
      fontSize: 14,
      color: variables['--text-secondary'] || '#616161',
      lineHeight: 20
    },

    focusedInput: {
      borderColor: variables['--primary'] || '#007A33',
      borderWidth: 2
    },
    errorInput: {
      borderColor: variables['--error'] || '#C62828',
      borderWidth: 2
    },

    mainContainer: {
      flex: 1,
      paddingHorizontal: 0
    }
  });
};
