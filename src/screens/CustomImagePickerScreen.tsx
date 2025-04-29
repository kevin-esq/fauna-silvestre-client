// components/CustomImagePickerScreen.tsx
import React, { useState, useEffect, useCallback, memo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const ITEM_SIZE = width / 3;
const ACCESSIBILITY = {
  headerLabel: "Selector de fotos",
  backButton: "Volver atrás",
  confirmButton: "Confirmar selección",
  albumButton: (name: string) => `Ver álbum ${name}`,
  photoButton: (selected: boolean) =>
    selected ? "Deseleccionar foto" : "Seleccionar foto",
};

interface ImageItem {
  uri: string;
  id: string;
}
interface AlbumItem {
  id: string;
  title: string;
  assetCount: number;
}
interface Props {
  onConfirm: (uri: string) => void;
  onCancel: () => void;
}

const CameraImagePicker: React.FC<Props> = ({ onConfirm, onCancel }) => {
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [photos, setPhotos] = useState<ImageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAlbum, setActiveAlbum] = useState<AlbumItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMedia = useCallback(async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        setError("Se requiere acceso a la galería");
        return;
      }

      const fetchedAlbums = await MediaLibrary.getAlbumsAsync();
      const cameraRoll =
        fetchedAlbums.find((a) => a.title === "Camera Roll") ||
        fetchedAlbums[0];

      setAlbums(fetchedAlbums);
      setActiveAlbum(cameraRoll);
    } catch (e) {
      setError("Error cargando contenido");
    }
  }, []);

  const loadAlbumPhotos = useCallback(async (album: AlbumItem) => {
    try {
      setIsLoading(true);
      const result = await MediaLibrary.getAssetsAsync({
        album: album.id,
        mediaType: "photo",
        first: 100,
        sortBy: [["creationTime", false]],
      });

      setPhotos(result.assets.map((a) => ({ uri: a.uri, id: a.id })));
      setSelectedId(null);
    } catch (e) {
      setError("Error cargando fotos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);
  useEffect(() => {
    activeAlbum && loadAlbumPhotos(activeAlbum);
  }, [activeAlbum, loadAlbumPhotos]);

  const handleSelectPhoto = (id: string) =>
    setSelectedId((prev) => (prev === id ? null : id));

  const handleConfirm = () => {
    const selectedPhoto = photos.find((p) => p.id === selectedId);
    selectedPhoto && onConfirm(selectedPhoto.uri);
  };

  if (error) {
    return <ErrorState message={error} onRetry={loadMedia} />;
  }

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <View style={styles.container}>
      <Header
        onCancel={onCancel}
        onConfirm={handleConfirm}
        hasSelection={!!selectedId}
      />

      <AlbumTabs
        albums={albums}
        activeAlbum={activeAlbum}
        onSelect={setActiveAlbum}
      />

      <PhotoGrid
        photos={photos}
        selectedId={selectedId}
        onSelect={handleSelectPhoto}
      />
    </View>
  );
};

const Header = memo(
  ({
    onCancel,
    onConfirm,
    hasSelection,
  }: {
    onCancel: () => void;
    onConfirm: () => void;
    hasSelection: boolean;
  }) => (
    <View style={styles.header}>
      <IconButton
        icon="arrow-back"
        onPress={onCancel}
        accessibilityLabel={ACCESSIBILITY.backButton}
      />

      <Text style={styles.headerTitle}>
        {hasSelection ? "Foto seleccionada" : "Seleccione una foto"}
      </Text>

      <IconButton
        icon="checkmark-circle"
        onPress={onConfirm}
        color={hasSelection ? "#2E7D32" : "#BDBDBD"}
        accessibilityLabel={ACCESSIBILITY.confirmButton}
      />
    </View>
  )
);

const AlbumTabs = memo(
  ({
    albums,
    activeAlbum,
    onSelect,
  }: {
    albums: AlbumItem[];
    activeAlbum: AlbumItem | null;
    onSelect: (album: AlbumItem) => void;
  }) => (
    <FlatList
      horizontal
      data={albums}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.albumContainer}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.albumButton,
            activeAlbum?.id === item.id && styles.activeAlbumButton,
          ]}
          onPress={() => onSelect(item)}
          accessibilityLabel={ACCESSIBILITY.albumButton(item.title)}>
          <Text style={styles.albumText}>{item.title}</Text>
        </TouchableOpacity>
      )}
    />
  )
);

const PhotoGrid = memo(
  ({
    photos,
    selectedId,
    onSelect,
  }: {
    photos: ImageItem[];
    selectedId: string | null;
    onSelect: (id: string) => void;
  }) => (
    <FlatList
      data={photos}
      numColumns={3}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.grid}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.photoContainer}
          onPress={() => onSelect(item.id)}
          accessibilityLabel={ACCESSIBILITY.photoButton(
            item.id === selectedId
          )}>
          <Image
            source={{ uri: item.uri }}
            style={styles.photo}
            accessibilityRole="image"
          />

          {item.id === selectedId && (
            <View style={styles.selectionBadge}>
              <Ionicons name="checkmark" size={32} color="white" />
            </View>
          )}
        </TouchableOpacity>
      )}
    />
  )
);

const IconButton = memo(
  ({
    icon,
    onPress,
    color = "#424242",
    accessibilityLabel,
  }: {
    icon: string;
    onPress: () => void;
    color?: string;
    accessibilityLabel: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}>
      <Ionicons name={icon as any} size={36} color={color} />
    </TouchableOpacity>
  )
);

const LoadingIndicator = () => (
  <View style={styles.centered}>
    <ActivityIndicator size="large" color="#2E7D32" />
    <Text style={styles.loadingText}>Cargando...</Text>
  </View>
);

const ErrorState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <View style={styles.centered}>
    <Text style={styles.errorText}>{message}</Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryText}>Reintentar</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#E8F5E9",
    borderBottomWidth: 2,
    borderBottomColor: "#C8E6C9",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2E7D32",
  },
  albumContainer: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  albumButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 6,
    borderRadius: 24,
    backgroundColor: "#E0E0E0",
  },
  activeAlbumButton: {
    backgroundColor: "#2E7D32",
  },
  albumText: {
    fontSize: 16,
    color: "#424242",
    fontWeight: "500",
  },
  grid: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  photoContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    padding: 2,
    backgroundColor: "#FFF",
  },
  photo: {
    flex: 1,
    borderRadius: 8,
  },
  selectionBadge: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(46,125,50,0.7)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: "#616161",
  },
  errorText: {
    fontSize: 18,
    color: "#D32F2F",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CameraImagePicker;
