import React, { useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import PropTypes from "prop-types";
import AnimatedPressable from "./AnimatedPressable";

interface Publication {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  status: string;
  animalStatus: string;
  reason?: string;
  location: string;
}

interface StatusIcon {
  name: "times-circle" | "hourglass-half" | "check-circle" | "heartbeat" | "ambulance";
  color: string;
}

// Constantes para mejor mantenibilidad
const STATUS_ICONS: { [key: string]: StatusIcon } = {
  rejected: { name: "times-circle", color: "#F44336" },
  pending: { name: "hourglass-half", color: "#FFC107" },
  published: { name: "check-circle", color: "#4CAF50" },
};

const ANIMAL_STATUS_ICONS: { [key: string]: StatusIcon } = {
  alive: { name: "heartbeat", color: "#4CAF50" },
  dead: { name: "ambulance", color: "#F44336" },
};

const PublicationCard = ({ publication, onPress } : { publication: Publication, onPress: () => void }) => {
  const [imageError, setImageError] = useState(false);
  const { title, description, imageUrl, status, reason, animalStatus } = publication;

  const handleImageError = () => setImageError(true);

  const renderStatusIndicator = () => {
    const iconConfig = STATUS_ICONS[status] || STATUS_ICONS.pending;
    return (
      <View style={styles.statusContainer}>
        <FontAwesome name={iconConfig.name} size={16} color={iconConfig.color} />
        <Text style={[styles.status, styles[status as keyof typeof styles]]}>
          {status === "rejected" ? ` Rechazada: ${reason}` : ` Estado: ${status === "pending" ? "Pendiente" : "Aprobada"}`}
        </Text>
      </View>
    );
  };

  const renderAnimalStatus = () => {
    const animalStatus: keyof typeof ANIMAL_STATUS_ICONS = publication.animalStatus;
    if (!(animalStatus in ANIMAL_STATUS_ICONS)) {
      throw new Error(`Invalid animal status: ${animalStatus}`);
    }
    const iconConfig = ANIMAL_STATUS_ICONS[animalStatus];
    const statusText = animalStatus === "alive" ? "Vivo" : "Muerto";

    return (
        <View style={styles.animalStatusContainer}>
          <FontAwesome name={iconConfig.name} size={16} color={iconConfig.color} />
          <Text style={[styles.animalStatus, styles[animalStatus as keyof typeof styles]]}>
            Estado del animal: {statusText}
          </Text>
        </View>
    );
  };

  return (
    <AnimatedPressable
      style={styles.card}
      onPress={onPress}
   //   accessibilityRole="button"
    //  accessibilityLabel={`Publicación: ${title}`}
    >
      {imageError || !imageUrl ? (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>Imagen no disponible</Text>
        </View>
      ) : (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          onError={handleImageError}
          accessibilityLabel={`Imagen de ${title}`}
        />
      )}

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{title}</Text>
        <Text style={styles.description} numberOfLines={3} ellipsizeMode="tail">
          {description}
        </Text>

        {renderStatusIndicator()}
        {renderAnimalStatus()}
      </View>
    </AnimatedPressable>
  );
};

// Validación de props
PublicationCard.propTypes = {
  publication: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    status: PropTypes.oneOf(["rejected", "pending", "published"]).isRequired,
    reason: PropTypes.string,
    animalStatus: PropTypes.oneOf(["alive", "dead"]).isRequired,
  }).isRequired,
  onPress: PropTypes.func.isRequired,
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
  imagePlaceholder: {
    width: "100%",
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E0E0E0",
  },
  placeholderText: {
    color: "#757575",
    fontSize: 14,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#333",
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    lineHeight: 20,
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
  published: { color: "#4CAF50" },
  pending: { color: "#FFC107" },
  rejected: { color: "#F44336" },
  alive: { color: "#4CAF50" },
  dead: { color: "#F44336" },
});

export default PublicationCard;