import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

type Props = {
  onBack: () => void;
  onToggleFlash: () => void;
  onFlip: () => void;
  flashMode: 'off' | 'on' | 'auto';
  showFlash: boolean;
};

export const TopControls: React.FC<Props> = ({ onBack, onToggleFlash, onFlip, flashMode, showFlash }) => (
  <View style={styles.container}>
    <TouchableOpacity onPress={onBack} style={styles.button}>
      <Ionicons name="arrow-back" size={28} color="#fff" />
    </TouchableOpacity>
    {showFlash && (
      <TouchableOpacity onPress={onToggleFlash} style={styles.button}>
        <MaterialIcons name={flashMode === 'on' ? 'flash-on' : flashMode === 'auto' ? 'flash-auto' : 'flash-off'} size={26} color="#fff" />
      </TouchableOpacity>
    )}
    <TouchableOpacity onPress={onFlip} style={styles.button}>
      <Ionicons name="camera-reverse-outline" size={30} color="#fff" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 50, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, zIndex: 10 },
  button: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 25 },
});