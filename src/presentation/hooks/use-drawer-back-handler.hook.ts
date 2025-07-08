import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const useDrawerBackHandler = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const onBackPress = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      return false;
    };

    const backHandlerListener = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandlerListener.remove();
  }, [navigation]);
};

export default useDrawerBackHandler;