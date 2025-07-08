import React, { useState, useEffect } from "react";
import { View, Text, Alert, FlatList } from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import moment from "moment";
import * as Location from "expo-location";

import styles from "./styles/HomeScreen.styles";
import FloatingActionButton from "../components/FloatingActionButton";
import AnimalCard from "../components/AnimalCard";
import AnimatedPressable from "../components/AnimatedPressable";
import useDoubleBackExit from "../hooks/useDoubleBackExit";
import { NavigateReset } from "../../shared/utils/navigation";
import {useAuth} from "../contexts/AuthContext";
import type {NavigationProp} from "@react-navigation/native";
import {getAllAnimals} from "../../shared/utils/fakeData";

interface LocationInfo {
  city: string | null;
  region: string | null;
}

/**
 * Pantalla principal del usuario.
 * Muestra información relevante como hora actual, ubicación y ficha técnica de animales registrados.
 * Adaptada para ser más comprensible para adultos mayores.
 */
const HomeScreen = ({ navigation }: { navigation: NavigationProp<any, any> }) => {
  const { signOut, user } = useAuth();

  const [dashboardStats, setDashboardStats] = useState({
    published: 0,
    pending: 0,
  });
  const [animals, setAnimals] = useState<any>([]);
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(moment().format("HH:mm"));

  useDoubleBackExit();

  useEffect(() => {
    loadData();
    fetchLocation();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment().format("HH:mm"));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Carga las publicaciones y animales del usuario.
   */
  const loadData = () => {
    const newAnimals = getAllAnimals();
    setAnimals(newAnimals);
  };

  /**
   * Refresca los datos cuando el usuario baja para actualizar.
   */
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
    setRefreshing(false);
  };
  /**
   * Carga más animales al llegar al final de la lista.
   */
  const handleLoadMore = () => {
      const moreAnimals = getAllAnimals();
    setAnimals((prev: { id: string }[]) => {
      const existingIds = new Set(prev.map((a) => a.id));
      const newUnique = moreAnimals.filter((a) => !existingIds.has(a.id));
      return [...prev, ...newUnique];
    });
  };

  /**
   * Solicita permisos y obtiene la ubicación actual.
   */
  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      const geo = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (geo.length > 0) {
        const { city, region } = geo[0];
        setLocationInfo({ city, region });
      }
    } catch (err) {
      console.log("Error al obtener ubicación:", err);
    } finally {
      setLoadingLocation(false);
    }
  };

  /**
   * Cierra sesión del usuario actual.
   */
  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Deseas salir de la aplicación?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sí", onPress: () => signOut() },
      ],
      { cancelable: true }
    );
  };

  /**
   * Renderiza el encabezado con la hora, ubicación, estadísticas y botón de ayuda.
   */
  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <AnimatedPressable onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={24} color="#fff" />
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </AnimatedPressable>

        <Text style={styles.greeting}>👋 ¡Hola de nuevo!</Text>

        <Text style={styles.description}>
          Aquí puedes ver la ficha técnica de animales en el registro.{"\n"}Gracias por tu aporte.
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoText}>
            📍{locationInfo && !loadingLocation ? `${locationInfo.city}, ${locationInfo.region}` : "Cargando..." }
          </Text>
          <Text style={styles.infoText}>🕒 Hora local: {currentTime}</Text>
        </View>

        <AnimatedPressable onPress={() => navigation.navigate("Publications")} style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Publicaciones</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{dashboardStats.published}</Text>
              <Text style={styles.statLabel}>Publicadas</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{dashboardStats.pending}</Text>
              <Text style={styles.statLabel}>Pendientes</Text>
            </View>
          </View>
        </AnimatedPressable>

        <AnimatedPressable
          style={styles.helpButton}
          onPress={() =>
            Alert.alert(
              "¿Necesitas ayuda?",
              "Puedes llamar al 123456789 o escribirnos a soporte@fauna.com"
            )
          }>
          <MaterialIcons name="help-outline" size={22} color="#000" />
          <Text style={styles.helpText}>¿Necesitas ayuda?</Text>
        </AnimatedPressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={animals}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <AnimalCard
            animal={item}
            onPress={() =>
              navigation.navigate("AnimalDetails", { animal: item })
            }
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      <FloatingActionButton
        onPress={() => NavigateReset("AddPublication")}
        Icon={
          <>
            <FontAwesome name="camera" size={26} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 16, marginTop: 6 }}>
              Nueva foto
            </Text>
          </>
        }
      />
    </View>
  );
};

export default HomeScreen;