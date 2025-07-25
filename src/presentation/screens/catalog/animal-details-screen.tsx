import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../../contexts/theme-context";
import { useNavigationActions } from "../../navigation/navigation-provider";
import { DrawerScreenProps } from '@react-navigation/drawer';
import { RootStackParamList } from "../../navigation/navigation.types";
import { AnimalModel } from "../../../domain/models/animal.models";
import { createStyles } from "./animal-details-screen.styles";

type Props = DrawerScreenProps<RootStackParamList, 'AnimalDetails'>;

const AnimalDetailsScreen: React.FC<Props> = ({ route }) => {
  const { animal } = route.params;
  const navigation = useNavigationActions();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [expanded, setExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const InfoRow = ({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) => (
    <View style={styles.infoRow}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: theme.colors.text }]}>{label}:</Text>
        <Text style={[styles.infoValue, { color: theme.colors.text }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Tarjeta principal */}
      <View style={styles.card}>
        {/* Header de la tarjeta con imagen y nombre */}
        <TouchableOpacity 
          style={styles.cardHeader}
          onPress={() => setShowImageModal(true)}
          activeOpacity={0.9}
        >
          <Image source={{ uri: animal.image }} style={styles.cardImage} />
          <View style={styles.imageOverlay} />
          <View style={styles.cardHeaderContent}>
            <Text style={styles.commonName}>{animal.commonNoun}</Text>
            <Text style={styles.scientificName}>{animal.specie}</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{animal.category}</Text>
          </View>
          {/* Indicador de que se puede tocar */}
          <View style={styles.imageIndicator}>
            <Ionicons name="expand-outline" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Contenido de la tarjeta */}
        <View style={styles.cardContent}>
          {/* Descripción */}
          <View style={styles.descriptionContainer}>
            <Text style={[styles.description, { color: theme.colors.text }]}>
              {animal.description}
            </Text>
          </View>

          {/* Información básica siempre visible */}
          <View style={styles.basicInfo}>
            <InfoRow 
              icon="location" 
              label="Distribución" 
              value={animal.distribution}
              color="#EF4444"
            />
            
            <InfoRow 
              icon="earth" 
              label="Hábitat" 
              value={animal.habitat}
              color="#10B981"
            />

            <InfoRow 
              icon="restaurant" 
              label="Alimentación" 
              value={animal.feeding}
              color="#F59E0B"
            />
          </View>

          {/* Información expandible */}
          {expanded && (
            <View style={styles.expandedInfo}>
              <View style={styles.separator} />
              <InfoRow 
                icon="eye" 
                label="Hábitos" 
                value={animal.habits}
                color="#3B82F6"
              />
              
              <InfoRow 
                icon="heart" 
                label="Reproducción" 
                value={animal.reproduction}
                color="#8B5CF6"
              />
            </View>
          )}

          {/* Botón expandir/contraer */}
          <TouchableOpacity
            onPress={() => setExpanded(!expanded)}
            style={styles.expandButton}
          >
            <Text style={styles.expandButtonText}>
              {expanded ? 'Ver menos' : 'Ver más detalles'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer con acciones */}
        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={16} 
              color={isFavorite ? "#EF4444" : theme.colors.text} 
            />
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
              Favorito
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="map-outline" size={16} color={theme.colors.text} />
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
              Ver mapa
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="save-outline" size={16} color={theme.colors.text} />
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
              Descargar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal para imagen en pantalla completa */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalBackground}
            onPress={() => setShowImageModal(false)}
            activeOpacity={1}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowImageModal(false)}
              >
                <Ionicons name="close" size={30} color="#FFFFFF" />
              </TouchableOpacity>
              
              <Image 
                source={{ uri: animal.image }} 
                style={styles.modalImage}
                resizeMode="contain"
              />
              
              <View style={styles.modalInfo}>
                <Text style={styles.modalTitle}>{animal.commonNoun}</Text>
                <Text style={styles.modalSubtitle}>{animal.specie}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default AnimalDetailsScreen;