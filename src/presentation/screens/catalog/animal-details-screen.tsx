import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  ImageLoadEventData,
  NativeSyntheticEvent,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/theme.context';
import { createAnimalDetailsStyles } from './animal-details-screen.styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animal from '../../../domain/entities/animal.entity';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LatLng } from 'react-native-maps';
import { catalogRepository } from '../../../data/repositories/catalog.repository';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { BackHandler } from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import { Dimensions } from 'react-native';
import { useFileDownload } from '../../hooks/use-file-download.hook';
import LocationMap from '@/presentation/components/ui/location-map.component';

const AnimalDetailsScreen: React.FC = () => {
  const route = useRoute();
  const { animal } = route.params as { animal: Animal };
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createAnimalDetailsStyles(theme, insets),
    [theme, insets]
  );

  const [expanded, setExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [animalLocations, setAnimalLocations] = useState<LatLng[]>([]);
  const [loadingMap, setLoadingMap] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

  const { goBack, navigate } = useNavigationActions();
  const navigation = useNavigation();
  const {
    downloadState,
    handleDownloadSheet,
    getStepLabel,
    progressPercentage
  } = useFileDownload(Number(animal.catalogId), animal.commonNoun, navigate);

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (navigation.canGoBack()) {
            goBack();
            return true;
          }
          navigate('HomeTabs');
          return true;
        }
      );

      return () => backHandler.remove();
    }, [navigate, navigation, goBack])
  );

  useEffect(() => {
    const fetchAnimalMap = async () => {
      try {
        setLoadingMap(true);
        setMapError(null);

        const response = await catalogRepository.getLocations(
          String(animal.catalogId)
        );

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

  const handleImageLoad = (event: NativeSyntheticEvent<ImageLoadEventData>) => {
    const { width, height } = event.nativeEvent.source;
    const aspectRatio = width / height;
    setImageAspectRatio(aspectRatio);
  };

  const InfoRow = ({
    icon,
    label,
    value,
    color
  }: {
    icon: string;
    label: string;
    value: string;
    color: string;
  }) => (
    <View style={styles.infoRow}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  const getImageStyle = () => {
    if (imageAspectRatio !== null && imageAspectRatio < 1) {
      return [styles.cardImage, styles.imageTopAligned];
    }
    return styles.cardImage;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              goBack();
              return;
            }
            navigate('HomeTabs');
          }}
          style={styles.backButton}
          accessibilityLabel="Volver"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {animal.commonNoun}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.headerActionButton,
            isFavorite && styles.headerActionButtonActive
          ]}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#EF4444' : theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.imageCard}
          onPress={() => setShowImageModal(true)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: animal.image }}
            style={getImageStyle()}
            onLoad={handleImageLoad}
          />
          <View style={styles.imageOverlay} />
          <View style={styles.imageContent}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{animal.category}</Text>
            </View>
            <View style={styles.imageTitleContainer}>
              <Text style={styles.imageCommonName}>{animal.commonNoun}</Text>
              <Text style={styles.imageScientificName}>{animal.specie}</Text>
            </View>
          </View>
          <View style={styles.imageZoomIndicator}>
            <Ionicons name="expand-outline" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <View style={styles.contentCard}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{animal.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información General</Text>
            <View style={styles.infoGrid}>
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
          </View>

          {expanded && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detalles Adicionales</Text>
              <View style={styles.infoGrid}>
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
            </View>
          )}

          <TouchableOpacity
            onPress={() => setExpanded(!expanded)}
            style={styles.expandButton}
          >
            <Text style={styles.expandButtonText}>
              {expanded ? 'Ver menos información' : 'Ver más información'}
            </Text>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.downloadButton,
              downloadState.isDownloading && styles.downloadButtonDisabled
            ]}
            onPress={handleDownloadSheet}
            disabled={downloadState.isDownloading}
          >
            <View style={styles.downloadButtonContent}>
              {downloadState.isDownloading ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.textOnPrimary}
                  />
                  <View style={styles.downloadTextContainer}>
                    <Text style={styles.downloadButtonText}>
                      {getStepLabel()}
                    </Text>
                    {downloadState.progress > 0 && (
                      <Text style={styles.downloadProgressText}>
                        {progressPercentage}%
                      </Text>
                    )}
                  </View>
                </>
              ) : (
                <>
                  <Ionicons
                    name="download-outline"
                    size={20}
                    color={theme.colors.textOnPrimary}
                  />
                  <Text style={styles.downloadButtonText}>
                    Descargar Ficha Técnica
                  </Text>
                </>
              )}
            </View>

            {downloadState.isDownloading && downloadState.progress > 0 && (
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${downloadState.progress}%`,
                      backgroundColor: theme.colors.secondary
                    }
                  ]}
                />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.mapSection}>
          <View style={styles.mapHeader}>
            <View style={styles.mapTitleContainer}>
              <Ionicons name="map" size={24} color={theme.colors.primary} />
              <View style={styles.mapTitleTextContainer}>
                <Text style={styles.mapTitle}>Ubicaciones Registradas</Text>
                {!loadingMap && !mapError && (
                  <Text style={styles.mapSubtitle}>
                    {animalLocations.length}{' '}
                    {animalLocations.length === 1 ? 'ubicación' : 'ubicaciones'}{' '}
                    encontradas
                  </Text>
                )}
              </View>
            </View>
          </View>

          {loadingMap ? (
            <View style={styles.mapLoadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.mapLoadingText}>Cargando ubicaciones...</Text>
            </View>
          ) : mapError ? (
            <View style={styles.mapErrorContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={48}
                color={theme.colors.error}
              />
              <Text style={styles.mapErrorText}>
                No se pudieron cargar las ubicaciones
              </Text>
              <Text style={styles.mapErrorSubtext}>{mapError}</Text>
            </View>
          ) : animalLocations.length === 0 ? (
            <View style={styles.mapEmptyContainer}>
              <Ionicons
                name="location-outline"
                size={48}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.mapEmptyText}>
                No hay ubicaciones registradas
              </Text>
            </View>
          ) : (
            <View style={styles.mapContainer}>
              <LocationMap
                locations={animalLocations}
                showLocationNumbers
                height={400}
                initialZoom="far"
                containerStyle={styles.mapWrapper}
              />
            </View>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

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

              {/* @ts-expect-error - TypeScript definitions for react-native-image-pan-zoom don't include children prop */}
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
                    resizeMode: 'contain'
                  }}
                />
              </ImageZoom>

              <View style={styles.modalInfo}>
                <Text style={styles.modalTitle}>{animal.commonNoun}</Text>
                <Text style={styles.modalSubtitle}>{animal.specie}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AnimalDetailsScreen;
