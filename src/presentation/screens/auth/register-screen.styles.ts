import { StyleSheet } from 'react-native';

export const createStyles = (variables: Record<string, string>) => {
  return StyleSheet.create({
    button: {
      marginBottom: 12
    },
    orText: {
      textAlign: 'center',
      marginVertical: 12,
      color: variables.textSecondary
    },
    loginButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: variables.outline
    }
  });
};
