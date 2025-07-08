import React from "react";
import { View, Text, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AnimatedPressable from "../ui/animated-pressable.component";
import styles from "./animal-card.styles";

/**
 * Tarjeta animada que muestra la información de un animal.
 *
 * @param {Object} animal - Objeto con información del animal.
 * @param {Function} onPress - Acción al presionar la tarjeta.
 */
const AnimalCard = ({ animal, onPress }: { animal: any; onPress: () => void }) => {
  return (
    <AnimatedPressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: animal.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.commonName}>{animal.commonName}</Text>
        <Text style={styles.scientificName}>{animal.scientificName}</Text>
        <View style={styles.statusContainer}>
          <MaterialIcons
            name="eco"
            size={16}
            color={animal.statusColor || "gray"}
          />
          <Text style={[styles.statusText, { color: animal.statusColor }]}>
            {animal.status}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
};

export default AnimalCard;