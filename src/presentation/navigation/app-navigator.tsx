import React, { useCallback, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator, MaterialTopTabScreenProps, MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useAuth } from '../contexts/auth-context';
import TopTabsNavigationBar from '../components/ui/top-tabs-navigation-bar.component';

import LoginScreen from '../screens/auth/login-screen';
import RegisterScreen from '../screens/auth/register-screen';
import ForgotPasswordScreen from '../screens/auth/forgot-password-screen';
import HomeScreen from '../screens/home/home-screen';
import SplashScreen from '../screens/home/splash-screen';
import PublicationScreen from '../screens/publication/publication-screen';
import PublicationDetailsScreen from '../screens/publication/publication-details-screen';
import AnimalDetailsScreen from '../screens/catalog/animal-details-screen';
import PublicationFormScreen from '../screens/publication/publication-form-screen';
import AdminHomeScreen from '../screens/admin/admin-home-screen/admin-home-screen';
import ReviewPublicationsScreen from '../screens/admin/review-publications-screen';
import { CameraGalleryScreen } from '../screens/media/camera-gallery-screen';
import ImagePreviewScreen from '../screens/media/image-preview-screen';
import { Theme, themeVariables, useTheme } from '../contexts/theme-context';

import type { RootStackParamList } from './navigation.types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStackNav = createNativeStackNavigator<RootStackParamList>();
const TopTabs = createMaterialTopTabNavigator<RootStackParamList>();

const screenOptions = (variables: Record<string, string>): MaterialTopTabNavigationOptions => ({
    lazy: true,
    swipeEnabled: true,
    tabBarScrollEnabled: false,
    tabBarIndicatorStyle: { backgroundColor: variables['--primary'], height: 3 },
    tabBarLabelStyle: { fontWeight: 'bold', textTransform: 'none' },
    tabBarPressColor: variables['--primary'],
  });

function createTabs(screens: Array<{
  name: keyof RootStackParamList;
  component: React.ComponentType<
    MaterialTopTabScreenProps<RootStackParamList, keyof RootStackParamList>
  >;
  title: string;
  hideInBar?: boolean;
  tabBarIcon?: MaterialTopTabNavigationOptions['tabBarIcon'];
}>, theme: Theme) {
  return (
    <TopTabs.Navigator
      backBehavior='history'
      screenOptions={screenOptions(themeVariables(theme))}
      tabBar={props => <TopTabsNavigationBar {...props} theme={theme} />}
    >
      {screens.map(({ name, component, title, hideInBar, tabBarIcon }) => (
        <TopTabs.Screen
          key={name}
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
}

const AdminTabs = () =>
  createTabs([
    { name: 'Home', component: AdminHomeScreen, title: 'Inicio', tabBarIcon: ({ focused, color }) => (
        <FontAwesome5 name="home" solid={focused} size={24} color={color} />
    ) },
    { name: 'Publications', component: PublicationScreen, title: 'Todas las Publicaciones', tabBarIcon: ({ focused, color }) => (
        <FontAwesome5 name="book-open" solid={focused} size={24} color={color} />
    ) },
    { name: 'ReviewPublication', component: ReviewPublicationsScreen, title: 'Revisión de Publicaciones', tabBarIcon: ({ focused, color }) => (
        <FontAwesome5 name="clipboard-check" solid={focused} size={24} color={color} />
    ) }
  ], useTheme().theme);

const UserTabs = () =>
  createTabs([
    { name: 'Home', component: HomeScreen, title: 'Inicio', tabBarIcon: ({ focused, color }) => (
        <FontAwesome5 name="home" solid={focused} size={24} color={color} />
    ) },
    { name: 'Publications', component: PublicationScreen, title: 'Mis Publicaciones', tabBarIcon: ({ focused, color }) => (
        <FontAwesome5 name="book-open" solid={focused} size={24} color={color} />
    ) }
  ], useTheme().theme);

function PublicationFormStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CameraGallery" component={CameraGalleryScreen} />
      <Stack.Screen name="ImagePreview" component={ImagePreviewScreen} />
      <Stack.Screen name="PublicationForm" component={PublicationFormScreen} />
    </Stack.Navigator>
  );
}

const AdminRootStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeTabs" component={AdminTabs} />
    <Stack.Screen name="AddPublication" component={PublicationFormStack} />
    <Stack.Screen name="PublicationDetails" component={PublicationDetailsScreen} />
    <Stack.Screen name="AnimalDetails" component={AnimalDetailsScreen} />
  </Stack.Navigator>
);

const UserRootStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeTabs" component={UserTabs} />
    <Stack.Screen name="AddPublication" component={PublicationFormStack} />
    <Stack.Screen name="PublicationDetails" component={PublicationDetailsScreen} />
    <Stack.Screen name="AnimalDetails" component={AnimalDetailsScreen} />
  </Stack.Navigator>
);

const AuthStack = () => (
  <AuthStackNav.Navigator screenOptions={{ headerShown: false }}>
    <AuthStackNav.Screen name="Login" component={LoginScreen} />
    <AuthStackNav.Screen name="Register" component={RegisterScreen} />
    <AuthStackNav.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStackNav.Navigator>
);

export default function AppNavigator(): React.JSX.Element {
  const { user, isAuthenticated, isLoading } = useAuth();

  const navigateToAuth = useCallback(() => {
    if (isLoading) return <SplashScreen />;
    if (!isAuthenticated) return <AuthStack />;
    return user?.role === 'Admin' ? <AdminRootStack /> : <UserRootStack />;
  }, [isLoading, isAuthenticated, user?.role]);

  useEffect(() => {
    navigateToAuth();
  }, [navigateToAuth]);

  return navigateToAuth();
}
