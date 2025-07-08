// components/custom-image-picker-screen.tsx
import React, { useState, useEffect, memo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  CameraRoll,
  Album,
} from "@react-native-camera-roll/camera-roll/src/CameraRoll";
import Ionicons from "react-native-vector-icons/Ionicons";

// --- Constants & Types ---------------------------------------
const { width } = Dimensions.get("window");
const ITEM_SIZE = width / 3;
const ACCESSIBILITY = {
  headerLabel: "Selector de fotos",
  backButton: "Volver atrás",
  confirmButton: "Confirmar selección",
  clearButton: "Limpiar selección",
};

interface ImageItem {
  uri: string;
  id: string;
}

interface Props {
  onConfirm: (uri: string) => void;
  onCancel: () => void;
}

// --- Hook: Camera Roll ---------------------------------------
function useCameraRoll() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<ImageItem[]>([]);
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all albums
  useEffect(() => {
    CameraRoll.getAlbums({ assetType: "Photos" })
      .then((fetched) => {
        setAlbums(fetched);
        setActiveAlbum(
          fetched.find((a) => a.title === "Camera Roll") || fetched[0]
        );
      })
      .catch(() => setError("Error cargando álbumes"));
  }, []);

  // Load photos when album changes
  useEffect(() => {
    if (!activeAlbum) return;
    setLoading(true);
    CameraRoll.getPhotos({
      first: 100,
      groupName: activeAlbum.title,
      assetType: "Photos",
      include: ["filename"],
    })
      .then((result) => {
        const formatted = result.edges.map((edge) => ({
          uri: edge.node.image.uri,
          id: edge.node.image.filename || String(edge.node.timestamp),
        }));
        setPhotos(formatted);
      })
      .catch(() => setError("Error cargando fotos"))
      .finally(() => setLoading(false));
  }, [activeAlbum]);

  return {
    albums,
    photos,
    activeAlbum,
    setActiveAlbum,
    loading,
    error,
  };
}

// --- Component -----------------------------------------------
const CameraImagePicker: React.FC<Props> = ({ onConfirm, onCancel }) => {
  const { albums, photos, activeAlbum, setActiveAlbum, loading, error } =
    useCameraRoll();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (id: string) =>
    setSelectedId((prev) => (prev === id ? null : id));
  const clearSelection = () => setSelectedId(null);
  const confirm = () => {
    const selected = photos.find((p) => p.id === selectedId);
    selected && onConfirm(selected.uri);
  };

  if (error) {
    return <ErrorState message={error} onRetry={clearSelection} />;
  }

  return (
    <View style={styles.container}>
      {/* <Header onCancel={onCancel} /> */}

      {loading ? (
        <LoadingIndicator />
      ) : (
        <View style={styles.gridContainer}>
          <FlatList<ImageItem>
            data={photos}
            keyExtractor={(item) => item.id}
            numColumns={3}
            renderItem={({ item }) => (
              <PhotoTile
                uri={item.uri}
                selected={item.id === selectedId}
                onPress={() => handleSelect(item.id)}
              />
            )}
            nestedScrollEnabled
            removeClippedSubviews
            ListHeaderComponent={() => (
              <View>
                <Header onCancel={onCancel} />
                <AlbumTabs
                  albums={albums}
                  active={activeAlbum}
                  onSelect={setActiveAlbum}
                />
              </View>
            )}
            ListFooterComponent={() => <View style={{ height: ITEM_SIZE }} />}
          />
          {selectedId && (
            <FloatingActions onConfirm={confirm} onClear={clearSelection} />
          )}
        </View>
      )}
    </View>
  );
};

// --- Sub-components ------------------------------------------
const Header = memo(({ onCancel }: { onCancel: () => void }) => (
  <View style={styles.header}>
    <IconButton
      name="arrow-back"
      onPress={onCancel}
      accessibilityLabel={ACCESSIBILITY.backButton}
    />
    <Text style={styles.headerTitle}>{ACCESSIBILITY.headerLabel}</Text>
    <View style={{ width: 40 }} />
  </View>
));

const AlbumTabs = memo(
  ({
    albums,
    active,
    onSelect,
  }: {
    albums: Album[];
    active: Album | null;
    onSelect: (a: Album) => void;
  }) => (
    <View style={styles.tabContainer}>
      {albums.map((album) => (
        <TouchableOpacity
          key={album.title}
          style={[
            styles.tabButton,
            active?.title === album.title && styles.tabActive,
          ]}
          onPress={() => onSelect(album)}
          accessibilityLabel={`Ver álbum ${album.title}`}>
          <Text style={styles.tabText}>{album.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
);

const PhotoTile = memo(
  ({
    uri,
    selected,
    onPress,
  }: {
    uri: string;
    selected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={styles.photoContainer}
      onPress={onPress}
      accessibilityLabel={selected ? "Deseleccionar foto" : "Seleccionar foto"}>
      <Image source={{ uri }} style={styles.photo} />
      {selected && (
        <View style={styles.selectionBadge}>
          <Ionicons name="checkmark-circle" size={32} color="#FFF" />
        </View>
      )}
    </TouchableOpacity>
  )
);

const FloatingActions = memo(
  ({ onConfirm, onClear }: { onConfirm: () => void; onClear: () => void }) => (
    <View style={styles.floatingContainer}>
      <IconButton
        name="close-circle"
        onPress={onClear}
        color="#D32F2F"
        accessibilityLabel={ACCESSIBILITY.clearButton}
      />
      <IconButton
        name="checkmark-circle"
        onPress={onConfirm}
        color="#2E7D32"
        accessibilityLabel={ACCESSIBILITY.confirmButton}
      />
    </View>
  )
);

const IconButton = memo(
  ({
    name,
    onPress,
    color = "#424242",
    accessibilityLabel,
  }: {
    name: React.ComponentProps<typeof Ionicons>['name'];
    onPress: () => void;
    color?: string;
    accessibilityLabel: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}>
      <Ionicons name={name} size={28} color={color} />
    </TouchableOpacity>
  )
);

const LoadingIndicator = memo(() => (
  <View style={styles.centered}>
    <ActivityIndicator size="large" color="#2E7D32" />
    <Text style={styles.loadingText}>Cargando fotos...</Text>
  </View>
));

const ErrorState = memo(
  ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <View style={styles.centered}>
      <Text style={styles.errorText}>{message}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  )
);

// --- Styles -----------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#E8F5E9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#2E7D32" },
  tabContainer: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#FFF",
  },
  tabButton: {
    marginRight: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
  },
  tabActive: { backgroundColor: "#2E7D32" },
  tabText: { fontSize: 14, color: "#424242" },
  gridContainer: { flex: 1 },
  photoContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: 1,
    backgroundColor: "#FFF",
  },
  photo: { flex: 1, borderRadius: 6 },
  selectionBadge: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(46,125,50,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  floatingContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "row",
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#616161" },
  errorText: { fontSize: 16, color: "#D32F2F", textAlign: "center" },
  retryButton: {
    marginTop: 12,
    backgroundColor: "#2E7D32",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  retryText: { color: "#FFF", fontWeight: "bold" },
});

export default CameraImagePicker;
