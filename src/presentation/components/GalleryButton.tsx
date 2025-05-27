import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

type Props = {
  onPress: () => void;
  style?: any;
};

export const GalleryButton: React.FC<Props> = ({ onPress, style }) => (
  <TouchableOpacity
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }}
    style={[styles.button, style]}
    activeOpacity={0.7}>
    <MaterialIcons name="photo-library" size={40} color="#fff" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: "rgba(0,0,0,0.3)",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
});
