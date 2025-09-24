import { useState, useEffect } from 'react';
import { BackHandler, ToastAndroid } from 'react-native';

const useDoubleBackExit = () => {
  const [backPressedOnce, setBackPressedOnce] = useState(false);

  useEffect(() => {
    const backAction = () => {
      if (!backPressedOnce) {
        ToastAndroid.show(
          'Presiona atrás de nuevo para salir',
          ToastAndroid.SHORT
        );
        setBackPressedOnce(true);
        setTimeout(() => setBackPressedOnce(false), 2000);
        return true;
      }
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, [backPressedOnce]);
};

export default useDoubleBackExit;
