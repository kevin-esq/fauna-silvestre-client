import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Dimensions,
  RefreshControl
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Rect
} from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Theme, useTheme } from '../../contexts/theme.context';
import { createAnimalDetailsStyles } from './animal-details-screen.styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animal from '../../../domain/entities/animal.entity';
import { LatLng } from 'react-native-maps';
import { catalogRepository } from '../../../data/repositories/catalog.repository';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigationActions } from '../../navigation/navigation-provider';
import { BackHandler } from 'react-native';
import { useAuth } from '../../contexts/auth.context';
import ImageZoom from 'react-native-image-pan-zoom';
import { useFileDownload } from '../../hooks/use-file-download.hook';
import LocationMap from '@/presentation/components/ui/location-map.component';
import CustomModal from '@/presentation/components/ui/custom-modal.component';
import { useCatalogManagement } from '../../hooks/use-catalog-management.hook';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import {
  emitEvent,
  AppEvents,
  addEventListener
} from '@/shared/utils/event-emitter';

const AnimalDetailsScreen: React.FC = () => {
  const route = useRoute();
  const { animal } = route.params as { animal: Animal };
  const { theme } = useTheme();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createAnimalDetailsStyles(theme, insets),
    [theme, insets]
  );

  const [expanded, setExpanded] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [animalLocations, setAnimalLocations] = useState<LatLng[]>([]);
  const [loadingMap, setLoadingMap] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isSharingImage, setIsSharingImage] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [imageModalMessage, setImageModalMessage] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });
  const [currentAnimal, setCurrentAnimal] = useState(animal);

  const { goBack, navigate, navigateToAnimalForm, navigateToImageEditor } =
    useNavigationActions();
  const navigation = useNavigation();
  const { actions } = useCatalogManagement();
  const {
    downloadState,
    handleDownloadSheet,
    getStepLabel,
    progressPercentage
  } = useFileDownload(Number(animal.catalogId), animal.commonNoun, navigate);

  useEffect(() => {
    const subscription = addEventListener(
      AppEvents.ANIMAL_UPDATED,
      async () => {
        console.log('🔄 Animal actualizado, recargando desde backend...');

        try {
          const updatedAnimal = await actions.getAnimalById(
            animal.catalogId.toString()
          );

          setCurrentAnimal({
            ...animal,
            catalogId: animal.catalogId,
            specie: updatedAnimal.specie,
            commonNoun: updatedAnimal.commonNoun,
            description: updatedAnimal.description,
            habits: updatedAnimal.habits,
            habitat: updatedAnimal.habitat,
            reproduction: updatedAnimal.reproduction,
            distribution: updatedAnimal.distribution,
            feeding: updatedAnimal.feeding,
            category: updatedAnimal.category,
            image: `${updatedAnimal.image.split('?')[0]}?t=${Date.now()}`
          });
        } catch (error) {
          console.error('Error al recargar animal:', error);

          setCurrentAnimal(prev => ({
            ...prev,
            image: `${prev.image.split('?')[0]}?t=${Date.now()}`
          }));
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [animal, actions]);

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

  interface InfoSectionProps {
    title: string;
    icon: string;
    content: string;
    theme: Theme;
    styles: ReturnType<typeof createAnimalDetailsStyles>;
    iconColor?: string;
    iconLibrary?: 'ionicons' | 'material' | 'fontawesome';
  }

  const InfoSection = React.memo<InfoSectionProps>(
    ({
      title,
      icon,
      content,
      theme,
      styles,
      iconColor,
      iconLibrary = 'ionicons'
    }) => {
      const IconComponent =
        iconLibrary === 'material'
          ? MaterialCommunityIcons
          : iconLibrary === 'fontawesome'
            ? FontAwesome5
            : Ionicons;

      const color = iconColor || theme.colors.primary;

      return (
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: color + '15' }
                ]}
              >
                <IconComponent name={icon} size={20} color={color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>{title}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.sectionContent}>{content}</Text>
        </View>
      );
    }
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await catalogRepository.getLocations(
        String(animal.catalogId)
      );
      setAnimalLocations(response.cords);
      setMapError(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMapError(error.message);
      }
    } finally {
      setRefreshing(false);
    }
  }, [animal.catalogId]);

  const handleShareImage = useCallback(async () => {
    if (!currentAnimal.image) {
      setImageModalMessage({
        visible: true,
        title: 'Error',
        message: 'No hay imagen disponible para compartir'
      });
      return;
    }

    setIsSharingImage(true);
    let filePath;
    try {
      const fileName = `image_${Date.now()}.jpg`;
      filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

      const downloadResult = await RNFS.downloadFile({
        fromUrl: currentAnimal.image,
        toFile: filePath
      }).promise;

      if (downloadResult.statusCode !== 200) {
        throw new Error(
          `Error al descargar la imagen: Código ${downloadResult.statusCode}`
        );
      }

      await Share.open({
        title: `Compartir ${currentAnimal.commonNoun}`,
        url: `file://${filePath}`,
        type: 'image/jpeg',
        failOnCancel: false
      });
    } catch (error) {
      console.error('Error compartiendo imagen:', error);
      const errorMessage = error instanceof Error ? error.message : '';
      if (!errorMessage.includes('User did not share')) {
        setImageModalMessage({
          visible: true,
          title: 'Error',
          message: `No se pudo compartir la imagen. Detalle: ${errorMessage}`
        });
      }
    } finally {
      if (filePath) {
        try {
          await RNFS.unlink(filePath);
        } catch (unlinkError) {
          console.error('Error al eliminar el archivo temporal:', unlinkError);
        }
      }
      setIsSharingImage(false);
    }
  }, [currentAnimal.image, currentAnimal.commonNoun]);

  const handleSaveImage = useCallback(async () => {
    if (!currentAnimal.image) {
      setImageModalMessage({
        visible: true,
        title: 'Error',
        message: 'No hay imagen disponible para descargar'
      });
      return;
    }

    setIsSavingImage(true);
    try {
      const timestamp = Date.now();
      const animalName = currentAnimal.commonNoun.replace(/\s+/g, '_');
      const fileName = `FaunaSilvestre_${animalName}_${timestamp}.jpg`;
      const filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

      const downloadResult = await RNFS.downloadFile({
        fromUrl: currentAnimal.image,
        toFile: filePath
      }).promise;

      if (downloadResult.statusCode !== 200) {
        throw new Error(
          `Error al descargar la imagen: Código ${downloadResult.statusCode}`
        );
      }

      setImageModalMessage({
        visible: true,
        title: '✅ Imagen descargada',
        message: `La imagen de ${currentAnimal.commonNoun} se guardó en Descargas.\n\n📁 ${fileName}`
      });

      console.log('✅ Imagen guardada en:', filePath);
    } catch (error) {
      console.error('Error guardando imagen:', error);
      const errorMessage = error instanceof Error ? error.message : '';
      setImageModalMessage({
        visible: true,
        title: 'Error',
        message: `No se pudo descargar la imagen. Detalle: ${errorMessage}`
      });
    } finally {
      setIsSavingImage(false);
    }
  }, [currentAnimal.image, currentAnimal.commonNoun]);

  return (
    <View style={styles.container}>
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
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentAnimal.commonNoun}
          </Text>
        </View>

        {isAdmin && (
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={() => setShowEditModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Editar animal"
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}

        <View style={styles.headerBadge}>
          <MaterialCommunityIcons
            name="paw"
            size={18}
            color={theme.colors.leaf}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setShowImageModal(true)}
          style={styles.heroImageContainer}
        >
          <View style={styles.imageCard}>
            <Image
              source={{ uri: currentAnimal.image }}
              style={styles.cardImage}
            />
          </View>

          <View style={styles.heroGradientOverlay}>
            <Svg height="100%" width="100%" style={{ position: 'absolute' }}>
              <Defs>
                <SvgLinearGradient
                  id="animalGradient"
                  x1="0"
                  y1="1"
                  x2="0"
                  y2="0"
                >
                  <Stop offset="0" stopColor="#000000" stopOpacity="0.85" />
                  <Stop offset="0.4" stopColor="#000000" stopOpacity="0.6" />
                  <Stop offset="0.7" stopColor="#000000" stopOpacity="0.3" />
                  <Stop offset="1" stopColor="#000000" stopOpacity="0" />
                </SvgLinearGradient>
              </Defs>
              <Rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="url(#animalGradient)"
              />
            </Svg>
          </View>

          <View style={styles.heroContentOverlay}>
            <View style={styles.categoryBadge}>
              <MaterialCommunityIcons
                name="tag"
                size={18}
                color={theme.colors.leaf}
              />
              <Text style={styles.categoryText}>{currentAnimal.category}</Text>
            </View>

            <View style={styles.heroTitleContainer}>
              <Text style={styles.heroTitle} numberOfLines={2}>
                {currentAnimal.commonNoun}
              </Text>
              <Text style={styles.heroSubtitle}>{currentAnimal.specie}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setShowImageModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="expand-outline"
              size={24}
              color={theme.colors.forest}
            />
          </TouchableOpacity>
        </TouchableOpacity>

        <View style={styles.imageActionsRow}>
          <TouchableOpacity
            style={[styles.imageActionButton, styles.downloadImageButton]}
            onPress={handleSaveImage}
            disabled={isSavingImage}
            activeOpacity={0.8}
          >
            {isSavingImage ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="download-outline" size={20} color="white" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.imageActionButton, styles.shareImageButton]}
            onPress={handleShareImage}
            disabled={isSharingImage}
            activeOpacity={0.8}
          >
            {isSharingImage ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="share-social" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.contentSection}>
          <InfoSection
            title="Nombre Científico"
            icon="flask"
            content={currentAnimal.specie}
            theme={theme}
            styles={styles}
            iconColor={theme.colors.earth}
          />

          <InfoSection
            title="Descripción"
            icon="document-text"
            content={currentAnimal.description}
            theme={theme}
            styles={styles}
            iconColor="#3B82F6"
          />

          <InfoSection
            title="Distribución"
            icon="location"
            content={currentAnimal.distribution}
            theme={theme}
            styles={styles}
            iconColor="#EF4444"
          />

          <InfoSection
            title="Hábitat"
            icon="earth"
            content={currentAnimal.habitat}
            theme={theme}
            styles={styles}
            iconColor={theme.colors.leaf}
          />

          <InfoSection
            title="Alimentación"
            icon="restaurant"
            content={currentAnimal.feeding}
            theme={theme}
            styles={styles}
            iconColor="#F59E0B"
          />

          {expanded && (
            <>
              <InfoSection
                title="Hábitos"
                icon="eye"
                content={currentAnimal.habits}
                theme={theme}
                styles={styles}
                iconColor="#3B82F6"
              />

              <InfoSection
                title="Reproducción"
                icon="heart"
                content={currentAnimal.reproduction}
                theme={theme}
                styles={styles}
                iconColor="#EC4899"
              />
            </>
          )}

          <TouchableOpacity
            onPress={() => setExpanded(!expanded)}
            style={styles.expandButtonContainer}
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

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.downloadButton,
                downloadState.isDownloading && { opacity: 0.7 }
              ]}
              onPress={handleDownloadSheet}
              disabled={downloadState.isDownloading}
              activeOpacity={0.8}
            >
              {downloadState.isDownloading ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.actionButtonText}>{getStepLabel()}</Text>
                  {downloadState.progress > 0 && (
                    <Text style={styles.downloadProgressText}>
                      {progressPercentage}%
                    </Text>
                  )}
                </>
              ) : (
                <>
                  <Ionicons name="download" size={24} color="#fff" />
                  <Text style={styles.actionButtonText}>Descargar Ficha</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: theme.colors.primary + '20' }
                  ]}
                >
                  <Ionicons name="map" size={20} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>
                    Ubicaciones Registradas
                  </Text>
                  {!loadingMap && !mapError && animalLocations.length > 0 && (
                    <Text style={styles.mapSubtitle}>
                      {animalLocations.length}{' '}
                      {animalLocations.length === 1
                        ? 'ubicación'
                        : 'ubicaciones'}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {loadingMap ? (
              <View style={styles.mapLoadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.mapLoadingText}>
                  Cargando ubicaciones...
                </Text>
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
              <Text style={styles.sectionContent}>
                No hay ubicaciones registradas para esta especie
              </Text>
            ) : (
              <View style={styles.mapContainer}>
                <LocationMap
                  locations={animalLocations}
                  showLocationNumbers
                  height={300}
                  initialZoom="far"
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <CustomModal
        isVisible={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Animal"
        description="Selecciona qué deseas editar"
        type="default"
        size="medium"
        centered
        showFooter={false}
      >
        <View style={{ gap: 12, marginTop: 16, marginBottom: 16 }}>
          <TouchableOpacity
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 20,
              paddingHorizontal: 12,
              borderRadius: 12,
              backgroundColor: '#3B82F6',
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4
            }}
            onPress={() => {
              setShowEditModal(false);
              navigateToAnimalForm({
                catalogId: Number(animal.catalogId),
                specie: currentAnimal.specie,
                commonNoun: currentAnimal.commonNoun,
                description: currentAnimal.description,
                habits: currentAnimal.habits,
                habitat: currentAnimal.habitat,
                reproduction: currentAnimal.reproduction,
                distribution: currentAnimal.distribution,
                feeding: currentAnimal.feeding,
                category: currentAnimal.category,
                image: currentAnimal.image
              });
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Editar información del animal"
          >
            <View style={{ marginBottom: 4 }}>
              <Ionicons name="document-text" size={32} color="#FFFFFF" />
            </View>
            <Text
              style={{
                fontSize: 15,
                color: '#FFFFFF',
                fontWeight: '700'
              }}
            >
              Editar Información
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: '#FFFFFF',
                opacity: 0.85,
                marginTop: 4,
                textAlign: 'center',
                paddingHorizontal: 4
              }}
            >
              Modificar datos del animal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 20,
              paddingHorizontal: 12,
              borderRadius: 12,
              backgroundColor: '#10B981',
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4
            }}
            onPress={() => {
              setShowEditModal(false);
              navigateToImageEditor(
                {
                  catalogId: Number(animal.catalogId),
                  specie: currentAnimal.specie,
                  commonNoun: currentAnimal.commonNoun,
                  description: currentAnimal.description,
                  habits: currentAnimal.habits,
                  habitat: currentAnimal.habitat,
                  reproduction: currentAnimal.reproduction,
                  distribution: currentAnimal.distribution,
                  feeding: currentAnimal.feeding,
                  category: currentAnimal.category,
                  image: currentAnimal.image
                },
                true
              );
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Cambiar imagen del animal"
          >
            <View style={{ marginBottom: 4 }}>
              <Ionicons name="image" size={32} color="#FFFFFF" />
            </View>
            <Text
              style={{
                fontSize: 15,
                color: '#FFFFFF',
                fontWeight: '700'
              }}
            >
              Cambiar Imagen
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: '#FFFFFF',
                opacity: 0.85,
                marginTop: 4,
                textAlign: 'center',
                paddingHorizontal: 4
              }}
            >
              Actualizar foto del animal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 20,
              paddingHorizontal: 12,
              borderRadius: 12,
              backgroundColor: theme.colors.error,
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4
            }}
            onPress={() => {
              setShowEditModal(false);
              setShowDeleteModal(true);
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Eliminar animal"
          >
            <View style={{ marginBottom: 4 }}>
              <Ionicons name="trash" size={32} color="#FFFFFF" />
            </View>
            <Text
              style={{
                fontSize: 15,
                color: '#FFFFFF',
                fontWeight: '700'
              }}
            >
              Eliminar Animal
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: '#FFFFFF',
                opacity: 0.85,
                marginTop: 4,
                textAlign: 'center',
                paddingHorizontal: 4
              }}
            >
              Borrar permanentemente
            </Text>
          </TouchableOpacity>
        </View>
      </CustomModal>

      <CustomModal
        isVisible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="⚠️ Eliminar Animal"
        description={`¿Estás seguro de que deseas eliminar a ${currentAnimal.commonNoun}?\n\nEsta acción no se puede deshacer.`}
        type="confirmation"
        size="small"
        centered
        icon={<Ionicons name="warning" size={50} color={theme.colors.error} />}
        buttons={[
          {
            label: 'Cancelar',
            onPress: () => setShowDeleteModal(false),
            variant: 'outline'
          },
          {
            label: 'Eliminar',
            onPress: async () => {
              setShowDeleteModal(false);
              try {
                await actions.deleteAnimal(animal.catalogId);

                emitEvent(AppEvents.ANIMAL_DELETED, {
                  catalogId: animal.catalogId
                });
                goBack();
              } catch (error) {
                console.error('Error al eliminar animal:', error);
              }
            },
            variant: 'danger'
          }
        ]}
        footerAlignment="space-between"
      />

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
                  source={{ uri: currentAnimal.image }}
                  style={{
                    width: Dimensions.get('window').width,
                    height: Dimensions.get('window').height,
                    resizeMode: 'contain'
                  }}
                />
              </ImageZoom>

              <View style={styles.modalInfo}>
                <Text style={styles.modalTitle}>
                  {currentAnimal.commonNoun}
                </Text>
                <Text style={styles.modalSubtitle}>{currentAnimal.specie}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      <CustomModal
        isVisible={imageModalMessage.visible}
        onClose={() =>
          setImageModalMessage({ visible: false, title: '', message: '' })
        }
        title={imageModalMessage.title}
        type="alert"
        maxWidth={Dimensions.get('window').width - 40}
        size="small"
      >
        <Text
          style={{
            fontSize: 15,
            color: theme.colors.text,
            textAlign: 'center',
            lineHeight: 22
          }}
        >
          {imageModalMessage.message}
        </Text>
      </CustomModal>
    </View>
  );
};

export default AnimalDetailsScreen;
