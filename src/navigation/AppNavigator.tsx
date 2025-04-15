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
import AddPublicationScreen from "../screens/AddPublicationScreen";

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const AppDrawer = () => (
  <Drawer.Navigator
    id={undefined}
    drawerContent={(props) => <CustomDrawerContent {...props} />}
  >
    <Drawer.Screen
      name="Home"
      component={HomeScreen}
      options={{ title: "Inicio", drawerLabel: "Principal" }}
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
      component={AddPublicationScreen}
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
      {isAuthenticated ? <AppDrawer /> : <AuthStack />}
    </NavigationContainer>
  );
}
