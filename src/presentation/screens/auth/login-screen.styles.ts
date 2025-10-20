import { ThemeVariablesType } from '@/presentation/contexts/theme.context';
import { StyleSheet } from 'react-native';

export const createStyles = (vars: ThemeVariablesType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: vars['--background'],
      justifyContent: 'center',
      padding: 20
    },
    inputContainer: {
      marginBottom: vars['--spacing-small']
    },
    rememberContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: vars['--spacing-large'],
      marginTop: vars['--spacing-medium'],
      paddingVertical: vars['--spacing-medium'],
      paddingHorizontal: vars['--spacing-large'],
      borderRadius: vars['--border-radius-medium'],
      backgroundColor: vars['--surface'],
      borderWidth: vars['--border-width-hairline'],
      borderColor: vars['--border'],
      shadowColor: vars['--shadow'],
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
    },
    rememberText: {
      fontSize: vars['--font-size-large'],
      fontWeight: '500',
      color: vars['--text'],
      fontFamily: vars['--font-family-primary']
    },
    button: {
      marginBottom: vars['--spacing-medium'],
      borderRadius: vars['--border-radius-medium'],
      paddingVertical: 4
    },
    forgotPassword: {
      alignSelf: 'center',
      marginBottom: vars['--spacing-large'],
      paddingVertical: vars['--spacing-small'],
      paddingHorizontal: vars['--spacing-medium'],
      borderRadius: vars['--border-radius-small']
    },
    forgotPasswordText: {
      fontSize: vars['--font-size-medium'],
      color: vars['--primary'],
      fontWeight: '500',
      textDecorationLine: 'underline',
      fontFamily: vars['--font-family-primary']
    },
    orText: {
      textAlign: 'center',
      fontSize: vars['--font-size-large'],
      color: vars['--text-secondary'],
      marginVertical: vars['--spacing-large'],
      fontWeight: '500',
      fontFamily: vars['--font-family-primary'],
      position: 'relative'
    },
    inputFocused: {
      borderColor: vars['--primary'],
      borderWidth: 2,
      shadowColor: vars['--primary'],
      shadowOpacity: 0.1
    },
    inputError: {
      borderColor: vars['--error'],
      borderWidth: 2
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: vars['--border-radius-medium']
    }
  });
