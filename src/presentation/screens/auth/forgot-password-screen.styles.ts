import { StyleSheet } from 'react-native';

export const createStyles = (vars: Record<string, string>) => StyleSheet.create({
    button: {
        marginBottom: 12,
      },
      orText: {
        textAlign: 'center',
        fontSize: 15,
        color: vars['--text-secondary'],
        marginTop: 16,
        marginBottom: 8,
      },
      resendText: {
        textAlign: 'center',
        color: vars['--text-secondary'],
        marginTop: 10,
        marginBottom: 20,
        fontWeight: '600',
      },
});
