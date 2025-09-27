import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BackHandler } from 'react-native';
import { useNavigationActions } from '../navigation/navigation-provider';

export const useBackHandler = (
  isModalOpen: boolean,
  closeModal: () => void
) => {
  const navigation = useNavigation();
  const { navigate, goBack } = useNavigationActions();

  useFocusEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (isModalOpen) {
          closeModal();
          return true;
        }
        if (navigation.canGoBack()) {
          goBack();
          return true;
        } else {
          navigate('HomeTabs');
          return true;
        }
      }
    );

    return () => backHandler.remove();
  });

  const handleBackPress = () => {
    navigate('HomeTabs');
  };

  return { handleBackPress };
};
