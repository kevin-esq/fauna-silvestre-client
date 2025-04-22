import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { NavigateReset } from "../utils/navigation";

const animalOptions = ["Jaguar", "Mono aullador", "Guacamaya", "Puma", "Tucán"];

const PublicationFormScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { imageUri, location } = route.params as {
    imageUri: string;
    location: { latitude: number; longitude: number };
  };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [animal, setAnimal] = useState(animalOptions[0]);

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Campos incompletos", "Por favor completa todos los campos.");
      return;
    }

    // Aquí puedes manejar el envío de la publicación
    console.log({ title, description, animal, imageUri, location });
    Alert.alert("Éxito", "Publicación enviada.");
    NavigateReset("Home");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />

      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Avistamiento en la selva"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Describe el avistamiento..."
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Animal</Text>
      {animalOptions.map((item) => (
        <TouchableOpacity
          key={item}
          style={[
            styles.option,
            item === animal && styles.optionSelected,
          ]}
          onPress={() => setAnimal(item)}
        >
          <Text style={styles.optionText}>{item}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.location}>
        Ubicación: {location.latitude.toFixed(3)}, {location.longitude.toFixed(3)}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Enviar publicación</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default PublicationFormScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  option: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#eee",
    marginBottom: 6,
  },
  optionSelected: {
    backgroundColor: "#007AFF",
  },
  optionText: {
    color: "#000",
  },
  location: {
    marginTop: 16,
    fontStyle: "italic",
    color: "#555",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: "#888",
    padding: 14,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
