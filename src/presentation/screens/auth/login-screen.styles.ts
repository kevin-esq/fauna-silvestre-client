import { StyleSheet } from 'react-native';

export const createStyles = (vars: Record<string, string>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: vars['--background'],
      justifyContent: 'center',
      padding: 20
    },
    rememberContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 10,
      backgroundColor: vars['--background']
    },
    rememberText: {
      fontSize: 16,
      color: vars['--text-secondary']
    },
    input: {
      borderWidth: 1,
      borderRadius: 10,
      padding: 12,
      marginBottom: 12,
      backgroundColor: vars['--surface']
    },
    button: {
      marginBottom: 12
    },
    forgotPassword: {
      alignSelf: 'center',
      marginBottom: 16
    },
    forgotPasswordText: {
      fontSize: 14,
      color: vars['--text-secondary']
    },
    orText: {
      textAlign: 'center',
      fontSize: 15,
      color: vars['--text-secondary'],
      marginVertical: 12
    }
  });
