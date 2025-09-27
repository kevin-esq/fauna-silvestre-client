import React, {
  useState,
  useEffect,
  useMemo,
  memo,
  useCallback,
  useRef
} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert
} from 'react-native';
import {
  Album,
  PhotoIdentifier,
  CameraRoll
} from '@react-native-camera-roll/camera-roll';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Theme, themeVariables } from '../../contexts/theme.context';
import { createStyles } from './custom-image-picker-screen.styles';
import type { StyleProp, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { Location } from 'react-native-get-location';
import {
  MediaLibraryService,
  MediaMetadata
} from '../../../services/media/media-library.service';

const PAGE_SIZE = 50;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_ITEM_SIZE = (SCREEN_WIDTH - 12) / 3;
const INITIAL_RENDER_COUNT = 15;
const MAX_RENDER_PER_BATCH = 12;
const WINDOW_SIZE = 5;

interface ImageItem {
  uri: string;
  id: string;
  title: string;
  hasLocation: boolean;
}

interface AlbumWithCover extends Album {
  coverUri?: string;
}

interface Props {
  onConfirm: (uri: string, location: Location) => void;
  onCancel: () => void;
  theme: Theme;
}

interface Styles {
  container: StyleProp<ViewStyle>;
  header: StyleProp<ViewStyle>;
  headerTitle: StyleProp<TextStyle>;
  albumGrid: StyleProp<ViewStyle>;
  albumItem: StyleProp<ViewStyle>;
  albumCover: StyleProp<ImageStyle>;
  albumTitle: StyleProp<TextStyle>;
  albumCount: StyleProp<TextStyle>;
  photoGrid: StyleProp<ViewStyle>;
  photoItem: StyleProp<ViewStyle>;
  photo: StyleProp<ImageStyle>;
  selectionBadge: StyleProp<ViewStyle>;
  centered: StyleProp<ViewStyle>;
  loadingText: StyleProp<TextStyle>;
  errorText: StyleProp<TextStyle>;
  backButton: StyleProp<ViewStyle>;
  confirmButton: StyleProp<ViewStyle>;
  buttonText: StyleProp<TextStyle>;
  selectionOverlay: StyleProp<ViewStyle>;
  selectionText: StyleProp<TextStyle>;
  floatingButtonContainer: StyleProp<ViewStyle>;
  content: StyleProp<ViewStyle>;
  disabledPhotoOverlay: StyleProp<ViewStyle>;
  locationIcon: StyleProp<ViewStyle>;
  infoContainer: StyleProp<ViewStyle>;
  infoText: StyleProp<TextStyle>;
  retryButton: StyleProp<ViewStyle>;
  emptyStateContainer: StyleProp<ViewStyle>;
  emptyStateIcon: StyleProp<ViewStyle>;
  emptyStateTitle: StyleProp<TextStyle>;
  emptyStateSubtitle: StyleProp<TextStyle>;
}

const parseCoordinate = (value: unknown): number => {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

async function hasValidLocation(
  metadataPromise: Promise<MediaMetadata | null>
): Promise<boolean> {
  try {
    const metadata = await metadataPromise;
    if (!metadata) return false;
    const lat = parseCoordinate(metadata.latitude);
    const lng = parseCoordinate(metadata.longitude);
    return lat !== 0 && lng !== 0;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return false;
  }
}
function useCameraRoll() {
  const [albums, setAlbums] = useState<AlbumWithCover[]>([]);
  const [photos, setPhotos] = useState<ImageItem[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumWithCover | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);

  const loadAlbums = useCallback(async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      const fetchedAlbums = await CameraRoll.getAlbums({
        assetType: 'Photos'
      });

      if (!fetchedAlbums?.length) {
        setError('No se encontraron álbumes');
        return;
      }

      const albumsWithCovers = await Promise.allSettled(
        fetchedAlbums.map(async album => {
          try {
            const photos = await CameraRoll.getPhotos({
              first: 1,
              groupName: album.title,
              assetType: 'Photos'
            });

            return {
              ...album,
              coverUri: photos.edges[0]?.node.image.uri
            };
          } catch {
            return { ...album, coverUri: undefined };
          }
        })
      );

      const validAlbums = albumsWithCovers
        .filter(
          (result): result is PromiseFulfilledResult<AlbumWithCover> =>
            result.status === 'fulfilled'
        )
        .map(result => result.value);

      setAlbums(validAlbums);
    } catch (err) {
      console.error('Failed to load albums:', err);
      setError('Error al cargar álbumes. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const loadAlbumPhotos = useCallback(
    async (album: Album, after?: string) => {
      if ((!hasNextPage && after) || (loadingMore && after)) return;

      try {
        if (after) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          setPhotos([]);
        }

        setError(null);

        const result = await CameraRoll.getPhotos({
          first: PAGE_SIZE,
          after: after || undefined,
          groupName: album.title,
          assetType: 'Photos',
          include: ['filename', 'location', 'imageSize']
        });

        const newPhotosPromises = result.edges.map(
          async (edge: PhotoIdentifier, index: number) => {
            try {
              const metadata = await MediaLibraryService.extractMetadata(
                edge.node.image.uri
              );
              return {
                uri: edge.node.image.uri,
                id:
                  edge.node.image.filename ||
                  `${edge.node.timestamp}-${index}-${album.title}`,
                title: album.title,
                hasLocation: await Promise.resolve(
                  hasValidLocation(Promise.resolve(metadata))
                )
              };
            } catch {
              return {
                uri: edge.node.image.uri,
                id:
                  edge.node.image.filename ||
                  `${edge.node.timestamp}-${index}-${album.title}`,
                title: album.title,
                hasLocation: false
              };
            }
          }
        );

        const newPhotos = await Promise.all(newPhotosPromises);

        setPhotos(prev => (after ? [...prev, ...newPhotos] : newPhotos));
        setEndCursor(result.page_info.end_cursor || null);
        setHasNextPage(result.page_info.has_next_page);
      } catch (err) {
        console.error('Failed to load photos:', err);
        setError('Error al cargar fotos. Intenta nuevamente.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [hasNextPage, loadingMore]
  );

  const resetPhotos = useCallback(() => {
    setPhotos([]);
    setEndCursor(null);
    setHasNextPage(true);
    setError(null);
  }, []);

  return {
    albums,
    photos,
    selectedAlbum,
    setSelectedAlbum,
    loadAlbums,
    loadAlbumPhotos,
    resetPhotos,
    endCursor,
    hasNextPage,
    loading,
    loadingMore,
    error
  };
}

const PhotoItem = memo<{
  uri: string;
  selected: boolean;
  hasLocation: boolean;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  itemSize: number;
}>(({ uri, selected, hasLocation, onPress, styles, itemSize }) => (
  <TouchableOpacity
    style={[
      styles.photoItem,
      { width: itemSize, height: itemSize },
      !hasLocation && { opacity: 0.5 }
    ]}
    onPress={onPress}
    activeOpacity={hasLocation ? 0.8 : 0.3}
    disabled={!hasLocation}
  >
    <Image
      source={{ uri }}
      style={[styles.photo, { width: itemSize, height: itemSize }]}
      resizeMode="cover"
    />

    <View
      style={[
        styles.locationIcon,
        {
          backgroundColor: hasLocation ? '#4CAF50' : '#F44336',
          opacity: 0.9
        }
      ]}
    >
      <Ionicons
        name={hasLocation ? 'location' : 'location-outline'}
        size={12}
        color="white"
      />
    </View>

    {selected && hasLocation && (
      <View style={styles.selectionOverlay}>
        <View style={styles.selectionBadge}>
          <Ionicons name="checkmark-circle" size={28} color="#007AFF" />
        </View>
      </View>
    )}

    {!hasLocation && (
      <View style={styles.disabledPhotoOverlay}>
        <Ionicons name="ban" size={24} color="#F44336" />
      </View>
    )}
  </TouchableOpacity>
));

PhotoItem.displayName = 'PhotoItem';

const AlbumItem = memo<{
  album: AlbumWithCover;
  onPress: () => void;
  styles: Styles;
}>(({ album, onPress, styles }) => (
  <TouchableOpacity
    style={styles.albumItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {album.coverUri ? (
      <Image
        source={{ uri: album.coverUri }}
        style={styles.albumCover}
        resizeMode="cover"
      />
    ) : (
      <View
        style={[
          styles.albumCover,
          {
            backgroundColor: '#f5f5f5',
            justifyContent: 'center',
            alignItems: 'center'
          }
        ]}
      >
        <Ionicons name="images" size={40} color="#bbb" />
      </View>
    )}
    <Text style={styles.albumTitle} numberOfLines={1}>
      {album.title}
    </Text>
    <Text style={styles.albumCount}>
      {album.count} {album.count === 1 ? 'foto' : 'fotos'}
    </Text>
  </TouchableOpacity>
));

AlbumItem.displayName = 'AlbumItem';

const CustomImagePickerScreen: React.FC<Props> = ({
  onConfirm,
  onCancel,
  theme
}) => {
  const {
    albums,
    photos,
    selectedAlbum,
    setSelectedAlbum,
    loadAlbums,
    loadAlbumPhotos,
    resetPhotos,
    endCursor,
    hasNextPage,
    loading,
    loadingMore,
    error
  } = useCameraRoll();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);
  const photoListRef = useRef<FlatList>(null);
  const albumListRef = useRef<FlatList>(null);
  const isMountedRef = useRef(true);

  const photosWithLocation = useMemo(
    () => photos.filter(photo => photo.hasLocation).length,
    [photos]
  );

  useEffect(() => {
    isMountedRef.current = true;
    if (albums.length === 0) {
      loadAlbums();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [loadAlbums, albums.length]);

  const confirmPhoto = useCallback(
    async (uri: string) => {
      try {
        const metadata = await MediaLibraryService.extractMetadata(uri);
        const isValidLocation = await hasValidLocation(
          Promise.resolve(metadata)
        );
        if (!isValidLocation) {
          Alert.alert(
            'Sin ubicación',
            'Esta imagen no contiene información de ubicación válida.',
            [{ text: 'Entendido', style: 'default' }]
          );
          return;
        }

        const location: Location = {
          latitude: parseCoordinate(metadata?.latitude),
          longitude: parseCoordinate(metadata?.longitude),
          altitude: parseCoordinate(metadata?.altitude),
          accuracy: parseCoordinate(metadata?.accuracy),
          speed: 0,
          time: Date.now(),
          bearing: 0,
          provider: 0,
          verticalAccuracy: 0,
          course: 0
        };
        onConfirm(uri, location);
      } catch (err) {
        console.error('Error processing photo:', err);
        Alert.alert(
          'Error',
          'No se pudo procesar la imagen. Intenta con otra.',
          [{ text: 'Entendido', style: 'default' }]
        );
      }
    },
    [onConfirm]
  );

  const handleAlbumSelect = useCallback(
    (album: Album) => {
      resetPhotos();
      setSelectedAlbum(album);
      setSelectedId(null);
      loadAlbumPhotos(album);
    },
    [setSelectedAlbum, resetPhotos, loadAlbumPhotos]
  );

  const handlePhotoSelect = useCallback((id: string, hasLocation: boolean) => {
    if (!hasLocation) {
      Alert.alert(
        'Imagen sin ubicación',
        'Esta imagen no contiene información de ubicación GPS. Solo puedes seleccionar imágenes que tengan datos de ubicación.',
        [{ text: 'Entendido', style: 'default' }]
      );
      return;
    }
    setSelectedId(prev => (prev === id ? null : id));
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedId) return;
    const selectedPhoto = photos.find(photo => photo.id === selectedId);
    if (selectedPhoto && selectedPhoto.hasLocation) {
      confirmPhoto(selectedPhoto.uri);
    }
  }, [selectedId, photos, confirmPhoto]);

  const handleBack = useCallback(() => {
    if (selectedAlbum) {
      setSelectedAlbum(null);
      setSelectedId(null);
      resetPhotos();
    } else {
      onCancel();
    }
  }, [selectedAlbum, setSelectedAlbum, resetPhotos, onCancel]);

  const handleEndReached = useCallback(() => {
    if (selectedAlbum && hasNextPage && endCursor && !loadingMore) {
      loadAlbumPhotos(selectedAlbum, endCursor);
    }
  }, [selectedAlbum, endCursor, hasNextPage, loadAlbumPhotos, loadingMore]);

  const photoKeyExtractor = useCallback((item: ImageItem) => item.id, []);

  const albumKeyExtractor = useCallback((item: AlbumWithCover) => {
    return `album-${item.title}-${item.count}`;
  }, []);

  const renderPhotoItem = useCallback(
    ({ item }: { item: ImageItem }) => (
      <PhotoItem
        uri={item.uri}
        selected={item.id === selectedId}
        hasLocation={item.hasLocation}
        onPress={() => handlePhotoSelect(item.id, item.hasLocation)}
        styles={styles}
        itemSize={PHOTO_ITEM_SIZE}
      />
    ),
    [selectedId, handlePhotoSelect, styles]
  );

  const renderAlbumItem = useCallback(
    ({ item }: { item: AlbumWithCover }) => (
      <AlbumItem
        album={item}
        onPress={() => handleAlbumSelect(item)}
        styles={styles}
      />
    ),
    [handleAlbumSelect, styles]
  );

  const retryAction = useCallback(() => {
    if (selectedAlbum) {
      loadAlbumPhotos(selectedAlbum);
    } else {
      loadAlbums();
    }
  }, [selectedAlbum, loadAlbumPhotos, loadAlbums]);

  if (error && !albums.length && !photos.length) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onCancel}>
            <Ionicons
              name="close"
              size={24}
              color={variables['--text-on-primary']}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
        </View>
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateIcon}>
            <Ionicons name="warning" size={48} color="#ff5555" />
          </View>
          <Text style={styles.emptyStateTitle}>¡Ups! Algo salió mal</Text>
          <Text style={styles.emptyStateSubtitle}>{error}</Text>
          <TouchableOpacity onPress={retryAction} style={styles.retryButton}>
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={[styles.buttonText, { marginLeft: 8 }]}>
              Reintentar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons
            name={selectedAlbum ? 'arrow-back' : 'close'}
            size={24}
            color={variables['--text']}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedAlbum ? selectedAlbum.title : 'Seleccionar Álbum'}
        </Text>
      </View>

      {selectedAlbum && photos.length > 0 && (
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle" size={16} color="#666" />
          <Text style={styles.infoText}>
            {photosWithLocation} de {photos.length} fotos tienen ubicación GPS
          </Text>
        </View>
      )}

      <View style={styles.content}>
        {loading && !selectedAlbum ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={variables['--primary']} />
            <Text style={styles.loadingText}>Cargando álbumes...</Text>
          </View>
        ) : selectedAlbum ? (
          <FlatList
            key="photos-list"
            ref={photoListRef}
            data={photos}
            keyExtractor={photoKeyExtractor}
            numColumns={3}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.2}
            contentContainerStyle={styles.photoGrid}
            renderItem={renderPhotoItem}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            ListFooterComponent={
              loadingMore ? (
                <View style={[styles.centered, { height: 60 }]}>
                  <ActivityIndicator
                    size="small"
                    color={variables['--primary']}
                  />
                  <Text style={styles.loadingText}>Cargando más fotos...</Text>
                </View>
              ) : null
            }
            initialNumToRender={INITIAL_RENDER_COUNT}
            maxToRenderPerBatch={MAX_RENDER_PER_BATCH}
            windowSize={WINDOW_SIZE}
            removeClippedSubviews
            updateCellsBatchingPeriod={50}
            ListEmptyComponent={
              !loading ? (
                <View style={styles.emptyStateContainer}>
                  <View style={styles.emptyStateIcon}>
                    <Ionicons name="images-outline" size={48} color="#ccc" />
                  </View>
                  <Text style={styles.emptyStateTitle}>No hay fotos</Text>
                  <Text style={styles.emptyStateSubtitle}>
                    Este álbum no contiene fotos
                  </Text>
                </View>
              ) : null
            }
          />
        ) : (
          <FlatList
            key="albums-list"
            ref={albumListRef}
            data={albums}
            keyExtractor={albumKeyExtractor}
            numColumns={2}
            contentContainerStyle={styles.albumGrid}
            renderItem={renderAlbumItem}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            ListEmptyComponent={
              !loading ? (
                <View style={styles.emptyStateContainer}>
                  <View style={styles.emptyStateIcon}>
                    <Ionicons name="folder-outline" size={48} color="#ccc" />
                  </View>
                  <Text style={styles.emptyStateTitle}>No hay álbumes</Text>
                  <Text style={styles.emptyStateSubtitle}>
                    No se encontraron álbumes de fotos
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>

      {selectedId && (
        <View style={styles.floatingButtonContainer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark" size={20} color="white" />
            <Text style={[styles.buttonText, { marginLeft: 8 }]}>
              Seleccionar Foto
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default memo(CustomImagePickerScreen);
