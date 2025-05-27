import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  headerContainer: {
    paddingTop: 30,
    paddingBottom: 20,
  },

  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#E74C3C",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    alignSelf: "flex-end",
    marginRight: 10,
  },

  logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },

  greeting: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    textAlign: "center",
  },

  description: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginVertical: 10,
    paddingHorizontal: 10,
  },

  infoRow: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },

  infoText: {
    fontSize: 17,
    color: "#000",
    marginVertical: 2,
  },

  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginTop: 16,
    padding: 20,
    marginHorizontal: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1E88E5",
    marginBottom: 16,
    textAlign: "center",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  statBox: {
    alignItems: "center",
  },

  statValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1E88E5",
  },

  statLabel: {
    fontSize: 16,
    color: "#666",
    marginTop: 6,
  },

  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECECEC",
    padding: 12,
    borderRadius: 12,
    marginTop: 20,
    marginHorizontal: 10,
  },

  helpText: {
    marginLeft: 10,
    fontSize: 17,
    color: "#333",
  },
});
