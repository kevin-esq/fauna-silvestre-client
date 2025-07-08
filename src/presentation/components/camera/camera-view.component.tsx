// components/CameraView.tsx
import React, { memo } from 'react';
import { Camera, CameraDevice } from 'react-native-vision-camera';
import { StyleSheet } from 'react-native';

type CameraViewProps = {
  device: CameraDevice;
  isActive: boolean;
};

const CameraView = memo(({ device, isActive }: CameraViewProps) => (
  <Camera
    style={StyleSheet.absoluteFill}
    device={device}
    isActive={isActive}
    photo
    enableZoomGesture
  />
));

export default CameraView;