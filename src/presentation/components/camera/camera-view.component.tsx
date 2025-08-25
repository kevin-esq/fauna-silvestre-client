// components/CameraView.tsx

import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Camera, CameraDevice } from 'react-native-vision-camera';

// --- PROPS ---
interface CameraViewProps {
  device: CameraDevice;
  isActive: boolean;
}

// --- COMPONENTE ---
const CameraView: React.FC<CameraViewProps> = ({ device, isActive }) => {
  return (
    <Camera
      style={styles.fullscreen}
      device={device}
      isActive={isActive}
      photo
      enableZoomGesture
    />
  );
};

CameraView.displayName = 'CameraView';

const styles = StyleSheet.create({
  fullscreen: StyleSheet.absoluteFillObject
});

export default memo(CameraView);
