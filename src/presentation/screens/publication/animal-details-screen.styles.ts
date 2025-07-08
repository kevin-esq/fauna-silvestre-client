import { StyleSheet } from "react-native";


export const createStyles = (vars: Record<string, string>) =>
  StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: vars["--background"],
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    marginLeft: 6,
    fontSize: 16,
    color: vars["--text"],
    fontWeight: "600",
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 16,
    marginBottom: 20,
  },
  commonName: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: vars["--text"],
    marginBottom: 4,
  },
  scientificName: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    color: vars["--text-secondary"],
    marginBottom: 20,
  },
  infoBlock: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: vars["--text"],
    marginTop: 8,
  },
  value: {
    fontSize: 15,
    color: vars["--text-secondary"],
    marginTop: 2,
  },
});
