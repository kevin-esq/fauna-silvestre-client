import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { RootStackParamList } from "../../../navigation/navigation.types";
import { useAuth } from "../../../contexts/auth-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, themeVariables } from "../../../contexts/theme-context";
import { useMemo } from "react";
import { createStyles } from "./admin-home-header.component.styles";

// Constants for maintainability
const ICON_SIZE = 32;
const MIN_TOUCH_AREA = 60;

export const AdminHomeHeaderComponent = () => {
  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();
  const { signOut } = useAuth();
  const { theme } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const insets = useSafeAreaInsets();
  const styles = createStyles(insets, MIN_TOUCH_AREA, variables);

  const handleSignOut = () => {
    Alert.alert(
      "Confirmar salida",
      "¿Estás seguro que deseas cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Salir", onPress: () => signOut() }
      ]
    );
  };

  return (
    <View style={styles.header} testID="admin-header">
      {/* Menu Button */}
      <TouchableOpacity
        onPress={() => navigation.toggleDrawer()}
        accessibilityLabel="Abrir menú"
        accessibilityHint="Abre el menú lateral"
        accessibilityRole="button"
        style={styles.iconContainer}
        hitSlop={styles.hitSlop}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="menu" 
          size={ICON_SIZE} 
          color={variables['--text-secondary']} 
        />
      </TouchableOpacity>

      {/* Title */}
      <Text 
        style={styles.title}
        accessibilityRole="header"
        allowFontScaling={true}
      >
        Inicio
      </Text>

      {/* Logout Button */}
      <TouchableOpacity
        onPress={handleSignOut}
        accessibilityLabel="Cerrar sesión"
        accessibilityHint="Cierra sesión de la aplicación"
        accessibilityRole="button"
        style={styles.iconContainer}
        hitSlop={styles.hitSlop}
        activeOpacity={0.7}
      >
        <Text style={styles.logoutText}>Cerrar sesión</Text>
        <Ionicons 
          name="log-out-outline" 
          size={ICON_SIZE} 
          color={variables['--text-secondary']} 
        />
      </TouchableOpacity>
    </View>
  );
};

