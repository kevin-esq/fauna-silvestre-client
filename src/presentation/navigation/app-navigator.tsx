// navigation/app-navigator.tsx

import React, { useEffect } from 'react';
import { useAuth } from '../contexts/auth-context';

import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth screens
import LoginScreen from '../screens/auth/login-screen';
import RegisterScreen from '../screens/auth/register-screen';
import ForgotPasswordScreen from '../screens/auth/forgot-password-screen';

// Home screens
import HomeScreen from '../screens/home/home-screen';
import SplashScreen from '../screens/home/splash-screen';

// Publication screens
import PublicationScreen from '../screens/publication/publication-screen';
import PublicationDetailsScreen from '../screens/publication/publication-details-screen';
import AnimalDetailsScreen from '../screens/publication/animal-details-screen';
import PublicationFormScreen from '../screens/publication/publication-form-screen';

// Admin screens
import AdminHomeScreen from '../screens/admin/admin-home-screen';
import ReviewPublicationsScreen from '../screens/admin/review-publications-screen';

// Media screens
import { CameraGalleryScreen } from '../screens/media/camera-gallery-screen';
import ImagePreviewScreen from '../screens/media/image-preview-screen';

// Components & Contexts
import CustomDrawerContent from '../components/layout/custom-drawer-content.component';
import { usePublications } from '../contexts/publication-context';

import { RootStackParamList } from './navigation.types';

const Drawer = createDrawerNavigator<RootStackParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStackNav = createNativeStackNavigator<RootStackParamList>();

function PublicationFormStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CameraGallery" component={CameraGalleryScreen} />
            <Stack.Screen name="ImagePreview" component={ImagePreviewScreen} />
            <Stack.Screen name="PublicationForm" component={PublicationFormScreen} />
        </Stack.Navigator>
    );
}

function PublicationStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ViewPublications" component={PublicationScreen} />
            <Stack.Screen name="PublicationDetails" component={PublicationDetailsScreen} />
        </Stack.Navigator>
    );
}

const AdminDrawer = () => {
    console.log('[AdminDrawer] render');
    const { pending, all } = usePublications();
    useEffect(() => {
        pending.load();
        all.load();
    });
    return (
        <Drawer.Navigator
            drawerContent={CustomDrawerContent}>
            <Drawer.Screen
                name="Home"
                component={AdminHomeScreen}
                options={{
                    title: 'Inicio (Admin)',
                    drawerLabel: 'Panel de Administración',
                    headerShown: true,
                }}
            />
            <Drawer.Screen
                name="Publications"
                component={PublicationStackNavigator}
                options={{
                    title: 'Todas las Publicaciones',
                    drawerLabel: 'Todas las Publicaciones',
                }}
            />
            <Drawer.Screen
                name="ReviewPublication"
                    component={ReviewPublicationsScreen}
                options={{
                    title: 'Revisión de Publicaciones',
                    drawerLabel: 'Revisar publicaciones',
                }}
            />
            <Drawer.Screen
                name="AnimalDetails"
                component={AnimalDetailsScreen}
                options={{
                    title: 'Detalles del Animal',
                    headerShown: false,
                    drawerItemStyle: { display: 'none' },
                }}
            />
            <Drawer.Screen
                name="AddPublication"
                component={PublicationFormStackNavigator}
                options={{
                    headerShown: false,
                    drawerItemStyle: { display: 'none' },
                }}
            />
        </Drawer.Navigator>
    );
};

const UserDrawer = () => {
    console.log('[UserDrawer] render');
    return (
        <Drawer.Navigator
            drawerContent={CustomDrawerContent}>
            <Drawer.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Inicio',
                    drawerLabel: 'Inicio',
                    headerShown: true,
                }}
            />
            <Drawer.Screen
                name="Publications"
                component={PublicationScreen}
                options={{
                    title: 'Mis Publicaciones',
                    drawerLabel: 'Mis Publicaciones',
                }}
            />
            <Drawer.Screen
                name="PublicationDetails"
                component={PublicationDetailsScreen}
                options={{
                    headerShown: false,
                    drawerItemStyle: { display: 'none' },
                }}
            />
            <Drawer.Screen
                name="AnimalDetails"
                component={AnimalDetailsScreen}
                options={{
                    title: 'Detalles del Animal',
                    headerShown: false,
                    drawerItemStyle: { display: 'none' },
                }}
            />
            <Drawer.Screen
                name="AddPublication"
                component={PublicationFormStackNavigator}
                options={{
                    headerShown: false,
                    drawerItemStyle: { display: 'none' },
                }}
            />
        </Drawer.Navigator>
    );
};

const AuthStack = () => (
    <AuthStackNav.Navigator screenOptions={{ headerShown: false }}>
        <AuthStackNav.Screen name="Login" component={LoginScreen} />
        <AuthStackNav.Screen name="Register" component={RegisterScreen} />
        <AuthStackNav.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStackNav.Navigator>
);

export default function AppNavigator() {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <SplashScreen />;
    }

    if (!isAuthenticated) {
        return <AuthStack />;
    }
    return user?.role === 'Admin' ? <AdminDrawer /> : <UserDrawer />;
}
