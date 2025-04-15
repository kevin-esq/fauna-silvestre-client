import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import styles from "./AnimalCard.styles";

const AnimalCard = ({ animal, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
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
    </TouchableOpacity>
  );
};

export default AnimalCard;
