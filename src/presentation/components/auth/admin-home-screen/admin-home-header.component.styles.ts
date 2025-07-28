import { StyleSheet } from "react-native";

export const createStyles = (insets: { top: number }, MIN_TOUCH_AREA: number, variables: Record<string, string>) => 
    StyleSheet.create({
      header: {
        paddingTop: insets.top,
        minHeight: MIN_TOUCH_AREA + insets.top,
        paddingHorizontal: 16,
        backgroundColor: variables['--background'],
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      title: {
        fontSize: 24, 
        fontWeight: "bold", 
        color: variables['--text'],
        fontFamily: "System", 
        letterSpacing: 0.5, 
      },
      iconContainer: {
        padding: 8, 
        borderRadius: 8, 
        flexDirection: "row", 
        alignItems: "center", 
        justifyContent: "center", 
      },
      hitSlop: {
        top: 12,
        bottom: 12,
        left: 12,
        right: 12,
      },
      logoutText: {
        fontSize: 16, 
        fontWeight: "bold", 
        color: variables['--text-secondary'], 
        marginRight: 8,
      },
    });