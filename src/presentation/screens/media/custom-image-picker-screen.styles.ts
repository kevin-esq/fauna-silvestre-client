import { ThemeVariablesType } from '@/presentation/contexts/theme.context';
import { StyleSheet, Platform } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';

export const createStyles = (
  variables: ThemeVariablesType,
  insets: EdgeInsets
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: variables['--background'],
      left: insets.left,
      right: insets.right
    },
    content: {
      flex: 1
    },

    header: {
      height: 60,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      backgroundColor: variables['--surface'],
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: variables['--divider'],
      ...Platform.select({
        ios: {
          shadowColor: variables['--shadow'],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4
        },
        android: {
          elevation: 3
        }
      })
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: variables['--text'],
      fontFamily: variables['--font-family-primary'],
      letterSpacing: 0.2
    },
    backButton: {
      position: 'absolute',
      left: 16,
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent'
    },

    infoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: variables['--primary'] + '10',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: variables['--divider']
    },
    infoText: {
      fontSize: 13,
      color: variables['--text'],
      marginLeft: 8,
      fontFamily: variables['--font-family-primary'],
      fontWeight: '600',
      letterSpacing: 0.2
    },

    progressContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: variables['--surface'],
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: variables['--divider']
    },
    progressBarContainer: {
      height: 6,
      backgroundColor: variables['--surface-variant'],
      borderRadius: 3,
      marginBottom: 8,
      overflow: 'hidden'
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 3,
      ...Platform.select({
        ios: {
          shadowColor: variables['--primary'],
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 4
        }
      })
    },
    progressText: {
      fontSize: 12,
      color: variables['--text-secondary'],
      textAlign: 'center',
      fontFamily: variables['--font-family-primary'],
      fontWeight: '500',
      letterSpacing: 0.2
    },

    albumGrid: {
      padding: 8,
      paddingTop: 16
    },
    photoGrid: {
      padding: 2,
      paddingTop: 8
    },

    albumItem: {
      flex: 1,
      margin: 8,
      backgroundColor: variables['--surface'],
      borderRadius: 18,
      padding: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: variables['--border'],
      ...Platform.select({
        ios: {
          shadowColor: variables['--shadow'],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8
        },
        android: {
          elevation: 3
        }
      })
    },
    albumCover: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: 14,
      backgroundColor: variables['--surface-variant']
    },
    albumCoverLoading: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: variables['--surface-variant']
    },
    albumTitle: {
      marginTop: 10,
      fontSize: 15,
      fontWeight: '600',
      color: variables['--text'],
      fontFamily: variables['--font-family-primary'],
      letterSpacing: 0.2
    },
    albumCount: {
      marginTop: 4,
      fontSize: 12,
      color: variables['--text-secondary'],
      fontFamily: variables['--font-family-primary'],
      fontWeight: '500',
      letterSpacing: 0.2
    },

    photoItem: {
      margin: 2,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: variables['--surface-variant'],
      ...Platform.select({
        ios: {
          shadowColor: variables['--shadow'],
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3
        },
        android: {
          elevation: 2
        }
      })
    },
    photo: {
      borderRadius: 12,
      backgroundColor: variables['--surface-variant']
    },

    checkingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12
    },
    checkingOverlayPriority: {
      backgroundColor: 'rgba(0, 122, 255, 0.15)'
    },
    priorityText: {
      marginTop: 6,
      fontSize: 10,
      fontWeight: '700',
      color: variables['--primary'],
      textTransform: 'uppercase',
      letterSpacing: 0.5
    },

    selectionOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 122, 255, 0.25)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12
    },
    selectionBadge: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 24,
      padding: 4,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4
        },
        android: {
          elevation: 6
        }
      })
    },

    disabledPhotoOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12
    },

    locationIcon: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 26,
      height: 26,
      borderRadius: 13,
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3
        },
        android: {
          elevation: 4
        }
      })
    },

    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32
    },

    emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      marginTop: 40
    },
    emptyStateIcon: {
      marginBottom: 20,
      padding: 24,
      backgroundColor: variables['--surface-variant'],
      borderRadius: 50,
      ...Platform.select({
        ios: {
          shadowColor: variables['--shadow'],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8
        },
        android: {
          elevation: 2
        }
      })
    },
    emptyStateTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: variables['--text'],
      marginBottom: 8,
      textAlign: 'center',
      fontFamily: variables['--font-family-primary'],
      letterSpacing: 0.2
    },
    emptyStateSubtitle: {
      fontSize: 14,
      color: variables['--text-secondary'],
      textAlign: 'center',
      lineHeight: 20,
      fontFamily: variables['--font-family-primary'],
      fontWeight: '500',
      letterSpacing: 0.2
    },

    loadingText: {
      marginTop: 16,
      fontSize: 14,
      color: variables['--text-secondary'],
      textAlign: 'center',
      fontFamily: variables['--font-family-primary'],
      fontWeight: '500',
      letterSpacing: 0.2
    },

    confirmButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: variables['--primary'],
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 16,
      minWidth: 180,
      ...Platform.select({
        ios: {
          shadowColor: variables['--primary'],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 10
        },
        android: {
          elevation: 6
        }
      })
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: variables['--primary'],
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 14,
      marginTop: 20,
      ...Platform.select({
        ios: {
          shadowColor: variables['--shadow'],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 6
        },
        android: {
          elevation: 3
        }
      })
    },
    buttonText: {
      fontSize: 15,
      fontWeight: '700',
      color: variables['--text-on-primary'],
      fontFamily: variables['--font-family-primary'],
      letterSpacing: 0.3
    },

    floatingButtonContainer: {
      position: 'absolute',
      bottom: 24,
      left: 16,
      right: 16,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }
  });
