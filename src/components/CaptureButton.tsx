import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

type Props = { onPress: () => void; disabled: boolean; };
export const CaptureButton: React.FC<Props> = ({ onPress, disabled }) => (
  <TouchableOpacity onPress={onPress} style={styles.button} disabled={disabled}>
    <FontAwesome name="camera" size={30} color="#fff" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({ button: { backgroundColor: '#007AFF', padding: 18, borderRadius: 40 } });