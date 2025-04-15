import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { getUserPublications } from "../utils/fakeData";
//import useAuth from "../hooks/useAuth";
import PublicationCard from "../components/PublicationCard";
import styles from "./PublicationScreen.styles";
import useDrawerBackHandler from "../hooks/useDrawerBackHandler";

const PublicationScreen = ({ navigation }) => {
  const { user } = {
    user: { id: "string", name: "string", email: "string", token: "string" },
  }; //useAuth();
  const [loading, setLoading] = useState(true);
  const [publications, setPublications] = useState([]);

  useDrawerBackHandler();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = getUserPublications(user.id);
        const publicationsArray = [
          ...data.published,
          ...data.pending,
          ...data.rejected,
        ];
        setPublications(publicationsArray);
      } catch (error) {
        console.error("Error al cargar publicaciones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando publicaciones...</Text>
      </View>
    );
  }

  if (!publications.length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No tienes publicaciones todavía.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={publications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PublicationCard
            key={item.id}
            publication={item}
            onPress={() =>
              navigation.navigate("PublicationDetails", {
                publicationId: item.id,
              })
            }
          />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default PublicationScreen;
