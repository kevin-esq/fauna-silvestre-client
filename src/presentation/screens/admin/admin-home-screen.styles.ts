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
          shadowOpacity: isDark ? 0.4 : 0.06,
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
      flex: 1,
      paddingRight: vars['--spacing-small']
    },
    greetingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: vars['--spacing-tiny']
    },
    greeting: {
      fontSize: vars['--font-size-xxlarge'] + 2,
      fontWeight: vars['--font-weight-bold'],
      color: vars['--text'],
      marginRight: vars['--spacing-small'],
      letterSpacing: 0.2,
      lineHeight: vars['--line-height-xxlarge']
    },
    subGreetingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2
    },
    subGreeting: {
      fontSize: vars['--font-size-small'],
      color: vars['--text-secondary'],
      fontWeight: vars['--font-weight-medium'],
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      opacity: 0.75,
      marginLeft: vars['--spacing-tiny']
    },
    logoutButton: {
      padding: vars['--spacing-small'],
      borderRadius: vars['--border-radius-large'],
      backgroundColor: vars['--error'] + '10'
    },

    infoCard: {
      backgroundColor: isDark ? vars['--surface-variant'] : vars['--surface'],
      borderRadius: vars['--border-radius-large'] + 6,
      padding: vars['--spacing-medium'] + 2,
      marginHorizontal: 2,
      borderWidth: vars['--border-width-hairline'],
      borderColor: vars['--border'],
      ...Platform.select({
        ios: {
          shadowColor: vars['--shadow'],
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: isDark ? 0.4 : 0.08,
          shadowRadius: 10
        },
        android: {
          elevation: isDark ? 4 : 3
        }
      })
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: vars['--spacing-small'] + 2
    },
    statItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center'
    },
    statIconContainer: {
      width: 48,
      height: 48,
      borderRadius: vars['--border-radius-medium'] + 2,
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
      fontSize: vars['--font-size-xlarge'] + 2,
      color: vars['--text'],
      fontWeight: vars['--font-weight-bold'],
      letterSpacing: -0.3
    },
    statDivider: {
      width: vars['--border-width-hairline'],
      height: 40,
      backgroundColor: vars['--divider'],
      marginHorizontal: vars['--spacing-medium'],
      opacity: 0.5
    },
    dividerLine: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: vars['--divider'],
      marginVertical: vars['--spacing-small'],
      opacity: 0.4
    },
    statsRowCompact: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: vars['--spacing-small'],
      marginTop: vars['--spacing-tiny']
    },
    statItemCompact: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center'
    },
    statIconContainerCompact: {
      width: 34,
      height: 34,
      borderRadius: vars['--border-radius-medium'],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: vars['--spacing-small'] - 2
    },
    statTextContainerCompact: {
      flex: 1
    },
    statLabelCompact: {
      fontSize: vars['--font-size-small'] - 1,
      color: vars['--text-secondary'],
      marginBottom: 0,
      fontWeight: vars['--font-weight-medium'],
      letterSpacing: 0.1,
      textTransform: 'lowercase'
    },
    statValueCompact: {
      fontSize: vars['--font-size-large'] + 1,
      color: vars['--text'],
      fontWeight: vars['--font-weight-bold'],
      letterSpacing: -0.3,
      lineHeight: vars['--line-height-large']
    },
    statDividerCompact: {
      width: vars['--border-width-hairline'],
      height: 30,
      backgroundColor: vars['--divider'],
      marginHorizontal: vars['--spacing-small'] - 1,
      opacity: 0.35
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: vars['--spacing-tiny'],
      paddingVertical: 2
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
      marginBottom: vars['--spacing-tiny']
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    sectionTitle: {
      fontSize: vars['--font-size-xlarge'] + 2,
      fontWeight: vars['--font-weight-bold'],
      color: vars['--text'],
      letterSpacing: 0.2,
      marginLeft: vars['--spacing-small']
    },
    sectionSubtitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: vars['--spacing-medium'],
      marginTop: 2
    },
    sectionSubtitle: {
      fontSize: vars['--font-size-small'],
      color: vars['--text-secondary'],
      fontWeight: vars['--font-weight-medium'],
      letterSpacing: 0.3,
      opacity: 0.75,
      marginLeft: vars['--spacing-tiny']
    },
    seeAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: vars['--spacing-tiny'],
      paddingHorizontal: vars['--spacing-small']
    },
    seeAll: {
      color: vars['--primary'],
      fontSize: vars['--font-size-medium'],
      fontWeight: vars['--font-weight-bold'],
      letterSpacing: 0.2,
      marginRight: 4
    },

    quickActions: {
      marginTop: vars['--spacing-small']
    },
    quickActionButton: {
      backgroundColor: vars['--surface'],
      borderRadius: vars['--border-radius-large'] + 6,
      padding: vars['--spacing-medium'],
      marginBottom: vars['--spacing-medium'],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: vars['--border-width-hairline'],
      borderColor: vars['--border'],
      minHeight: 72,
      ...Platform.select({
        ios: {
          shadowColor: vars['--shadow'],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.4 : 0.08,
          shadowRadius: 8
        },
        android: {
          elevation: 3
        }
      })
    },
    quickActionButtonPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
      backgroundColor: isDark ? vars['--surface-variant'] : vars['--surface']
    },
    quickActionButtonDisabled: {
      opacity: 0.4,
      backgroundColor: vars['--disabled']
    },
    quickActionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      paddingRight: vars['--spacing-small']
    },
    quickActionIconContainer: {
      borderRadius: vars['--border-radius-medium'] + 2,
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
      letterSpacing: 0.2,
      lineHeight: vars['--line-height-medium']
    },

    userListItem: {
      backgroundColor: vars['--surface'],
      borderRadius: vars['--border-radius-large'] + 6,
      padding: vars['--spacing-medium'],
      marginBottom: vars['--spacing-medium'],
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: vars['--border-width-hairline'],
      borderColor: vars['--border'],
      minHeight: 80,
      ...Platform.select({
        ios: {
          shadowColor: vars['--shadow'],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.4 : 0.08,
          shadowRadius: 8
        },
        android: {
          elevation: 3
        }
      })
    },
    userListItemPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
      backgroundColor: isDark ? vars['--surface-variant'] : vars['--surface']
    },
    avatarContainer: {
      position: 'relative',
      marginRight: vars['--spacing-medium']
    },
    userAvatar: {
      width: 54,
      height: 54,
      borderRadius: vars['--border-radius-large'] + 6,
      borderWidth: vars['--border-width-small'],
      borderColor: vars['--border']
    },
    statusIndicator: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 14,
      height: 14,
      borderRadius: vars['--border-radius-small'] + 3,
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
      flex: 1,
      justifyContent: 'center'
    },
    userName: {
      fontSize: vars['--font-size-medium'],
      fontWeight: vars['--font-weight-medium'],
      color: vars['--text'],
      marginBottom: 4,
      letterSpacing: 0.2,
      lineHeight: vars['--line-height-medium']
    },
    userEmailRow: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    userEmail: {
      fontSize: vars['--font-size-small'],
      color: vars['--text-secondary'],
      fontWeight: vars['--font-weight-regular'],
      letterSpacing: 0.2,
      marginLeft: vars['--spacing-tiny'],
      flex: 1
    },

    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: vars['--spacing-xxlarge'],
      paddingHorizontal: vars['--spacing-large'],
      marginTop: vars['--spacing-medium'],
      backgroundColor: vars['--surface'],
      borderRadius: vars['--border-radius-large'] + 6,
      borderWidth: vars['--border-width-hairline'],
      borderColor: vars['--border'],
      borderStyle: 'dashed'
    },
    emptyIconContainer: {
      width: 100,
      height: 100,
      borderRadius: vars['--border-radius-xlarge'] + 34,
      backgroundColor: vars['--surface-variant'],
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: vars['--spacing-medium']
    },
    emptyTitle: {
      fontSize: vars['--font-size-large'],
      color: vars['--text'],
      fontWeight: vars['--font-weight-bold'],
      marginTop: vars['--spacing-small'],
      letterSpacing: 0.2,
      textAlign: 'center'
    },
    emptySubtitle: {
      fontSize: vars['--font-size-medium'],
      color: vars['--text-secondary'],
      marginTop: vars['--spacing-small'],
      textAlign: 'center',
      lineHeight: vars['--line-height-large'],
      letterSpacing: 0.2,
      paddingHorizontal: vars['--spacing-medium']
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: vars['--background']
    },
    loadingText: {
      marginTop: vars['--spacing-medium'],
      fontSize: vars['--font-size-medium'],
      color: vars['--text-secondary'],
      fontWeight: vars['--font-weight-medium'],
      letterSpacing: 0.2
    },

    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: vars['--spacing-xxlarge'],
      backgroundColor: vars['--background']
    },
    errorIconContainer: {
      width: 100,
      height: 100,
      borderRadius: vars['--border-radius-xlarge'] + 34,
      backgroundColor: vars['--error'] + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: vars['--spacing-medium']
    },
    errorTitle: {
      fontSize: vars['--font-size-large'],
      color: vars['--text'],
      fontWeight: vars['--font-weight-bold'],
      marginTop: vars['--spacing-small'],
      marginBottom: vars['--spacing-small'],
      letterSpacing: 0.2,
      textAlign: 'center'
    },
    errorText: {
      fontSize: vars['--font-size-medium'],
      color: vars['--text-secondary'],
      marginTop: vars['--spacing-small'],
      marginBottom: vars['--spacing-large'],
      textAlign: 'center',
      lineHeight: vars['--line-height-large'],
      letterSpacing: 0.2,
      paddingHorizontal: vars['--spacing-medium']
    },
    retryButton: {
      backgroundColor: vars['--primary'],
      paddingHorizontal: vars['--spacing-large'],
      paddingVertical: vars['--spacing-medium'],
      borderRadius: vars['--border-radius-medium'] + 2,
      marginTop: vars['--spacing-medium'],
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 150,
      justifyContent: 'center',
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
      letterSpacing: 0.5,
      marginLeft: vars['--spacing-small']
    },

    listContent: {
      paddingBottom: vars['--spacing-xxlarge'] + vars['--spacing-xlarge']
    }
  });
};
