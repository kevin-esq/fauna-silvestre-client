import { useEffect, useState } from 'react';
import Orientation, { OrientationType } from 'react-native-orientation-locker';

export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState<OrientationType | null>(null);

  useEffect(() => {
    Orientation.getOrientation(current => {
      setOrientation(current);
    });

    const orientationChangeHandler = (newOrientation: OrientationType) => {
      setOrientation(newOrientation);
    };

    Orientation.addOrientationListener(orientationChangeHandler);

    return () => {
      Orientation.removeOrientationListener(orientationChangeHandler);
    };
  }, []);

  return orientation;
};
