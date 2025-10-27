import { ThemeVariablesType } from '@/presentation/contexts/theme.context';
import { StyleSheet } from 'react-native';

export const createStyles = (variables: ThemeVariablesType) => {
  return StyleSheet.create({
    stepTitle: {
      fontSize: variables['--font-size-xlarge'],
      fontWeight: variables['--font-weight-bold'],
      color: variables['--text'],
      textAlign: 'center',
      marginBottom: variables['--spacing-small']
    },
    stepDescription: {
      fontSize: variables['--font-size-medium'],
      fontWeight: variables['--font-weight-regular'],
      color: variables['--text-secondary'],
      textAlign: 'center',
      marginBottom: variables['--spacing-large'],
      lineHeight: variables['--line-height-large']
    },

    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: variables['--spacing-large'],
      gap: variables['--spacing-small']
    },

    backButton: {
      flex: 1,
      backgroundColor: 'transparent',
      borderWidth: variables['--border-width-small'],
      borderColor: variables['--border']
    },
    nextButton: {
      flex: 1,
      backgroundColor: variables['--primary']
    },
    submitButton: {
      flex: 1,
      backgroundColor: variables['--success']
    },

    loginButton: {
      backgroundColor: 'transparent',
      borderWidth: variables['--border-width-small'],
      borderColor: variables['--primary'],
      marginBottom: 0
    },

    orText: {
      textAlign: 'center',
      fontSize: variables['--font-size-large'],
      color: variables['--text-secondary'],
      marginTop: variables['--spacing-xlarge'],
      marginBottom: variables['--spacing-medium'],
      fontWeight: variables['--font-weight-medium']
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
      marginBottom: variables['--spacing-medium']
    },

    requiredIndicator: {
      color: variables['--error'],
      fontSize: variables['--font-size-medium'],
      marginLeft: variables['--spacing-tiny']
    },

    helpText: {
      fontSize: variables['--font-size-small'],
      color: variables['--text-secondary'],
      fontStyle: 'italic',
      marginBottom: variables['--spacing-small'],
      textAlign: 'center',
      lineHeight: variables['--line-height-medium']
    },

    summaryContainer: {
      backgroundColor: variables['--surface-variant'],
      padding: variables['--spacing-medium'],
      borderRadius: variables['--border-radius-large'],
      marginBottom: variables['--spacing-large'],
      borderWidth: variables['--border-width-hairline'],
      borderColor: variables['--border']
    },
    summaryTitle: {
      fontSize: variables['--font-size-large'],
      fontWeight: variables['--font-weight-bold'],
      color: variables['--text'],
      marginBottom: variables['--spacing-small']
    },
    summaryText: {
      fontSize: variables['--font-size-medium'],
      color: variables['--text-secondary'],
      lineHeight: variables['--line-height-large']
    },

    focusedInput: {
      borderColor: variables['--primary'],
      borderWidth: variables['--border-width-small']
    },
    errorInput: {
      borderColor: variables['--error'],
      borderWidth: variables['--border-width-small']
    },

    mainContainer: {
      flex: 1,
      paddingHorizontal: 0
    }
  });
};
