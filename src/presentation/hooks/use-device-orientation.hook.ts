import { useEffect, useState } from "react";
import Orientation, { OrientationType } from "react-native-orientation-locker";

export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState<OrientationType | null>(null);

  useEffect(() => {
    // Obtener la orientación inicial
    Orientation.getOrientation((current) => {
      setOrientation(current);
    });

    // Escuchar cambios de orientación
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