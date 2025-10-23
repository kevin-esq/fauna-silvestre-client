import { StyleSheet } from 'react-native';
import { Theme } from '../../contexts/theme.context';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.medium,
      padding: theme.spacing.medium,
      marginBottom: theme.spacing.small,
      borderLeftWidth: 4,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      position: 'relative'
    },
    unreadContainer: {
      backgroundColor: `${theme.colors.forest}05`,
      elevation: 3
    },
    unreadDot: {
      position: 'absolute',
      top: theme.spacing.medium,
      right: theme.spacing.medium,
      width: 8,
      height: 8,
      borderRadius: theme.borderRadius.xlarge * 2,
      backgroundColor: theme.colors.leaf
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.small
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.xlarge * 2,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.small
    },
    headerContent: {
      flex: 1,
      marginRight: theme.spacing.small
    },
    title: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.tiny
    },
    titleUnread: {
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.forest
    },
    time: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.textSecondary,
      fontWeight: theme.typography.fontWeight.regular
    },
    deleteButton: {
      padding: theme.spacing.tiny,
      borderRadius: theme.borderRadius.small,
      backgroundColor: theme.colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center'
    },
    message: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.text,
      lineHeight: theme.typography.lineHeight.medium,
      marginBottom: theme.spacing.small
    },
    animalTag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${theme.colors.forest}10`,
      paddingHorizontal: theme.spacing.small,
      paddingVertical: theme.spacing.tiny,
      borderRadius: theme.borderRadius.small,
      alignSelf: 'flex-start'
    },
    animalName: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.forest,
      fontWeight: theme.typography.fontWeight.bold,
      marginLeft: theme.spacing.tiny
    }
  });
