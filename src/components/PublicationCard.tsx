import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons"; // Asegúrate de instalar este paquete si no lo tienes.

const PublicationCard = ({ publication, onPress }) => {
  const { title, description, imageUrl, status, reason, animalStatus } = publication;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: imageUrl }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <View style={styles.statusContainer}>
          <Text style={[styles.status, styles[status]]}>
            {status === "rejected" ? (
              <FontAwesome name="times-circle" size={16} color="#F44336" />
            ) : status === "pending" ? (
              <FontAwesome name="hourglass-half" size={16} color="#FFC107" />
            ) : (
              <FontAwesome name="check-circle" size={16} color="#4CAF50" />
            )}
            {status === "rejected"
              ? ` Rechazada: ${reason}`
              : ` Estado: ${status}`}
          </Text>
        </View>

        <View style={styles.animalStatusContainer}>
          <Text style={[styles.animalStatus, styles[animalStatus]]}>
            {animalStatus === "alive" ? (
              <FontAwesome name="heartbeat" size={16} color="#4CAF50" />
            ) : (
              <FontAwesome name="ambulance" size={16} color="#F44336" />
            )}
            Estado del animal: {animalStatus === "alive" ? "Vivo" : "Muerto"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    paddingBottom: 10,
  },
  image: {
    width: "100%",
    height: 180,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  status: {
    fontWeight: "600",
    textTransform: "capitalize",
    fontSize: 14,
    marginLeft: 8,
  },
  animalStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  animalStatus: {
    fontWeight: "600",
    textTransform: "capitalize",
    fontSize: 14,
    marginLeft: 8,
  },
  approved: {
    color: "#4CAF50",
  },
  pending: {
    color: "#FFC107",
  },
  rejected: {
    color: "#F44336",
  },
  alive: {
    color: "#4CAF50",
  },
  dead: {
    color: "#F44336",
  },
  reason: {
    fontStyle: "italic",
    color: "#C62828",
  },
});

export default PublicationCard;
