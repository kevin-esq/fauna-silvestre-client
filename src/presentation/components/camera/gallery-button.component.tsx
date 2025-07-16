import React from "react";
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

type Props = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export const GalleryButton: React.FC<Props> = ({ onPress, style }) => (
  <TouchableOpacity
    onPress={() => {
      ReactNativeHapticFeedback.trigger('impactLight', { ignoreAndroidSystemSettings: true });
      onPress();
    }}
    style={[styles.button, style]}
    activeOpacity={0.7}>
    <Icon name="photo-library" size={40} color="#fff" />
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
