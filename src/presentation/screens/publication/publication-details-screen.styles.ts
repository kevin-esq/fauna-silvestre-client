import { StyleSheet } from 'react-native';

export const createStyles = (vars: Record<string, string>, width: number, height: number) => StyleSheet.create({
    container: {
      flex: 1,
    },
    expandIconContainer: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      backgroundColor: vars["--background-variant"],
      padding: 6,
      borderRadius: 20,
    },
    contentContainer: {
      padding: 20,
      paddingBottom: 40,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: vars["--background-variant"],
      justifyContent: "center",
      alignItems: "center",
    },
    modalCloseButton: {
      position: "absolute",
      top: 50,
      right: 20,
      zIndex: 10,
      backgroundColor: vars["--background-variant"],
      borderRadius: 20,
      padding: 8,
    },
    expandedImage: {
      width: width,
      height: height * 0.8,
    },
    header: {
      marginBottom: 20,
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
    },
    image: {
      width: "100%",
      height: 250,
      borderRadius: 10,
      marginBottom: 20,
    },
    imagePlaceholder: {
      width: "100%",
      height: 250,
      borderRadius: 10,
      marginBottom: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: vars['--background-variant'],
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    description: {
      fontSize: 16,
      lineHeight: 24,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    locationText: {
      marginLeft: 8,
      fontSize: 16,
    },
    statusContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 15,
      borderRadius: 10,
      marginBottom: 20,
    },
    status: {
      fontSize: 16,
      fontWeight: "bold",
      marginLeft: 8,
    },
    rejectionContainer: {
      padding: 15,
      borderRadius: 10,
      marginBottom: 20,
    },
    rejectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 8,
    },
    rejectionText: {
      fontSize: 16,
    },
    button: {
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
    },
    buttonText: {
      fontSize: 18,
      fontWeight: '600',
    },
  });