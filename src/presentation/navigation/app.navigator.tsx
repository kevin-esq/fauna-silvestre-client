import React, { useCallback, useEffect, useMemo } from 'react';
import {
  createMaterialTopTabNavigator,
  MaterialTopTabScreenProps,
  MaterialTopTabNavigationOptions
} from '@react-navigation/material-top-tabs';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';

import { useAuth } from '@/presentation/contexts/auth.context';
import {
  Theme,
  themeVariables,
  ThemeVariablesType,
  useTheme
} from '@/presentation/contexts/theme.context';
import { useApiStatus } from '@/presentation/contexts/api-status.context';
import { CatalogViewPreferencesProvider } from '@/presentation/contexts/catalog-view-preferences.context';
import TopTabsNavigationBar from '@/presentation/components/ui/top-tabs-navigation-bar.component';

import LoginScreen from '../screens/auth/login-screen';
import RegisterScreen from '../screens/auth/register-screen';
import ForgotPasswordScreen from '../screens/auth/forgot-password-screen';
import SplashScreen from '../screens/home/splash-screen';
import PublicationDetailsScreen from '../screens/publication/publication-details-screen';
import AnimalDetailsScreen from '../screens/catalog/animal-details-screen';
import PublicationFormScreen from '../screens/publication/publication-form-screen';
import { CameraGalleryScreen } from '../screens/media/camera-gallery-screen';
import ImagePreviewScreen from '../screens/media/image-preview-screen';
import AnimalFormScreen from '../screens/admin/animal-form-screen';
import ImageEditorScreen from '../screens/admin/image-editor-screen';
import CatalogAnimalsScreen from '../screens/catalog/catalog-animals-screen';
import DownloadedFilesScreen from '../screens/media/downloaded-files-screen';
import DraftsScreen from '../screens/drafts/drafts-screen';
import UserListScreen from '../screens/users/user-list-screen';
import UserDetailsScreen from '../screens/users/user-details-screen';

import type { RootStackParamList } from '@/presentation/navigation/navigation.types';
import { createRootStack } from '@/presentation/navigation/create-root-stack';
import { adminTabs, userTabs } from '@/presentation/navigation/tabs-config';
import { offlineTabs } from '@/presentation/navigation/offline-tabs-config';
import { useNetworkStatus } from '../hooks/common/use-network-status.hook';

export type ValidRole = 'Admin' | 'User';

const CatalogAnimalsScreenWithProvider = () => (
  <CatalogViewPreferencesProvider>
    <CatalogAnimalsScreen />
  </CatalogViewPreferencesProvider>
);

interface TabConfig {
  name: keyof RootStackParamList;
  component: React.ComponentType<
    MaterialTopTabScreenProps<RootStackParamList, keyof RootStackParamList>
  >;
  title: string;
  hideInBar?: boolean;
  tabBarIcon?: MaterialTopTabNavigationOptions['tabBarIcon'];
}

const VALID_ROLES: readonly ValidRole[] = ['Admin', 'User'] as const;

const TopTabs = createMaterialTopTabNavigator<RootStackParamList>();

const createScreenOptions = (
  variables: ThemeVariablesType
): MaterialTopTabNavigationOptions => ({
  lazy: true,
  swipeEnabled: true,
  tabBarScrollEnabled: false,
  tabBarIndicatorStyle: {
    backgroundColor: variables['--primary'],
    height: 3
  },
  tabBarLabelStyle: {
    fontWeight: 'bold',
    textTransform: 'none'
  },
  tabBarPressColor: variables['--primary']
});

const isValidRole = (role: string | undefined): role is ValidRole => {
  return role !== undefined && VALID_ROLES.includes(role as ValidRole);
};

const useRoleValidation = () => {
  const { user, isAuthenticated, initializing, signOut } = useAuth();

  const handleInvalidRole = useCallback(async () => {
    try {
      console.warn('Invalid role detected, signing out user');
      await signOut();
    } catch (error) {
      console.error('Error during signOut:', error);
    }
  }, [signOut]);

  useEffect(() => {
    if (initializing || !isAuthenticated) return;

    if (!user?.role || !isValidRole(user.role)) {
      handleInvalidRole();
    }
  }, [initializing, isAuthenticated, user?.role, handleInvalidRole]);

  return { role: user?.role, isValidRole: isValidRole(user?.role) };
};

const useNavigationState = () => {
  const { status } = useApiStatus();
  const { isAuthenticated, initializing } = useAuth();
  const { role, isValidRole: hasValidRole } = useRoleValidation();
  const { isOffline } = useNetworkStatus();

  return useMemo(() => {
    if (status === 'BOOTING' || initializing) {
      return 'splash';
    }

    if (isOffline) {
      return 'offline';
    }

    if (status === 'AUTHENTICATING' || status === 'UNAUTHENTICATED') {
      return 'auth';
    }
    if (status === 'AUTHENTICATED' && isAuthenticated && hasValidRole) {
      return role === 'Admin' ? 'admin' : 'user';
    }
    return 'splash';
  }, [
    status,
    initializing,
    isAuthenticated,
    hasValidRole,
    role,
    isOffline
  ]);
};

const TabsComponent = React.memo<{
  screens: TabConfig[];
  theme: Theme;
  testID?: string;
}>(({ screens, theme, testID }) => {
  const screenOptions = useMemo(
    () => createScreenOptions(themeVariables(theme)),
    [theme]
  );

  const tabBar = useCallback(
    (props: MaterialTopTabBarProps) => <TopTabsNavigationBar {...props} />,
    []
  );

  return (
    <TopTabs.Navigator
      backBehavior="history"
      screenOptions={screenOptions}
      tabBar={tabBar}
      initialRouteName={screens[0]?.name}
      testID={testID}
    >
      {screens.map(({ name, component, title, hideInBar, tabBarIcon }) => (
        <TopTabs.Screen
          key={name as string}
          name={name}
          component={component}
          options={{
            title,
            ...(hideInBar && { tabBarItemStyle: { display: 'none' } }),
            tabBarIcon
          }}
        />
      ))}
    </TopTabs.Navigator>
  );
});

TabsComponent.displayName = 'TabsComponent';

export const AdminTabs = React.memo(() => {
  const { theme } = useTheme();
  return (
    <CatalogViewPreferencesProvider>
      <TabsComponent screens={adminTabs} theme={theme} testID="admin-tabs" />
    </CatalogViewPreferencesProvider>
  );
});

AdminTabs.displayName = 'AdminTabs';

export const UserTabs = React.memo(() => {
  const { theme } = useTheme();
  return (
    <CatalogViewPreferencesProvider>
      <TabsComponent screens={userTabs} theme={theme} testID="user-tabs" />
    </CatalogViewPreferencesProvider>
  );
});

UserTabs.displayName = 'UserTabs';

export const OfflineTabs = React.memo(() => {
  const { theme } = useTheme();
  return (
    <TabsComponent screens={offlineTabs} theme={theme} testID="offline-tabs" />
  );
});

OfflineTabs.displayName = 'OfflineTabs';

const createStackConfigurations = () => {
  const publicationFormStack = createRootStack<RootStackParamList>([
    { name: 'CameraGallery', component: CameraGalleryScreen },
    { name: 'ImagePreview', component: ImagePreviewScreen },
    { name: 'PublicationForm', component: PublicationFormScreen }
  ]);

  const adminRootStack = createRootStack<RootStackParamList>([
    { name: 'HomeTabs', component: AdminTabs },
    { name: 'AddPublication', component: publicationFormStack },
    { name: 'PublicationForm', component: PublicationFormScreen },
    { name: 'PublicationDetails', component: PublicationDetailsScreen },
    { name: 'AnimalDetails', component: AnimalDetailsScreen },
    { name: 'AnimalForm', component: AnimalFormScreen },
    { name: 'ImageEditor', component: ImageEditorScreen },
    { name: 'DownloadedFiles', component: DownloadedFilesScreen },
    { name: 'Drafts', component: DraftsScreen },
    { name: 'UserList', component: UserListScreen },
    { name: 'UserDetails', component: UserDetailsScreen }
  ]);

  const userRootStack = createRootStack<RootStackParamList>([
    { name: 'HomeTabs', component: UserTabs },
    { name: 'AddPublication', component: publicationFormStack },
    { name: 'PublicationForm', component: PublicationFormScreen },
    { name: 'PublicationDetails', component: PublicationDetailsScreen },
    { name: 'AnimalDetails', component: AnimalDetailsScreen },
    { name: 'Catalog', component: CatalogAnimalsScreenWithProvider },
    { name: 'DownloadedFiles', component: DownloadedFilesScreen },
    { name: 'Drafts', component: DraftsScreen }
  ]);

  const authStack = createRootStack<RootStackParamList>([
    { name: 'Login', component: LoginScreen },
    { name: 'Register', component: RegisterScreen },
    { name: 'ForgotPassword', component: ForgotPasswordScreen }
  ]);

  const offlineStack = createRootStack<RootStackParamList>([
    { name: 'HomeTabs', component: OfflineTabs },
    { name: 'AddPublication', component: publicationFormStack },
    { name: 'PublicationForm', component: PublicationFormScreen },
    { name: 'DownloadedFiles', component: DownloadedFilesScreen },
    { name: 'Drafts', component: DraftsScreen }
  ]);

  return {
    publicationFormStack,
    adminRootStack,
    userRootStack,
    authStack,
    offlineStack
  };
};

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class NavigationErrorBoundary extends React.Component<
  React.PropsWithChildren<{ children: React.ReactNode }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{ children: React.ReactNode }>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Navigation Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <SplashScreen />;
    }

    return this.props.children;
  }
}

const AppNavigator: React.FC = () => {
  const navigationState = useNavigationState();

  const stacks = useMemo(() => createStackConfigurations(), []);

  const renderNavigator = useCallback(() => {
    switch (navigationState) {
      case 'splash':
        return <SplashScreen />;
      case 'auth':
        return <stacks.authStack />;
      case 'admin':
        return <stacks.adminRootStack />;
      case 'user':
        return <stacks.userRootStack />;
      case 'offline':
        return <stacks.offlineStack />;
      default:
        console.warn('Unknown navigation state:', navigationState);
        return <SplashScreen />;
    }
  }, [navigationState, stacks]);

  return <NavigationErrorBoundary>{renderNavigator()}</NavigationErrorBoundary>;
};

AppNavigator.displayName = 'AppNavigator';

export default React.memo(AppNavigator);

export type { TabConfig };
export { VALID_ROLES, isValidRole };
