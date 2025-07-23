// components/custom-image-picker-screen.tsx
import React, { useState, useEffect, useMemo, memo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Album, PhotoIdentifier, CameraRoll } from '@react-native-camera-roll/camera-roll';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Theme, themeVariables } from '../../contexts/theme-context';
import { createStyles } from './custom-image-picker-screen.styles';
import type { StyleProp, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { Location } from 'react-native-get-location';
import { MediaLibraryService } from '../../../services/media/media-library.service';

// --- Constants ---
const PAGE_SIZE = 100;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_ITEM_SIZE = SCREEN_WIDTH / 3;
const INITIAL_RENDER_COUNT = 24;
const MAX_RENDER_PER_BATCH = 24;
const WINDOW_SIZE = 7;

// --- Types ---
interface ImageItem {
  uri: string;
  id: string;
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

// --- Custom Hook: Camera Roll ---
function useCameraRoll() {
  const [albums, setAlbums] = useState<AlbumWithCover[]>([]);
  const [photos, setPhotos] = useState<ImageItem[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumWithCover | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [cachedAlbums, setCachedAlbums] = useState<Record<string, ImageItem[]>>({});

  const loadAlbums = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedAlbums = await CameraRoll.getAlbums({ assetType: 'Photos' });
      
      const albumsWithCovers = await Promise.all(
        fetchedAlbums.map(async album => {
          try {
            const photos = await CameraRoll.getPhotos({
              first: 1,
              groupName: album.title,
              assetType: 'Photos',
            });
            return {
              ...album,
              coverUri: photos.edges[0]?.node.image.uri,
            };
          } catch {
            return { ...album, coverUri: undefined };
          }
        })
      );

      setAlbums(albumsWithCovers);
      setError(null);
    } catch (err) {
      setError('Error loading albums');
      console.error('Failed to load albums:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAlbumPhotos = useCallback(async (album: Album, after?: string) => {
    if (!hasNextPage && after) return;
    
    try {
      if (after) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      // Check if we have cached data for this album
      const cachedData = cachedAlbums[album.title];
      if (!after && cachedData) {
        setPhotos(cachedData);
        setLoading(false);
        return;
      }
      
      const result = await CameraRoll.getPhotos({
        first: PAGE_SIZE,
        after: after || undefined,
        groupName: album.title,
        assetType: 'Photos',
        include: ['filename'],
      });

      const newPhotos = result.edges.map((edge: PhotoIdentifier) => ({
        uri: edge.node.image.uri,
        id: edge.node.image.filename || `${edge.node.timestamp}-${edge.node.location?.latitude || 0}`,
      }));

      setPhotos(prev => {
        const updatedPhotos = after ? [...prev, ...newPhotos] : newPhotos;
        
        // Cache first page of each album
        if (!after) {
          setCachedAlbums(prevCache => ({
            ...prevCache,
            [album.title]: updatedPhotos
          }));
        }
        
        return updatedPhotos;
      });
      
      setEndCursor(result.page_info.end_cursor || null);
      setHasNextPage(result.page_info.has_next_page);
      setError(null);
    } catch (err) {
      setError('Error loading photos');
      console.error('Failed to load photos:', err);
    } finally {
      if (after) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [hasNextPage, cachedAlbums]);

  return {
    albums,
    photos,
    selectedAlbum,
    setSelectedAlbum,
    loadAlbums,
    loadAlbumPhotos,
    endCursor,
    hasNextPage,
    loading,
    loadingMore,
    error,
  };
}

// --- Main Component ---
const CameraImagePicker: React.FC<Props> = ({ onConfirm, theme }) => {
  const {
    albums,
    photos,
    selectedAlbum,
    setSelectedAlbum,
    loadAlbums,
    loadAlbumPhotos,
    endCursor,
    hasNextPage,
    loading,
    loadingMore,
    error,
  } = useCameraRoll();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);
  const lastSelectedIdRef = useRef<string | null>(null);
  const lastSelectTimeRef = useRef<number>(0);
  const isMountedRef = useRef(true);
  const photoListRef = useRef<FlatList>(null);

  useEffect(() => {
    isMountedRef.current = true;
    loadAlbums();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [loadAlbums]);

  useEffect(() => {
    if (selectedAlbum && photoListRef.current) {
      photoListRef.current.scrollToOffset({ offset: 0, animated: false });
    }
  }, [selectedAlbum]);

  const confirmPhoto = useCallback(async (uri: string) => {
    try {
      const metadata = await MediaLibraryService.extractMetadata(uri);
      const location: Location = {
        latitude: parseCoordinate(metadata?.latitude),
        longitude: parseCoordinate(metadata?.longitude),
        altitude: parseCoordinate(metadata?.altitude),
        accuracy: parseCoordinate(metadata?.accuracy),
        speed: 0,
        time: 0,
        bearing: 0,
        provider: 0,
        verticalAccuracy: 0,
        course: 0,
      };
      onConfirm(uri, location);
    } catch (err) {
      console.error('Error processing photo:', err);
      // Consider showing an error to the user here
    }
  }, [onConfirm]);

  const handleAlbumSelect = useCallback((album: Album) => {
    setSelectedAlbum(album);
    setSelectedId(null);
  }, [setSelectedAlbum]);

  const handlePhotoSelect = useCallback((id: string) => {
    const now = Date.now();
    const lastSelectedId = lastSelectedIdRef.current;
    const lastSelectTime = lastSelectTimeRef.current;
    
    // Double-tap detection
    if (id === lastSelectedId && (now - lastSelectTime) < 500) {
      const selectedPhoto = photos.find(photo => photo.id === id);
      if (selectedPhoto) {
        confirmPhoto(selectedPhoto.uri);
      }
      return;
    }
  
    // Update selection
    setSelectedId(prev => (prev === id ? null : id));
    lastSelectedIdRef.current = id;
    lastSelectTimeRef.current = now;
  }, [photos, confirmPhoto]);

  const handleConfirm = useCallback(() => {
    if (!selectedId) return;
    
    const selectedPhoto = photos.find(photo => photo.id === selectedId);
    if (selectedPhoto) {
      confirmPhoto(selectedPhoto.uri);
    } else {
      console.warn('Selected photo not found');
    }
  }, [selectedId, photos, confirmPhoto]);

  const handleEndReached = useCallback(() => {
    if (selectedAlbum && hasNextPage && endCursor && !loadingMore) {
      loadAlbumPhotos(selectedAlbum, endCursor);
    }
  }, [selectedAlbum, endCursor, hasNextPage, loadAlbumPhotos, loadingMore]);

  const getItemLayout = useCallback((_: unknown, index: number) => ({
    length: PHOTO_ITEM_SIZE,
    offset: PHOTO_ITEM_SIZE * Math.floor(index / 3) * 3,
    index,
  }), []);

  const keyExtractor = useCallback((item: ImageItem) => item.id, []);

    // Optimized render item
    const renderPhotoItem = useCallback(({ item }: { item: ImageItem }) => (
      <PhotoItem
        uri={item.uri}
        selected={item.id === selectedId}
        onPress={() => handlePhotoSelect(item.id)}
        styles={styles}
        itemSize={PHOTO_ITEM_SIZE}
      />
    ), [selectedId, handlePhotoSelect, styles]);

  if (error) {
    return (
      <ErrorView 
        message={error} 
        onRetry={selectedAlbum ? () => loadAlbumPhotos(selectedAlbum) : loadAlbums} 
        styles={styles} 
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* ... Header ... */}

      {/* Main Content */}
      <View style={styles.content}>
        {loading && !selectedAlbum && albums.length === 0 ? (
          <LoadingView styles={styles} />
        ) : selectedAlbum ? (
          <FlatList
            ref={photoListRef}
            key="photos-list"
            data={photos}
            keyExtractor={keyExtractor}
            numColumns={3}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.1} // More sensitive threshold
            contentContainerStyle={styles.photoGrid}
            renderItem={renderPhotoItem}
            ListFooterComponent={
              loadingMore ? (
                <View style={[styles.centered, { height: 80 }]}>
                  <ActivityIndicator size="small" color={variables['--text-secondary']} />
                </View>
              ) : null
            }
            getItemLayout={getItemLayout}
            initialNumToRender={INITIAL_RENDER_COUNT}
            maxToRenderPerBatch={MAX_RENDER_PER_BATCH}
            windowSize={WINDOW_SIZE}
            removeClippedSubviews={true}
            updateCellsBatchingPeriod={100}
            disableVirtualization={false} // Ensure virtualization is enabled
          />
        ) : (
          <FlatList
            key="albums-list"
            data={albums}
            keyExtractor={item => item.title}
            numColumns={2}
            contentContainerStyle={styles.albumGrid}
            renderItem={({ item }) => (
              <AlbumItem
                album={item}
                onPress={() => handleAlbumSelect(item)}
                styles={styles}
              />
            )}
            ListEmptyComponent={
              !loading && !error ? (
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
          >
            <Text style={styles.buttonText}>Confirmar selección</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const AlbumItem = memo(({ album, onPress, styles }: { album: AlbumWithCover, onPress: () => void, styles: Styles }) => (
  <TouchableOpacity style={styles.albumItem} onPress={onPress}>
    {album.coverUri ? (
      <Image 
        source={{ uri: album.coverUri }} 
        style={styles.albumCover}
        resizeMode="cover"
      />
    ) : (
      <View style={[styles.albumCover, { backgroundColor: '#e1e1e1', justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="images" size={40} color="#888" />
      </View>
    )}
    <Text style={styles.albumTitle} numberOfLines={1}>{album.title}</Text>
    <Text style={styles.albumCount}>{album.count} photos</Text>
  </TouchableOpacity>
));

interface PhotoItemProps {
  uri: string;
  selected: boolean;
  onPress: () => void;
  styles: Styles;
  itemSize: number;
}

const PhotoItem = memo(({ uri, selected, onPress, styles, itemSize }: PhotoItemProps) => (
  <TouchableOpacity 
    style={[styles.photoItem, { width: itemSize, height: itemSize }]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Image 
      source={{ uri }} 
      style={[styles.photo, { width: itemSize, height: itemSize }]} 
      resizeMode="cover"
    />
    {selected && (
      <View style={styles.selectionOverlay}>
        <View style={styles.selectionBadge}>
          <Ionicons name="checkmark-circle" size={32} color="white" />
        </View>
        <Text style={styles.selectionText}>Tap again to confirm</Text>
      </View>
    )}
  </TouchableOpacity>
));

interface LoadingViewProps {
  styles: Styles;
}

const LoadingView = memo(({ styles }: LoadingViewProps) => (
  <View style={styles.centered}>
    <ActivityIndicator size="large" />
    <Text style={styles.loadingText}>Cargando...</Text>
  </View>
));

interface ErrorViewProps {
  message: string;
  onRetry: () => void;
  styles: Styles;
}

const ErrorView = memo(({ message, onRetry, styles }: ErrorViewProps) => (
  <View style={styles.centered}>
    <Ionicons name="warning" size={48} color="#ff5555" style={{ marginBottom: 16 }} />
    <Text style={styles.errorText}>{message}</Text>
    <TouchableOpacity 
      onPress={onRetry}
      style={[styles.confirmButton, { marginTop: 20, paddingHorizontal: 24 }]}
    >
      <Text style={styles.buttonText}>Intentar de nuevo</Text>
    </TouchableOpacity>
  </View>
));

export default memo(CameraImagePicker);