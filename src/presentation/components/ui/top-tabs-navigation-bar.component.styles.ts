import { StyleSheet } from 'react-native';
import { themeVariables } from '@/presentation/contexts/theme.context';

export const createStyles = (
  insets: { top: number; left: number; right: number },
  variables: ReturnType<typeof themeVariables>
) =>
  StyleSheet.create({
    container: {
      paddingTop: insets.top + 12,
      paddingHorizontal: 20,
      backgroundColor: variables['--background'],
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: variables['--border'],
    },

    headerOuter: {
      marginTop: 24,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },

    headerIcon: {
      width: 36,
      height: 36,
      marginRight: 12,
      resizeMode: 'contain',
    },

    headerText: {
      fontSize: 28,
      fontWeight: '700',
      color: variables['--primary'],
      flexShrink: 1,
    },

    tabsContainer: {
      flexDirection: 'row',
      alignSelf: 'center',
      position: 'relative',
      marginTop: 8,
    },

    tabButton: {
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
    },

    indicator: {
      position: 'absolute',
      height: 3,
      bottom: 0,
      borderRadius: 2,
      backgroundColor: variables['--primary'],
    },
  });
