import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  ImageLoadEventData,
  NativeSyntheticEvent
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme, themeVariables } from "../../contexts/theme-context";
import { DrawerScreenProps } from '@react-navigation/drawer';
import { RootStackParamList } from "../../navigation/navigation.types";
import { createStyles } from "./animal-details-screen.styles";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CatalogMap from '../../components/ui/catalog-map.component';
import { LatLng } from "react-native-maps";
import { catalogRepository } from "../../../data/repositories/catalog.repository" // Asegúrate que esto esté bien importado
import { useFocusEffect } from "@react-navigation/native";
import { useNavigationActions } from "../../navigation/navigation-provider";
import { BackHandler } from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import { Dimensions } from 'react-native';

type Props = DrawerScreenProps<RootStackParamList, 'AnimalDetails'>;

const AnimalDetailsScreen: React.FC<Props> = ({ route }) => {
  const { animal } = route.params;
  const { theme } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const insets = useSafeAreaInsets();
  const styles = createStyles(variables, insets);

  const [expanded, setExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [animalLocations, setAnimalLocations] = useState<LatLng[]>([]);
  const [, setLoadingMap] = useState(true);
  const [, setMapError] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  console.log('animalLocations:', animalLocations);
  const { navigate } = useNavigationActions();

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          navigate('HomeTabs');
          return true;
        },
      );

      return () => backHandler.remove();
    }, [navigate]),
  );


  useEffect(() => {
    const fetchAnimalMap = async () => {
      try {
        setLoadingMap(true);
        setMapError(null);

        const response = await catalogRepository.getLocations(String(animal.catalogId));

        console.log('Locations response:', response);  // DEBUG

        setAnimalLocations(response.cords);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setMapError(error.message);
        } else {
          setMapError('Error desconocido');
        }
      } finally {
        setLoadingMap(false);
      }
    };

    fetchAnimalMap();
  }, [animal.catalogId]);

  // Función para manejar la carga de la imagen y determinar si es vertical
  const handleImageLoad = (event: NativeSyntheticEvent<ImageLoadEventData>) => {
    const { width, height } = event.nativeEvent.source;
    const aspectRatio = width / height;
    setImageAspectRatio(aspectRatio);
  };


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

  // Determinar si la imagen es vertical (aspect ratio < 1) y aplicar estilo correspondiente
  const getImageStyle = () => {
    if (imageAspectRatio !== null && imageAspectRatio < 1) {
      // Es una imagen vertical, aplicamos el estilo para alinear arriba
      return [styles.cardImage, styles.imageTopAligned];
    }
    return styles.cardImage;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: variables['--background'] }}>
      {/* Aquí el botón Volver dentro del área segura, con algo de padding para que no esté pegado */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 8, paddingTop: 10, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => navigate('HomeTabs')}
          style={styles.backButton}
          accessibilityLabel="Volver"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={22} color="white" />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.container}>
        {/* Tarjeta principal */}
        <View style={styles.card}>
          {/* Header de la tarjeta con imagen y nombre */}
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() => setShowImageModal(true)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: animal.image }}
              style={getImageStyle()}
              onLoad={handleImageLoad}
            />
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

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowMapModal(true)}
            >
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
                {/* Botón de cerrar */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowImageModal(false)}
                >
                  <Ionicons name="close" size={30} color="#FFFFFF" />
                </TouchableOpacity>

                {/* Imagen con zoom */}

                //@ts-ignore
                <ImageZoom
                  cropWidth={Dimensions.get('window').width}
                  cropHeight={Dimensions.get('window').height}
                  imageWidth={Dimensions.get('window').width}
                  imageHeight={Dimensions.get('window').height}
                  enableSwipeDown={true}
                  onSwipeDown={() => setShowImageModal(false)}
                >
                  <Image
                    source={{ uri: animal.image }}
                    style={{
                      width: Dimensions.get('window').width,
                      height: Dimensions.get('window').height,
                      resizeMode: 'contain',
                    }}
                  />
                </ImageZoom>

                {/* Información de la imagen */}
                <View style={styles.modalInfo}>
                  <Text style={styles.modalTitle}>{animal.commonNoun}</Text>
                  <Text style={styles.modalSubtitle}>{animal.specie}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>



        {/* Modal mapa */}
        <Modal
          visible={showMapModal}
          animationType="slide"
          onRequestClose={() => setShowMapModal(false)}
        >
          <View style={{ flex: 1 }}>
            {/* Encabezado fijo */}
            <View style={{
              backgroundColor: '#1f2937',
              height: 80,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              paddingTop: 10,
              paddingBottom: 10,
            }}>
              {/* Textos centrados */}
              <View>
                <Text style={{
                  color: '#fff',
                  fontSize: 20,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                  Ubicaciones de {animal.commonNoun}
                </Text>
                <Text style={{
                  color: '#d1d5db',
                  fontSize: 14,
                  textAlign: 'center',
                }}>
                  {animal.specie} • {animalLocations.length} ubicaciones
                </Text>
              </View>

              {/* Botón cerrar en la esquina */}
              <TouchableOpacity
                onPress={() => setShowMapModal(false)}
                style={{
                  position: 'absolute',
                  right: 20,
                  top: 20,
                }}
              >
                <Ionicons
                  name="close"
                  size={34}
                  color="#fff"
                  style={{
                    borderRadius: 25,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    padding: 4,
                  }}
                />
              </TouchableOpacity>
            </View>

            {/* Mapa debajo del header */}
            <View style={{ flex: 1, marginTop: 80 }}>
              <CatalogMap locations={animalLocations} />
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
};

export default AnimalDetailsScreen;
