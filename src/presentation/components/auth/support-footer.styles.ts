import { StyleSheet } from 'react-native';
import { ThemeVariablesType } from '@/presentation/contexts/theme.context';

export const createStyles = (variables: ThemeVariablesType) =>
  StyleSheet.create({
    container: {
      paddingVertical: variables['--spacing-medium'],
      alignItems: 'center',
      gap: variables['--spacing-small']
    },
    contextualHelp: {
      backgroundColor: variables['--warning'],
      paddingVertical: variables['--spacing-small'],
      paddingHorizontal: variables['--spacing-medium'],
      borderRadius: variables['--border-radius-medium'],
      borderLeftWidth: 3,
      borderLeftColor: variables['--error'],
      marginBottom: variables['--spacing-small'],
      width: '100%',
      opacity: 0.15
    },
    contextualText: {
      fontSize: variables['--font-size-small'],
      color: variables['--error'],
      marginBottom: variables['--spacing-tiny'],
      fontWeight: variables['--font-weight-medium']
    },
    contactLink: {
      fontSize: variables['--font-size-medium'],
      color: variables['--error'],
      fontWeight: variables['--font-weight-bold'],
      textDecorationLine: 'underline'
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: variables['--spacing-tiny']
    },
    footerText: {
      fontSize: variables['--font-size-small'],
      color: variables['--text-secondary']
    },
    supportLink: {
      fontSize: variables['--font-size-small'],
      color: variables['--primary'],
      fontWeight: variables['--font-weight-bold'],
      textDecorationLine: 'underline'
    },
    contactOptions: {
      flexDirection: 'row',
      gap: variables['--spacing-medium'],
      marginTop: variables['--spacing-medium'],
      marginBottom: variables['--spacing-medium']
    },
    contactOption: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: variables['--spacing-large'],
      paddingHorizontal: variables['--spacing-small'],
      borderRadius: variables['--border-radius-medium'],
      elevation: 2,
      shadowColor: variables['--shadow'],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4
    },
    contactIconContainer: {
      marginBottom: variables['--spacing-tiny']
    },
    contactOptionText: {
      fontSize: variables['--font-size-medium'],
      color: '#FFFFFF',
      fontWeight: variables['--font-weight-bold']
    },
    cancelButton: {
      alignSelf: 'center',
      paddingVertical: variables['--spacing-small'],
      paddingHorizontal: variables['--spacing-large']
    },
    cancelButtonText: {
      fontSize: variables['--font-size-medium'],
      color: variables['--text-secondary'],
      fontWeight: variables['--font-weight-medium']
    },
    contactSubtext: {
      fontSize: variables['--font-size-small'],
      color: '#FFFFFF',
      opacity: 0.85,
      marginTop: variables['--spacing-tiny'],
      textAlign: 'center',
      paddingHorizontal: variables['--spacing-tiny']
    },
    supportInfo: {
      backgroundColor: variables['--surface'],
      borderRadius: variables['--border-radius-medium'],
      padding: variables['--spacing-medium'],
      marginTop: variables['--spacing-medium'],
      marginBottom: variables['--spacing-small'],
      borderWidth: variables['--border-width-small'],
      borderColor: variables['--border']
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: variables['--spacing-small'],
      marginBottom: variables['--spacing-small']
    },
    infoText: {
      fontSize: variables['--font-size-small'],
      color: variables['--text'],
      flexShrink: 1,
      lineHeight: variables['--line-height-medium'],
      fontWeight: variables['--font-weight-regular']
    }
  });
