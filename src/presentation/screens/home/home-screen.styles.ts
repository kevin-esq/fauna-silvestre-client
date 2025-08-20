import { StyleSheet } from 'react-native';
import { Theme } from '../../contexts/theme.context';

export const createStyles = (theme: Theme) => {
  const vars = theme.colors;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: vars.background,
      paddingTop: 10, // Espacio para el status bar
    },
    list: {
      paddingHorizontal: 16,
      paddingBottom: 100,
    },
    timeAndLocationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
      paddingTop: 12,
      borderTopWidth: 1,
      borderColor: theme.colors.border,
    },
    timeAndLocationText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      marginLeft: 8,
    },
    separator: {
      height: '60%',
      width: 1,
      backgroundColor: theme.colors.border,
      marginHorizontal: 12,
    },
    activityIndicator: {
      marginLeft: 8,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 10,
      width: '100%',
    },
    statNumber: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginTop: 4,
    },
    scrollContainer: {
      paddingBottom: 100,
    },
    headerContainer: {
      backgroundColor: vars.background,
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 20,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    headerTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      borderRadius: 8,
      backgroundColor: vars.cardBackground,
    },
    logoutButtonText: {
      marginLeft: 8,
      color: vars.text,
      fontWeight: 'bold',
    },
    greeting: {
      fontSize: 24,
      fontWeight: 'bold',
      color: vars.text,
    },
    subGreeting: {
      fontSize: 18,
      color: vars.textSecondary,
      marginTop: 4,
    },
    description: {
      fontSize: 16,
      color: vars.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
      alignSelf: 'stretch',
    },
    welcome: {
      fontSize: 22,
      fontWeight: 'bold',
      color: vars.text,
      marginVertical: 16,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      backgroundColor: vars.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 14,
      alignItems: 'center',
      elevation: 2,
      width: '100%',
    },
    statLabel: {
      fontSize: 14,
      color: vars.textSecondary,
    },
    statCount: {
      fontSize: 20,
      fontWeight: 'bold',
      color: vars.primary,
    },
    section: {
      marginVertical: 12,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: vars.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    imageSection: {
      marginTop: 24,
      paddingHorizontal: 16,
    },
    imagePlaceholder: {
      textAlign: 'center',
      color: vars.textSecondary,
      padding: 16,
      backgroundColor: vars.cardBackground,
      borderRadius: 8,
    },
    statsCard: {
      width: '100%',
      padding: 16,
      borderRadius: 12,
      backgroundColor: vars.cardBackground,
      alignItems: 'center',
      marginBottom: 24,
    },
    statBox: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: vars.primary,
    },
    cardButtonContainer: {
      width: '100%',
      marginBottom: 24,
    },
    cardButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: vars.cardBackground,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
    },
    cardButtonText: {
      fontSize: 16,
      color: vars.text,
      fontWeight: '600',
    },
    buttonIcon: {
      marginLeft: 8,
    },
    emptyListContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    emptyListText: {
      marginTop: 12,
      fontSize: 16,
      color: vars.textSecondary,
      textAlign: 'center',
    },
    catalogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceVariant,
  },

  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: 4,
  },

  filterContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },

  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  resultsText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },

  toggleButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: theme.colors.surfaceVariant,
  },

  toggleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 12,
    fontStyle: 'italic',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },

  emptyStateText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  });
};
