import React from "react";
import { View, Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { NavigationProp, useNavigation, useRoute } from "@react-navigation/native";

const ImagePreviewScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute();
  const { imageUri, location } = route.params as { imageUri: string; location: any };

  const handleContinue = () => {
    navigation.navigate("Formulario", {
      imageUri,
      location,
    });
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
      <View style={styles.actions}>
        <TouchableOpacity style={styles.buttonSecondary} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonPrimary} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ImagePreviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#111",
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    marginLeft: 10,
    alignItems: "center",
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: "#555",
    padding: 14,
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
