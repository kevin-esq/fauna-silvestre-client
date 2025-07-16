import React from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar
} from "react-native";
import { NavigationProp, useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { createStyles } from "./image-preview-screen.styles";
import { useTheme, themeVariables } from "../../contexts/theme-context";
import { useMemo } from "react";
import { RootStackParamList } from "../../navigation/navigation.types";
import type { Location } from 'react-native-get-location';

const ImagePreviewScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { imageUri, location } = route.params as { imageUri: string; location: Location };
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const {theme} = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);

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

