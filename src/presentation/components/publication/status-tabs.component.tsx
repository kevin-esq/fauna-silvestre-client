import React, { memo } from 'react';
import { Text, TouchableOpacity, ScrollView, StyleSheet, View } from 'react-native';
import { PublicationStatus } from '../../../domain/models/publication.models';
import { useTheme } from "../../contexts/theme-context";

interface StatusTab {
  label: string;
  value: PublicationStatus | 'all';
}

interface StatusTabsProps {
  statuses: readonly StatusTab[];
  active: PublicationStatus | 'all';
  onSelect: (status: PublicationStatus | 'all') => void;
  theme?: ReturnType<typeof useTheme>['theme'];
}

const StatusTabs: React.FC<StatusTabsProps> = memo(({ statuses, active, onSelect, theme }) => {
  const { theme: defaultTheme } = useTheme();
  const currentTheme = theme || defaultTheme;

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.surface }]}>
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
              style={[
                styles.tabButton,
                {
                  backgroundColor: isActive ? currentTheme.colors.primary : currentTheme.colors.surface,
                  borderColor: isActive ? currentTheme.colors.primary : currentTheme.colors.border,
                  marginRight: idx === statuses.length - 1 ? 0 : 12,
                  shadowColor: isActive ? currentTheme.colors.primary : 'transparent',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isActive ? 0.3 : 0,
                  shadowRadius: isActive ? 4 : 0,
                  elevation: isActive ? 4 : 0,
                }
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive ? currentTheme.colors.textOnPrimary : currentTheme.colors.textSecondary,
                    fontWeight: isActive ? '700' : '500',
                  }
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: '100%',
  },
  contentContainer: {
    alignItems: 'center',
    paddingRight: 16,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default StatusTabs;
