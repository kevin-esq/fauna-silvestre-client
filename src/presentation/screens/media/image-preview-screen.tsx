import React from "react";
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar
} from "react-native";
import { NavigationProp, useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

const ImagePreviewScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute();
  const { imageUri, location } = route.params as { imageUri: string; location: any };
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleContinue = () => {
    navigation.navigate("PublicationForm", { imageUri, location });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Image 
          source={{ uri: imageUri }} 
          style={styles.image} 
          resizeMode="contain"
        />
        
        {/* Header con botón de cerrar */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={handleGoBack}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Footer con acciones */}
        <View style={styles.footer}>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color="#fff" />
            <Text style={styles.locationText}>
              {location ? 
                `Ubicación: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 
                "Ubicación no disponible"}
            </Text>
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.button, styles.buttonSecondary]} 
              onPress={handleGoBack}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Retomar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.buttonPrimary]} 
              onPress={handleContinue}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Continuar</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
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
  },
  header: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    paddingBottom: 30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  locationText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonPrimary: {
    backgroundColor: "#007AFF",
    marginLeft: 10,
  },
  buttonSecondary: {
    backgroundColor: "#333",
    marginRight: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonIcon: {
    marginLeft: 8,
  },
});