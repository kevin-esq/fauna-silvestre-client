import { StyleSheet } from 'react-native';
import { Theme } from '@/presentation/contexts/theme.context';
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
      borderRadius: theme.borderRadius.small,
      backgroundColor: theme.colors.surfaceVariant
    },
    tabsContainer: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.small,
      paddingVertical: theme.spacing.small,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.surfaceVariant
    },
    tabRow: {
      flexDirection: 'row',
      marginBottom: theme.spacing.tiny
    },
    tabButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.small + 2,
      paddingHorizontal: theme.spacing.small,
      marginHorizontal: theme.spacing.tiny,
      borderRadius: theme.borderRadius.medium,
      backgroundColor: theme.colors.surfaceVariant,
      gap: theme.spacing.small
    },
    tabButtonActive: {
      backgroundColor: theme.colors.forest,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 2
    },
    tabButtonText: {
      fontSize: theme.typography.fontSize.small,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.forest,
      textAlign: 'center'
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
      marginBottom: theme.spacing.medium,
      padding: theme.spacing.medium,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.xlarge,
      alignSelf: 'center'
    },
    title: {
      fontSize: theme.typography.fontSize.xlarge,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.forest,
      marginBottom: theme.spacing.small
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.small,
      marginBottom: theme.spacing.small
    },
    subtitle: {
      fontSize: theme.typography.fontSize.large,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.earth,
      flex: 1
    },
    paragraph: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.text,
      lineHeight: theme.typography.lineHeight.large,
      marginBottom: theme.spacing.small
    },
    bulletList: {
      marginLeft: theme.spacing.small,
      marginTop: theme.spacing.small,
      gap: theme.spacing.small
    },
    bulletItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.small,
      paddingVertical: theme.spacing.tiny
    },
    bulletText: {
      flex: 1,
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.text,
      lineHeight: theme.typography.lineHeight.medium
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
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2
    },
    stepNumber: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.leaf,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.medium,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3
    },
    stepNumberText: {
      fontSize: theme.typography.fontSize.large,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.surface
    },
    stepContent: {
      flex: 1
    },
    stepTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.small,
      marginBottom: theme.spacing.small
    },
    stepTitle: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.forest,
      flex: 1
    },
    stepDescription: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.textSecondary,
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
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2
    },
    faqQuestionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.small,
      marginBottom: theme.spacing.small
    },
    faqQuestion: {
      flex: 1,
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.forest
    },
    faqAnswer: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.textSecondary,
      lineHeight: theme.typography.lineHeight.medium
    },
    bold: {
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.forest
    },
    link: {
      color: theme.colors.water,
      textDecorationLine: 'underline',
      fontWeight: theme.typography.fontWeight.medium
    },
    contactButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.forest,
      paddingVertical: theme.spacing.medium,
      paddingHorizontal: theme.spacing.large,
      borderRadius: theme.borderRadius.medium,
      gap: theme.spacing.small,
      marginTop: theme.spacing.small,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4
    },
    contactButtonText: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.surface
    },
    contactMethodsGrid: {
      gap: theme.spacing.medium,
      marginTop: theme.spacing.small
    },
    contactMethodCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.medium,
      borderRadius: theme.borderRadius.medium,
      borderLeftWidth: 4,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
      gap: theme.spacing.medium
    },
    contactMethodIcon: {
      width: 44,
      height: 44,
      borderRadius: theme.borderRadius.medium,
      justifyContent: 'center',
      alignItems: 'center'
    },
    contactMethodInfo: {
      flex: 1
    },
    contactMethodLabel: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.forest,
      marginBottom: 2
    },
    contactMethodValue: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.textSecondary
    },
    supportInfoBox: {
      backgroundColor: theme.colors.surfaceVariant,
      padding: theme.spacing.medium,
      borderRadius: theme.borderRadius.medium,
      marginTop: theme.spacing.medium,
      gap: theme.spacing.small
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.small
    },
    infoItemText: {
      flex: 1,
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.textSecondary
    }
  });
