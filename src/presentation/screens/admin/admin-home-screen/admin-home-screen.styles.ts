import { themeVariables, Theme } from '@/presentation/contexts/theme.context';
import { StyleSheet, Platform } from 'react-native';

export const useStyles = (theme: Theme, isDark?: boolean) => {
  const vars = themeVariables(theme);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: vars['--background']
    },

    headerContainer: {
      paddingTop: vars['--spacing-large'],
      paddingHorizontal: vars['--spacing-large'],
      paddingBottom: vars['--spacing-medium'],
      marginBottom: vars['--spacing-small'],
      backgroundColor: vars['--surface'],
      borderBottomWidth: vars['--border-width-hairline'],
      borderBottomColor: vars['--border'],
      ...Platform.select({
        ios: {
          shadowColor: vars['--shadow'],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8
        },
        android: {
          elevation: 2
        }
      })
    },
    headerTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: vars['--spacing-medium']
    },
    headerTextContainer: {
      flex: 1
    },
    greeting: {
      fontSize: 26,
      fontWeight: vars['--font-weight-bold'],
      color: vars['--text'],
      marginBottom: 4,
      letterSpacing: 0.2,
      lineHeight: 32
    },
    subGreeting: {
      fontSize: vars['--font-size-small'],
      color: vars['--text-secondary'],
      fontWeight: vars['--font-weight-medium'],
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      opacity: 0.75
    },
    logoutButton: {
      padding: vars['--spacing-small'],
      marginLeft: vars['--spacing-small'],
      borderRadius: vars['--border-radius-large'],
      backgroundColor: vars['--error'] + '10'
    },

    infoCard: {
      backgroundColor: vars['--surface'],
      borderRadius: 18,
      padding: vars['--spacing-medium'],
      marginHorizontal: 2,
      ...Platform.select({
        ios: {
          shadowColor: vars['--shadow'],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 8
        },
        android: {
          elevation: 3
        }
      })
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: vars['--spacing-medium']
    },
    statItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center'
    },
    statIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: vars['--spacing-small']
    },
    statTextContainer: {
      flex: 1
    },
    statLabel: {
      fontSize: vars['--font-size-small'],
      color: vars['--text-secondary'],
      marginBottom: 2,
      fontWeight: vars['--font-weight-medium'],
      letterSpacing: 0.3
    },
    statValue: {
      fontSize: 22,
      color: vars['--text'],
      fontWeight: vars['--font-weight-bold'],
      letterSpacing: -0.3
    },
    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: vars['--divider'],
      marginHorizontal: vars['--spacing-medium'],
      opacity: 0.4
    },
    dividerLine: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: vars['--divider'],
      marginVertical: vars['--spacing-small'],
      opacity: 0.4
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: vars['--spacing-tiny'],
      paddingVertical: 2
    },
    infoIcon: {
      marginRight: vars['--spacing-small']
    },
    infoText: {
      fontSize: vars['--font-size-small'],
      color: vars['--text-secondary'],
      marginLeft: vars['--spacing-small'],
      fontWeight: vars['--font-weight-regular'],
      letterSpacing: 0.2
    },

    section: {
      marginTop: vars['--spacing-large'],
      paddingHorizontal: vars['--spacing-large']
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: vars['--font-weight-bold'],
      color: vars['--text'],
      letterSpacing: 0.2
    },
    sectionSubtitle: {
      fontSize: vars['--font-size-small'],
      color: vars['--text-secondary'],
      marginBottom: vars['--spacing-medium'],
      fontWeight: vars['--font-weight-medium'],
      letterSpacing: 0.3,
      opacity: 0.75
    },
    seeAll: {
      color: vars['--primary'],
      fontSize: vars['--font-size-medium'],
      fontWeight: vars['--font-weight-bold'],
      letterSpacing: 0.2
    },

    quickActions: {
      marginTop: vars['--spacing-small']
    },
    quickActionButton: {
      backgroundColor: vars['--surface'],
      borderRadius: 18,
      padding: vars['--spacing-medium'],
      marginBottom: vars['--spacing-medium'],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: vars['--border-width-hairline'],
      borderColor: vars['--border'],
      ...Platform.select({
        ios: {
          shadowColor: vars['--shadow'],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 8
        },
        android: {
          elevation: 3
        }
      })
    },
    quickActionButtonPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }]
    },
    quickActionButtonDisabled: {
      opacity: 0.5
    },
    quickActionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1
    },
    quickActionIconContainer: {
      borderRadius: 14,
      width: 46,
      height: 46,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: vars['--spacing-medium']
    },
    quickActionText: {
      fontSize: vars['--font-size-medium'],
      fontWeight: vars['--font-weight-medium'],
      color: vars['--text'],
      flex: 1,
      letterSpacing: 0.2
    },

    listContent: {
      paddingBottom: 100
    },
    userListItem: {
      backgroundColor: vars['--surface'],
      borderRadius: 18,
      padding: vars['--spacing-medium'],
      marginHorizontal: vars['--spacing-large'],
      marginBottom: vars['--spacing-medium'],
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: vars['--border-width-hairline'],
      borderColor: vars['--border'],
      ...Platform.select({
        ios: {
          shadowColor: vars['--shadow'],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 8
        },
        android: {
          elevation: 3
        }
      })
    },
    userListItemPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }]
    },
    avatarContainer: {
      position: 'relative',
      marginRight: vars['--spacing-medium']
    },
    userAvatar: {
      width: 54,
      height: 54,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: vars['--border']
    },
    statusIndicator: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 14,
      height: 14,
      borderRadius: 7,
      borderWidth: 2.5,
      borderColor: vars['--surface'],
      ...Platform.select({
        ios: {
          shadowColor: vars['--success'],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.5,
          shadowRadius: 4
        },
        android: {
          elevation: 4
        }
      })
    },
    userInfo: {
      flex: 1
    },
    userName: {
      fontSize: vars['--font-size-medium'],
      fontWeight: vars['--font-weight-medium'],
      color: vars['--text'],
      marginBottom: 4,
      letterSpacing: 0.2
    },
    userEmail: {
      fontSize: vars['--font-size-small'],
      color: vars['--text-secondary'],
      fontWeight: vars['--font-weight-regular'],
      letterSpacing: 0.2
    },

    emptyContainer: {
      alignItems: 'center',
      padding: vars['--spacing-xxlarge'],
      marginTop: vars['--spacing-medium']
    },
    emptyIcon: {
      color: vars['--text-secondary'],
      opacity: 0.3
    },
    emptyTitle: {
      fontSize: vars['--font-size-large'],
      color: vars['--text'],
      fontWeight: vars['--font-weight-bold'],
      marginTop: vars['--spacing-medium'],
      letterSpacing: 0.2
    },
    emptySubtitle: {
      fontSize: vars['--font-size-medium'],
      color: vars['--text-secondary'],
      marginTop: vars['--spacing-small'],
      textAlign: 'center',
      lineHeight: vars['--line-height-large'],
      letterSpacing: 0.2
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    loadingIndicator: {
      color: vars['--primary']
    },
    loadingText: {
      marginTop: vars['--spacing-medium'],
      fontSize: vars['--font-size-medium'],
      color: vars['--text'],
      fontWeight: vars['--font-weight-medium'],
      letterSpacing: 0.2
    },

    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: vars['--spacing-xxlarge']
    },
    errorIcon: {
      color: vars['--error']
    },
    errorText: {
      fontSize: vars['--font-size-medium'],
      color: vars['--text'],
      marginTop: vars['--spacing-medium'],
      textAlign: 'center',
      lineHeight: vars['--line-height-large'],
      letterSpacing: 0.2
    },
    retryButton: {
      backgroundColor: vars['--primary'],
      paddingHorizontal: vars['--spacing-large'],
      paddingVertical: 14,
      borderRadius: 14,
      marginTop: vars['--spacing-large'],
      ...Platform.select({
        ios: {
          shadowColor: vars['--primary'],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8
        },
        android: {
          elevation: 6
        }
      })
    },
    retryButtonText: {
      color: vars['--text-on-primary'],
      fontSize: vars['--font-size-medium'],
      fontWeight: vars['--font-weight-bold'],
      letterSpacing: 0.5
    },

    refreshControl: {
      color: vars['--primary']
    }
  });
};
