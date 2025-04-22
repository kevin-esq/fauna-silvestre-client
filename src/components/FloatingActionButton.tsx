import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Icon } from 'react-native-vector-icons/FontAwesome';

const FloatingActionButton = ({ onPress, Icon }) => (
  <TouchableOpacity style={styles.floatingButton} onPress={onPress}>
    {Icon}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#FF6F61",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 50,
    alignItems: "center",
  },
});

export default FloatingActionButton;