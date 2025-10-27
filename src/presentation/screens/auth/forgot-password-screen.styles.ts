import { ThemeVariablesType } from '@/presentation/contexts/theme.context';
import { StyleSheet } from 'react-native';

export const createStyles = (vars: ThemeVariablesType) =>
  StyleSheet.create({
    button: {
      marginBottom: vars['--spacing-medium']
    },
    orText: {
      textAlign: 'center',
      fontSize: vars['--font-size-large'],
      fontWeight: vars['--font-weight-medium'],
      color: vars['--text-secondary'],
      marginTop: vars['--spacing-large'],
      marginBottom: vars['--spacing-small']
    },
    resendText: {
      textAlign: 'center',
      fontSize: vars['--font-size-medium'],
      color: vars['--text-secondary'],
      marginTop: vars['--spacing-small'],
      marginBottom: vars['--spacing-large'],
      fontWeight: vars['--font-weight-bold'],
      lineHeight: vars['--line-height-medium']
    }
  });
