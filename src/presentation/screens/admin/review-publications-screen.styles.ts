import { StyleSheet } from 'react-native';

export const createStyles = (vars: Record<string, string>) =>
  StyleSheet.create({
    container: {
      flex: 1
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
    },
    list: {
      paddingBottom: 20,
      paddingTop: 10,
      width: '95%',
      alignSelf: 'center'
    },
    errorText: {
      textAlign: 'center',
      marginBottom: 12,
      marginHorizontal: 16,
      fontSize: 14,
      color: vars['--text-secondary']
    },
    emptyText: {
      fontSize: 16,
      textAlign: 'center',
      marginTop: 40,
      paddingHorizontal: 20,
      color: vars['--text']
    },
    resultText: {
      textAlign: 'center',
      marginBottom: 8,
      fontSize: 14,
      color: vars['--text-secondary']
    },
    listContent: {
      paddingBottom: 20,
      paddingTop: 10,
      width: '95%',
      alignSelf: 'center'
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12
    },
    loadingText: {
      fontSize: 14,
      marginLeft: 8,
      color: vars['--text-secondary']
    },
    resultsContainer: {
      paddingVertical: 12,
      alignItems: 'center'
    }
  });
