import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { getUserPublications } from "../../shared/utils/fakeData";
import PublicationCard from "../components/PublicationCard";
import styles from "./styles/PublicationScreen.styles";
import useDrawerBackHandler from "../hooks/useDrawerBackHandler";
import type {NavigationProp} from "@react-navigation/native";

interface Publication {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  status: string;
  animalStatus: string;
  reason?: string;
  location: string;
}

const PublicationScreen = ({ navigation } : { navigation: NavigationProp<any, any> }) => {
  const { user } = {
    user: { id: "string", name: "string", email: "string", token: "string" },
  }; //useAuth();
  const [loading, setLoading] = useState(true);
  const [publications, setPublications] = useState<Publication[]>([]);

  useDrawerBackHandler();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = getUserPublications(user.id);
        const publicationsArray = [
          ...data.published.map((publication) => ({ ...publication, reason: '' })),
          ...data.pending.map((publication) => ({ ...publication, reason: '' })),
          ...data.rejected.map((publication) => ({ ...publication })),
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
