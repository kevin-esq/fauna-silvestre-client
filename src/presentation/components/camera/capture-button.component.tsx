import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

type Props = {
  onPress: () => void;
  disabled?: boolean;
  isActive?: boolean;
};

export const CaptureButton: React.FC<Props> = ({
  onPress,
  disabled,
  isActive
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}
    style={styles.captureButton}
  >
    <View
      style={[
        styles.captureButtonInner,
        isActive && styles.captureButtonActive
      ]}
    />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)'
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff'
  },
  captureButtonActive: {
    backgroundColor: '#007AFF'
  }
});
