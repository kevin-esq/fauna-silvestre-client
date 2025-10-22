import { ThemeVariablesType } from '@/presentation/contexts/theme.context';
import React, { useEffect, useRef, useMemo } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface FeedbackMessageProps {
  message: string | null;
  isSuccess?: boolean;
  variables: ThemeVariablesType | undefined;
}

const ErrorMessage: React.FC<FeedbackMessageProps> = ({
  message,
  isSuccess = false,
  variables
}) => {
  const styles = useMemo(() => createStyles(variables), [variables]);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: message ? 1 : 0,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, [message, opacity]);

  console.log('[ErrorMessage] Received message:', message);

  if (!message) {
    return null;
  }

  const containerStyle = isSuccess
    ? styles.successContainer
    : styles.errorContainer;
  const textStyle = isSuccess ? styles.successText : styles.errorText;
  const iconName = isSuccess ? 'check-circle' : 'error';
  const iconColor = isSuccess
    ? styles.successText.color
    : styles.errorText.color;

  return (
    <Animated.View style={[styles.container, containerStyle, { opacity }]}>
      <Icon name={iconName} size={20} color={iconColor} />
      <Text style={[styles.text, textStyle]}>{message}</Text>
    </Animated.View>
  );
};

const createStyles = (variables: ThemeVariablesType | undefined) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: variables?.['--border-radius-medium'],
      marginBottom: 16
    },
    errorContainer: {
      backgroundColor: variables?.['--error']
    },
    successContainer: {
      backgroundColor: variables?.['--success']
    },
    text: {
      marginLeft: 10,
      fontSize: 14,
      fontWeight: '500'
    },
    errorText: {
      color: variables?.['--text-on-primary']
    },
    successText: {
      color: variables?.['--text-on-primary']
    }
  });

export default React.memo(ErrorMessage);
