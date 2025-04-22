import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  headerContainer: {
    paddingTop: 30,
    paddingBottom: 20,
  },
  logoutTopRight: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 10,
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#E74C3C",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginVertical: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  locationContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  locationText: {
    fontSize: 18,
    color: "#333",
    marginVertical: 2,
  },
  statsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    marginHorizontal: 10,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#444",
    marginBottom: 16,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  statBox: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e88e5",
  },
  statLabel: {
    fontSize: 16,
    color: "#666",
    marginTop: 6,
  },
});