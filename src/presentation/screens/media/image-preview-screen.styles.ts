import { StyleSheet } from 'react-native';

export const createStyles = (vars: Record<string, string>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: vars['--background-color']
    },
    image: {
      flex: 1,
      width: '100%'
    },
    header: {
      position: 'absolute',
      top: 15,
      left: 15,
      right: 15,
      zIndex: 10,
      flexDirection: 'row',
      justifyContent: 'flex-end'
    },
    closeButton: {
      backgroundColor: vars['--background-color'],
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center'
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: vars['--background-color'],
      padding: 20,
      paddingBottom: 30,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      paddingHorizontal: 10
    },
    locationText: {
      color: vars['--text-color'],
      marginLeft: 8,
      fontSize: 14
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    button: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row'
    },
    buttonPrimary: {
      backgroundColor: vars['--primary-color'],
      marginLeft: 10
    },
    buttonSecondary: {
      backgroundColor: vars['--background-color'],
      marginRight: 10
    },
    buttonText: {
      color: vars['--text-color'],
      fontWeight: '600',
      fontSize: 16
    },
    buttonIcon: {
      marginLeft: 8
    }
  });
