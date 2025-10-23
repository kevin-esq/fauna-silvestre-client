import { StyleSheet } from 'react-native';
import { Theme } from '../../contexts/theme.context';
import { EdgeInsets } from 'react-native-safe-area-context';

export const createStyles = (theme: Theme, insets: EdgeInsets) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: insets.top + theme.spacing.medium,
      paddingHorizontal: theme.spacing.medium,
      paddingBottom: theme.spacing.medium,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.surfaceVariant,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.small
    },
    headerTitle: {
      fontSize: theme.typography.fontSize.xlarge,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.forest
    },
    closeButton: {
      padding: theme.spacing.tiny,
      borderRadius: theme.borderRadius.small
    },
    tabsContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.small,
      paddingVertical: theme.spacing.tiny,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.surfaceVariant
    },
    tabButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.small,
      paddingHorizontal: theme.spacing.tiny,
      marginHorizontal: theme.spacing.tiny,
      borderRadius: theme.borderRadius.small,
      backgroundColor: theme.colors.surfaceVariant,
      gap: theme.spacing.tiny
    },
    tabButtonActive: {
      backgroundColor: theme.colors.forest
    },
    tabButtonText: {
      fontSize: theme.typography.fontSize.small,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.forest
    },
    tabButtonTextActive: {
      color: theme.colors.surface
    },
    scrollView: {
      flex: 1
    },
    scrollContent: {
      paddingBottom: insets.bottom + theme.spacing.xlarge
    },
    content: {
      padding: theme.spacing.medium
    },
    section: {
      marginBottom: theme.spacing.large
    },
    iconHeader: {
      alignItems: 'center',
      marginBottom: theme.spacing.medium
    },
    title: {
      fontSize: theme.typography.fontSize.xlarge,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.forest,
      marginBottom: theme.spacing.small
    },
    subtitle: {
      fontSize: theme.typography.fontSize.large,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.earth,
      marginBottom: theme.spacing.small
    },
    paragraph: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.text,
      lineHeight: theme.typography.lineHeight.medium,
      marginBottom: theme.spacing.small
    },
    bulletList: {
      marginLeft: theme.spacing.small,
      marginTop: theme.spacing.tiny
    },
    bulletItem: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.text,
      lineHeight: theme.typography.lineHeight.medium,
      marginBottom: theme.spacing.tiny
    },
    tutorialStep: {
      flexDirection: 'row',
      marginBottom: theme.spacing.medium,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.medium,
      borderRadius: theme.borderRadius.medium,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.leaf,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2
    },
    stepNumber: {
      width: 36,
      height: 36,
      borderRadius: theme.borderRadius.xlarge * 2,
      backgroundColor: theme.colors.leaf,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.small
    },
    stepNumberText: {
      fontSize: theme.typography.fontSize.large,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.surface
    },
    stepContent: {
      flex: 1
    },
    stepTitle: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.forest,
      marginBottom: theme.spacing.tiny
    },
    stepDescription: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.text,
      lineHeight: theme.typography.lineHeight.medium
    },
    faqItem: {
      marginBottom: theme.spacing.medium,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.medium,
      borderRadius: theme.borderRadius.medium,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.water,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2
    },
    faqQuestion: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.forest,
      marginBottom: theme.spacing.small
    },
    faqAnswer: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.text,
      lineHeight: theme.typography.lineHeight.medium
    },
    bold: {
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.forest
    },
    link: {
      color: theme.colors.water,
      textDecorationLine: 'underline'
    },
    contactButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.forest,
      paddingVertical: theme.spacing.small,
      paddingHorizontal: theme.spacing.medium,
      borderRadius: theme.borderRadius.medium,
      gap: theme.spacing.small,
      marginTop: theme.spacing.small,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3
    },
    contactButtonText: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.surface
    }
  });
