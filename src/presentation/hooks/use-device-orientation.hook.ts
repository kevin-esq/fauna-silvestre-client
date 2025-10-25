import { useEffect, useState, useMemo } from 'react';
import Orientation from 'react-native-orientation-locker';

export const useDeviceOrientation = () => {
  const [deviceOrientation, setDeviceOrientation] =
    useState<string>('PORTRAIT');

  useEffect(() => {
    Orientation.getDeviceOrientation(orientation => {
      console.log(
        '🔄 [ORIENTATION] Orientación inicial del dispositivo:',
        orientation
      );
      setDeviceOrientation(orientation);
    });

    const handleOrientationChange = (orientation: string) => {
      console.log(
        '🔄 [ORIENTATION] Cambio de orientación del dispositivo:',
        orientation
      );
      setDeviceOrientation(orientation);
    };

    Orientation.addDeviceOrientationListener(handleOrientationChange);

    return () => {
      Orientation.removeDeviceOrientationListener(handleOrientationChange);
    };
  }, []);

  const iconRotation = useMemo(() => {
    switch (deviceOrientation) {
      case 'LANDSCAPE-LEFT':
        return '90deg';
      case 'LANDSCAPE-RIGHT':
        return '-90deg';
      case 'PORTRAIT-UPSIDEDOWN':
        return '180deg';
      default:
        return '0deg';
    }
  }, [deviceOrientation]);

  const isLandscape = useMemo(() => {
    return deviceOrientation.includes('LANDSCAPE');
  }, [deviceOrientation]);

  return {
    deviceOrientation,
    iconRotation,
    isLandscape
  };
};
