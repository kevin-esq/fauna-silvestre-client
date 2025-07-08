//animal card styles
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginVertical: 8,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  image: {
    width: 100,
    height: 100,
  },
  info: {
    padding: 10,
    flex: 1,
    justifyContent: "center",
  },
  commonName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  scientificName: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#666",
  },
  statusContainer: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    marginLeft: 4,
    fontSize: 14,
  },
});