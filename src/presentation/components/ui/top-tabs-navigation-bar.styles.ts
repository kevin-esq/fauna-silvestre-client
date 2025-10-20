import { StyleSheet, Platform } from 'react-native';
import { Theme } from '@/presentation/contexts/theme.context';

export const createStyles = (
  insets: { top: number; left: number; right: number },
  theme: Theme
) => {
  const colors = theme.colors;

  return StyleSheet.create({
    container: {
      paddingTop: insets.top + 8,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8
        },
        android: {
          elevation: 3
        }
      })
    },

    headerOuter: {
      marginTop: 12,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 4
    },

    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 12
    },

    logoContainer: {
      marginRight: 14,
      borderRadius: 50,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.18,
          shadowRadius: 10
        },
        android: {
          elevation: 6
        }
      })
    },

    headerIcon: {
      width: 48,
      height: 48,
      resizeMode: 'contain'
    },

    headerTextContainer: {
      flex: 1,
      justifyContent: 'center'
    },

    headerText: {
      fontSize: 22,
      fontWeight: theme.typography.fontWeight.bold,
      color: colors.text,
      letterSpacing: 0.2,
      lineHeight: 28,
      marginBottom: 2,
      fontFamily: 'Cabin Regular'
    },

    headerSubtitle: {
      fontSize: 11,
      fontWeight: theme.typography.fontWeight.bold,
      color: colors.textSecondary,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      opacity: 0.75
    },

    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10
    },

    tabsOuterContainer: {
      position: 'relative',
      alignItems: 'center',
      marginBottom: 14,
      paddingHorizontal: 4
    },

    tabsContainer: {
      flexDirection: 'row',
      position: 'relative',
      backgroundColor: colors.surfaceVariant,
      borderRadius: 18,
      padding: 6,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 4
        },
        android: {
          elevation: 1
        }
      })
    },

    tabButton: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 8,
      borderRadius: 14,
      minHeight: 52,
      position: 'relative',
      overflow: 'hidden',
      zIndex: 1
    },

    tabButtonBackground: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.surface,
      borderRadius: 14,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6
        },
        android: {
          elevation: 2
        }
      })
    },

    tabIconContainer: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2
    },

    indicator: {
      position: 'absolute',
      height: 3.5,
      bottom: 8,
      borderRadius: 2,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 8
        },
        android: {
          elevation: 4
        }
      })
    },

    badge: {
      position: 'absolute',
      top: -4,
      right: -6,
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.error,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 5,
      borderWidth: 2.5,
      borderColor: colors.surface,
      ...Platform.select({
        ios: {
          shadowColor: colors.error,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.5,
          shadowRadius: 4
        },
        android: {
          elevation: 5
        }
      })
    },

    badgeText: {
      color: colors.textOnPrimary,
      fontSize: 10,
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: 12,
      letterSpacing: -0.2
    },

    rippleEffect: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.primary,
      opacity: 0.08,
      borderRadius: 14
    },

    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.divider,
      opacity: 0.4,
      marginVertical: 8
    },

    skeletonContainer: {
      backgroundColor: colors.surfaceVariant,
      borderRadius: 14,
      overflow: 'hidden',
      height: 52
    },

    skeletonShimmer: {
      backgroundColor: colors.surface,
      opacity: 0.4,
      height: '100%'
    },

    tooltip: {
      position: 'absolute',
      backgroundColor: colors.text,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 16,
      bottom: -52,
      zIndex: 1000,
      minWidth: 90,
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8
        },
        android: {
          elevation: 8
        }
      })
    },

    tooltipText: {
      color: colors.textOnPrimary,
      fontSize: 13,
      fontWeight: theme.typography.fontWeight.bold,
      textAlign: 'center',
      letterSpacing: 0.2
    },

    tooltipArrow: {
      position: 'absolute',
      top: -7,
      width: 0,
      height: 0,
      borderLeftWidth: 7,
      borderRightWidth: 7,
      borderBottomWidth: 7,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: colors.text
    },

    gestureContainer: {
      flex: 1,
      overflow: 'visible'
    },

    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlay
    },

    loading: {
      opacity: 0.5
    },

    error: {
      borderColor: colors.error,
      borderWidth: 1.5,
      borderRadius: 14
    },

    fadeIn: {
      opacity: 0
    },

    fadeInActive: {
      opacity: 1
    }
  });
};
