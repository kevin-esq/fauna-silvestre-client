// components/custom-image-picker-screen.tsx
import React, { useState, useEffect, memo, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  CameraRoll,
  Album,
} from "@react-native-camera-roll/camera-roll/src/CameraRoll";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Theme, themeVariables } from "../../contexts/theme-context";
import { createStyles } from "./custom-image-picker-screen.styles";
import type { StyleProp, ViewStyle, TextStyle, ImageStyle } from 'react-native';

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
  theme: Theme;
}

// Estilos compartidos
interface Styles {
  container: StyleProp<ViewStyle>;
  header: StyleProp<ViewStyle>;
  headerTitle: StyleProp<TextStyle>;
  tabContainer: StyleProp<ViewStyle>;
  tabButton: StyleProp<ViewStyle>;
  tabActive: StyleProp<ViewStyle>;
  tabText: StyleProp<TextStyle>;
  gridContainer: StyleProp<ViewStyle>;
  photoContainer: StyleProp<ViewStyle>;
  photo: StyleProp<ImageStyle>;
  selectionBadge: StyleProp<ViewStyle>;
  centered: StyleProp<ViewStyle>;
  loadingText: StyleProp<TextStyle>;
  retryButton: StyleProp<ViewStyle>;
  retryText: StyleProp<TextStyle>;
  floatingContainer: StyleProp<ViewStyle>;
  errorText: StyleProp<TextStyle>;
}

// Props principales del componente
interface Props {
  onConfirm: (uri: string) => void;
  onCancel: () => void;
  theme: Theme;
}

// Header
interface HeaderProps {
  onCancel: () => void;
  styles: Styles;
  variables: Record<string, string>;
}

// AlbumTabs
interface AlbumTabsProps {
  albums: Album[];
  active: Album | null;
  onSelect: (a: Album) => void;
  styles: Styles;
}

// PhotoTile
interface PhotoTileProps {
  uri: string;
  selected: boolean;
  onPress: () => void;
  styles: Styles;
  variables: Record<string, string>;
}

// FloatingActions
interface FloatingActionsProps {
  onConfirm: () => void;
  onClear: () => void;
  styles: Styles;
  variables: Record<string, string>;
}

// IconButton
interface IconButtonProps {
  name: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  variables: Record<string, string>;
  accessibilityLabel: string;
}

// LoadingIndicator
interface LoadingIndicatorProps {
  styles: Styles;
}

// ErrorState
interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  styles: Styles;
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
const CameraImagePicker: React.FC<Props> = ({ onConfirm, onCancel, theme }) => {
  const { albums, photos, activeAlbum, setActiveAlbum, loading, error } =
    useCameraRoll();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables, ITEM_SIZE), [variables]);

  const handleSelect = (id: string) =>
    setSelectedId((prev) => (prev === id ? null : id));
  const clearSelection = () => setSelectedId(null);
  const confirm = () => {
    const selected = photos.find((p) => p.id === selectedId);
    if (selected) {
      onConfirm(selected.uri);
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={clearSelection} styles={styles} />;
  }

  return (
    <View style={styles.container}>
      {/* <Header onCancel={onCancel} /> */}

      {loading ? (
        <LoadingIndicator styles={styles} />
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
                styles={styles}
                variables={variables}
              />
            )}
            nestedScrollEnabled
            removeClippedSubviews
            ListHeaderComponent={() => (
              <View>
                <Header onCancel={onCancel} styles={styles} variables={variables} />
                <AlbumTabs
                  albums={albums}
                  active={activeAlbum}
                  onSelect={setActiveAlbum}
                  styles={styles}
                                  />
              </View>
            )}
            ListFooterComponent={() => <View style={{ height: ITEM_SIZE }} />}
          />
          {selectedId && (
            <FloatingActions onConfirm={confirm} onClear={clearSelection} styles={styles} variables={variables} />
          )}
        </View>
      )}
    </View>
  );
};

// --- Sub-components ------------------------------------------
const Header = memo(({ onCancel, styles, variables }: HeaderProps) => (
  <View style={styles.header}>
    <IconButton
      name="arrow-back"
      onPress={onCancel}
      accessibilityLabel={ACCESSIBILITY.backButton}
      variables={variables}
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
    styles,
  }: AlbumTabsProps) => (
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
    styles,
    variables,
  }: PhotoTileProps) => (
    <TouchableOpacity
      style={styles.photoContainer}
      onPress={onPress}
      accessibilityLabel={selected ? "Deseleccionar foto" : "Seleccionar foto"}>
      <Image source={{ uri }} style={styles.photo} />
      {selected && (
        <View style={styles.selectionBadge}>
          <Ionicons name="checkmark-circle" size={32} color={variables['--text-color']} />
        </View>
      )}
    </TouchableOpacity>
  )
);

const FloatingActions = memo(
  ({ onConfirm, onClear, styles, variables }: FloatingActionsProps) => (
    <View style={styles.floatingContainer}>
      <IconButton
        name="close-circle"
        onPress={onClear}
        variables={variables}
        accessibilityLabel={ACCESSIBILITY.clearButton}
      />
      <IconButton
        name="checkmark-circle"
        onPress={onConfirm}
        variables={variables}
        accessibilityLabel={ACCESSIBILITY.confirmButton}
      />
    </View>
  )
);

const IconButton = memo(
  ({
    name,
    onPress,
    variables,
    accessibilityLabel,
  }: IconButtonProps) => (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}>
      <Ionicons name={name} size={28} color={variables['--text-color']} />
    </TouchableOpacity>
  )
);

const LoadingIndicator = memo(({ styles }: LoadingIndicatorProps) => (
  <View style={styles.centered}>
    <ActivityIndicator size="large" color="#2E7D32" />
    <Text style={styles.loadingText}>Cargando fotos...</Text>
  </View>
));

const ErrorState = memo(
  ({ message, onRetry, styles }: ErrorStateProps) => (
    <View style={styles.centered}>
      <Text style={styles.errorText}>{message}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  )
);

export default CameraImagePicker;
