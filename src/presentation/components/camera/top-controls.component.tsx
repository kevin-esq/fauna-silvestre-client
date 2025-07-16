import React from "react";
import { View, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

type Props = {
  onBack: () => void;
  onToggleFlash: () => void;
  onFlip: () => void;
  flashMode: "off" | "on" | "auto";
  showFlash: boolean;
  style?: StyleProp<ViewStyle>;
};

export const TopControls: React.FC<Props> = ({
  onBack,
  onToggleFlash,
  onFlip,
  flashMode,
  showFlash,
  style,
}) => {
  const handlePress = (action: () => void) => {
    ReactNativeHapticFeedback.trigger('impactLight', { ignoreAndroidSystemSettings: true });
    action();
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={() => handlePress(onBack)}
        style={styles.button}
        activeOpacity={0.7}>
        <Ionicons name="close" size={40} color="#fff" />
      </TouchableOpacity>

      <View style={styles.controlGroup}>
        {showFlash && (
          <TouchableOpacity
            onPress={() => handlePress(onToggleFlash)}
            style={styles.button}
            activeOpacity={0.7}>
            <MaterialIcons
              name={
                flashMode === "on"
                  ? "flash-on"
                  : flashMode === "auto"
                  ? "flash-auto"
                  : "flash-off"
              }
              size={40}
              color="#fff"
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => handlePress(onFlip)}
          style={styles.button}
          activeOpacity={0.7}>
          <Ionicons name="camera-reverse" size={40} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  button: {
    backgroundColor: "rgba(0,0,0,0.3)",
    width: 50,
    height: 50,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  controlGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
});
