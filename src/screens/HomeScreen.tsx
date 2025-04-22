import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, FlatList } from "react-native";
import styles from "./HomeScreen.styles";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import moment from "moment";
import * as Location from "expo-location";

import FloatingActionButton from "../components/FloatingActionButton";
import AnimalCard from "../components/AnimalCard";
import { getDashboardStats, getAllAnimals } from "../utils/fakeData";
import { useAuthContext } from "../contexts/AuthContext";
import useDoubleBackExit from "../hooks/useDoubleBackExit";
import useUser from "../hooks/useUser";
import { NavigateReset } from "../utils/navigation";

const HomeScreen = ({ navigation }) => {
  const user = useUser();
  const { setAuthToken } = useAuthContext();

  const [dashboardStats, setDashboardStats] = useState({
    published: 0,
    pending: 0,
  });
  const [animals, setAnimals] = useState([]);
  const [locationInfo, setLocationInfo] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useDoubleBackExit();

  useEffect(() => {
    loadData();
    fetchLocation();
  }, []);

  const loadData = () => {
    //const newStats = getDashboardStats(user);
    const newAnimals = getAllAnimals(); // Aquí puedes implementar paginación real si gustas
    // setDashboardStats(newStats);
    setAnimals(newAnimals);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    const moreAnimals = getAllAnimals();
    setAnimals((prev) => {
      const existingIds = new Set(prev.map((a) => a.id));
      const newUnique = moreAnimals.filter((a) => !existingIds.has(a.id));
      return [...prev, ...newUnique];
    });
  };

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

  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Deseas salir de la aplicación?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sí", onPress: () => setAuthToken("") },
      ],
      { cancelable: true }
    );
  };

  const renderHeader = () => {
    const localTime = moment().format("HH:mm");

    return (
      <View style={styles.headerContainer}>
        <View style={styles.logoutTopRight}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <MaterialIcons name="logout" size={22} color="#fff" />
            <Text style={styles.logoutButtonText}>Salir</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>👋 ¡Hola de nuevo!</Text>

        <Text style={styles.subtitle}>
          Mira los animales existentes aquí. ¡Gracias por contribuir!
        </Text>

        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>
            📍{" "}
            {loadingLocation
              ? "Buscando ubicación..."
              : locationInfo?.city || "Ubicación no disponible"}
          </Text>
          <Text style={styles.locationText}>🕒 Hora actual: {localTime}</Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Tus publicaciones</Text>
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
        </View>
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
