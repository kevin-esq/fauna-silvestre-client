import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Theme, themeVariables } from '@/presentation/contexts/theme.context';

const { width: screenWidth } = Dimensions.get('window');

export const createStyles = (theme: Theme) => {
  const vars = themeVariables(theme);
  const CARD_WIDTH =
    (screenWidth - vars['--spacing-large'] * 2 - vars['--spacing-medium']) / 2;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: vars['--background']
    },
    scrollView: {
      flex: 1,
      backgroundColor: vars['--background']
    },
    bottomSpacer: {
      height: vars['--spacing-xxlarge']
    },

    headerGradient: {
      borderBottomLeftRadius: vars['--border-radius-xlarge'] + 12,
      borderBottomRightRadius: vars['--border-radius-xlarge'] + 12,
      ...Platform.select({
        ios: {
          shadowColor: vars['--shadow'],
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 12
        },
        android: {
          elevation: 6
        }
      })
    },
    headerContainer: {
      paddingHorizontal: vars['--spacing-large'],
      paddingVertical: vars['--spacing-large'],
      paddingTop: vars['--spacing-large'] + vars['--spacing-small']
    },
    headerTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: vars['--spacing-medium']
    },
    greetingSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1
    },
    greetingIcon: {
      fontSize: vars['--font-size-xxlarge'] + 12,
      marginRight: vars['--spacing-medium']
    },
    greetingTextContainer: {
      flex: 1
    },
    greeting: {
      fontSize: vars['--font-size-xlarge'],
      fontWeight: vars['--font-weight-bold'],
      color: vars['--text-on-primary'],
      marginBottom: 4,
      letterSpacing: 0.2,
      lineHeight: vars['--line-height-large']
    },
    subGreeting: {
      fontSize: vars['--font-size-small'] + 1,
      fontWeight: vars['--font-weight-medium'],
      color: vars['--text-on-primary'],
      opacity: 0.9,
      letterSpacing: 0.3
    },
    logoutButton: {
      width: 44,
      height: 44,
      borderRadius: vars['--border-radius-medium'] + 2,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    logoutIcon: {
      fontSize: vars['--icon-size-medium'] - 2,
      color: vars['--text-on-primary']
    },

    timeAndLocationContainer: {
      flexDirection: 'row',
      gap: vars['--spacing-medium'],
      flexWrap: 'wrap'
    },
    infoChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: vars['--spacing-medium'],
      paddingVertical: vars['--spacing-small'],
      borderRadius: vars['--border-radius-medium'] + 2,
      gap: vars['--spacing-tiny']
    },
    infoChipText: {
      fontSize: vars['--font-size-small'],
      color: vars['--text-on-primary'],
      fontWeight: vars['--font-weight-bold'],
      letterSpacing: 0.2
    },

    sectionTitle: {
      fontSize: vars['--font-size-xlarge'] + 2,
      fontWeight: vars['--font-weight-bold'],
      color: vars['--text'],
      marginBottom: vars['--spacing-large'],
      letterSpacing: 0.3
    },

    statsSection: {
      paddingHorizontal: vars['--spacing-large'],
      paddingTop: vars['--spacing-large']
    },
    statsContainer: {
      flexDirection: 'row',
      gap: vars['--spacing-large']
    },
    statCard: {
      backgroundColor: vars['--surface'],
      borderRadius: vars['--border-radius-large'] + 6,
      flex: 1,
      padding: vars['--spacing-large'],
      alignItems: 'center',
      minHeight: 140,
      justifyContent: 'center',
      borderWidth: vars['--border-width-hairline'],
      borderColor: vars['--border'],
      ...Platform.select({
        ios: {
          shadowColor: vars['--shadow'],
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.08,
          shadowRadius: 8
        },
        android: {
          elevation: 4
        }
      })
    },
    statIconContainer: {
      width: 52,
      height: 52,
      borderRadius: vars['--border-radius-large'],
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: vars['--spacing-medium']
    },
    statNumber: {
      fontSize: vars['--font-size-xlarge'] + 8,
      fontWeight: vars['--font-weight-black'],
      color: vars['--text'],
      marginBottom: 4,
      letterSpacing: -0.5
    },
    statLabel: {
      fontSize: vars['--font-size-small'] + 1,
      color: vars['--text-secondary'],
      textAlign: 'center',
      fontWeight: vars['--font-weight-bold'],
      letterSpacing: 0.3
    },

    quickActionsSection: {
      paddingHorizontal: vars['--spacing-large'],
      paddingTop: vars['--spacing-xlarge']
    },
    quickActionsContainer: {
      gap: vars['--spacing-medium']
    },
    quickActionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: vars['--spacing-medium'],
      borderRadius: vars['--border-radius-large'],
      minHeight: 72,
      ...Platform.select({
        ios: {
          shadowColor: vars['--shadow'],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8
        },
        android: {
          elevation: 3
        }
      })
    },
    quickActionPrimary: {
      backgroundColor: vars['--primary']
    },
    quickActionSecondary: {
      backgroundColor: vars['--surface'],
      borderWidth: vars['--border-width-small'],
      borderColor: vars['--forest']
    },
    quickActionTertiary: {
      backgroundColor: vars['--surface'],
      borderWidth: vars['--border-width-small'],
      borderColor: vars['--info']
    },
    quickActionIcon: {
      width: 46,
      height: 46,
      borderRadius: vars['--border-radius-medium'],
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: vars['--spacing-medium']
    },
    quickActionContent: {
      flex: 1
    },
    quickActionTitle: {
      fontSize: vars['--font-size-medium'],
      fontWeight: vars['--font-weight-bold'],
      color: vars['--text-on-primary'],
      marginBottom: 2,
      letterSpacing: 0.2
    },
    quickActionSubtitle: {
      fontSize: vars['--font-size-small'],
      color: vars['--text-on-primary'],
      opacity: 0.85,
      fontWeight: vars['--font-weight-regular'],
      letterSpacing: 0.2
    },

    filtersSection: {
      paddingHorizontal: vars['--spacing-large'],
      paddingTop: vars['--spacing-large']
    },
    filtersHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: vars['--spacing-small']
    },
    filterContainer: {
      marginBottom: vars['--spacing-large'],
      zIndex: 1000,
      elevation: 1000
    },
    filterContainerOpen: {
      zIndex: 99999,
      elevation: 99999
    },
    resultsInfo: {
      backgroundColor: vars['--surface'],
      borderRadius: vars['--border-radius-large'] + 6,
      padding: vars['--spacing-large'],
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: vars['--spacing-large'],
      borderWidth: vars['--border-width-hairline'],
      borderColor: vars['--border'],
      ...Platform.select({
        ios: {
          shadowColor: vars['--shadow'],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 6
        },
        android: {
          elevation: 2
        }
      })
    },
    resultsCount: {
      flex: 1
    },
    resultsNumber: {
      fontSize: vars['--font-size-xlarge'] + 6,
      color: vars['--primary'],
      fontWeight: vars['--font-weight-black'],
      letterSpacing: -0.5
    },
    resultsLabel: {
      fontSize: vars['--font-size-small'] + 1,
      color: vars['--text-secondary'],
      marginTop: 4,
      fontWeight: vars['--font-weight-medium'],
      letterSpacing: 0.2
    },
    toggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: vars['--spacing-large'],
      paddingVertical: vars['--spacing-medium'],
      backgroundColor: vars['--primary-light'] || vars['--surface-variant'],
      borderRadius: vars['--border-radius-medium'] + 2,
      gap: vars['--spacing-tiny'],
      ...Platform.select({
        ios: {
          shadowColor: vars['--primary'],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4
        },
        android: {
          elevation: 2
        }
      })
    },
    toggleButtonText: {
      fontSize: vars['--font-size-small'] + 1,
      fontWeight: vars['--font-weight-bold'],
      color: vars['--primary'],
      letterSpacing: 0.3
    },

    animalsGrid: {
      paddingHorizontal: vars['--spacing-small'],
      paddingVertical: vars['--spacing-small']
    },
    animalsContainer: {
      gap: vars['--spacing-small'],
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between'
    },
    animalsRow: {
      justifyContent: 'space-between',
      marginBottom: vars['--spacing-small']
    },
    animalCardWrapper: {
      width: CARD_WIDTH
    },
    animalCardLeft: {
      marginRight: vars['--spacing-small']
    },
    animalCardRight: {
      marginLeft: vars['--spacing-small']
    },

    loadingSection: {
      paddingHorizontal: vars['--spacing-small'],
      paddingTop: vars['--spacing-large']
    },
    loadingTitle: {
      fontSize: vars['--font-size-large'],
      fontWeight: vars['--font-weight-bold'],
      color: vars['--text'],
      textAlign: 'center',
      marginBottom: vars['--spacing-large'],
      letterSpacing: 0.2
    },
    skeletonGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: vars['--spacing-large'],
      justifyContent: 'space-between'
    },

    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: vars['--spacing-xxlarge'],
      paddingHorizontal: vars['--spacing-large']
    },
    emptyIconContainer: {
      width: 100,
      height: 100,
      borderRadius: vars['--border-radius-xlarge'] + 34,
      backgroundColor: vars['--surface-variant'],
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: vars['--spacing-large'],
      ...Platform.select({
        ios: {
          shadowColor: vars['--shadow'],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4
        },
        android: {
          elevation: 2
        }
      })
    },
    emptyStateTitle: {
      fontSize: vars['--font-size-xlarge'],
      fontWeight: vars['--font-weight-bold'],
      color: vars['--text'],
      textAlign: 'center',
      marginBottom: vars['--spacing-medium'],
      letterSpacing: 0.2
    },
    emptyStateText: {
      fontSize: vars['--font-size-medium'],
      color: vars['--text-secondary'],
      textAlign: 'center',
      lineHeight: vars['--line-height-large'],
      opacity: 0.8,
      maxWidth: 280,
      fontWeight: vars['--font-weight-medium'],
      letterSpacing: 0.2
    }
  });
};
