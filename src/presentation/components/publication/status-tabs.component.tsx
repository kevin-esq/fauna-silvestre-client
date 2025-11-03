import React, { memo } from 'react';
import {
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import { ThemeVariablesType, useTheme } from '@/presentation/contexts/theme.context';
import { themeVariables } from '@/presentation/contexts/theme.context';
import { PublicationStatus } from '@/services/publication/publication.service';

export interface StatusTab {
  label: string;
  value: PublicationStatus;
}

interface StatusTabsProps {
  statuses: readonly StatusTab[];
  active: PublicationStatus;
  onSelect: (status: PublicationStatus) => void;
  theme?: ReturnType<typeof useTheme>['theme'];
}

const StatusTabs: React.FC<StatusTabsProps> = ({
  statuses,
  active,
  onSelect,
  theme
}) => {
  const { theme: defaultTheme } = useTheme();
  const currentTheme = theme || defaultTheme;
  const vars = themeVariables(currentTheme);

  return (
    <View style={[styles.container, { backgroundColor: vars['--surface'] }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        snapToAlignment="start"
        decelerationRate="fast"
        keyboardShouldPersistTaps="handled"
      >
        {statuses.map(({ label, value }, idx) => {
          const isActive = active === value;

          return (
            <TouchableOpacity
              key={value}
              activeOpacity={0.7}
              onPress={() => onSelect(value)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Filtrar por ${label}`}
              style={getTabButtonStyle(
                vars,
                isActive,
                idx === statuses.length - 1
              )}
            >
              <Text style={getTabTextStyle(vars, isActive)}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

StatusTabs.displayName = 'StatusTabs';

const getTabButtonStyle = (
  vars: ThemeVariablesType,
  isActive: boolean,
  isLast: boolean
): StyleProp<ViewStyle> => ({
  backgroundColor: isActive ? vars['--primary'] : vars['--surface'],
  borderColor: isActive ? vars['--primary'] : vars['--border'],
  shadowColor: isActive ? vars['--primary'] : 'transparent',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: isActive ? 0.3 : 0,
  shadowRadius: isActive ? 4 : 0,
  elevation: isActive ? 4 : 0,
  marginRight: isLast ? 0 : 12,
  ...styles.tabButton
});

const getTabTextStyle = (
  vars: ThemeVariablesType,
  isActive: boolean
): StyleProp<TextStyle> => ({
  color: isActive ? vars['--text-on-primary'] : vars['--text-secondary'],
  fontWeight: isActive ? '700' : '500',
  ...styles.tabText
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: '100%'
  },
  contentContainer: {
    alignItems: 'center',
    paddingRight: 16
  },
  tabButton: {
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center'
  },
  tabText: {
    fontSize: 16,
    textAlign: 'center'
  }
});

export default memo(StatusTabs);
