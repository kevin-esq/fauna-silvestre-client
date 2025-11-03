import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo
} from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Region,
  LatLng,
  Callout
} from 'react-native-maps';
import { useTheme } from '@/presentation/contexts/theme.context';
import { createLocationMapStyles } from './location-map.styles';

interface LocationMapProps {
  location?: string;
  markerTitle?: string;
  markerDescription?: string;

  locations?: LatLng[];
  showLocationNumbers?: boolean;

  showCoordinates?: boolean;
  showControls?: boolean;
  pitchEnabled?: boolean;
  initialZoom?: 'close' | 'medium' | 'far';
  onLocationPress?: (coords: LatLng) => void;
  onMarkerPress?: (coords: LatLng, index: number) => void;
  height?: number;
  animationDuration?: number;

  containerStyle?: object;
  emptyStateMessage?: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface ZoomLevel {
  latitudeDelta: number;
  longitudeDelta: number;
}

const ZOOM_LEVELS: Record<'close' | 'medium' | 'far', ZoomLevel> = {
  close: { latitudeDelta: 0.005, longitudeDelta: 0.005 },
  medium: { latitudeDelta: 0.02, longitudeDelta: 0.02 },
  far: { latitudeDelta: 0.2, longitudeDelta: 0.2 }
};

const MIN_ZOOM_DELTA = 0.0008;
const MAX_ZOOM_DELTA = 180;
const ZOOM_FACTOR = 0.5;

const parseCoordinates = (location: string): Coordinates => {
  if (!location || typeof location !== 'string') {
    throw new Error('Ubicación no proporcionada');
  }

  const [latStr, lonStr] = location.split(',').map(s => s.trim());

  if (!latStr || !lonStr) {
    throw new Error('Formato de coordenadas incompleto');
  }

  const latitude = parseFloat(latStr);
  const longitude = parseFloat(lonStr);

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Las coordenadas contienen valores inválidos');
  }

  if (latitude < -90 || latitude > 90) {
    throw new Error('Latitud fuera de rango (-90 a 90)');
  }

  if (longitude < -180 || longitude > 180) {
    throw new Error('Longitud fuera de rango (-180 a 180)');
  }

  return { latitude, longitude };
};

const calculateRegionForLocations = (locations: LatLng[]): Region => {
  if (locations.length === 0) {
    throw new Error('No hay ubicaciones');
  }

  if (locations.length === 1) {
    return {
      ...locations[0],
      ...ZOOM_LEVELS.medium
    };
  }

  let minLat = locations[0].latitude;
  let maxLat = locations[0].latitude;
  let minLon = locations[0].longitude;
  let maxLon = locations[0].longitude;

  locations.forEach(loc => {
    minLat = Math.min(minLat, loc.latitude);
    maxLat = Math.max(maxLat, loc.latitude);
    minLon = Math.min(minLon, loc.longitude);
    maxLon = Math.max(maxLon, loc.longitude);
  });

  const centerLat = (minLat + maxLat) / 2;
  const centerLon = (minLon + maxLon) / 2;
  const latDelta = (maxLat - minLat) * 1.5;
  const lonDelta = (maxLon - minLon) * 1.5;

  return {
    latitude: centerLat,
    longitude: centerLon,
    latitudeDelta: Math.max(latDelta, 0.01),
    longitudeDelta: Math.max(lonDelta, 0.01)
  };
};

const LocationMap = React.memo(
  ({
    location,
    locations,
    showCoordinates = false,
    showControls = true,
    pitchEnabled = false,
    initialZoom = 'close',
    onLocationPress,
    onMarkerPress,
    markerTitle = 'Ubicación',
    markerDescription,
    showLocationNumbers = true,
    height = 280,
    animationDuration = 300,
    containerStyle,
    emptyStateMessage = 'No hay ubicaciones disponibles'
  }: LocationMapProps) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createLocationMapStyles(theme), [theme]);

    const isMultipleMode = useMemo(() => {
      return Boolean(locations && locations.length > 0);
    }, [locations]);

    const [coords, setCoords] = useState<Coordinates | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMapReady, setIsMapReady] = useState(false);
    const [region, setRegion] = useState<Region | null>(null);

    const mapRef = useRef<MapView>(null);
    const isMountedRef = useRef(true);
    const regionUpdateTimeoutRef = useRef<number | null>(null);
    const fitToCoordinatesTimeoutRef = useRef<number | null>(null);

    const initialRegion = useMemo(() => {
      if (isMultipleMode && locations && locations.length > 0) {
        try {
          return calculateRegionForLocations(locations);
        } catch {
          return null;
        }
      } else if (coords) {
        return {
          ...coords,
          ...ZOOM_LEVELS[initialZoom]
        };
      }
      return null;
    }, [isMultipleMode, locations, coords, initialZoom]);

    useEffect(() => {
      if (isMultipleMode) {
        setIsLoading(false);
        return;
      }

      if (!location) {
        setError('Ubicación no proporcionada');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const newCoords = parseCoordinates(location);
        const newRegion = {
          ...newCoords,
          ...ZOOM_LEVELS[initialZoom]
        };

        if (isMountedRef.current) {
          setCoords(newCoords);
          setRegion(newRegion);
          setIsLoading(false);
        }
      } catch (e) {
        if (isMountedRef.current) {
          setError(
            e instanceof Error ? e.message : 'Error al procesar la ubicación'
          );
          setIsLoading(false);
          setCoords(null);
        }
      }
    }, [location, initialZoom, isMultipleMode]);

    useEffect(() => {
      return () => {
        isMountedRef.current = false;
        if (regionUpdateTimeoutRef.current) {
          clearTimeout(regionUpdateTimeoutRef.current);
        }
        if (fitToCoordinatesTimeoutRef.current) {
          clearTimeout(fitToCoordinatesTimeoutRef.current);
        }
      };
    }, []);

    useEffect(() => {
      if (isMapReady && initialRegion && mapRef.current) {
        requestAnimationFrame(() => {
          if (isMultipleMode && locations && locations.length > 1) {
            fitToCoordinatesTimeoutRef.current = setTimeout(() => {
              mapRef.current?.fitToCoordinates(locations, {
                edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
                animated: true
              });
            }, 500);
          } else {
            mapRef.current?.animateToRegion(initialRegion, animationDuration);
          }
        });
      }
    }, [
      isMapReady,
      initialRegion,
      animationDuration,
      isMultipleMode,
      locations
    ]);

    const handleMapReady = useCallback(() => {
      if (!isMountedRef.current) return;
      setIsMapReady(true);
    }, []);

    const handleRegionChangeComplete = useCallback((newRegion: Region) => {
      if (regionUpdateTimeoutRef.current) {
        clearTimeout(regionUpdateTimeoutRef.current);
      }

      regionUpdateTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setRegion(newRegion);
        }
      }, 100);
    }, []);

    const handleRecenter = useCallback(() => {
      if (!initialRegion || !mapRef.current) return;

      if (isMultipleMode && locations && locations.length > 1) {
        mapRef.current.fitToCoordinates(locations, {
          edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
          animated: true
        });
      } else {
        mapRef.current.animateToRegion(initialRegion, animationDuration);
      }
    }, [initialRegion, animationDuration, isMultipleMode, locations]);

    const handleZoomIn = useCallback(() => {
      if (!region || !mapRef.current) return;

      const currentDelta = region.latitudeDelta;

      const newLatDelta = currentDelta * ZOOM_FACTOR;
      const newLonDelta = region.longitudeDelta * ZOOM_FACTOR;

      if (newLatDelta < MIN_ZOOM_DELTA) {
        return;
      }

      const clampedLatDelta = Math.max(newLatDelta, MIN_ZOOM_DELTA);
      const clampedLonDelta = Math.max(newLonDelta, MIN_ZOOM_DELTA);

      const newRegion = {
        latitude: region.latitude,
        longitude: region.longitude,
        latitudeDelta: clampedLatDelta,
        longitudeDelta: clampedLonDelta
      };

      setRegion(newRegion);
      mapRef.current.animateToRegion(newRegion, animationDuration);
    }, [region, animationDuration]);

    const handleZoomOut = useCallback(() => {
      if (!region || !mapRef.current) return;

      const currentDelta = region.latitudeDelta;

      const newLatDelta = currentDelta / ZOOM_FACTOR;
      const newLonDelta = region.longitudeDelta / ZOOM_FACTOR;

      if (newLatDelta > MAX_ZOOM_DELTA) {
        return;
      }

      const clampedLatDelta = Math.min(newLatDelta, MAX_ZOOM_DELTA);
      const clampedLonDelta = Math.min(newLonDelta, MAX_ZOOM_DELTA);

      const newRegion = {
        latitude: region.latitude,
        longitude: region.longitude,
        latitudeDelta: clampedLatDelta,
        longitudeDelta: clampedLonDelta
      };

      setRegion(newRegion);
      mapRef.current.animateToRegion(newRegion, animationDuration);
    }, [region, animationDuration]);

    const formattedCoords = useMemo(() => {
      if (!coords) return '';
      return `📍 ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
    }, [coords]);

    if (isMultipleMode && (!locations || locations.length === 0)) {
      return (
        <View style={[styles.container, containerStyle, { height }]}>
          <View style={[styles.mapContainer, { height }]}>
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>📍</Text>
              <Text style={styles.errorText}>{emptyStateMessage}</Text>
            </View>
          </View>
        </View>
      );
    }

    if (error) {
      return (
        <View style={[styles.container, containerStyle, { height }]}>
          <View style={[styles.mapContainer, { height }]}>
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>📍</Text>
              <Text style={styles.errorText}>No se pudo cargar el mapa</Text>
              <Text style={styles.errorDescription}>{error}</Text>
            </View>
          </View>
        </View>
      );
    }

    if (isLoading || !initialRegion) {
      return (
        <View style={[styles.container, containerStyle, { height }]}>
          <View style={[styles.mapContainer, { height }]}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Cargando mapa...</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.container, containerStyle, { height }]}>
        <View style={[styles.mapContainer, { height }]}>
          <MapView
            ref={mapRef}
            style={[styles.map, { height }]}
            provider={PROVIDER_GOOGLE}
            initialRegion={initialRegion}
            onRegionChangeComplete={handleRegionChangeComplete}
            loadingEnabled={true}
            loadingIndicatorColor={theme.colors.primary}
            loadingBackgroundColor={theme.colors.background}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsCompass={false}
            showsScale={false}
            pitchEnabled={pitchEnabled}
            rotateEnabled={true}
            scrollEnabled={true}
            zoomEnabled={true}
            zoomTapEnabled={true}
            zoomControlEnabled={false}
            toolbarEnabled={false}
            moveOnMarkerPress={false}
            onMapReady={handleMapReady}
            onPress={
              onLocationPress
                ? e => onLocationPress(e.nativeEvent.coordinate)
                : undefined
            }
            cacheEnabled={true}
          >
            {!isMultipleMode && isMapReady && coords && (
              <Marker
                coordinate={coords}
                pinColor={theme.colors.primary}
                title={markerTitle}
                description={markerDescription}
                tracksViewChanges={false}
              />
            )}

            {isMultipleMode &&
              isMapReady &&
              locations &&
              locations.map((coord, index) => (
                <Marker
                  key={`marker-${index}-${coord.latitude}-${coord.longitude}`}
                  coordinate={coord}
                  pinColor={theme.colors.primary}
                  tracksViewChanges={false}
                  onPress={() => onMarkerPress?.(coord, index)}
                >
                  {showLocationNumbers && (
                    <Callout>
                      <View style={styles.calloutContainer}>
                        <Text style={styles.calloutText}>
                          Ubicación {index + 1}
                        </Text>
                        <Text style={styles.calloutCoords}>
                          {coord.latitude.toFixed(6)},{' '}
                          {coord.longitude.toFixed(6)}
                        </Text>
                      </View>
                    </Callout>
                  )}
                </Marker>
              ))}
          </MapView>

          {showControls && (
            <View style={styles.mapControls}>
              <Pressable
                onPress={handleZoomIn}
                style={({ pressed }) => [
                  styles.mapButton,
                  pressed && styles.mapButtonPressed
                ]}
                accessibilityLabel="Acercar"
                accessibilityRole="button"
                android_ripple={{ color: theme.colors.primary + '20' }}
              >
                <Text style={styles.mapButtonIcon}>+</Text>
              </Pressable>

              <Pressable
                onPress={handleZoomOut}
                style={({ pressed }) => [
                  styles.mapButton,
                  pressed && styles.mapButtonPressed
                ]}
                accessibilityLabel="Alejar"
                accessibilityRole="button"
                android_ripple={{ color: theme.colors.primary + '20' }}
              >
                <Text style={styles.mapButtonIcon}>−</Text>
              </Pressable>

              <Pressable
                onPress={handleRecenter}
                style={({ pressed }) => [
                  styles.mapButton,
                  pressed && styles.mapButtonPressed
                ]}
                accessibilityLabel="Recentrar"
                accessibilityRole="button"
                android_ripple={{ color: theme.colors.primary + '20' }}
              >
                <Text style={styles.mapButtonIcon}>⊙</Text>
              </Pressable>
            </View>
          )}

          {showCoordinates && !isMultipleMode && coords && (
            <View style={styles.coordinatesLabel}>
              <Text style={styles.coordinatesText} numberOfLines={1}>
                {formattedCoords}
              </Text>
            </View>
          )}

          {isMultipleMode && locations && locations.length > 0 && (
            <View style={styles.coordinatesLabel}>
              <Text style={styles.coordinatesText}>
                📍 {locations.length}{' '}
                {locations.length === 1 ? 'ubicación' : 'ubicaciones'}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }
);

LocationMap.displayName = 'LocationMap';

export default LocationMap;
