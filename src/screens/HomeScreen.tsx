import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import FloatingActionButton from "../components/FloatingActionButton";
import { getDashboardStats, getAllAnimals } from "../utils/fakeData";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import styles from "./HomeScreen.styles";
import PublicationCard from "../components/PublicationCard";
import * as Location from "expo-location";
import moment from "moment";
import AnimalCard from "../components/AnimalCard";
import { useAuthContext } from "../contexts/AuthContext";
import useDoubleBackExit from "../hooks/useDoubleBackExit";

const HomeScreen = ({ navigation }) => {
  // Simulación de usuario; en producción utiliza tu hook de autenticación.
  const { user } = {
    user: { id: "1", role: "user", name: "Kevin" },
  };

  const [dashboardStats, setDashboardStats] = useState({
    published: 0,
    pending: 0,
  });
  const [animals, setAnimals] = useState([]);
  const [locationInfo, setLocationInfo] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const { setAuthToken } = useAuthContext();

  useDoubleBackExit();

  useEffect(() => {
    // Cargar estadísticas y publicaciones simuladas
    const loadData = async () => {
      const stats = getDashboardStats(user?.role);
      setDashboardStats(stats);
      setAnimals(getAllAnimals());
    };

    // Obtener ubicación actual y geocodificarla
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLoadingLocation(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        const geo = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (geo.length > 0) {
          const { city, region, country } = geo[0];
          setLocationInfo({ city, region, country });
        }
      } catch (error) {
        console.log("Error al obtener ubicación:", error);
      } finally {
        setLoadingLocation(false);
      }
    };

    loadData();
    fetchLocation();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que quieres salir?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí",
          onPress: async () => {
            setAuthToken("");
          },
        },
      ],
      { cancelable: true }
    );
  };

  const localTime = moment().format("HH:mm");

  // Sección del encabezado con saludo, ubicación y hora
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>👋 Hola, {user.name}</Text>
          <Text style={styles.location}>
            📍{" "}
            {loadingLocation
              ? "Cargando ubicación..."
              : locationInfo
              ? `${locationInfo.city}, ${locationInfo.region}`
              : "Ubicación no disponible"}
          </Text>
          <Text style={styles.time}>⏱️ {localTime}</Text>
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>📊 Tus estadísticas</Text>
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

  return (
    <View style={styles.container}>
      <FlatList
        data={animals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AnimalCard
            animal={item}
            onPress={() =>
              navigation.navigate("AnimalDetails", {
                animal: item,
              })
            }
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
      />

      <FloatingActionButton
        onPress={() => navigation.navigate("AddPublication")}
        Icon={<FontAwesome name="camera" size={24} color="#fff" />}
      />
    </View>
  );
};

export default HomeScreen;
