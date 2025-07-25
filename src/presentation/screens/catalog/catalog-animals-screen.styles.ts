import { StyleSheet } from 'react-native';

export const createStyles = (vars: Record<string, string>) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: vars['--text-secondary'],
    },
    emptyText: {
      fontSize: 16,
      textAlign: 'center',
      marginTop: 40,
      paddingHorizontal: 20,
      color: vars['--text-secondary'],
    },
    list: {
      paddingBottom: 20,
      paddingTop: 10,
      width: '95%',
      alignSelf: 'center',
    },
    searchInput: {
      padding: 12,
      borderRadius: 8,
      marginHorizontal: 16,
      marginVertical: 12,
      fontSize: 16,
      borderWidth: 1,
      borderColor: vars['--background-secondary'],
      color: vars['--text-secondary'],
    },
    errorText: {
      textAlign: 'center',
      marginBottom: 12,
      marginHorizontal: 16,
      fontSize: 14,
      color: vars['--text-secondary'],
    },
    primary: {
      color: vars['--primary'],
    },
  });
