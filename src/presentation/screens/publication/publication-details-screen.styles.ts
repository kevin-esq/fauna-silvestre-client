import {
  ThemeContextType,
  ThemeVariablesType
} from '@/presentation/contexts/theme.context';
import { StyleSheet } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';

export const createStyles = (
  vars: ThemeVariablesType,
  width: number,
  height: number,
  insets: EdgeInsets,
  theme: ThemeContextType
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: vars['--background']
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: insets.top + 16,
      paddingBottom: 16,
      backgroundColor: vars['--surface'],
      borderBottomWidth: 1,
      borderBottomColor: vars['--border'],
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 3
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: vars['--surface-variant'],
      justifyContent: 'center',
      alignItems: 'center'
    },

    headerTitleContainer: {
      flex: 1,
      marginHorizontal: 16,
      alignItems: 'center'
    },

    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: vars['--text'],
      textAlign: 'center'
    },

    headerStatusBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center'
    },

    scrollView: {
      flex: 1
    },

    scrollContent: {
      padding: 20,
      paddingBottom: insets.bottom + 24
    },

    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 16,
      marginBottom: 24,
      gap: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4
    },

    statusText: {
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: 0.5
    },

    imageCard: {
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: vars['--surface-variant'],
      marginBottom: 24,
      position: 'relative',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8
    },

    image: {
      width: '100%',
      height: 280
    },

    expandButton: {
      position: 'absolute',
      bottom: 16,
      right: 16,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4
    },

    infoSection: {
      backgroundColor: vars['--surface'],
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: vars['--border'],
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14
    },

    sectionTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1
    },

    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center'
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: vars['--text'],
      flex: 1
    },

    editButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: vars['--surface-variant'],
      justifyContent: 'center',
      alignItems: 'center'
    },

    sectionContent: {
      fontSize: 15,
      color: vars['--text-secondary'],
      lineHeight: 24,
      paddingLeft: 52
    },

    stateBadge: {
      alignSelf: 'flex-start',
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 20,
      borderWidth: 1.5,
      marginLeft: 52
    },

    stateBadgeText: {
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: 0.5
    },

    mapContainer: {
      borderRadius: 12,
      overflow: 'hidden',
      height: 220,
      marginTop: 8
    },

    rejectionSection: {
      backgroundColor: vars['--error'] + '10',
      borderRadius: 16,
      padding: 20,
      borderLeftWidth: 5,
      borderLeftColor: vars['--error'],
      marginBottom: 16,
      elevation: 1
    },

    rejectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12
    },

    rejectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: vars['--error'],
      flex: 1
    },

    rejectionText: {
      fontSize: 15,
      color: vars['--text'],
      lineHeight: 24,
      paddingLeft: 52
    },

    actionButtonsContainer: {
      flexDirection: 'row',
      padding: 20,
      paddingBottom: insets.bottom + 20,
      backgroundColor: vars['--surface'],
      borderTopWidth: 1,
      borderTopColor: vars['--border'],
      gap: 12,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 6
    },

    rejectButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: '#EF5350',
      paddingVertical: 16,
      borderRadius: 14,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4
    },

    approveButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: '#66BB6A',
      paddingVertical: 16,
      borderRadius: 14,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4
    },

    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: 0.5
    },

    imageModalCloseButton: {
      position: 'absolute',
      top: insets.top + 20,
      right: 20,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
      elevation: 10
    },

    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)'
    },

    modalBackground: {
      flex: 1
    },

    modalContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },

    closeButton: {
      position: 'absolute',
      top: insets.top + 20,
      right: 20,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10
    },

    modalInfo: {
      position: 'absolute',
      bottom: insets.bottom + 40,
      left: 20,
      right: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: theme.spacing.large,
      borderRadius: theme.borderRadius.medium,
      gap: theme.spacing.small
    },

    modalTitle: {
      fontSize: theme.typography.fontSize.xlarge,
      fontWeight: theme.typography.fontWeight.bold,
      color: '#FFFFFF'
    },

    modalSubtitle: {
      fontSize: theme.typography.fontSize.medium,
      color: '#E0E0E0',
      fontStyle: 'italic'
    }
  });
