import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import HomeScreen from "../screens/HomeScreen";
import PublicationScreen from "../screens/PublicationScreen";
import PublicationViewScreen from "../screens/PublicationViewScreen";
import CustomDrawerContent from "../components/CustomDrawerContent";
import { navigationRef } from "../services/navigationRef";
import { ActivityIndicator, View } from "react-native";
import AnimalViewScreen from "../screens/AnimalViewScreen";
import { useAuthContext } from "../contexts/AuthContext";
import {  CameraGalleryScreen } from "../screens/CameraGalleryScreen";
import ImagePreviewScreen from "../screens/ImagePreviewScreen";
import PublicationFormScreen from "../screens/PublicationFormScreen";
import { CustomHomeHeader } from "../components/CustomHeader";

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function PublicationStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} id={undefined}>
      <Stack.Screen name="CameraGallery" component={CameraGalleryScreen} />
      <Stack.Screen name="ImagePreview" component={ImagePreviewScreen} />
      <Stack.Screen name="Formulario" component={PublicationFormScreen} />
    </Stack.Navigator>
  );
}

const AppDrawer = () => (
  <Drawer.Navigator
    id={undefined}
    drawerContent={(props) => <CustomDrawerContent {...props} />}
  >
    <Drawer.Screen
      name="Home"
      component={HomeScreen}
      options={{ title: "Inicio", drawerLabel: "Principal", /*header: () => <CustomHomeHeader />,*/ headerShown: true }}
    />
    <Drawer.Screen
      name="Publications"
      component={PublicationScreen}
      options={{ title: "Publicaciones", drawerLabel: "Publicaciones" }}
    />
    <Drawer.Screen
      name="PublicationDetails"
      component={PublicationViewScreen}
      options={{ headerShown: false, drawerItemStyle: { display: "none" } }}
    />
    <Drawer.Screen
      name="AnimalDetails"
      component={AnimalViewScreen}
      options={{
        title: "Detalles del Animal",
        headerShown: false,
        drawerItemStyle: { display: "none" },
      }}
    />
    <Drawer.Screen
      name="AddPublication"
      component={PublicationStackNavigator}
      options={{ headerShown: false, drawerItemStyle: { display: "none" } }}
    />
  </Drawer.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }} id={undefined}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

export default function AppNavigator() {
  const { isAuthenticated } = useAuthContext();

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {!isAuthenticated ? <AppDrawer /> : <AuthStack />}
    </NavigationContainer>
  );
}
