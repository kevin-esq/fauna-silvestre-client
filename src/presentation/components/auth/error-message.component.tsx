import React, { useEffect, useRef, useMemo } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface FeedbackMessageProps {
  message: string | null;
  isSuccess?: boolean;
  variables: Record<string, string> | undefined;
}

const ErrorMessage: React.FC<FeedbackMessageProps> = ({ message, isSuccess = false, variables }) => {
  const styles = useMemo(() => createStyles(variables), [variables]);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: message ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [message, opacity]);

  if (!message) {
    return null;
  }

  const containerStyle = isSuccess ? styles.successContainer : styles.errorContainer;
  const textStyle = isSuccess ? styles.successText : styles.errorText;
  const iconName = isSuccess ? 'check-circle' : 'error';
  const iconColor = isSuccess ? styles.successText.color : styles.errorText.color;

  return (
    <Animated.View style={[styles.container, containerStyle, { opacity }]}>
      <Icon name={iconName} size={20} color={iconColor} />
      <Text style={[styles.text, textStyle]}>{message}</Text>
    </Animated.View>
  );
};

const createStyles = (variables: Record<string, string> | undefined) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: variables?.['--error'],
  },
  successContainer: {
    backgroundColor: variables?.['--success'],
  },
  text: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: variables?.['--text-on-primary'], // Usually white text on red background
  },
  successText: {
    color: variables?.['--text-on-primary'], // Same as error, white text on green background
  },
});

export default React.memo(ErrorMessage);