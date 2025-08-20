import { themeVariables, Theme, ThemeVariablesType } from "@/presentation/contexts/theme.context";
import { StyleSheet } from "react-native";

export const useStyles = (theme: Theme, isDark?: boolean) => {
  const vars = themeVariables(theme);
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: vars['--background'],
    },
    
    // Header
    headerContainer: {
      padding: 20,
      paddingBottom: 10,
      marginBottom: 10,
    },
    headerTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    greeting: {
      fontSize: 24,
      fontWeight: 'bold',
      color: vars['--text'],
    },
    subGreeting: {
      fontSize: 16,
      color: vars['--text-secondary'],
      marginTop: 4,
    },
    logoutButton: {
      padding: 8,
    },
    logoutButtonText: {
      color: vars['--text-secondary'],
    },
    
    // Info Card
    infoCard: {
      backgroundColor: vars['--surface'],
      borderRadius: 12,
      padding: 16,
      ...shadowStyle(vars, isDark),
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 6,
    },
    infoIcon: {
      color: vars['--text'],
      marginRight: 12,
      width: 24,
    },
    infoText: {
      fontSize: 16,
      color: vars['--text'],
    },
    infoValue: {
      fontSize: 16,
      color: vars['--primary'],
      fontWeight: 'bold',
      marginLeft: 4,
    },
    activityIndicator: {
      marginLeft: 8,
      color: vars['--text-secondary'],
    },
    
    // Secciones
    section: {
      marginTop: 20,
      paddingHorizontal: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: vars['--text'],
      marginBottom: 4,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: vars['--text-secondary'],
      marginBottom: 12,
    },
    seeAll: {
      color: vars['--primary'],
      fontSize: 14,
      fontWeight: '500',
    },
    
    // Quick Actions
    quickActions: {
      marginTop: 8,
    },
    quickActionButton: {
      backgroundColor: vars['--surface'],
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...shadowStyle(vars, isDark),
    },
    quickActionButtonPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    quickActionContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    quickActionIconContainer: {
      backgroundColor: vars['--primary-light'] + '30',
      borderRadius: 10,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    quickActionIcon: {
      color: vars['--primary'],
    },
    quickActionText: {
      fontSize: 16,
      fontWeight: '600',
      color: vars['--text'],
      flexShrink: 1,
    },
    quickActionChevron: {
      color: vars['--text-secondary'],
    },
    
    // User List
    listContent: {
      paddingBottom: 100,
    },
    userListItem: {
      backgroundColor: vars['--surface'],
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 20,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      ...shadowStyle(vars, isDark),
    },
    userListItemPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    userAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 16,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 16,
      fontWeight: '600',
      color: vars['--text'],
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      color: vars['--text-secondary'],
    },
    userChevron: {
      color: vars['--text-secondary'],
    },
    
    // Empty State
    emptyContainer: {
      alignItems: 'center',
      padding: 40,
    },
    emptyIcon: {
      color: vars['--text-secondary'],
      opacity: 0.5,
    },
    emptyTitle: {
      fontSize: 18,
      color: vars['--text'],
      fontWeight: '600',
      marginTop: 16,
    },
    emptySubtitle: {
      fontSize: 14,
      color: vars['--text-secondary'],
      marginTop: 8,
      textAlign: 'center',
    },
    
    // Loading State
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingIndicator: {
      color: vars['--primary'],
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: vars['--text'],
    },
    
    // Error State
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    errorIcon: {
      color: vars['--error'],
    },
    errorText: {
      fontSize: 16,
      color: vars['--text'],
      marginTop: 16,
      textAlign: 'center',
    },
    retryButton: {
      backgroundColor: vars['--primary'],
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      marginTop: 20,
    },
    retryButtonText: {
      color: vars['--text-on-primary'],
      fontSize: 16,
      fontWeight: '600',
    },
    
    // FAB
    fab: {
      position: 'absolute',
      bottom: 30,
      right: 20,
      backgroundColor: vars['--primary'],
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadowStyle(vars, isDark, 8),
    },
    fabIcon: {
      color: vars['--text-on-primary'],
    },
    
    // Refresh Control
    refreshControl: {
      color: vars['--primary'],
    },
  });
};

// Función auxiliar para sombras consistentes
const shadowStyle = (vars: ThemeVariablesType, isDark?: boolean, elevation = 4) => ({
  elevation,
  shadowColor: vars['--shadow'],
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: isDark ? 0.3 : 0.1,
  shadowRadius: isDark ? 6 : 4,
});