import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  LatLng,
  Callout,
  Region
} from 'react-native-maps';

interface Props {
  locations: LatLng[];
}

const CatalogMap: React.FC<Props> = ({ locations }) => {
  const mapRef = useRef<MapView>(null);

  const getInitialRegion = (): Region | undefined => {
    if (!locations.length) return undefined;

    const { latitude, longitude } = locations[0];
    return {
      latitude,
      longitude,
      latitudeDelta: 0.2,
      longitudeDelta: 0.2
    };
  };

  useEffect(() => {
    if (locations.length > 0 && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(locations, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true
        });
      }, 500);
    }
  }, [locations]);

  if (!locations.length) {
    return (
      <View style={styles.center}>
        <Text>No hay ubicaciones disponibles</Text>
      </View>
    );
  }

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={StyleSheet.absoluteFillObject}
      showsUserLocation={false}
      initialRegion={getInitialRegion()}
    >
      {locations.map((coord, index) => (
        <Marker key={index} coordinate={coord}>
          <Callout>
            <Text>Ubicación {index + 1}</Text>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default CatalogMap;
