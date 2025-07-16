import { StyleSheet } from 'react-native';

export const createStyles = (vars: Record<string, string>) => StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: vars['--background-color'],
    },
    full: {
      flex: 1,
      backgroundColor: vars['--background-color'],
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: vars['--background-color'],
    },
    loadingText: {
      marginTop: 20,
      fontSize: 16,
      color: vars['--text-color'],
    },
    bottomControls: {
      position: "absolute",
      bottom: 20,
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      paddingHorizontal: 30,
    },
    thumbnailContainer: {
      position: "absolute",
      left: 0,
      right: 0,
      zIndex: 10,
    },
    modalContent: {
      flex: 1,
    },
  });