import { StyleSheet } from 'react-native';

export const createStyles = (vars: Record<string, any>) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: vars['--background-alt'],
    },
    centeredContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: vars['--background-alt'],
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: vars['--text-secondary'],
    },
    headerContainer: {
      backgroundColor: vars['--background'],
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 20,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    headerTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    greeting: {
      fontSize: 24,
      fontWeight: 'bold',
      color: vars['--text'],
    },
    subGreeting: {
      fontSize: 18,
      color: vars['--text-secondary'],
      marginTop: 4,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: vars['--background-alt'],
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
    },
    logoutButtonText: {
      color: vars['--text-secondary'],
      marginLeft: 6,
      fontWeight: '600',
    },
    timeAndLocationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
      paddingTop: 12,
      borderTopWidth: 1,
      borderColor: vars['--border-color'],
    },
    timeAndLocationText: {
      color: vars['--text-secondary'],
      fontSize: 14,
      marginLeft: 8,
    },
    separator: {
      height: '60%',
      width: 1,
      backgroundColor: vars['--border-color'],
      marginHorizontal: 12,
    },
    activityIndicator: {
      marginLeft: 8,
    },

    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginHorizontal: 15,
      marginTop: 25,
    },
    statBox: {
      backgroundColor: vars['--card-background'],
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 100,
      marginHorizontal: 5,
      elevation: 4,
      shadowColor: vars['--shadow-color'],
      shadowOpacity: 0.1,
      shadowRadius: 10,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: vars['--text'],
    },
    statLabel: {
      fontSize: 14,
      color: vars['--text-secondary'],
      marginTop: 4,
    },

    listHeader: {
      fontSize: 22,
      fontWeight: 'bold',
      color: vars['--text'],
      paddingHorizontal: 20,
      marginTop: 24,
      marginBottom: 12,
    },
    listContentContainer: {
      paddingHorizontal: 20,
      paddingBottom: 120,
    },
    userCard: {
      backgroundColor: vars['--background'],
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      elevation: 2,
      shadowColor: vars['--shadow-color'],
      shadowOpacity: 0.05,
      shadowRadius: 5,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 16,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: vars['--text'],
    },
    userEmail: {
      fontSize: 14,
      color: vars['--text-secondary'],
      marginTop: 2,
    },

    cardButtonText: {
      color: vars['--primary'],
      fontWeight: '600',
    },

    buttonIcon: {
      marginLeft: 8,
    },
    cardButtonContainer: {
      paddingHorizontal: 20,
      marginTop: 10,
    },
    cardButton: {
      backgroundColor: vars['--background'],
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      elevation: 2,
      shadowColor: vars['--shadow-color'],
      shadowOpacity: 0.05,
      shadowRadius: 5,
    },
    emptyListContainer: {
      alignItems: 'center',
      marginTop: 50,
      paddingHorizontal: 20,
    },
    emptyListText: {
      fontSize: 16,
      color: vars['--text-secondary'],
      textAlign: 'center',
      marginTop: 16,
    },
  });
};

