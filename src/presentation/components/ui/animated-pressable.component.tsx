import React, { useState } from "react";
import { Pressable } from "react-native";
import { MotiView } from "moti";

/**
 * Botón animado que escala y cambia opacidad al presionar.
 *
 * @param {React.ReactNode} children - Contenido dentro del botón.
 * @param {Function} onPress - Acción al presionar.
 * @param {object} style - Estilo adicional del botón.
 * @returns {JSX.Element}
 */
const AnimatedPressable = ({ children, onPress, style }: { children: React.ReactNode; onPress: any; style?: any }) => {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onPress}
    >
      <MotiView
        animate={{
          scale: pressed ? 0.95 : 1,
          opacity: pressed ? 0.8 : 1,
        }}
        transition={{ type: "timing", duration: 120 }}
        style={style}
      >
        {children}
      </MotiView>
    </Pressable>
  );
};

export default AnimatedPressable;