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
  Modal,
  Dimensions,
  SafeAreaView,
  Animated,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { NavigateReset } from "../utils/navigation";

const { width, height } = Dimensions.get("window");

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
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Campos incompletos", "Por favor completa todos los campos.");
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    console.log({ title, description, animal, imageUri, location });
    Alert.alert("Éxito", "Publicación enviada.");
    NavigateReset("Home");
  };

  const toggleImageExpand = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsImageExpanded(!isImageExpanded);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Nueva Publicación</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Imagen con opción de expandir */}
          <TouchableOpacity onPress={toggleImageExpand} activeOpacity={0.8}>
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.expandIconContainer}>
              <MaterialIcons name="zoom-in" size={24} color="white" />
            </View>
          </TouchableOpacity>

          {/* Formulario */}
          <View style={styles.formContainer}>
            <Text style={styles.label}>Título*</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Avistamiento en la selva"
              placeholderTextColor="#888"
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
            />

            <Text style={styles.label}>Descripción*</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe el avistamiento..."
              placeholderTextColor="#888"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Animal*</Text>
            <View style={styles.animalOptions}>
              {animalOptions.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.option,
                    item === animal && styles.optionSelected,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setAnimal(item);
                  }}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.optionText,
                      item === animal && styles.optionTextSelected,
                    ]}>
                    {item}
                  </Text>
                  {item === animal && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color="white"
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.locationContainer}>
              <Ionicons name="location-sharp" size={16} color="#555" />
              <Text style={styles.locationText}>
                Ubicación: {location.latitude.toFixed(4)},{" "}
                {location.longitude.toFixed(4)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer con botones */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.7}>
            <Text style={styles.submitButtonText}>Publicar</Text>
            <Ionicons
              name="send"
              size={18}
              color="white"
              style={styles.sendIcon}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Modal para imagen expandida */}
      <Modal visible={isImageExpanded} transparent={true}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={toggleImageExpand}
            activeOpacity={0.7}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          <Image
            source={{ uri: imageUri }}
            style={styles.expandedImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 8,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  image: {
    width: "100%",
    height: width * 0.7,
    borderRadius: 12,
    marginBottom: 16,
  },
  expandIconContainer: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 6,
    borderRadius: 20,
  },
  formContainer: {
    paddingHorizontal: 16,
  },
  label: {
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
    fontSize: 15,
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 15,
    color: "#333",
    borderWidth: 1,
    borderColor: "#eee",
  },
  textArea: {
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 15,
    color: "#333",
    height: 120,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#eee",
  },
  animalOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    gap: 8,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
  },
  optionSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  optionText: {
    color: "#333",
    fontSize: 14,
  },
  optionTextSelected: {
    color: "white",
  },
  checkIcon: {
    marginLeft: 6,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  locationText: {
    marginLeft: 8,
    color: "#555",
    fontSize: 14,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    ...Platform.select({
      ios: {
        paddingBottom: 30,
      },
    }),
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  sendIcon: {
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  expandedImage: {
    width: width,
    height: height * 0.8,
  },
});

export default PublicationFormScreen;