import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  location: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },
  time: {
    fontSize: 13,
    color: "#aaa",
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: "#FF6B6B",
    padding: 10,
    borderRadius: 50,
    marginLeft: 12,
    elevation: 2,
  },
  statsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e88e5",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});
