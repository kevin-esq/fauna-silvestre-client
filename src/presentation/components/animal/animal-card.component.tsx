import React from 'react';
import { View, Text, Image } from 'react-native';
import AnimatedPressable from '../ui/animated-pressable.component';
import styles from './animal-card.styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AnimalModel } from '../../../domain/models/animal.models';

const AnimalCard = ({
  animal,
  onPress
}: {
  animal: AnimalModel;
  onPress: () => void;
}) => {
  return (
    <AnimatedPressable style={styles.card} onPress={onPress}>
      {/* Contenedor de imagen con mejoras */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: animal.image }} style={styles.image} />
        <View style={styles.imageOverlay} />
      </View>

      {/* Información del animal */}
      <View style={styles.info}>
        <View style={styles.headerSection}>
          <Text style={styles.commonName} numberOfLines={1}>
            {animal.commonName}
          </Text>
          <Text style={styles.scientificName} numberOfLines={1}>
            {animal.scientificName}
          </Text>
        </View>

        {/* Status con diseño mejorado */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: animal.statusColor || '#4CAF50' }
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: animal.statusColor || '#4CAF50' }
            ]}
          >
            {animal.status}
          </Text>
        </View>

        {/* Indicador de que es clickeable */}
        <View style={styles.actionIndicator}>
          <Icon name="chevron-right" size={20} color="#ccc" />
        </View>
      </View>
    </AnimatedPressable>
  );
};

export default AnimalCard;
