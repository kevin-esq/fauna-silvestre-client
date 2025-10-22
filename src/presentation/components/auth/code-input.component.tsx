import { ThemeVariablesType } from '@/presentation/contexts/theme.context';
import React, { useRef, useMemo, useEffect, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Animated,
  Text,
  TouchableOpacity,
  ViewStyle,
  NativeSyntheticEvent,
  TextInputKeyPressEventData
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

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

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const animatedValues = useRef(
    Array.from({ length: digitCount }, () => new Animated.Value(0))
  );

  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [maskedDigits, setMaskedDigits] = useState<boolean[]>(
    new Array(digitCount).fill(false)
  );
  const [clipboardText, setClipboardText] = useState<string>('');

  const hasError = Boolean(error);
  const errorMessage = typeof error === 'string' ? error : undefined;

  useEffect(() => {
    let mounted = true;
    const interval = setInterval(async () => {
      try {
        const text = await Clipboard.getString();
        if (!mounted) return;
        setClipboardText(text || '');
      } catch {}
    }, 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [autoFocus]);

  useEffect(() => {
    const isComplete = code.length === digitCount;
    if (isComplete && onComplete) onComplete(code);
    if (onCodeChange) onCodeChange(code, isComplete);
  }, [code, digitCount, onComplete, onCodeChange]);

  useEffect(() => {
    if (!maskDelay) return;
    const timers: number[] = [];
    const codeArr = code.split('');

    setMaskedDigits(prev => {
      const arr =
        prev.length === digitCount
          ? [...prev]
          : new Array(digitCount).fill(false);
      return arr;
    });

    codeArr.forEach((ch, idx) => {
      if (ch) {
        const t = setTimeout(() => {
          setMaskedDigits(prev => {
            const newArr = [...prev];
            newArr[idx] = true;
            return newArr;
          });
        }, maskDelay);
        timers.push(t);
      } else {
        setMaskedDigits(prev => {
          const newArr = [...prev];
          newArr[idx] = false;
          return newArr;
        });
      }
    });

    return () => timers.forEach(clearTimeout);
  }, [code, maskDelay, digitCount]);

  useEffect(() => {
    animatedValues.current.forEach((av, idx) => {
      Animated.spring(av, {
        toValue: idx === focusedIndex ? 1 : 0,
        useNativeDriver: false,
        tension: 100,
        friction: 8
      }).start();
    });
  }, [focusedIndex]);

  const updateCode = (newCode: string) => {
    const clean = newCode.replace(/[^0-9]/g, '').slice(0, digitCount);
    setCode(clean);
  };

  const handleChangeText = (text: string, index: number) => {
    const codeArray = code.split('');

    if (text.length > 1) {
      const pastedDigits = text.replace(/[^0-9]/g, '').slice(0, digitCount);
      const newCodeArray = [...codeArray];

      for (let i = 0; i < pastedDigits.length && index + i < digitCount; i++) {
        newCodeArray[index + i] = pastedDigits[i];
      }

      const newCode = newCodeArray.join('').slice(0, digitCount);
      updateCode(newCode);

      const nextIndex = Math.min(index + pastedDigits.length, digitCount - 1);
      setTimeout(() => inputRefs.current[nextIndex]?.focus(), 10);
      return;
    }

    const digit = text.replace(/[^0-9]/g, '');

    if (digit) {
      codeArray[index] = digit;
      const newCode = codeArray.join('');
      updateCode(newCode);

      if (index < digitCount - 1) {
        const nextIndex = index + 1;
        setTimeout(() => {
          inputRefs.current[nextIndex]?.focus();

          setTimeout(() => {
            inputRefs.current[nextIndex]?.setNativeProps({
              selection: { start: 0, end: 1 }
            });
          }, 50);
        }, 10);
      } else {
        inputRefs.current[index]?.blur();
      }
    } else if (text === '') {
      codeArray[index] = '';
      const newCode = codeArray.join('');
      updateCode(newCode);
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    const key = e.nativeEvent.key;

    if (key === 'Backspace') {
      const codeArray = code.split('');

      if (codeArray[index]) {
        codeArray[index] = '';
        updateCode(codeArray.join(''));
      } else if (index > 0) {
        codeArray[index - 1] = '';
        updateCode(codeArray.join(''));
        setTimeout(() => inputRefs.current[index - 1]?.focus(), 10);
      }
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);

    setTimeout(() => {
      inputRefs.current[index]?.setNativeProps({
        selection: { start: 0, end: 1 }
      });
    }, 0);
  };

  const handleBlur = () => {
    setFocusedIndex(-1);
  };

  const handleSelectionChange = (index: number) => {
    if (focusedIndex === index && code[index]) {
      setTimeout(() => {
        inputRefs.current[index]?.setNativeProps({
          selection: { start: 0, end: 1 }
        });
      }, 0);
    }
  };

  const clearCode = () => {
    setCode('');
    setMaskedDigits(new Array(digitCount).fill(false));
    setTimeout(() => inputRefs.current[0]?.focus(), 30);
  };

  const pasteCode = async () => {
    const text = await Clipboard.getString();
    const clean = text.replace(/[^0-9]/g, '').slice(0, digitCount);
    if (!clean) return;

    setCode(clean);
    setMaskedDigits(new Array(digitCount).fill(false));

    const nextIndex = Math.min(clean.length, digitCount - 1);
    setTimeout(() => inputRefs.current[nextIndex]?.focus(), 30);
  };

  const getCellStyle = (index: number, filled: boolean) => {
    const av = animatedValues.current[index];

    const borderColor = av?.interpolate
      ? av.interpolate({
          inputRange: [0, 1],
          outputRange: [
            hasError ? variables['--error'] : variables['--border'],
            hasError ? variables['--error'] : variables['--primary']
          ]
        })
      : hasError
        ? variables['--error']
        : variables['--border'];

    const scale = av?.interpolate
      ? av.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.05]
        })
      : 1;

    const animatedStyle: Animated.WithAnimatedObject<ViewStyle> = {
      borderColor,
      transform: [{ scale }]
    };

    return [
      styles.codeInput,
      focusedIndex === index && styles.focused,
      hasError && styles.error,
      filled && styles.filled,
      animatedStyle
    ];
  };

  const getDisplayValue = (index: number) => {
    const digit = code[index] || '';
    if (maskDelay > 0 && digit && maskedDigits[index]) {
      return '•';
    }
    return digit;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.inputsContainer}>
        {Array.from({ length: digitCount }).map((_, index) => {
          const digit = code[index] || '';
          const filled = Boolean(digit);
          const displayValue = getDisplayValue(index);

          return (
            <Animated.View key={index} style={getCellStyle(index, filled)}>
              <TextInput
                ref={ref => {
                  inputRefs.current[index] = ref;
                }}
                value={displayValue}
                onChangeText={text => handleChangeText(text, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                onFocus={() => handleFocus(index)}
                onBlur={handleBlur}
                onSelectionChange={() => handleSelectionChange(index)}
                keyboardType="number-pad"
                maxLength={1}
                style={styles.digitInput}
                placeholder={placeholder}
                placeholderTextColor={variables['--text-secondary']}
                selectTextOnFocus={true}
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                caretHidden={true}
                selectionColor="transparent"
              />
            </Animated.View>
          );
        })}
      </View>

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      <View style={styles.buttonsContainer}>
        {code.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearCode}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}

        {Boolean(clipboardText && clipboardText.match(/\d/)) && (
          <TouchableOpacity style={styles.clearButton} onPress={pasteCode}>
            <Text style={styles.clearButtonText}>Paste</Text>
          </TouchableOpacity>
        )}
      </View>
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
    codeInput: {
      width: config.width,
      height: config.height,
      borderColor: variables['--border'],
      borderRadius:
        variant === 'underlined' ? 0 : variables['--border-radius-medium'],
      justifyContent: 'center',
      alignItems: 'center',
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
    digitInput: {
      width: '100%',
      height: '100%',
      fontSize: config.fontSize,
      fontWeight: 'bold',
      color: variables['--text'],
      fontFamily: variables['--font-family-primary'],
      textAlign: 'center',
      padding: 0
    },
    errorText: {
      fontSize: variables['--font-size-small'],
      color: variables['--error'],
      fontFamily: variables['--font-family-primary'],
      marginTop: variables['--spacing-small'],
      textAlign: 'center'
    },
    buttonsContainer: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 10
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
