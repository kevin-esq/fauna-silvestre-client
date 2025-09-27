import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback
} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Theme, themeVariables } from '../../contexts/theme.context';
import { CommonNounResponse } from '../../../domain/models/animal.models';

interface Props {
  options: CommonNounResponse[];
  selectedValue: CommonNounResponse | null;
  onValueChange: (value: CommonNounResponse | null) => void;
  placeholder?: string;
  label?: string;
  theme: Theme;
  maxHeight?: number;
  testID?: string;
}

export interface DropdownRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
}

const AnimalDropdown = forwardRef<DropdownRef, Props>(
  (
    {
      options,
      selectedValue,
      onValueChange,
      placeholder,
      label,
      theme,
      maxHeight,
      testID
    },
    ref
  ) => {
    const vars = themeVariables(theme);

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<string | null>(
      selectedValue ? selectedValue.catalogId.toString() : null
    );

    const [items, setItems] = useState(
      options.map(o => {
        if (o.catalogId === -1) {
          return {
            label: `🔍 ${o.commonNoun}`,
            value: o.catalogId.toString(),
            parent: 'unknown'
          };
        }
        return {
          label: o.commonNoun,
          value: o.catalogId.toString()
        };
      })
    );

    useImperativeHandle(ref, () => ({
      focus: () => setOpen(true),
      blur: () => setOpen(false),
      clear: () => setValue(null)
    }));

    useEffect(() => {
      console.log('AnimalDropdown - options changed:', options.length);
      const newItems = options.map(o => {
        if (o.catalogId === -1) {
          return {
            label: `🔍 ${o.commonNoun}`,
            value: o.catalogId.toString()
          };
        }
        return {
          label: o.commonNoun,
          value: o.catalogId.toString()
        };
      });
      setItems(newItems);
      console.log('AnimalDropdown - setItems:', newItems.slice(0, 2));

      if (!selectedValue && options.length > 0) {
        const unknownOption = options.find(o => o.catalogId === -1);
        if (unknownOption) {
          console.log('AnimalDropdown - Auto-selecting Desconocido');
          setValue('-1');
          onValueChange(unknownOption);
        }
      }
    }, [options, selectedValue, onValueChange]);

    useEffect(() => {
      const newValue = selectedValue
        ? selectedValue.catalogId.toString()
        : null;
      console.log(
        'AnimalDropdown - setValue:',
        newValue,
        'selectedValue:',
        selectedValue
      );
      setValue(newValue);
    }, [selectedValue]);

    const handleValueChange = useCallback(
      (
        callback: ((prevValue: string | null) => string | null) | string | null
      ) => {
        const newValue =
          typeof callback === 'function' ? callback(value) : callback;

        console.log(
          'AnimalDropdown - Usuario seleccionó:',
          newValue,
          typeof newValue
        );
        setValue(newValue);

        const selected =
          options.find(o => o.catalogId.toString() === newValue) || null;
        console.log('AnimalDropdown - Enviando a parent:', selected);
        onValueChange(selected);
      },
      [value, options, onValueChange]
    );

    return (
      <View
        style={{ zIndex: 999, width: '100%' }}
        testID={testID || 'animal-dropdown'}
      >
        {label && (
          <Text style={[styles.label, { color: vars['--text'] }]}>{label}</Text>
        )}

        <DropDownPicker
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={handleValueChange}
          setItems={setItems}
          placeholder={placeholder || 'Buscar y seleccionar animal...'}
          searchable={true}
          searchPlaceholder="Buscar..."
          maxHeight={maxHeight || 400}
          zIndex={1000}
          zIndexInverse={3000}
          style={{
            borderColor: vars['--border'],
            backgroundColor: vars['--surface'],
            minHeight: 56
          }}
          dropDownContainerStyle={{
            borderColor: vars['--primary'],
            backgroundColor: vars['--surface']
          }}
          listMode="SCROLLVIEW"
          scrollViewProps={{
            nestedScrollEnabled: true,
            keyboardShouldPersistTaps: 'handled'
          }}
        />

        {/* Mostrar información adicional cuando se selecciona "Desconocido" */}
        {selectedValue?.catalogId === -1 && (
          <View style={styles.unknownAnimalInfo}>
            <Text
              style={[
                styles.unknownAnimalInfoText,
                { color: vars['--text-secondary'] }
              ]}
            >
              🔍 Has seleccionado "Desconocido". Podrás especificar más detalles
              del animal en el siguiente campo.
            </Text>
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
  },
  unknownAnimalInfo: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3'
  },
  unknownAnimalInfoText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic'
  }
});

AnimalDropdown.displayName = 'AnimalDropdown';

export default AnimalDropdown;
