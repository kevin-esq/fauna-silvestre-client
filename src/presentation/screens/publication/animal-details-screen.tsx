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
import { useTheme, themeVariables } from "../../contexts/theme-context";
import { StyleSheet } from "react-native";

const AnimalDetailsScreen = ({ route }: { route: any }) => {
  const { animal } = route.params;
  const navigation = useNavigation();
  const { theme } = useTheme();
  const variables = themeVariables(theme);
  const styles = createStyles(variables);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
      </View>

      {/* Imagen principal */}
      <Image source={{ uri: animal.image }} style={styles.image} />

      {/* Nombre y nombre científico */}
      <Text style={[styles.commonName, { color: theme.colors.text }]}>{animal.commonName}</Text>
      <Text style={[styles.scientificName, { color: theme.colors.text }]}>{animal.scientificName}</Text>

      {/* Información general */}
      <View style={styles.infoBlock}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Nombre en inglés:</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{animal.englishName}</Text>

        <Text style={[styles.label, { color: theme.colors.text }]}>Especie:</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{animal.species}</Text>

        <Text style={[styles.label, { color: theme.colors.text }]}>Estado de conservación:</Text>
        <Text style={[styles.value, { color: animal.statusColor }]}>{animal.status}</Text>
      </View>

      {/* Descripción e información adicional */}
      <View style={styles.infoBlock}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Descripción:</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{animal.description}</Text>

        <Text style={[styles.label, { color: theme.colors.text }]}>Hábitat:</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{animal.habitat}</Text>

        <Text style={[styles.label, { color: theme.colors.text }]}>Dieta:</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{animal.diet}</Text>

        <Text style={[styles.label, { color: theme.colors.text }]}>Altura promedio:</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{animal.averageHeight}</Text>

        <Text style={[styles.label, { color: theme.colors.text }]}>Peso promedio:</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{animal.averageWeight}</Text>

        <Text style={[styles.label, { color: theme.colors.text }]}>Esperanza de vida:</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{animal.lifespan}</Text>

        <Text style={[styles.label, { color: theme.colors.text }]}>Distribución geográfica:</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{animal.distribution}</Text>

        <Text style={[styles.label, { color: theme.colors.text }]}>Actividad:</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{animal.activity}</Text>

        <Text style={[styles.label, { color: theme.colors.text }]}>Reproducción:</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{animal.reproduction}</Text>

        <Text style={[styles.label, { color: theme.colors.text }]}>Comportamiento:</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{animal.behavior}</Text>
      </View>
    </ScrollView>
  );
};

const createStyles = (vars: Record<string, string>) => 
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: vars["--background"],
  },
  header: {
    backgroundColor: vars["--background"],
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: vars["--border"],
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    fontSize: 18,
    marginLeft: 10,
    color: vars["--text"],
  },
  image: {
    width: "100%",
    height: 300,
  },
  commonName: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
  },
  scientificName: {
    fontSize: 18,
    marginVertical: 10,
  },
  infoBlock: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: vars["--border"],
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default AnimalDetailsScreen;