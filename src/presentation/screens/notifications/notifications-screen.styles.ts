import { StyleSheet } from 'react-native';
import { Theme } from '../../contexts/theme.context';
import { EdgeInsets } from 'react-native-safe-area-context';

export const createStyles = (theme: Theme, insets: EdgeInsets) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    listContent: {
      paddingHorizontal: theme.spacing.medium,
      paddingTop: theme.spacing.medium,
      paddingBottom: theme.spacing.large + insets.bottom,
      flexGrow: 1
    },
    listHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.medium,
      paddingBottom: theme.spacing.small,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.surfaceVariant
    },
    headerInfo: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    headerTitle: {
      fontSize: theme.typography.fontSize.xlarge,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.forest,
      marginRight: theme.spacing.small
    },
    unreadBadge: {
      backgroundColor: theme.colors.leaf,
      borderRadius: theme.borderRadius.xlarge * 2,
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.tiny
    },
    unreadBadgeText: {
      fontSize: theme.typography.fontSize.small,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.surface
    },
    markAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${theme.colors.forest}10`,
      paddingHorizontal: theme.spacing.small,
      paddingVertical: theme.spacing.tiny,
      borderRadius: theme.borderRadius.small,
      borderWidth: 1,
      borderColor: theme.colors.forest
    },
    markAllText: {
      fontSize: theme.typography.fontSize.small,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.forest,
      marginLeft: theme.spacing.tiny
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xlarge,
      paddingVertical: theme.spacing.xxlarge
    },
    emptyIconContainer: {
      marginBottom: theme.spacing.large,
      opacity: 0.5
    },
    emptyTitle: {
      fontSize: theme.typography.fontSize.xlarge,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.small,
      textAlign: 'center'
    },
    emptyMessage: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: theme.typography.lineHeight.medium
    }
  });
