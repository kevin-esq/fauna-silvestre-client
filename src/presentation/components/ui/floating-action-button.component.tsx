import React, { useMemo } from 'react';
import {
  Pressable,
  Text,
  StyleProp,
  ViewStyle,
  StyleSheet
} from 'react-native';
import { MotiView } from 'moti';
import { useTheme, themeVariables } from '../../contexts/theme.context';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  label?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  visible?: boolean;
}

const FloatingActionButton = ({
  onPress,
  icon,
  label,
  style,
  accessibilityLabel,
  visible
}: FloatingActionButtonProps) => {
  const { theme } = useTheme();
  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(
    () => createStyles(variables, visible || true),
    [variables, visible]
  );

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8, translateY: 20 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      exit={{ opacity: 0, scale: 0.8, translateY: 20 }}
      transition={{ type: 'spring', damping: 15 }}
      style={[styles.wrapper, style]}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.fab,
          label ? styles.fabWithLabel : styles.fabIconOnly,
          pressed && styles.fabPressed
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint="Double tap to activate"
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <MotiView
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ loop: true, duration: 2000 }}
          style={styles.iconContainer}
        >
          {icon}
        </MotiView>
        {label && (
          <Text
            style={styles.label}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {label}
          </Text>
        )}
      </Pressable>
    </MotiView>
  );
};

export default FloatingActionButton;

const createStyles = (vars: Record<string, string>, visible: boolean) =>
  StyleSheet.create({
    wrapper: {
      position: 'absolute',
      bottom: 40,
      right: 20,
      zIndex: 100,
      opacity: visible ? 1 : 0
    },
    fab: {
      backgroundColor: vars['--primary'],
      borderRadius: 28,
      elevation: 8,
      shadowColor: vars['--shadow-color'],
      shadowOpacity: 0.4,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      opacity: visible ? 1 : 0
    },
    fabWithLabel: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      minWidth: 120
    },
    fabIconOnly: {
      height: 56,
      width: 56,
      borderRadius: 28
    },
    fabPressed: {
      transform: [{ scale: 0.92 }],
      backgroundColor: vars['--primary-dark']
    },
    iconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
      opacity: visible ? 1 : 0
    },
    label: {
      color: vars['--on-primary'],
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 12,
      maxWidth: 150
    }
  });
