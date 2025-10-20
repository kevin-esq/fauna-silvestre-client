import { ThemeVariablesType } from '@/presentation/contexts/theme.context';
import React, { useRef, useMemo, useEffect, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  Animated,
  Text,
  TouchableOpacity,
  ViewStyle
} from 'react-native';

interface CodeInputProps {
  code: string;
  setCode: (code: string) => void;
  digitCount?: number;
  variables: ThemeVariablesType;
  error?: boolean | string;
  autoFocus?: boolean;
  placeholder?: string;
  variant?: 'outlined' | 'filled' | 'underlined';
  size?: 'small' | 'medium' | 'large';
  spacing?: 'tight' | 'normal' | 'loose';
  maskDelay?: number;
  containerStyle?: ViewStyle;
  onComplete?: (code: string) => void;
  onCodeChange?: (code: string, isComplete: boolean) => void;
}

const CodeInput: React.FC<CodeInputProps> = ({
  code,
  setCode,
  digitCount = 5,
  variables,
  error = false,
  autoFocus = true,
  placeholder = '·',
  variant = 'outlined',
  size = 'medium',
  spacing = 'normal',
  maskDelay = 0,
  containerStyle,
  onComplete,
  onCodeChange
}) => {
  const styles = useMemo(
    () => createStyles(variables, variant, size, spacing),
    [variables, variant, size, spacing]
  );
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [maskedDigits, setMaskedDigits] = useState<boolean[]>(
    new Array(digitCount).fill(false)
  );
  const animatedValues = useRef<Animated.Value[]>([]);

  const hasError = Boolean(error);
  const errorMessage = typeof error === 'string' ? error : undefined;

  useEffect(() => {
    animatedValues.current = Array.from(
      { length: digitCount },
      () => new Animated.Value(0)
    );
  }, [digitCount]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [autoFocus]);

  useEffect(() => {
    const isComplete = code.length === digitCount;
    if (isComplete && onComplete) {
      onComplete(code);
    }
    if (onCodeChange) {
      onCodeChange(code, isComplete);
    }
  }, [code, digitCount, onComplete, onCodeChange]);

  useEffect(() => {
    if (maskDelay > 0) {
      const timeouts: number[] = [];
      code.split('').forEach((digit, index) => {
        if (digit && !maskedDigits[index]) {
          const timeout = setTimeout(() => {
            setMaskedDigits(prev => {
              const newMasked = [...prev];
              newMasked[index] = true;
              return newMasked;
            });
          }, maskDelay);
          timeouts.push(timeout);
        }
      });

      return () => timeouts.forEach(clearTimeout);
    }
  }, [code, maskDelay, maskedDigits]);

  const codeDigits = useMemo(() => {
    const digits = code.padEnd(digitCount, '').split('');
    return digits.map((digit, index) => {
      if (maskDelay > 0 && digit && maskedDigits[index]) {
        return '•';
      }
      return digit;
    });
  }, [code, digitCount, maskDelay, maskedDigits]);

  const animateCell = (index: number, focused: boolean) => {
    Animated.spring(animatedValues.current[index], {
      toValue: focused ? 1 : 0,
      useNativeDriver: false,
      tension: 100,
      friction: 8
    }).start();
  };

  const handleTextChange = (text: string, index: number) => {
    if (text.length > 1 && index === 0) {
      const cleanText = text.replace(/[^0-9]/g, '');
      const newCode = cleanText.slice(0, digitCount);
      setCode(newCode);

      if (maskDelay > 0) {
        setMaskedDigits(new Array(digitCount).fill(false));
      }

      const focusIndex = Math.min(newCode.length, digitCount - 1);
      if (inputRefs.current[focusIndex]) {
        setTimeout(() => inputRefs.current[focusIndex]?.focus(), 50);
      }
      return;
    }

    const cleanText = text.replace(/[^0-9]/g, '');
    const newCodeArray = code.split('');

    if (cleanText) {
      newCodeArray[index] = cleanText[cleanText.length - 1];
    } else {
      newCodeArray[index] = '';
    }

    const newCode = newCodeArray.join('');
    setCode(newCode);

    if (maskDelay > 0 && cleanText) {
      setMaskedDigits(prev => {
        const newMasked = [...prev];
        newMasked[index] = false;
        return newMasked;
      });
    }

    if (cleanText && index < digitCount - 1) {
      setTimeout(() => inputRefs.current[index + 1]?.focus(), 50);
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!code[index] && index > 0) {
        setTimeout(() => inputRefs.current[index - 1]?.focus(), 50);
      } else if (code[index]) {
        const newCodeArray = code.split('');
        newCodeArray[index] = '';
        setCode(newCodeArray.join(''));

        if (maskDelay > 0) {
          setMaskedDigits(prev => {
            const newMasked = [...prev];
            newMasked[index] = false;
            return newMasked;
          });
        }
      }
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    animateCell(index, true);
  };

  const handleBlur = (index: number) => {
    if (focusedIndex === index) {
      setFocusedIndex(null);
    }
    animateCell(index, false);
  };

  const handleCellPress = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const getCellStyle = (index: number, digit: string) => {
    const animatedStyle = {
      borderColor:
        animatedValues.current[index]?.interpolate({
          inputRange: [0, 1],
          outputRange: [
            hasError ? variables['--error'] : variables['--border'],
            hasError ? variables['--error'] : variables['--primary']
          ]
        }) || variables['--border'],
      transform: [
        {
          scale: animatedValues.current[index]?.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.05]
          })
        }
      ]
    };

    return [
      styles.codeInput,
      focusedIndex === index && styles.focused,
      hasError && styles.error,
      digit && styles.filled,
      animatedStyle
    ].filter(Boolean);
  };

  const clearCode = () => {
    setCode('');
    setMaskedDigits(new Array(digitCount).fill(false));
    inputRefs.current[0]?.focus();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.inputsContainer}>
        {Array.from({ length: digitCount }).map((_, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.7}
            onPress={() => handleCellPress(index)}
            style={styles.cellTouchable}
          >
            <Animated.View style={getCellStyle(index, codeDigits[index])}>
              <TextInput
                ref={ref => {
                  inputRefs.current[index] = ref;
                }}
                style={styles.hiddenInput}
                keyboardType="number-pad"
                maxLength={1}
                value={codeDigits[index] === ' ' ? '' : codeDigits[index]}
                onChangeText={text => handleTextChange(text, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                onFocus={() => handleFocus(index)}
                onBlur={() => handleBlur(index)}
                selectTextOnFocus
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                caretHidden
              />
              <Text style={styles.digitText}>
                {codeDigits[index] || placeholder}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {code.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={clearCode}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (
  variables: ThemeVariablesType,
  variant: 'outlined' | 'filled' | 'underlined',
  size: 'small' | 'medium' | 'large',
  spacing: 'tight' | 'normal' | 'loose'
) => {
  const sizeConfig = {
    small: { width: 40, height: 50, fontSize: 20 },
    medium: { width: 50, height: 60, fontSize: 24 },
    large: { width: 60, height: 70, fontSize: 28 }
  };

  const spacingConfig = {
    tight: 6,
    normal: 12,
    loose: 18
  };

  const config = sizeConfig[size];
  const gap = spacingConfig[spacing];

  const getInputVariantStyle = () => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: variables['--surface-variant'],
          borderWidth: 0,
          borderBottomWidth: 2
        };
      case 'underlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          borderBottomWidth: 2,
          borderRadius: 0
        };
      default:
        return {
          backgroundColor: variables['--surface'],
          borderWidth: variables['--border-width-hairline']
        };
    }
  };

  return StyleSheet.create({
    container: {
      alignItems: 'center',
      marginBottom: variables['--spacing-large']
    },
    inputsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: gap
    },
    cellTouchable: {
      borderRadius: variables['--border-radius-medium']
    },
    codeInput: {
      width: config.width,
      height: config.height,
      borderColor: variables['--border'],
      borderRadius:
        variant === 'underlined' ? 0 : variables['--border-radius-medium'],
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      shadowColor: variables['--shadow'],
      shadowOffset: {
        width: 0,
        height: 1
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
      ...getInputVariantStyle()
    },
    focused: {
      borderWidth: 2,
      shadowColor: variables['--primary'],
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
    },
    filled: {
      backgroundColor: variables['--surface-variant']
    },
    error: {
      borderColor: variables['--error'],
      borderWidth: 2
    },
    hiddenInput: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      opacity: 0,
      textAlign: 'center'
    },
    digitText: {
      fontSize: config.fontSize,
      fontWeight: 'bold',
      color: variables['--text'],
      fontFamily: variables['--font-family-primary'],
      textAlign: 'center'
    },
    errorText: {
      fontSize: variables['--font-size-small'],
      color: variables['--error'],
      fontFamily: variables['--font-family-primary'],
      marginTop: variables['--spacing-small'],
      textAlign: 'center'
    },
    clearButton: {
      marginTop: variables['--spacing-medium'],
      paddingVertical: variables['--spacing-small'],
      paddingHorizontal: variables['--spacing-medium'],
      borderRadius: variables['--border-radius-medium'],
      backgroundColor: variables['--surface-variant']
    },
    clearButtonText: {
      fontSize: variables['--font-size-medium'],
      color: variables['--primary'],
      fontFamily: variables['--font-family-primary'],
      fontWeight: '500'
    }
  });
};

export default React.memo(CodeInput);
