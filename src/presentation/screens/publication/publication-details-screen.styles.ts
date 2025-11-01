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
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: insets.top + 12,
      paddingBottom: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.97)',
      zIndex: 100,
      elevation: 8,
      shadowColor: vars['--forest'],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 122, 51, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(0, 122, 51, 0.2)'
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
      alignItems: 'center',
      backgroundColor: 'rgba(0, 122, 51, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(0, 122, 51, 0.2)'
    },

    scrollView: {
      flex: 1
    },

    scrollContent: {
      paddingTop: 0,
      paddingBottom: insets.bottom + 24
    },

    heroImageContainer: {
      position: 'relative',
      height: 400,
      marginBottom: 20
    },

    heroGradientOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '75%',
      zIndex: 1
    },

    heroContentOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20,
      paddingBottom: 24,
      zIndex: 2,
      gap: 12
    },

    statusBadge: {
      flexDirection: 'row',
      alignSelf: 'flex-start',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 24,
      gap: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.97)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8
    },

    statusText: {
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: 0.3
    },

    heroTitleContainer: {
      gap: 8
    },

    heroTitle: {
      fontSize: 32,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: -0.5,
      lineHeight: 38,
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 12
    },

    heroSubtitle: {
      fontSize: 16,
      fontWeight: '500',
      color: 'rgba(255, 255, 255, 0.98)',
      letterSpacing: 0.2,
      textShadowColor: 'rgba(0, 0, 0, 0.7)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 8
    },

    imageCard: {
      width: '100%',
      height: '100%'
    },

    image: {
      width: '100%',
      height: '100%'
    },

    imageActionsRow: {
      position: 'absolute',
      top: insets.top + 72,
      right: 16,
      flexDirection: 'row',
      gap: 12,
      zIndex: 99
    },

    imageActionButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6
    },

    expandButton: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2,
      elevation: 4,
      shadowColor: vars['--forest'],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8
    },

    shareImageButton: {
      width: 44,
      height: 44,
      borderRadius: 22
    },

    downloadImageButton: {
      width: 44,
      height: 44,
      borderRadius: 22
    },

    contentSection: {
      paddingHorizontal: 20
    },

    infoSection: {
      backgroundColor: vars['--surface'],
      borderRadius: 20,
      padding: 24,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: vars['--border'],
      borderLeftWidth: 5,
      borderLeftColor: vars['--forest'],
      elevation: 2,
      shadowColor: vars['--forest'],
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 12
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
      width: 48,
      height: 48,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center'
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: vars['--text'],
      flex: 1,
      letterSpacing: -0.2
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
      fontSize: 16,
      color: vars['--text-secondary'],
      lineHeight: 26,
      paddingLeft: 60,
      letterSpacing: 0.1
    },

    stateBadge: {
      alignSelf: 'flex-start',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 24,
      borderWidth: 2,
      marginLeft: 60,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3
    },

    stateBadgeText: {
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.3
    },

    mapContainer: {
      borderRadius: 16,
      overflow: 'hidden',
      height: 240,
      marginTop: 12,
      elevation: 3,
      shadowColor: vars['--forest'],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8
    },

    rejectionSection: {
      backgroundColor: vars['--error'] + '08',
      borderRadius: 20,
      padding: 24,
      borderLeftWidth: 5,
      borderLeftColor: vars['--error'],
      marginBottom: 16,
      borderWidth: 1,
      borderColor: vars['--error'] + '20',
      elevation: 2,
      shadowColor: vars['--error'],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8
    },

    rejectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12
    },

    rejectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: vars['--error'],
      flex: 1,
      letterSpacing: -0.2
    },

    rejectionText: {
      fontSize: 15,
      color: vars['--text'],
      lineHeight: 24,
      paddingLeft: 52
    },

    rejectedReasonContainer: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1.5,
      marginLeft: 52,
      marginTop: 8
    },

    rejectedReasonText: {
      fontSize: 15,
      fontWeight: '600',
      lineHeight: 22
    },

    actionButtonsContainer: {
      flexDirection: 'row',
      padding: 20,
      paddingBottom: insets.bottom + 20,
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderTopWidth: 0,
      gap: 12,
      elevation: 12,
      shadowColor: vars['--forest'],
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 16
    },

    rejectButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: '#EF5350',
      paddingVertical: 18,
      borderRadius: 16,
      elevation: 4,
      shadowColor: '#EF5350',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12
    },

    approveButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: vars['--forest'],
      paddingVertical: 18,
      borderRadius: 16,
      elevation: 4,
      shadowColor: vars['--forest'],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12
    },

    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: 0.3
    },

    downloadButtonContainer: {
      backgroundColor: vars['--surface'],
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: vars['--border'],
      borderLeftWidth: 4,
      borderLeftColor: vars['--forest'],
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2
    },

    downloadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: vars['--forest'],
      paddingHorizontal: 28,
      paddingVertical: 14,
      borderRadius: 16,
      elevation: 4,
      shadowColor: vars['--forest'],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12
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
