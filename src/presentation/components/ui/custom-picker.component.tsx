import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/theme-context';
import { Picker } from '@react-native-picker/picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface PickerOption {
  label: string;
  value: string | number;
}

interface CustomPickerProps {
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  selectedValue: string | number;
  onValueChange: (value: string | number) => void;
  options: PickerOption[];
  enabled?: boolean;
}

const CustomPicker: React.FC<CustomPickerProps> = ({ iconName, selectedValue, onValueChange, options, enabled = true }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <MaterialIcons name={iconName} size={24} color={colors.textSecondary} style={styles.icon} />
      <Picker
        selectedValue={selectedValue}
        onValueChange={(itemValue) => onValueChange(itemValue)}
        style={styles.picker}
        enabled={enabled}
      >
        {options.map((option) => (
          <Picker.Item key={option.value} label={option.label} value={option.value} />
        ))}
      </Picker>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    height: 50,
  },
  icon: {
    marginRight: 10,
  },
  picker: {
    flex: 1,
    color: colors.text,
  },
});

export default CustomPicker;
