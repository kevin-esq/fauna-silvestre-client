import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useTheme } from "../../contexts/theme-context";
import axios from 'axios';

interface LocationMapProps {
    location: string;
}

const LocationMap = ({ location }: LocationMapProps) => {

    const { theme } = useTheme();
    const [coordinates, setCoordinates] = useState<{latitude: number, longitude: number} | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchCoordinates = async () => {
            try {
                setLoading(true);
                setError(null);

                // Usamos Nominatim (OpenStreetMap) para geocodificación gratuita
                const response = await axios.get(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
                );

                if (isMounted) {
                    if (response.data && response.data.length > 0) {
                        const { lat, lon } = response.data[0];
                        const newCoords = {
                            latitude: parseFloat(lat),
                            longitude: parseFloat(lon)
                        };
                        setCoordinates(newCoords);

                        // Animamos el mapa a la nueva ubicación
                        mapRef.current?.animateToRegion({
                            ...newCoords,
                            latitudeDelta: 0.005, // Zoom más cercano
                            longitudeDelta: 0.005,
                        }, 500);
                    } else {
                        setError('Ubicación no encontrada');
                    }
                }
            } catch (err) {
                if (isMounted) {
                    setError('Error al obtener las coordenadas');
                    console.error(err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchCoordinates();

        return () => {
            isMounted = false; // Limpieza al desmontar
        };
    }, [location]);

    if (loading) {
        return (
            <View style={[styles.mapContainer, styles.center, { borderColor: theme.colors.border }]}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
        );
    }

    if (error || !coordinates) {
        return (
            <View style={[styles.mapContainer, styles.center, { borderColor: theme.colors.border }]}>
                <Text style={{ color: theme.colors.error }}>{error || 'No se pudo mostrar el mapa'}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.mapContainer, { borderColor: theme.colors.border }]}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                    latitudeDelta: 0.005, // Zoom más cercano
                    longitudeDelta: 0.005,
                }}
             //   key={mapKey}
            >
                <Marker
                    coordinate={{
                        latitude: coordinates.latitude,
                        longitude: coordinates.longitude,
                    }}
                    title={location}
                />
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
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default LocationMap;