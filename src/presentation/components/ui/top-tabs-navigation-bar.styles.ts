import { StyleSheet, Platform } from 'react-native';
import { Theme } from '@/presentation/contexts/theme.context';

export const createStyles = (
  insets: { top: number; left: number; right: number },
  theme: Theme
) => {
  const { colors, spacing, borderRadius, typography, borderWidths } = theme;

  return StyleSheet.create({
    container: {
      paddingTop: insets.top + spacing.small,
      paddingHorizontal: spacing.medium,
      backgroundColor: colors.surface,
      borderBottomWidth: borderWidths.hairline,
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
      marginTop: spacing.small + spacing.tiny,
      marginBottom: spacing.medium,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.tiny
    },

    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: spacing.small + spacing.tiny
    },

    logoContainer: {
      marginRight: spacing.medium - 2,
      borderRadius: borderRadius.xlarge * 3,
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
      fontSize: typography.fontSize.xxlarge - 2,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
      letterSpacing: 0.2,
      lineHeight: typography.lineHeight.xlarge,
      marginBottom: spacing.tiny / 2,
      fontFamily: 'Cabin Regular'
    },

    headerSubtitle: {
      fontSize: typography.fontSize.small - 1,
      fontWeight: typography.fontWeight.bold,
      color: colors.textSecondary,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      opacity: 0.75
    },

    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.small + spacing.tiny / 2
    },

    tabsOuterContainer: {
      position: 'relative',
      alignItems: 'center',
      marginBottom: spacing.medium - 2,
      paddingHorizontal: spacing.tiny
    },

    tabsContainer: {
      flexDirection: 'row',
      position: 'relative',
      backgroundColor: colors.surfaceVariant,
      borderRadius: borderRadius.large + 6,
      padding: spacing.tiny + 2,
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
      paddingVertical: spacing.medium - 2,
      paddingHorizontal: spacing.small,
      borderRadius: borderRadius.large + 2,
      minHeight: 52,
      position: 'relative',
      overflow: 'hidden',
      zIndex: 1
    },

    tabButtonBackground: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.large + 2,
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
      bottom: spacing.small,
      borderRadius: borderRadius.small / 2,
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
      top: -spacing.tiny,
      right: -spacing.tiny - 2,
      minWidth: 20,
      height: 20,
      borderRadius: borderRadius.medium + 2,
      backgroundColor: colors.error,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.tiny + 1,
      borderWidth: borderWidths.small + 0,
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
      fontSize: typography.fontSize.small - 2,
      fontWeight: typography.fontWeight.bold,
      lineHeight: typography.lineHeight.small - 4,
      letterSpacing: -0.2
    },

    rippleEffect: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.primary,
      opacity: 0.08,
      borderRadius: borderRadius.large + 2
    },

    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.divider,
      opacity: 0.4,
      marginVertical: 8
    },

    skeletonContainer: {
      backgroundColor: colors.surfaceVariant,
      borderRadius: borderRadius.large + 2,
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
      borderRadius: borderRadius.medium + 2,
      paddingVertical: spacing.small + 2,
      paddingHorizontal: spacing.medium,
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
      fontSize: typography.fontSize.medium - 1,
      fontWeight: typography.fontWeight.bold,
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
      borderWidth: borderWidths.hairline + 0,
      borderRadius: borderRadius.large + 2
    },

    fadeIn: {
      opacity: 0
    },

    fadeInActive: {
      opacity: 1
    }
  });
};
