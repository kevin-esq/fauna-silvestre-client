import { StyleSheet } from 'react-native';

export const createStyles = (vars: Record<string, string>) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: vars['--background'],
        },
        list: {
            paddingHorizontal: 16,
            paddingBottom: 100, // Space for FAB
        },
        headerContainer: {
            paddingVertical: 24,
            alignItems: 'center',
        },
        logoutButton: {
            position: 'absolute',
            top: 24,
            right: 16,
            flexDirection: 'row',
            alignItems: 'center',
            padding: 8,
            borderRadius: 8,
            backgroundColor: vars['--card-background'],
        },
        logoutButtonText: {
            marginLeft: 8,
            color: vars['--text'],
            fontWeight: 'bold',
        },
        greeting: {
            fontSize: 28,
            fontWeight: 'bold',
            color: vars['--text'],
            marginBottom: 8,
            marginTop: 40,
        },
        description: {
            fontSize: 16,
            color: vars['--text-secondary'],
            textAlign: 'center',
            marginBottom: 16,
        },
        statsCard: {
            width: '100%',
            padding: 16,
            borderRadius: 12,
            backgroundColor: vars['--card-background'],
            alignItems: 'center',
            marginBottom: 24,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: vars['--text'],
            marginBottom: 16,
        },
        statsRow: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            width: '100%',
        },
        statBox: {
            alignItems: 'center',
            flex: 1,
        },
        statValue: {
            fontSize: 24,
            fontWeight: 'bold',
            color: vars['--primary'],
        },
        statLabel: {
            fontSize: 14,
            color: vars['--text-secondary'],
            marginTop: 4,
        },
    });
};
