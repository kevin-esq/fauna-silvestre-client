import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme, themeVariables } from "../../contexts/theme-context";
import { StyleSheet } from "react-native";
import { useNavigationActions } from "../../navigation/navigation-provider";
import { DrawerScreenProps } from '@react-navigation/drawer';
import { RootStackParamList } from "../../navigation/navigation.types";

type Props = DrawerScreenProps<RootStackParamList, 'AnimalDetails'>;

const AnimalDetailsScreen: React.FC<Props> = ({ route }) => {
  const { animal } = route.params;
  const navigation = useNavigationActions();
  const { theme } = useTheme();
  const variables = themeVariables(theme);
  const styles = createStyles(variables);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
      </View>

      {/* Imagen principal */}
      <Image source={{ uri: animal.image }} style={styles.image} />

      {/* Nombre y nombre científico */}
      <Text style={[styles.commonName, { color: theme.colors.text }]}>{animal.commonNoun}</Text>
      <Text style={[styles.scientificName, { color: theme.colors.text }]}>{animal.specie}</Text>

      {/* Descripción e información adicional */}
      <View style={styles.infoBlock}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Descripción:</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{animal.description}</Text>

        <Text style={[styles.label, { color: theme.colors.text }]}>Hábitat:</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{animal.habitat}</Text>

        <Text style={[styles.label, { color: theme.colors.text }]}>Dieta:</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{animal.feeding}</Text>

        <Text style={[styles.label, { color: theme.colors.text }]}>Distribución geográfica:</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{animal.distribution}</Text>

        <Text style={[styles.label, { color: theme.colors.text }]}>Reproducción:</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{animal.reproduction}</Text>
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