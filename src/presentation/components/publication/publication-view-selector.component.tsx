import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Platform
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/theme.context';
import { usePublicationViewPreferences } from '../../contexts/publication-view-preferences.context';
import {
  ViewLayout,
  ViewGroupBy,
  ViewSortBy
} from '../../../services/storage/publication-view-preferences.service';

const LAYOUT_OPTIONS: Array<{
  value: ViewLayout;
  label: string;
  icon: string;
  iconType: 'ionicons' | 'material';
}> = [
  {
    value: 'card',
    label: 'Tarjetas',
    icon: 'card-outline',
    iconType: 'material'
  },
  { value: 'list', label: 'Lista', icon: 'list', iconType: 'ionicons' },
  {
    value: 'grid',
    label: 'Cuadrícula',
    icon: 'grid-outline',
    iconType: 'ionicons'
  },
  {
    value: 'timeline',
    label: 'Línea de tiempo',
    icon: 'timeline',
    iconType: 'material'
  }
];

const GROUP_OPTIONS: Array<{
  value: ViewGroupBy;
  label: string;
  icon: string;
}> = [
  { value: 'none', label: 'Sin agrupar', icon: 'apps-outline' },
  { value: 'animal', label: 'Por animal', icon: 'paw-outline' },
  { value: 'date', label: 'Por fecha', icon: 'calendar-outline' },
  { value: 'status', label: 'Por estado', icon: 'filter-outline' }
];

const SORT_OPTIONS: Array<{ value: ViewSortBy; label: string; icon: string }> =
  [
    { value: 'date-desc', label: 'Más recientes', icon: 'arrow-down-outline' },
    { value: 'date-asc', label: 'Más antiguos', icon: 'arrow-up-outline' },
    {
      value: 'accepted-desc',
      label: 'Aceptados recientes',
      icon: 'checkmark-outline'
    },
    {
      value: 'accepted-asc',
      label: 'Aceptados antiguos',
      icon: 'checkmark-outline'
    },
    { value: 'species-asc', label: 'Especie (A-Z)', icon: 'paw-outline' },
    { value: 'species-desc', label: 'Especie (Z-A)', icon: 'paw-outline' },
    {
      value: 'location-asc',
      label: 'Ubicación (A-Z)',
      icon: 'location-outline'
    },
    {
      value: 'location-desc',
      label: 'Ubicación (Z-A)',
      icon: 'location-outline'
    },
    { value: 'name-asc', label: 'Nombre (A-Z)', icon: 'text-outline' },
    { value: 'name-desc', label: 'Nombre (Z-A)', icon: 'text-outline' },
    { value: 'status', label: 'Por estado', icon: 'checkbox-outline' }
  ];

const ANIMAL_STATE_OPTIONS: Array<{
  value: 'all' | 'ALIVE' | 'DEAD';
  label: string;
  icon: string;
}> = [
  { value: 'all', label: 'Todos', icon: 'apps-outline' },
  { value: 'ALIVE', label: 'Vivo', icon: 'heart-outline' },
  { value: 'DEAD', label: 'Muerto', icon: 'close-circle-outline' }
];

interface PublicationViewSelectorProps {
  minimal?: boolean;
  currentStatus?: 'pending' | 'accepted' | 'rejected';
}

export const PublicationViewSelector: React.FC<
  PublicationViewSelectorProps
> = ({ minimal = false, currentStatus }) => {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const preferences = usePublicationViewPreferences();
  const [showModal, setShowModal] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        triggerButton: {
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
        optionText: {
          fontSize: typography.fontSize.small,
          fontWeight: typography.fontWeight.medium,
          color: colors.text,
          flex: 1
        },
        optionTextActive: {
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
        toggleButton: {
          width: 50,
          height: 28,
          borderRadius: 14,
          justifyContent: 'center',
          padding: 2
        },
        toggleButtonActive: {
          backgroundColor: colors.primary
        },
        toggleButtonInactive: {
          backgroundColor: colors.disabled
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
        toggleContainer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: spacing.small
        },
        toggleDisabled: {
          opacity: 0.5
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
        toggleTrackDisabled: {
          backgroundColor: colors.divider
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
    value: string,
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
          name={icon}
          size={18}
          color={isActive ? colors.primary : colors.textSecondary}
          style={styles.optionIcon}
        />
        <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
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
  ) => (
    <TouchableOpacity
      style={[styles.toggleContainer, disabled && styles.toggleDisabled]}
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

  return (
    <>
      <TouchableOpacity
        style={styles.triggerButton}
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
              <Text style={styles.modalTitle}>Opciones</Text>
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
                      opt.iconType
                    )
                  )}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Agrupar por</Text>
                <View style={styles.optionsRow}>
                  {GROUP_OPTIONS.map(opt =>
                    renderOption(
                      opt.value,
                      opt.label,
                      opt.icon,
                      preferences.groupBy === opt.value,
                      () => preferences.setGroupBy(opt.value)
                    )
                  )}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ordenar por</Text>
                <View style={styles.optionsRow}>
                  {SORT_OPTIONS.map(opt =>
                    renderOption(
                      opt.value,
                      opt.label,
                      opt.icon,
                      preferences.sortBy === opt.value,
                      () => preferences.setSortBy(opt.value)
                    )
                  )}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Estado del animal</Text>
                <View style={styles.optionsRow}>
                  {ANIMAL_STATE_OPTIONS.map(opt =>
                    renderOption(
                      opt.value,
                      opt.label,
                      opt.icon,
                      preferences.filterByAnimalState === opt.value,
                      () => preferences.setFilterByAnimalState(opt.value)
                    )
                  )}
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
                  preferences.toggleImages,
                  false
                )}
                {renderToggle(
                  'Fecha de creación',
                  preferences.layout === 'timeline'
                    ? true
                    : preferences.showCreatedDate,
                  preferences.toggleCreatedDate,
                  preferences.layout === 'list' ||
                    preferences.layout === 'grid' ||
                    preferences.layout === 'timeline'
                )}
                {renderToggle(
                  'Fecha de aceptación',
                  preferences.showAcceptedDate,
                  preferences.toggleAcceptedDate,
                  preferences.layout !== 'card'
                )}
                {renderToggle(
                  'Estado del animal',
                  preferences.showAnimalState,
                  preferences.toggleAnimalState,
                  preferences.layout !== 'card'
                )}
                {renderToggle(
                  'Ubicación',
                  preferences.showLocation,
                  preferences.toggleLocation,
                  preferences.layout !== 'card'
                )}
                {currentStatus === 'rejected' &&
                  renderToggle(
                    'Motivo de rechazo',
                    preferences.showRejectReason,
                    preferences.toggleRejectReason,
                    preferences.layout !== 'card'
                  )}
                {renderToggle(
                  'Destacar estado',
                  preferences.highlightStatus,
                  preferences.toggleHighlightStatus,
                  false
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
