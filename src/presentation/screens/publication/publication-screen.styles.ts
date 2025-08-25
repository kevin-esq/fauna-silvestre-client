import { StyleSheet, Platform, Dimensions } from 'react-native';
import { ThemeVariablesType } from '@/presentation/contexts/theme.context';

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24
};

const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16
};

const FONT_SIZE = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20
};

const { width } = Dimensions.get('window');

export const createStyles = (vars: ThemeVariablesType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: vars['--surface']
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.lg
    },
    loadingText: {
      marginTop: SPACING.md,
      fontSize: FONT_SIZE.lg,
      color: vars['--text-secondary']
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.lg
    },
    emptyText: {
      fontSize: FONT_SIZE.lg,
      textAlign: 'center',
      marginTop: SPACING.xl,
      paddingHorizontal: SPACING.lg,
      color: vars['--text'],
      lineHeight: 22
    },
    emptySubText: {
      fontSize: FONT_SIZE.md,
      textAlign: 'center',
      marginTop: SPACING.sm,
      paddingHorizontal: SPACING.lg,
      color: vars['--text-secondary'],
      lineHeight: 20
    },
    list: {
      paddingBottom: SPACING.lg,
      paddingTop: SPACING.md,
      width: '100%',
      alignSelf: 'center'
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.lg
    },
    errorText: {
      textAlign: 'center',
      marginBottom: SPACING.md,
      marginHorizontal: SPACING.md,
      fontSize: FONT_SIZE.md,
      color: vars['--error'],
      lineHeight: 20
    },
    retryButton: {
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderRadius: BORDER_RADIUS.md,
      marginTop: SPACING.md,
      backgroundColor: vars['--primary'],
      minWidth: 120
    },
    retryButtonText: {
      fontSize: FONT_SIZE.lg,
      fontWeight: '600',
      color: vars['--primary-light']
    },
    searchInput: {
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.md,
      marginHorizontal: SPACING.md,
      marginVertical: SPACING.md,
      fontSize: FONT_SIZE.lg,
      borderWidth: 1,
      borderColor: vars['--background'],
      color: vars['--text'],
      backgroundColor: vars['--surface'],
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2
        },
        android: {
          elevation: 2
        }
      })
    },
    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.6)'
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg
    },
    modalContent: {
      width: width > 400 ? '85%' : '90%',
      maxWidth: 400,
      padding: SPACING.lg,
      borderRadius: BORDER_RADIUS.lg,
      backgroundColor: vars['--surface'],
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6
        },
        android: {
          elevation: 8
        }
      })
    },
    modalTitle: {
      fontSize: FONT_SIZE.xxl,
      fontWeight: 'bold',
      marginBottom: SPACING.sm,
      color: vars['--text']
    },
    modalSubtitle: {
      fontSize: FONT_SIZE.md,
      marginBottom: SPACING.md,
      color: vars['--text-secondary'],
      lineHeight: 20
    },
    reasonInput: {
      borderWidth: 1,
      borderColor: vars['--background'],
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.md,
      marginBottom: SPACING.lg,
      textAlignVertical: 'top',
      minHeight: 120,
      fontSize: FONT_SIZE.md,
      color: vars['--text'],
      backgroundColor: vars['--surface']
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: SPACING.md
    },
    modalButton: {
      borderRadius: BORDER_RADIUS.md,
      paddingVertical: SPACING.md,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },
    modalButtonPrimary: {
      backgroundColor: vars['--primary']
    },
    modalButtonSecondary: {
      backgroundColor: vars['--surface-variant'],
      borderWidth: 1,
      borderColor: vars['--background']
    },
    buttonText: {
      fontWeight: '600',
      fontSize: FONT_SIZE.lg
    },
    buttonTextPrimary: {
      color: vars['--primary-light']
    },
    buttonTextSecondary: {
      color: vars['--text']
    },
    keyboardAvoidingView: {
      flex: 1,
      width: '100%'
    },
    primary: {
      color: vars['--primary']
    },
    listContent: {
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.md
    },
    flexGrow: {
      flexGrow: 1
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.md,
      gap: SPACING.sm
    },
    stickyHeader: {
      backgroundColor: vars['--surface'],
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: vars['--background'],
      zIndex: 10,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3
        },
        android: {
          elevation: 4
        }
      })
    },
    fab: {
      position: 'absolute',
      borderRadius: 28,
      width: 56,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: vars['--primary'],
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4
        },
        android: {
          elevation: 6
        }
      })
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    loadingOverlayText: {
      marginTop: SPACING.md,
      fontSize: FONT_SIZE.lg,
      color: vars['--text']
    },
    shadow: {
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3
        },
        android: {
          elevation: 3
        }
      })
    },
    card: {
      backgroundColor: vars['--surface'],
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.md,
      marginVertical: SPACING.xs,
      marginHorizontal: SPACING.md,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2
        },
        android: {
          elevation: 2
        }
      })
    }
  });
