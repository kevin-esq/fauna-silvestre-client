import { StyleSheet } from 'react-native';

export const createStyles = (vars: Record<string, string>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: vars['--background'],
      justifyContent: 'center',
      padding: 20
    },
    inputContainer: {
      marginBottom: parseInt(vars['--spacing-small']) || 8
    },
    rememberContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: parseInt(vars['--spacing-large']) || 24,
      marginTop: parseInt(vars['--spacing-medium']) || 16,
      paddingVertical: parseInt(vars['--spacing-medium']) || 16,
      paddingHorizontal: parseInt(vars['--spacing-large']) || 20,
      borderRadius: parseInt(vars['--border-radius-medium']) || 8,
      backgroundColor: vars['--surface'],
      borderWidth: parseInt(vars['--border-width-hairline']) || 1,
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
      fontSize: parseInt(vars['--font-size-large']) || 16,
      fontWeight: '500',
      color: vars['--text'],
      fontFamily: vars['--font-family-primary']
    },
    button: {
      marginBottom: parseInt(vars['--spacing-medium']) || 16,
      borderRadius: parseInt(vars['--border-radius-medium']) || 8,
      paddingVertical: 4
    },
    forgotPassword: {
      alignSelf: 'center',
      marginBottom: parseInt(vars['--spacing-large']) || 24,
      paddingVertical: parseInt(vars['--spacing-small']) || 8,
      paddingHorizontal: parseInt(vars['--spacing-medium']) || 16,
      borderRadius: parseInt(vars['--border-radius-small']) || 4
    },
    forgotPasswordText: {
      fontSize: parseInt(vars['--font-size-medium']) || 14,
      color: vars['--primary'],
      fontWeight: '500',
      textDecorationLine: 'underline',
      fontFamily: vars['--font-family-primary']
    },
    orText: {
      textAlign: 'center',
      fontSize: parseInt(vars['--font-size-large']) || 16,
      color: vars['--text-secondary'],
      marginVertical: parseInt(vars['--spacing-large']) || 20,
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
      borderRadius: parseInt(vars['--border-radius-medium']) || 8
    }
  });
