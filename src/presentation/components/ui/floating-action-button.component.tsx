import React, { useMemo } from "react";
import { Pressable, Text, View, StyleProp, ViewStyle, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { useTheme, themeVariables } from "../../contexts/theme-context";

interface FloatingActionButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  label?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/**
 * Botón de acción flotante (FAB) animado, personalizable y consciente del tema.
 *
 * @param {FloatingActionButtonProps} props Propiedades para configurar el FAB.
 * @returns {React.ReactElement} El componente FAB.
 */
const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon,
  label,
  style,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(variables), [variables]);

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8, translateY: 20 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 350 }}
      style={styles.wrapper}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.fab,
          label ? styles.fabWithLabel : styles.fabIconOnly,
          pressed && styles.fabPressed,
          style,
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || label}
      >
        <View style={styles.iconContainer}>{icon}</View>
        {label && <Text style={styles.label}>{label}</Text>}
      </Pressable>
    </MotiView>
  );
};

const createStyles = (vars: Record<string, string>) =>
  StyleSheet.create({
    wrapper: {
      position: "absolute",
      bottom: 40,
      right: 20,
    },
    fab: {
      backgroundColor: vars["--primary"],
      borderRadius: 16,
      elevation: 6,
      shadowColor: vars["--shadow-color"],
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 5,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    },
    fabWithLabel: {
      paddingVertical: 12,
      paddingHorizontal: 20,
    },
    fabIconOnly: {
      height: 80,
      width: 80,
      borderRadius: 16,
    },
    fabPressed: {
      transform: [{ scale: 0.95 }],
      backgroundColor: vars["--primary-dark"],
    },
    iconContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      color: vars["--on-primary"],
      fontSize: 18,
      fontWeight: "bold",
      marginLeft: 8,
    },
  });

export default FloatingActionButton;
