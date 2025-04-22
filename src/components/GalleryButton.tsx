import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = { onPress: () => void };
export const GalleryButton: React.FC<Props> = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.container}>
    <Ionicons name="images-outline" size={24} color="#007AFF" />
    <Text style={styles.text}>Galería</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 120, left: 20, flexDirection: 'row', backgroundColor: '#fff', padding: 8, borderRadius: 20, alignItems: 'center', elevation: 5 },
  text: { marginLeft: 8, color: '#007AFF', fontSize: 16, fontWeight: '600' },
});