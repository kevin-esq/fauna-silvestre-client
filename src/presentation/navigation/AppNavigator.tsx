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
import { navigationRef } from "./navigationRef";
import { ActivityIndicator, View } from "react-native";
import AnimalViewScreen from "../screens/AnimalViewScreen";
import { CameraGalleryScreen } from "../screens/CameraGalleryScreen";
import ImagePreviewScreen from "../screens/ImagePreviewScreen";
import PublicationFormScreen from "../screens/PublicationFormScreen";
import {useAuth} from "../contexts/AuthContext";

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function PublicationStackNavigator() {
  console.log("[PublicationStackNavigator] render");
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} id={undefined}>
      <Stack.Screen name="CameraGallery" component={CameraGalleryScreen} />
     {/*} <Stack.Screen
        name="CustomImagePickerScreen"
        component={CustomImagePickerScreen}
        options={{ title: "Seleccionar imagen" }}
      />{*}*/}
      <Stack.Screen name="ImagePreview" component={ImagePreviewScreen} />
      <Stack.Screen name="Formulario" component={PublicationFormScreen} />
    </Stack.Navigator>
  );
}

const AppDrawer = () => {
  console.log("[AppDrawer] render");
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      id={undefined}>
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Inicio",
          drawerLabel: "Principal",
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="Publications"
        component={PublicationScreen}
        options={{
          title: "Publicaciones",
          drawerLabel: "Publicaciones",
        }}
      />
      <Drawer.Screen
        name="PublicationDetails"
        component={PublicationViewScreen}
        options={{
          headerShown: false,
          drawerItemStyle: { display: "none" },
        }}
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
        options={{
          headerShown: false,
          drawerItemStyle: { display: "none" },
        }}
      />
    </Drawer.Navigator>
  );
};

const AuthStack = () => {
  console.log("[AuthStack] render");
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} id={undefined}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

export default function AppNavigator() {
  /*const { token, isLoading } = useContext(AuthContext);
  console.log("[AppNavigator] isLoading =", isLoading, "token =", token);
  console.log("[AppNavigator] render ➤ token =", token);*/
    const auth = useAuth();

  if (auth.isLoading) {
    console.log("[AppNavigator] cargando token…");
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  console.log(
    `[AppNavigator] isLoading ${auth.isLoading} → ${
        auth.isAuthenticated ? "mostrar AppDrawer" : "mostrar AuthStack"
    }`
  );

  return (
    <NavigationContainer ref={navigationRef}>
      {auth.isAuthenticated ? <AppDrawer /> : <AuthStack />}
    </NavigationContainer>
  );
}
