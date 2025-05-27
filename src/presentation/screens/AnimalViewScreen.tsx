import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";
import styles from "./styles/AnimalViewScreen.styles";
import useDrawerBackHandler from "../hooks/useDrawerBackHandler";

const AnimalViewScreen = ({ route }) => {
  const { animal } = route.params;
  const navigation = useNavigation();

  useDrawerBackHandler();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#2c3e50" />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
      </View>

      {/* Imagen principal */}
      <Image source={{ uri: animal.image }} style={styles.image} />

      {/* Nombre y nombre científico */}
      <Text style={styles.commonName}>{animal.commonName}</Text>
      <Text style={styles.scientificName}>{animal.scientificName}</Text>

      {/* Información general */}
      <View style={styles.infoBlock}>
        <Text style={styles.label}>Nombre en inglés:</Text>
        <Text style={styles.value}>{animal.englishName}</Text>

        <Text style={styles.label}>Especie:</Text>
        <Text style={styles.value}>{animal.species}</Text>

        <Text style={styles.label}>Estado de conservación:</Text>
        <Text style={[styles.value, { color: animal.statusColor }]}>
          {animal.status}
        </Text>
      </View>

      {/* Descripción e información adicional */}
      <View style={styles.infoBlock}>
        <Text style={styles.label}>Descripción:</Text>
        <Text style={styles.value}>{animal.description}</Text>

        <Text style={styles.label}>Hábitat:</Text>
        <Text style={styles.value}>{animal.habitat}</Text>

        <Text style={styles.label}>Dieta:</Text>
        <Text style={styles.value}>{animal.diet}</Text>

        <Text style={styles.label}>Altura promedio:</Text>
        <Text style={styles.value}>{animal.averageHeight}</Text>

        <Text style={styles.label}>Peso promedio:</Text>
        <Text style={styles.value}>{animal.averageWeight}</Text>

        <Text style={styles.label}>Esperanza de vida:</Text>
        <Text style={styles.value}>{animal.lifespan}</Text>

        <Text style={styles.label}>Distribución geográfica:</Text>
        <Text style={styles.value}>{animal.distribution}</Text>

        <Text style={styles.label}>Actividad:</Text>
        <Text style={styles.value}>{animal.activity}</Text>

        <Text style={styles.label}>Reproducción:</Text>
        <Text style={styles.value}>{animal.reproduction}</Text>

        <Text style={styles.label}>Comportamiento:</Text>
        <Text style={styles.value}>{animal.behavior}</Text>
      </View>
    </ScrollView>
  );
};

export default AnimalViewScreen;