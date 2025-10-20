import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useMemo
} from 'react';
import {
  createNavigationContainerRef,
  StackActions,
  CommonActions
} from '@react-navigation/native';
import { RootStackParamList } from './navigation.types';
import { AnimalModelResponse } from '../../domain/models/animal.models';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export interface NavigationContextType {
  navigate: <T extends keyof RootStackParamList>(
    name: T,
    params?: RootStackParamList[T]
  ) => void;
  goBack: () => void;
  push: <T extends keyof RootStackParamList>(
    name: T,
    params?: RootStackParamList[T]
  ) => void;
  navigateAndReset: <T extends keyof RootStackParamList>(
    name: T,
    params?: RootStackParamList[T]
  ) => void;
  setParams: <T extends keyof RootStackParamList>(
    params: Partial<RootStackParamList[T]>
  ) => void;
  navigateToAnimalForm: (animal?: AnimalModelResponse) => void;
  navigateToImageEditor: (
    animal: AnimalModelResponse,
    refresh?: boolean
  ) => void;
  navigateToCatalogManagement: () => void;
  navigateToUserSettings: () => void;
  navigateToUserList: () => void;
  navigateToUserCreate: () => void;
  navigateToUserEdit: (userId: string) => void;
  navigateToDownloadedFiles: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children
}) => {
  const navigate = useCallback(
    <T extends keyof RootStackParamList>(
      name: T,
      params?: RootStackParamList[T]
    ) => {
      if (navigationRef.isReady()) {
        navigationRef.dispatch(CommonActions.navigate({ name, params }));
      }
    },
    []
  );

  const navigateAndReset = useCallback(
    <T extends keyof RootStackParamList>(
      name: T,
      params?: RootStackParamList[T]
    ) => {
      if (navigationRef.isReady()) {
        navigationRef.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name, params }]
          })
        );
      }
    },
    []
  );

  const goBack = useCallback(() => {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  }, []);

  const push = useCallback(
    <T extends keyof RootStackParamList>(
      name: T,
      params?: RootStackParamList[T]
    ) => {
      if (navigationRef.isReady()) {
        navigationRef.dispatch(StackActions.push(name, params));
      }
    },
    []
  );

  const setParams = useCallback(
    <T extends keyof RootStackParamList>(
      params: Partial<RootStackParamList[T]>
    ) => {
      if (navigationRef.isReady()) {
        navigationRef.dispatch(CommonActions.setParams(params));
      }
    },
    []
  );

  const navigateToAnimalForm = useCallback(
    (animal?: AnimalModelResponse) => {
      navigate('AnimalForm', { animal });
    },
    [navigate]
  );

  const navigateToImageEditor = useCallback(
    (animal: AnimalModelResponse, refresh?: boolean) => {
      navigate('ImageEditor', { animal, refresh });
    },
    [navigate]
  );

  const navigateToCatalogManagement = useCallback(() => {
    navigate('CatalogManagement');
  }, [navigate]);

  const navigateToUserSettings = useCallback(() => {
    navigate('UserSettings');
  }, [navigate]);

  const navigateToUserList = useCallback(() => {
    navigate('UserList');
  }, [navigate]);

  const navigateToUserCreate = useCallback(() => {
    navigate('UserCreate');
  }, [navigate]);

  const navigateToUserEdit = useCallback(
    (userId: string) => {
      navigate('UserEdit', { userId });
    },
    [navigate]
  );

  const navigateToDownloadedFiles = useCallback(() => {
    navigate('DownloadedFiles');
  }, [navigate]);

  const contextValue = useMemo(
    () => ({
      navigate,
      goBack,
      push,
      navigateAndReset,
      setParams,
      navigateToAnimalForm,
      navigateToImageEditor,
      navigateToCatalogManagement,
      navigateToUserSettings,
      navigateToUserList,
      navigateToUserCreate,
      navigateToUserEdit,
      navigateToDownloadedFiles
    }),
    [
      navigate,
      goBack,
      push,
      navigateAndReset,
      setParams,
      navigateToAnimalForm,
      navigateToImageEditor,
      navigateToCatalogManagement,
      navigateToUserSettings,
      navigateToUserList,
      navigateToUserCreate,
      navigateToUserEdit,
      navigateToDownloadedFiles
    ]
  );

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigationActions = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error(
      'useNavigationActions debe usarse dentro de NavigationProvider'
    );
  }
  return context;
};
