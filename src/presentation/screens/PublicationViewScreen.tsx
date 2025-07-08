import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { getUserPublications } from '../../shared/utils/fakeData';
import { FontAwesome } from '@expo/vector-icons';

interface PublicationViewScreenParams {
  publicationId: string;
}

const PublicationViewScreen = ({ navigation }) => {
  const route =
    useRoute<RouteProp<Record<string, PublicationViewScreenParams>>>();
  const { publicationId } = route.params;

  const [publication, setPublication] = useState(null);

  useEffect(() => {
    const fetchedPublication = getPublicationDetails(publicationId);
    setPublication(fetchedPublication);
  }, [publicationId]);

  const getPublicationDetails = (id) => {
    const data = getUserPublications(null);
    const publicationsArray = [
      ...data.published,
      ...data.pending,
      ...data.rejected,
    ];
    //setPublications(publicationsArray);
    return publicationsArray.find((pub) => pub.id === id);
  };

  if (!publication) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando detalles...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{publication.title}</Text>
      </View>
      <Image source={{ uri: publication.imageUrl }} style={styles.image} />
      <Text style={styles.description}>{publication.description}</Text>

      <View style={[styles.statusContainer, { backgroundColor: publication.status === "rejected" ? "#F44336" : publication.status === "pending" ? "#FFC107" : "#4CAF50" }]}>
        <Text style={[styles.status]}>
          {publication.status === "rejected" ? <FontAwesome name="times-circle" size={16} color="white" /> : publication.status === "pending" ? <FontAwesome name="hourglass-half" size={16} color="white" /> : <FontAwesome name="check-circle" size={16} color="white" />}
          {publication.status === "rejected" ? " Rechazada" : publication.status === "pending" ? " Pendiente" : " Publicada"}
        </Text>
      </View>

      {publication.status === "rejected" && (
        <View style={styles.rejectionContainer}>
          <Text style={styles.rejectionTitle}>Motivo de rechazo:</Text>
          <Text style={styles.rejectionText}>
            {publication.reason}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  header: {
    marginBottom: 20,
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
  },
  title: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
  },
  rejectionContainer: {
    backgroundColor: "#FF5733",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  rejectionTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  rejectionText: {
    fontSize: 16,
    color: "#fff",
  },
  button: {
    backgroundColor: "#FF5733",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  loadingText: {
    fontSize: 18,
    color: "#333",
  },
  statusContainer: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default PublicationViewScreen;
