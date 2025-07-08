import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../contexts/theme-context';
import { MaterialIcons } from '@expo/vector-icons';

interface FeedbackMessageProps {
  message: string | null;
  isSuccess?: boolean;
}

const ErrorMessage: React.FC<FeedbackMessageProps> = ({ message, isSuccess = false }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: message ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [message]);

  if (!message) {
    return null;
  }

  const containerStyle = isSuccess ? styles.successContainer : styles.errorContainer;
  const textStyle = isSuccess ? styles.successText : styles.errorText;
  const iconName = isSuccess ? 'check-circle' : 'error';
  const iconColor = isSuccess ? colors.success : colors.error;
  const textColor = isSuccess ? colors.success : colors.error;

  return (
    <Animated.View style={[styles.container, containerStyle, { opacity }]}>
      <MaterialIcons name={iconName} size={20} color={iconColor} />
      <Text style={[styles.text, textStyle, { color: textColor }]}>{message}</Text>
    </Animated.View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: '#fdecea',
  },
  successContainer: {
    backgroundColor: '#ecfdf5',
  },
  text: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#b91c1c',
  },
  successText: {
    color: '#047857',
  },
});

export default React.memo(ErrorMessage);