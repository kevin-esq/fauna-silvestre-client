import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../contexts/auth-context";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { RootStackParamList } from "../../navigation/navigation.types";

export const CustomHomeHeader = () => {
  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();
  const { signOut } = useAuth();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
        <Ionicons name="menu" size={28} color="#333" />
      </TouchableOpacity>
      <Text style={styles.title}>Inicio</Text>
      <TouchableOpacity onPress={() => signOut()}>
        <Ionicons name="log-out-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
});