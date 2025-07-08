import { StyleSheet } from 'react-native';

export const createStyles = (vars: Record<string, any>) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: vars['--background'],
        },
        logoContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
        },
        logo: {
            width: 150,
            height: 150,
        },
        appName: {
            fontSize: 28,
            fontWeight: 'bold',
            color: vars['--primary'],
            letterSpacing: 2,
            marginBottom: 16,
        },
        spinner: {
            marginVertical: 20,
        },
        loadingContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        loadingText: {
            fontSize: 16,
            color: vars['--text'],
        },
        glowEffect: {
            position: 'absolute',
            width: '150%',
            height: '150%',
            borderRadius: 999,
            opacity: 0.1,
            zIndex: -1,
        },
    });
};
