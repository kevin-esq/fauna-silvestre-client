import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTheme } from '../../contexts/theme.context';

interface LocationMapProps {
  location: string;
}

const LocationMap = ({ location }: LocationMapProps) => {
  const { theme } = useTheme();
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    try {
      const [latStr, lonStr] = location.split(',');
      const latitude = parseFloat(latStr.trim());
      const longitude = parseFloat(lonStr.trim());

      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Coordenadas inválidas');
      }

      const newCoords = { latitude, longitude };
      setCoords(newCoords);

      setTimeout(() => {
        mapRef.current?.animateToRegion(
          {
            ...newCoords,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          },
          500
        );
      }, 500);
    } catch (e) {
      console.error(e);
      setError('Formato de ubicación inválido');
    }
  }, [location]);

  if (error || !coords) {
    return (
      <View style={[styles.mapContainer, styles.center, { borderColor: theme.colors.border }]}>
        <Text style={{ color: theme.colors.error }}>{error || 'Error al mostrar el mapa'}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.mapContainer, { borderColor: theme.colors.border }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          ...coords,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        provider={PROVIDER_GOOGLE}
        cacheEnabled
        loadingEnabled
        loadingIndicatorColor={theme.colors.primary}
        loadingBackgroundColor={theme.colors.background}
      >
        <Marker coordinate={coords} title="Ubicación" />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    height: 250,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    minHeight: 250,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LocationMap;
