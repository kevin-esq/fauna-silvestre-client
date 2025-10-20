import React, { useState } from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import { MotiView } from 'moti';

const AnimatedPressable = ({
  children,
  onPress,
  style
}: {
  children: React.ReactNode;
  onPress: (() => void) | undefined;
  style?: StyleProp<ViewStyle>;
}) => {
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
          opacity: pressed ? 0.8 : 1
        }}
        transition={{ type: 'timing', duration: 120 }}
        style={style}
      >
        {children}
      </MotiView>
    </Pressable>
  );
};

export default AnimatedPressable;
