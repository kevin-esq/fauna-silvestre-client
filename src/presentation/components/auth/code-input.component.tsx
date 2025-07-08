import React, { useRef, useMemo } from 'react';
import { View, TextInput, StyleSheet, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { useTheme } from '../../contexts/theme-context';

interface CodeInputProps {
  code: string;
  setCode: (code: string) => void;
  digitCount?: number;
}

const CodeInput: React.FC<CodeInputProps> = ({ code, setCode, digitCount = 5 }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const codeDigits = useMemo(() => {
    return code.padEnd(digitCount, ' ').split('');
  }, [code, digitCount]);

  const handleTextChange = (text: string, index: number) => {
    // Handle pasting code
    if (text.length > 1 && index === 0) {
      const newCode = text.replace(/[^0-9]/g, '').slice(0, digitCount);
      setCode(newCode);
      const focusIndex = Math.max(0, newCode.length - 1);
      if (inputRefs.current[focusIndex]) {
        inputRefs.current[focusIndex]?.focus();
      }
      return;
    }

    const newCodeArr = code.split('');
    newCodeArr[index] = text.replace(/[^0-9]/g, '');
    const newCode = newCodeArr.join('').slice(0, digitCount);
    setCode(newCode);

    if (text && index < digitCount - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: digitCount }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={styles.codeInput}
          keyboardType="number-pad"
          maxLength={1}
          value={codeDigits[index]?.trim()}
          onChangeText={(text) => handleTextChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  codeInput: {
    width: 50,
    height: 60,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    backgroundColor: colors.surfaceVariant,
  },
});

export default CodeInput;
