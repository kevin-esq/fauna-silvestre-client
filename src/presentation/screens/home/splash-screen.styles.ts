import { StyleSheet } from 'react-native';
import { Theme } from '@/presentation/contexts/theme.context';

export const createStyles = (theme: Theme) => {
  const { colors, spacing, typography, borderRadius } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background
    },
    logoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xlarge,
      position: 'relative'
    },
    logo: {
      width: 150,
      height: 150,
      borderRadius: borderRadius.xlarge
    },
    appName: {
      fontSize: typography.fontSize.xxlarge,
      fontWeight: typography.fontWeight.bold,
      color: colors.forest,
      letterSpacing: 2,
      marginBottom: spacing.large,
      textAlign: 'center',
      paddingHorizontal: spacing.medium
    },

    subtitle: {
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.regular,
      color: colors.textSecondary,
      marginBottom: spacing.xlarge,
      textAlign: 'center',
      letterSpacing: 0.5
    },
    spinner: {
      marginVertical: spacing.large
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 24
    },
    loadingText: {
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.medium,
      color: colors.text,
      lineHeight: typography.lineHeight.medium
    },
    glowEffect: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: colors.forest,
      opacity: 0.15,
      zIndex: -1
    },

    pulseRing: {
      position: 'absolute',
      width: 180,
      height: 180,
      borderRadius: 90,
      borderWidth: 2,
      borderColor: colors.forest,
      opacity: 0.3
    },

    versionContainer: {
      position: 'absolute',
      bottom: spacing.xlarge,
      alignItems: 'center'
    },

    versionText: {
      fontSize: typography.fontSize.small,
      fontWeight: typography.fontWeight.regular,
      color: colors.textSecondary,
      opacity: 0.6
    },

    brandContainer: {
      marginTop: spacing.medium,
      alignItems: 'center'
    },

    brandText: {
      fontSize: typography.fontSize.small,
      fontWeight: typography.fontWeight.medium,
      color: colors.textSecondary,
      letterSpacing: 1
    }
  });
};
