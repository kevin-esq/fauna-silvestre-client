import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Platform
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '@/presentation/contexts/theme.context';
import { useCatalogViewPreferences } from '@/presentation/contexts/catalog-view-preferences.context';
import {
  ViewLayout,
  CatalogSortBy
} from '@/services/storage/catalog-view-preferences.service';

const LAYOUT_OPTIONS = [
  {
    value: 'card' as ViewLayout,
    label: 'Tarjeta',
    icon: 'card',
    iconType: 'ionicons'
  },
  {
    value: 'list' as ViewLayout,
    label: 'Lista',
    icon: 'list',
    iconType: 'ionicons'
  },
  {
    value: 'grid' as ViewLayout,
    label: 'Cuadrícula',
    icon: 'grid',
    iconType: 'ionicons'
  },
  {
    value: 'timeline' as ViewLayout,
    label: 'Línea de tiempo',
    icon: 'timeline',
    iconType: 'material'
  }
];

const SORT_OPTIONS: Array<{
  value: CatalogSortBy;
  label: string;
  icon: string;
}> = [
  { value: 'name-asc', label: 'Nombre (A-Z)', icon: 'text-outline' },
  { value: 'name-desc', label: 'Nombre (Z-A)', icon: 'text-outline' },
  { value: 'species-asc', label: 'Especie (A-Z)', icon: 'leaf-outline' },
  { value: 'species-desc', label: 'Especie (Z-A)', icon: 'leaf-outline' },
  { value: 'category-asc', label: 'Categoría (A-Z)', icon: 'paw-outline' },
  { value: 'category-desc', label: 'Categoría (Z-A)', icon: 'paw-outline' },
  { value: 'habitat-asc', label: 'Hábitat (A-Z)', icon: 'location-outline' },
  { value: 'habitat-desc', label: 'Hábitat (Z-A)', icon: 'location-outline' }
];

interface CatalogViewSelectorProps {
  minimal?: boolean;
}

export const CatalogViewSelector: React.FC<CatalogViewSelectorProps> = ({
  minimal = false
}) => {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const preferences = useCatalogViewPreferences();
  const [showModal, setShowModal] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        trigger: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.medium,
          paddingVertical: spacing.small,
          borderRadius: borderRadius.medium,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          ...Platform.select({
            ios: {
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4
            },
            android: {
              elevation: 2
            }
          })
        },
        triggerIcon: {
          marginRight: spacing.tiny
        },
        triggerText: {
          fontSize: typography.fontSize.medium,
          fontWeight: typography.fontWeight.medium,
          color: colors.text,
          marginRight: spacing.tiny
        },
        modalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end'
        },
        modalContent: {
          backgroundColor: colors.surface,
          borderTopLeftRadius: borderRadius.xlarge,
          borderTopRightRadius: borderRadius.xlarge,
          maxHeight: '80%',
          paddingBottom: Platform.OS === 'ios' ? spacing.xlarge : spacing.medium
        },
        modalHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: spacing.large,
          borderBottomWidth: 1,
          borderBottomColor: colors.border
        },
        modalTitle: {
          fontSize: typography.fontSize.xlarge,
          fontWeight: typography.fontWeight.bold,
          color: colors.text
        },
        closeButton: {
          padding: spacing.small
        },
        section: {
          padding: spacing.large
        },
        sectionTitle: {
          fontSize: typography.fontSize.medium,
          fontWeight: typography.fontWeight.bold,
          color: colors.textSecondary,
          marginBottom: spacing.small,
          textTransform: 'uppercase',
          letterSpacing: 0.5
        },
        optionsRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.small
        },
        optionButton: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.medium,
          paddingVertical: spacing.small + 2,
          borderRadius: borderRadius.medium,
          borderWidth: 1.5,
          borderColor: colors.border,
          backgroundColor: colors.background,
          minWidth: 100
        },
        optionButtonActive: {
          backgroundColor: colors.primary + '15',
          borderColor: colors.primary
        },
        optionIcon: {
          marginRight: spacing.tiny
        },
        optionLabel: {
          fontSize: typography.fontSize.small,
          fontWeight: typography.fontWeight.medium,
          color: colors.text,
          flex: 1
        },
        optionLabelActive: {
          color: colors.primary,
          fontWeight: typography.fontWeight.bold
        },
        sortOption: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.medium,
          paddingVertical: spacing.small + 2,
          borderRadius: borderRadius.medium,
          borderWidth: 1.5,
          borderColor: colors.border,
          backgroundColor: colors.background,
          minWidth: 100,
          marginBottom: spacing.small
        },
        sortOptionActive: {
          backgroundColor: colors.primary + '15',
          borderColor: colors.primary
        },
        sortOptionText: {
          flex: 1,
          fontSize: typography.fontSize.small,
          fontWeight: typography.fontWeight.medium,
          color: colors.text,
          marginLeft: spacing.tiny
        },
        sortOptionTextActive: {
          color: colors.primary,
          fontWeight: typography.fontWeight.bold
        },
        toggleSection: {
          padding: spacing.large,
          borderTopWidth: 1,
          borderTopColor: colors.divider
        },
        toggleRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: spacing.small
        },
        toggleLabel: {
          fontSize: typography.fontSize.medium,
          fontWeight: typography.fontWeight.medium,
          color: colors.text
        },
        toggleLabelDisabled: {
          color: colors.textSecondary,
          opacity: 0.5
        },
        toggleDisabled: {
          opacity: 0.5
        },
        toggleTrackDisabled: {
          backgroundColor: colors.divider
        },
        toggleTrack: {
          width: 50,
          height: 28,
          borderRadius: 14,
          justifyContent: 'center',
          padding: 2,
          backgroundColor: colors.disabled
        },
        toggleTrackActive: {
          backgroundColor: colors.primary
        },
        toggleCircle: {
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: colors.surface
        },
        toggleCircleActive: {
          alignSelf: 'flex-end'
        },
        buttonContainer: {
          flexDirection: 'row',
          gap: spacing.medium,
          margin: spacing.large,
          marginTop: 0
        },
        resetButton: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.small,
          paddingVertical: spacing.medium,
          borderRadius: borderRadius.medium,
          backgroundColor: colors.error + '15',
          borderWidth: 1,
          borderColor: colors.error
        },
        clearFiltersButton: {
          backgroundColor: colors.primary + '15',
          borderColor: colors.primary
        },
        resetButtonText: {
          fontSize: typography.fontSize.medium,
          fontWeight: typography.fontWeight.bold,
          color: colors.error
        }
      }),
    [colors, spacing, typography, borderRadius]
  );

  const renderOption = (
    value: ViewLayout,
    label: string,
    icon: string,
    isActive: boolean,
    onPress: () => void,
    iconType: 'ionicons' | 'material' = 'ionicons'
  ) => {
    const IconComponent =
      iconType === 'material' ? MaterialCommunityIcons : Ionicons;

    return (
      <TouchableOpacity
        key={value}
        style={[styles.optionButton, isActive && styles.optionButtonActive]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <IconComponent
          name={icon as never}
          size={18}
          color={isActive ? colors.primary : colors.textSecondary}
          style={styles.optionIcon}
        />
        <Text
          style={[styles.optionLabel, isActive && styles.optionLabelActive]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderToggle = (
    label: string,
    value: boolean,
    onToggle: () => void,
    disabled: boolean = false
  ) => {
    return (
      <TouchableOpacity
        style={[styles.toggleRow, disabled && styles.toggleDisabled]}
        onPress={disabled ? undefined : onToggle}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}
      >
        <Text
          style={[styles.toggleLabel, disabled && styles.toggleLabelDisabled]}
        >
          {label}
        </Text>
        <View
          style={[
            styles.toggleTrack,
            value && styles.toggleTrackActive,
            disabled && styles.toggleTrackDisabled
          ]}
        >
          <View
            style={[styles.toggleCircle, value && styles.toggleCircleActive]}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
      >
        <Ionicons
          name="options-outline"
          size={20}
          color={colors.primary}
          style={styles.triggerIcon}
        />
        {!minimal && <Text style={styles.triggerText}>Vista</Text>}
        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setShowModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Opciones de Vista</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Diseño</Text>
                <View style={styles.optionsRow}>
                  {LAYOUT_OPTIONS.map(opt =>
                    renderOption(
                      opt.value,
                      opt.label,
                      opt.icon,
                      preferences.layout === opt.value,
                      () => preferences.setLayout(opt.value),
                      opt.iconType as 'ionicons' | 'material'
                    )
                  )}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ordenar por</Text>
                <View style={styles.optionsRow}>
                  {SORT_OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.sortOption,
                        preferences.sortBy === opt.value &&
                          styles.sortOptionActive
                      ]}
                      onPress={() => preferences.setSortBy(opt.value)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={opt.icon as never}
                        size={18}
                        color={
                          preferences.sortBy === opt.value
                            ? colors.primary
                            : colors.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.sortOptionText,
                          preferences.sortBy === opt.value &&
                            styles.sortOptionTextActive
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.toggleSection}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { paddingHorizontal: 0, marginBottom: spacing.small }
                  ]}
                >
                  Mostrar
                </Text>
                {renderToggle(
                  'Imágenes',
                  preferences.showImages,
                  preferences.toggleImages
                )}
                {renderToggle(
                  'Categoría',
                  preferences.showCategory,
                  preferences.toggleCategory,
                  preferences.isToggleDisabled('showCategory')
                )}
                {renderToggle(
                  'Especie',
                  preferences.showSpecies,
                  preferences.toggleSpecies,
                  preferences.isToggleDisabled('showSpecies')
                )}
                {renderToggle(
                  'Hábitat',
                  preferences.showHabitat,
                  preferences.toggleHabitat,
                  preferences.isToggleDisabled('showHabitat')
                )}
                {renderToggle(
                  'Descripción',
                  preferences.showDescription,
                  preferences.toggleDescription,
                  preferences.isToggleDisabled('showDescription')
                )}
                {renderToggle(
                  'Destacar con bordes',
                  preferences.highlightStatus,
                  preferences.toggleHighlightStatus
                )}
              </View>

              <View style={styles.toggleSection}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { paddingHorizontal: 0, marginBottom: spacing.small }
                  ]}
                >
                  Accesibilidad
                </Text>
                {renderToggle(
                  'Reducir animaciones',
                  preferences.reducedMotion,
                  preferences.toggleReducedMotion
                )}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.resetButton, styles.clearFiltersButton]}
                  onPress={preferences.clearFilters}
                >
                  <Ionicons
                    name="funnel-outline"
                    size={16}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.resetButtonText, { color: colors.primary }]}
                  >
                    Limpiar filtros
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={preferences.resetPreferences}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={16}
                    color={colors.error}
                  />
                  <Text style={styles.resetButtonText}>Restablecer todo</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};
