// src/presentation/navigation/app.navigator.tsx
import React, { useCallback, useEffect, useMemo } from 'react';
import {
  createMaterialTopTabNavigator,
  MaterialTopTabScreenProps,
  MaterialTopTabNavigationOptions,
} from '@react-navigation/material-top-tabs';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { Alert } from 'react-native';

// Contexts
import { useAuth } from '../contexts/auth.context';
import { Theme, themeVariables, useTheme } from '../contexts/theme.context';
import { useApiStatus } from '../contexts/api-status.context';

// Components
import TopTabsNavigationBar from '../components/ui/top-tabs-navigation-bar.component';

// Screens
import LoginScreen from '../screens/auth/login-screen';
import RegisterScreen from '../screens/auth/register-screen';
import ForgotPasswordScreen from '../screens/auth/forgot-password-screen';
import SplashScreen from '../screens/home/splash-screen';
import PublicationDetailsScreen from '../screens/publication/publication-details-screen';
import AnimalDetailsScreen from '../screens/catalog/animal-details-screen';
import PublicationFormScreen from '../screens/publication/publication-form-screen';
import { CameraGalleryScreen } from '../screens/media/camera-gallery-screen';
import ImagePreviewScreen from '../screens/media/image-preview-screen';

// Navigation
import type { RootStackParamList } from './navigation.types';
import { createRootStack } from './create-root-stack';
import { adminTabs, userTabs } from './tabs-config';

// Types
export type ValidRole = 'Admin' | 'User';

interface TabConfig {
  name: keyof RootStackParamList;
  component: React.ComponentType<
    MaterialTopTabScreenProps<RootStackParamList, keyof RootStackParamList>
  >;
  title: string;
  hideInBar?: boolean;
  tabBarIcon?: MaterialTopTabNavigationOptions['tabBarIcon'];
}

// Constants
const VALID_ROLES: readonly ValidRole[] = ['Admin', 'User'] as const;

const TopTabs = createMaterialTopTabNavigator<RootStackParamList>();

// Pure functions
const createScreenOptions = (
  variables: Record<string, string>
): MaterialTopTabNavigationOptions => ({
  lazy: true,
  swipeEnabled: true,
  tabBarScrollEnabled: false,
  tabBarIndicatorStyle: {
    backgroundColor: variables['--primary'],
    height: 3,
  },
  tabBarLabelStyle: {
    fontWeight: 'bold',
    textTransform: 'none',
  },
  tabBarPressColor: variables['--primary'],
});

const isValidRole = (role: string | undefined): role is ValidRole => {
  return role !== undefined && VALID_ROLES.includes(role as ValidRole);
};

// Custom hooks
const useRoleValidation = () => {
  const { user, isAuthenticated, initializing, signOut } = useAuth();
  
  const handleInvalidRole = useCallback(async () => {
    try {
      console.warn('Invalid role detected, signing out user');
      Alert.alert(
        'Error de Sesión',
        'Se ha detectado un problema con tu cuenta. Por favor, vuelve a iniciar sesión.',
        [{ text: 'Entendido' }]
      );
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

  return useMemo(() => {
    if (status === 'BOOTING' || initializing) {
      return 'splash';
    }
    if (status === 'AUTHENTICATING' || status === 'UNAUTHENTICATED') {
      return 'auth';
    }
    if (status === 'AUTHENTICATED' && isAuthenticated && hasValidRole) {
      return role === 'Admin' ? 'admin' : 'user';
    }
    return 'splash';
  }, [status, initializing, isAuthenticated, hasValidRole, role]);
};

// Components with error boundaries
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
    (props: MaterialTopTabBarProps) => <TopTabsNavigationBar {...props} theme={theme} />,
    [theme]
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
            tabBarIcon,
          }}
        />
      ))}
    </TopTabs.Navigator>
  );
});

TabsComponent.displayName = 'TabsComponent';

// Memoized tab components
export const AdminTabs = React.memo(() => {
  const { theme } = useTheme();
  return <TabsComponent screens={adminTabs} theme={theme} testID="admin-tabs" />;
});

AdminTabs.displayName = 'AdminTabs';

export const UserTabs = React.memo(() => {
  const { theme } = useTheme();
  return <TabsComponent screens={userTabs} theme={theme} testID="user-tabs" />;
});

UserTabs.displayName = 'UserTabs';

// Stack configurations
const createStackConfigurations = () => {
  const publicationFormStack = createRootStack<RootStackParamList>([
    { name: 'CameraGallery', component: CameraGalleryScreen },
    { name: 'ImagePreview', component: ImagePreviewScreen },
    { name: 'PublicationForm', component: PublicationFormScreen },
  ]);

  const adminRootStack = createRootStack<RootStackParamList>([
    { name: 'HomeTabs', component: AdminTabs },
    { name: 'AddPublication', component: publicationFormStack },
    { name: 'PublicationDetails', component: PublicationDetailsScreen },
    { name: 'AnimalDetails', component: AnimalDetailsScreen },
  ]);

  const userRootStack = createRootStack<RootStackParamList>([
    { name: 'HomeTabs', component: UserTabs },
    { name: 'AddPublication', component: publicationFormStack },
    { name: 'PublicationDetails', component: PublicationDetailsScreen },
    { name: 'AnimalDetails', component: AnimalDetailsScreen },
  ]);

  const authStack = createRootStack<RootStackParamList>([
    { name: 'Login', component: LoginScreen },
    { name: 'Register', component: RegisterScreen },
    { name: 'ForgotPassword', component: ForgotPasswordScreen },
  ]);

  return {
    publicationFormStack,
    adminRootStack,
    userRootStack,
    authStack,
  };
};

// Error Boundary Component
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

// Main Navigator Component
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
      default:
        console.warn('Unknown navigation state:', navigationState);
        return <SplashScreen />;
    }
  }, [navigationState, stacks]);

  return (
    <NavigationErrorBoundary>
      {renderNavigator()}
    </NavigationErrorBoundary>
  );
};

AppNavigator.displayName = 'AppNavigator';

export default React.memo(AppNavigator);

export type { TabConfig };
export { VALID_ROLES, isValidRole };