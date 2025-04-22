import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fdfdfd",
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
    color: "#2c3e50",
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
    color: "#1e272e",
    marginBottom: 4,
  },
  scientificName: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    color: "#7f8c8d",
    marginBottom: 20,
  },
  infoBlock: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#34495e",
    marginTop: 8,
  },
  value: {
    fontSize: 15,
    color: "#2f3640",
    marginTop: 2,
  },
});
