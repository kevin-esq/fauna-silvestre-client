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
  Alert,
  RefreshControl
} from 'react-native';
import {
  Album,
  PhotoIdentifier,
  CameraRoll
} from '@react-native-camera-roll/camera-roll';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Theme, themeVariables } from '../../contexts/theme.context';
import { createStyles } from './custom-image-picker-screen.styles';
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
  isLoading?: boolean;
}

interface AlbumWithCover extends Album {
  coverUri?: string;
  isLoading?: boolean;
}

interface Props {
  onConfirm: (uri: string, location: Location) => void;
  onCancel: () => void;
  theme: Theme;
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

const ShimmerItem = memo<{
  style: ReturnType<typeof createStyles>;
  variables: Record<string, string>;
  width?: number;
  height?: number;
  variants: 'photo' | 'cover';
}>(({ style, variables, width, height, variants }) => {
  const baseStyle = variants === 'photo' ? style.photo : style.albumCover;

  return (
    <View
      style={[
        baseStyle,
        {
          backgroundColor: variables['--surface-variant'],
          opacity: 0.6,
          ...(width && { width }),
          ...(height && { height })
        }
      ]}
    >
      <ActivityIndicator
        size="small"
        color={variables['--text-secondary']}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginTop: -10,
          marginLeft: -10
        }}
      />
    </View>
  );
});

ShimmerItem.displayName = 'ShimmerItem';

function useCameraRoll() {
  const [albums, setAlbums] = useState<AlbumWithCover[]>([]);
  const [photos, setPhotos] = useState<ImageItem[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumWithCover | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const loadAlbums = useCallback(
    async (isRefresh = false) => {
      if (loading && !isRefresh) return;

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const fetchedAlbums = await CameraRoll.getAlbums({
          assetType: 'Photos'
        });

        if (!fetchedAlbums?.length) {
          setError('No se encontraron álbumes en tu dispositivo');
          return;
        }

        const albumsWithPlaceholders: AlbumWithCover[] = fetchedAlbums.map(
          album => ({
            ...album,
            coverUri: undefined,
            isLoading: true
          })
        );
        setAlbums(albumsWithPlaceholders);

        const albumPromises = fetchedAlbums.map(
          async (album, index): Promise<AlbumWithCover> => {
            try {
              const photos = await CameraRoll.getPhotos({
                first: 1,
                groupName: album.title,
                assetType: 'Photos'
              });

              const updatedAlbum: AlbumWithCover = {
                ...album,
                coverUri: photos.edges[0]?.node.image.uri,
                isLoading: false
              };

              setAlbums(prev =>
                prev.map((a, i) => (i === index ? updatedAlbum : a))
              );

              return updatedAlbum;
            } catch {
              return { ...album, coverUri: undefined, isLoading: false };
            }
          }
        );

        const albumsWithCovers = await Promise.allSettled(albumPromises);

        const validAlbums = albumsWithCovers
          .filter(
            (result): result is PromiseFulfilledResult<AlbumWithCover> =>
              result.status === 'fulfilled'
          )
          .map(result => result.value);

        setAlbums(validAlbums);
      } catch (err) {
        console.error('Failed to load albums:', err);
        setError('Error al cargar álbumes. Verifica los permisos de galería.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [loading]
  );

  const loadAlbumPhotos = useCallback(
    async (album: AlbumWithCover, after?: string) => {
      if ((!hasNextPage && after) || (loadingMore && after)) return;

      try {
        if (after) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          setPhotos([]);
          setProcessedCount(0);
          setTotalCount(0);
        }

        setError(null);

        const result = await CameraRoll.getPhotos({
          first: PAGE_SIZE,
          after: after || undefined,
          groupName: album.title,
          assetType: 'Photos',
          include: ['filename', 'location', 'imageSize']
        });

        if (!after) {
          setTotalCount(result.edges.length);
        }

        const initialPhotos = result.edges.map(
          (edge: PhotoIdentifier, index: number) => ({
            uri: edge.node.image.uri,
            id:
              edge.node.image.filename ||
              `${edge.node.timestamp}-${index}-${album.title}`,
            title: album.title,
            hasLocation: false,
            isLoading: true
          })
        );

        setPhotos(prev =>
          after ? [...prev, ...initialPhotos] : initialPhotos
        );

        result.edges.forEach(async (edge: PhotoIdentifier, index: number) => {
          try {
            const metadata = await MediaLibraryService.extractMetadata(
              edge.node.image.uri
            );
            const photoId =
              edge.node.image.filename ||
              `${edge.node.timestamp}-${index}-${album.title}`;
            const hasLocation = await hasValidLocation(
              Promise.resolve(metadata)
            );

            setPhotos(prev =>
              prev.map(photo =>
                photo.id === photoId
                  ? { ...photo, hasLocation, isLoading: false }
                  : photo
              )
            );

            setProcessedCount(prev => prev + 1);
          } catch {
            const photoId =
              edge.node.image.filename ||
              `${edge.node.timestamp}-${index}-${album.title}`;

            setPhotos(prev =>
              prev.map(photo =>
                photo.id === photoId
                  ? { ...photo, hasLocation: false, isLoading: false }
                  : photo
              )
            );

            setProcessedCount(prev => prev + 1);
          }
        });

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
    setProcessedCount(0);
    setTotalCount(0);
  }, []);

  const refreshAlbums = useCallback(() => {
    loadAlbums(true);
  }, [loadAlbums]);

  return {
    albums,
    photos,
    selectedAlbum,
    setSelectedAlbum,
    loadAlbums,
    loadAlbumPhotos,
    resetPhotos,
    refreshAlbums,
    endCursor,
    hasNextPage,
    loading,
    loadingMore,
    refreshing,
    error,
    processedCount,
    totalCount
  };
}

const PhotoItem = memo<{
  uri: string;
  selected: boolean;
  hasLocation: boolean;
  isLoading?: boolean;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  itemSize: number;
  variables: Record<string, string>;
}>(
  ({
    uri,
    selected,
    hasLocation,
    isLoading = false,
    onPress,
    styles,
    itemSize,
    variables
  }) => (
    <TouchableOpacity
      style={[
        styles.photoItem,
        { width: itemSize, height: itemSize },
        !hasLocation && !isLoading && { opacity: 0.5 }
      ]}
      onPress={onPress}
      activeOpacity={hasLocation || isLoading ? 0.8 : 0.3}
      disabled={(!hasLocation && !isLoading) || isLoading}
    >
      {isLoading ? (
        <ShimmerItem
          style={styles}
          variables={variables}
          variants="photo"
          width={itemSize}
          height={itemSize}
        />
      ) : (
        <Image
          source={{ uri }}
          style={[styles.photo, { width: itemSize, height: itemSize }]}
          resizeMode="cover"
        />
      )}

      {!isLoading && (
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
      )}

      {selected && hasLocation && !isLoading && (
        <View style={styles.selectionOverlay}>
          <View style={styles.selectionBadge}>
            <Ionicons name="checkmark-circle" size={28} color="#007AFF" />
          </View>
        </View>
      )}

      {!hasLocation && !isLoading && (
        <View style={styles.disabledPhotoOverlay}>
          <Ionicons name="ban" size={24} color="#F44336" />
        </View>
      )}
    </TouchableOpacity>
  )
);

PhotoItem.displayName = 'PhotoItem';

const AlbumItem = memo<{
  album: AlbumWithCover;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  variables: Record<string, string>;
}>(({ album, onPress, styles, variables }) => (
  <TouchableOpacity
    style={styles.albumItem}
    onPress={onPress}
    activeOpacity={0.7}
    disabled={album.isLoading}
  >
    {album.isLoading ? (
      <ShimmerItem style={styles} variables={variables} variants="cover" />
    ) : album.coverUri ? (
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
            backgroundColor: variables['--surface-variant'],
            justifyContent: 'center',
            alignItems: 'center'
          }
        ]}
      >
        <Ionicons
          name="images"
          size={40}
          color={variables['--text-secondary']}
        />
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

const ProgressIndicator = memo<{
  processed: number;
  total: number;
  styles: ReturnType<typeof createStyles>;
  variables: Record<string, string>;
}>(({ processed, total, styles, variables }) => {
  const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${percentage}%`,
              backgroundColor: variables['--primary'],
              position: 'absolute',
              left: 0,
              top: 0
            }
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        Analizando ubicaciones: {processed}/{total} ({percentage}%)
      </Text>
    </View>
  );
});

ProgressIndicator.displayName = 'ProgressIndicator';

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
    refreshAlbums,
    endCursor,
    hasNextPage,
    loading,
    loadingMore,
    refreshing,
    error,
    processedCount,
    totalCount
  } = useCameraRoll();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);
  const photoListRef = useRef<FlatList>(null);
  const albumListRef = useRef<FlatList>(null);
  const isMountedRef = useRef(true);

  const photosWithLocation = useMemo(
    () => photos.filter(photo => photo.hasLocation && !photo.isLoading).length,
    [photos]
  );

  const isProcessing = useMemo(
    () => processedCount < totalCount && totalCount > 0,
    [processedCount, totalCount]
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
            'Sin ubicación GPS',
            'Esta imagen no contiene información de ubicación válida. Por favor, selecciona una imagen con datos GPS.',
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
          'Error de procesamiento',
          'No se pudo procesar la imagen seleccionada. Por favor, intenta con otra.',
          [{ text: 'Entendido', style: 'default' }]
        );
      }
    },
    [onConfirm]
  );

  const handleAlbumSelect = useCallback(
    (album: AlbumWithCover) => {
      if (album.isLoading) return;
      resetPhotos();
      setSelectedAlbum(album);
      setSelectedId(null);
      loadAlbumPhotos(album);
    },
    [setSelectedAlbum, resetPhotos, loadAlbumPhotos]
  );

  const handlePhotoSelect = useCallback(
    (id: string, hasLocation: boolean, isLoading: boolean) => {
      if (isLoading) return;

      if (!hasLocation) {
        Alert.alert(
          'Imagen sin ubicación GPS',
          'Esta imagen no contiene información de ubicación GPS. Solo puedes seleccionar imágenes que tengan datos de ubicación válidos.',
          [{ text: 'Entendido', style: 'default' }]
        );
        return;
      }
      setSelectedId(prev => (prev === id ? null : id));
    },
    []
  );

  const handleConfirm = useCallback(() => {
    if (!selectedId) return;
    const selectedPhoto = photos.find(photo => photo.id === selectedId);
    if (
      selectedPhoto &&
      selectedPhoto.hasLocation &&
      !selectedPhoto.isLoading
    ) {
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
    if (
      selectedAlbum &&
      hasNextPage &&
      endCursor &&
      !loadingMore &&
      !isProcessing
    ) {
      loadAlbumPhotos(selectedAlbum, endCursor);
    }
  }, [
    selectedAlbum,
    endCursor,
    hasNextPage,
    loadAlbumPhotos,
    loadingMore,
    isProcessing
  ]);

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
        isLoading={item.isLoading}
        onPress={() =>
          handlePhotoSelect(item.id, item.hasLocation, item.isLoading || false)
        }
        styles={styles}
        itemSize={PHOTO_ITEM_SIZE}
        variables={variables}
      />
    ),
    [selectedId, handlePhotoSelect, styles, variables]
  );

  const renderAlbumItem = useCallback(
    ({ item }: { item: AlbumWithCover }) => (
      <AlbumItem
        album={item}
        onPress={() => handleAlbumSelect(item)}
        styles={styles}
        variables={variables}
      />
    ),
    [handleAlbumSelect, styles, variables]
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
            <Ionicons name="close" size={24} color={variables['--text']} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
        </View>
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateIcon}>
            <Ionicons name="warning" size={48} color={variables['--error']} />
          </View>
          <Text style={styles.emptyStateTitle}>Error de acceso</Text>
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
          <Ionicons
            name="information-circle"
            size={16}
            color={variables['--primary']}
          />
          <Text style={styles.infoText}>
            {photosWithLocation} de {photos.filter(p => !p.isLoading).length}{' '}
            fotos tienen ubicación GPS
          </Text>
        </View>
      )}

      {isProcessing && totalCount > 0 && (
        <ProgressIndicator
          processed={processedCount}
          total={totalCount}
          styles={styles}
          variables={variables}
        />
      )}

      <View style={styles.content}>
        {loading && !selectedAlbum && !refreshing ? (
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
              !loading && !isProcessing ? (
                <View style={styles.emptyStateContainer}>
                  <View style={styles.emptyStateIcon}>
                    <Ionicons
                      name="images-outline"
                      size={48}
                      color={variables['--text-secondary']}
                    />
                  </View>
                  <Text style={styles.emptyStateTitle}>Álbum vacío</Text>
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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refreshAlbums}
                colors={[variables['--primary']]}
                tintColor={variables['--primary']}
                title="Actualizando álbumes..."
                titleColor={variables['--text-secondary']}
              />
            }
            ListEmptyComponent={
              !loading && !refreshing ? (
                <View style={styles.emptyStateContainer}>
                  <View style={styles.emptyStateIcon}>
                    <Ionicons
                      name="folder-outline"
                      size={48}
                      color={variables['--text-secondary']}
                    />
                  </View>
                  <Text style={styles.emptyStateTitle}>Sin álbumes</Text>
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
