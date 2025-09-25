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
  Dimensions
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
import { MediaLibraryService } from '../../../services/media/media-library.service';

// Constants
const PAGE_SIZE = 50;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_ITEM_SIZE = (SCREEN_WIDTH - 6) / 3;
const INITIAL_RENDER_COUNT = 15;
const MAX_RENDER_PER_BATCH = 12;
const WINDOW_SIZE = 5;

// Types
interface ImageItem {
  uri: string;
  id: string;
  title: string;
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
}

const parseCoordinate = (value: unknown): number => {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// Custom Hook para Camera Roll
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
        setError('No albums found');
        return;
      }

      // Cargar covers con manejo de errores
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
      setError('Error loading albums. Please try again.');
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

        const newPhotos = result.edges.map(
          (edge: PhotoIdentifier, index: number) => ({
            uri: edge.node.image.uri,
            id:
              edge.node.image.filename ||
              `${edge.node.timestamp}-${index}-${album.title}`,
            title: album.title
          })
        );

        setPhotos(prev => (after ? [...prev, ...newPhotos] : newPhotos));
        setEndCursor(result.page_info.end_cursor || null);
        setHasNextPage(result.page_info.has_next_page);
      } catch (err) {
        console.error('Failed to load photos:', err);
        setError('Error loading photos. Please try again.');
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

// Componente PhotoItem
const PhotoItem = memo<{
  uri: string;
  selected: boolean;
  onPress: () => void;
  styles: Styles;
  itemSize: number;
}>(({ uri, selected, onPress, styles, itemSize }) => (
  <TouchableOpacity
    style={[styles.photoItem, { width: itemSize, height: itemSize }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Image
      source={{ uri }}
      style={[styles.photo, { width: itemSize, height: itemSize }]}
      resizeMode="cover"
    />
    {selected && (
      <View style={styles.selectionOverlay}>
        <View style={styles.selectionBadge}>
          <Ionicons name="checkmark-circle" size={28} color="#007AFF" />
        </View>
      </View>
    )}
  </TouchableOpacity>
));

PhotoItem.displayName = 'PhotoItem';

// Componente AlbumItem
const AlbumItem = memo<{
  album: AlbumWithCover;
  onPress: () => void;
  styles: Styles;
}>(({ album, onPress, styles }) => (
  <TouchableOpacity
    style={styles.albumItem}
    onPress={onPress}
    activeOpacity={0.8}
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
            backgroundColor: '#f0f0f0',
            justifyContent: 'center',
            alignItems: 'center'
          }
        ]}
      >
        <Ionicons name="images" size={40} color="#888" />
      </View>
    )}
    <Text style={styles.albumTitle} numberOfLines={1}>
      {album.title}
    </Text>
    <Text style={styles.albumCount}>{album.count} photos</Text>
  </TouchableOpacity>
));

AlbumItem.displayName = 'AlbumItem';

// Componente principal
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

  // Cargar albums al montar, pero solo si no existen
  useEffect(() => {
    isMountedRef.current = true;
    if (albums.length === 0) {
      loadAlbums();
    }
    return () => {
      isMountedRef.current = false;
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmPhoto = useCallback(
    async (uri: string) => {
      try {
        const metadata = await MediaLibraryService.extractMetadata(uri);
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
        // Fallback: confirmar sin ubicación
        const fallbackLocation: Location = {
          latitude: 0,
          longitude: 0,
          altitude: 0,
          accuracy: 0,
          speed: 0,
          time: Date.now(),
          bearing: 0,
          provider: 0,
          verticalAccuracy: 0,
          course: 0
        };
        onConfirm(uri, fallbackLocation);
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

  const handlePhotoSelect = useCallback((id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedId) return;
    const selectedPhoto = photos.find(photo => photo.id === selectedId);
    if (selectedPhoto) {
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

  // ✅ Diferentes keyExtractors para diferentes tipos de datos
  const photoKeyExtractor = useCallback((item: ImageItem) => item.id, []);

  const albumKeyExtractor = useCallback((item: AlbumWithCover) => {
    return `album-${item.title}-${item.count}`;
  }, []);

  const renderPhotoItem = useCallback(
    ({ item }: { item: ImageItem }) => (
      <PhotoItem
        uri={item.uri}
        selected={item.id === selectedId}
        onPress={() => handlePhotoSelect(item.id)}
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
        <View style={styles.centered}>
          <Ionicons name="warning" size={48} color="#ff5555" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={retryAction} style={styles.confirmButton}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons
            name={selectedAlbum ? 'arrow-back' : 'close'}
            size={24}
            color={variables['--text-on-primary']}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedAlbum ? selectedAlbum.title : 'Select Album'}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading && !selectedAlbum ? (
          <View style={styles.centered}>
            <ActivityIndicator
              size="large"
              color={variables['--text-on-primary']}
            />
            <Text style={styles.loadingText}>Loading albums...</Text>
          </View>
        ) : selectedAlbum ? (
          // ✅ FlatList específico para fotos con key única
          <FlatList
            key="photos-list" // ✅ Key única para fotos
            ref={photoListRef}
            data={photos}
            keyExtractor={photoKeyExtractor}
            numColumns={3}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.2}
            contentContainerStyle={styles.photoGrid}
            renderItem={renderPhotoItem}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              loadingMore ? (
                <View style={[styles.centered, { height: 60 }]}>
                  <ActivityIndicator
                    size="small"
                    color={variables['--text-on-primary']}
                  />
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
                <View style={styles.centered}>
                  <Text style={styles.errorText}>No photos found</Text>
                </View>
              ) : null
            }
          />
        ) : (
          // ✅ FlatList específico para álbumes con key única
          <FlatList
            key="albums-list" // ✅ Key única para álbumes
            ref={albumListRef}
            data={albums}
            keyExtractor={albumKeyExtractor}
            numColumns={2}
            contentContainerStyle={styles.albumGrid}
            renderItem={renderAlbumItem}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              !loading ? (
                <View style={styles.centered}>
                  <Text style={styles.errorText}>No albums found</Text>
                </View>
              ) : null
            }
          />
        )}
      </View>

      {/* Floating Confirm Button */}
      {selectedId && (
        <View style={styles.floatingButtonContainer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Select Photo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default memo(CustomImagePickerScreen);
