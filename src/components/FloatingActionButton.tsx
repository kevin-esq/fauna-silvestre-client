import React from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import { MotiView } from "moti";

/**
 * Botón flotante animado con Moti.
 * Incluye animación al entrar y retroalimentación táctil.
 */
const FloatingActionButton = ({ onPress, Icon }) => (
  <MotiView
    from={{
      opacity: 0,
      translateY: 100,
    }}
    animate={{
      opacity: 1,
      translateY: 0,
    }}
    transition={{
      type: "timing",
      duration: 200,
    }}
    style={styles.wrapper}
  >
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.floatingButton,
        pressed && { transform: [{ scale: 0.95 }] },
      ]}
    >
      <View style={styles.content}>{Icon}</View>
    </Pressable>
  </MotiView>
);

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 30,
    right: 20,
  },
  floatingButton: {
    backgroundColor: "#FF6F61",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  content: {
    alignItems: "center",
  },
});

export default FloatingActionButton;
