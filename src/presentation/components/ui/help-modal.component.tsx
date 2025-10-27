import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeVariablesType, useTheme } from '../../contexts/theme.context';
import { createStyles } from './help-modal.styles';
import SponsorsFooterComponent from '../auth/sponsors-footer.component';
import {
  SUPPORT_CONTACT_METHODS,
  SUPPORT_INFO,
  type ContactMethod
} from '@/shared/constants/support.constants';

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'about' | 'tutorial' | 'faq' | 'sponsors';

const HelpModal: React.FC<HelpModalProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets);
  const [activeTab, setActiveTab] = useState<TabType>('about');

  const activeContactMethods = SUPPORT_CONTACT_METHODS.filter(
    method => method.value && method.value.trim() !== ''
  );

  const handleContactMethod = useCallback(async (method: ContactMethod) => {
    const url = method.url(method.value);
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error(method.errorMessage, error);
    }
  }, []);

  const renderIcon = useCallback(
    (method: ContactMethod, size: number, color: string) => {
      const iconProps = { name: method.icon, size, color };

      switch (method.iconLibrary) {
        case 'ionicons':
          return <Ionicons {...iconProps} />;
        case 'material':
          return <MaterialIcons {...iconProps} />;
        case 'fontawesome5':
          return <FontAwesome5 {...iconProps} />;
        default:
          return <Ionicons {...iconProps} />;
      }
    },
    []
  );

  const renderTabButton = useCallback(
    (tab: TabType, label: string, icon: string) => (
      <TouchableOpacity
        key={tab}
        style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
        onPress={() => setActiveTab(tab)}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: activeTab === tab }}
      >
        <Ionicons
          name={icon}
          size={20}
          color={activeTab === tab ? theme.colors.surface : theme.colors.forest}
        />
        <Text
          style={[
            styles.tabButtonText,
            activeTab === tab && styles.tabButtonTextActive
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    ),
    [activeTab, styles, theme]
  );

  const renderAboutContent = () => (
    <View style={styles.content}>
      <View style={styles.section}>
        <View style={styles.iconHeader}>
          <MaterialCommunityIcons
            name="leaf"
            size={48}
            color={theme.colors.forest}
          />
        </View>
        <Text style={styles.title}>¿Qué es K'aaxil Ba'alilche'?</Text>
        <Text style={styles.paragraph}>
          K'aaxil Ba'alilche' (que significa "Fauna Silvestre" en maya) es una
          aplicación dedicada al registro y documentación de avistamientos de
          fauna silvestre en la región.
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="target"
            size={24}
            color={theme.colors.forest}
          />
          <Text style={styles.subtitle}>Nuestra Misión</Text>
        </View>
        <Text style={styles.paragraph}>
          Contribuir a la conservación de la biodiversidad mediante el registro
          ciudadano de avistamientos de fauna silvestre, generando datos
          valiosos para la investigación y protección de especies.
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="sprout"
            size={24}
            color={theme.colors.leaf}
          />
          <Text style={styles.subtitle}>Importancia</Text>
        </View>
        <Text style={styles.paragraph}>
          Cada registro que realizas ayuda a:
        </Text>
        <View style={styles.bulletList}>
          <View style={styles.bulletItem}>
            <MaterialCommunityIcons
              name="map-marker-radius"
              size={16}
              color={theme.colors.forest}
            />
            <Text style={styles.bulletText}>
              Mapear la distribución de especies
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <MaterialCommunityIcons
              name="chart-line"
              size={16}
              color={theme.colors.forest}
            />
            <Text style={styles.bulletText}>
              Identificar patrones de comportamiento
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={16}
              color={theme.colors.forest}
            />
            <Text style={styles.bulletText}>Detectar especies en riesgo</Text>
          </View>
          <View style={styles.bulletItem}>
            <MaterialCommunityIcons
              name="shield-check"
              size={16}
              color={theme.colors.forest}
            />
            <Text style={styles.bulletText}>
              Apoyar estudios de conservación
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderTutorialContent = () => (
    <View style={styles.content}>
      <View style={styles.section}>
        <Text style={styles.title}>Cómo Usar la App</Text>
      </View>

      <View style={styles.tutorialStep}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>1</Text>
        </View>
        <View style={styles.stepContent}>
          <View style={styles.stepTitleContainer}>
            <MaterialCommunityIcons
              name="camera"
              size={20}
              color={theme.colors.forest}
            />
            <Text style={styles.stepTitle}>Tomar una foto</Text>
          </View>
          <Text style={styles.stepDescription}>
            Toca el botón verde con el ícono de cámara en la parte superior para
            abrir la cámara o seleccionar una imagen desde tu galería.
          </Text>
        </View>
      </View>

      <View style={styles.tutorialStep}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>2</Text>
        </View>
        <View style={styles.stepContent}>
          <View style={styles.stepTitleContainer}>
            <MaterialCommunityIcons
              name="paw"
              size={20}
              color={theme.colors.forest}
            />
            <Text style={styles.stepTitle}>Seleccionar Animal</Text>
          </View>
          <Text style={styles.stepDescription}>
            Elige el animal que avistaste del catálogo disponible. Si no está en
            la lista, contacta al administrador.
          </Text>
        </View>
      </View>

      <View style={styles.tutorialStep}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>3</Text>
        </View>
        <View style={styles.stepContent}>
          <View style={styles.stepTitleContainer}>
            <MaterialCommunityIcons
              name="text-box"
              size={20}
              color={theme.colors.forest}
            />
            <Text style={styles.stepTitle}>Agregar Descripción</Text>
          </View>
          <Text style={styles.stepDescription}>
            Describe el avistamiento: comportamiento observado, número de
            individuos, condiciones del hábitat, etc.
          </Text>
        </View>
      </View>

      <View style={styles.tutorialStep}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>4</Text>
        </View>
        <View style={styles.stepContent}>
          <View style={styles.stepTitleContainer}>
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color={theme.colors.forest}
            />
            <Text style={styles.stepTitle}>Ubicación automática</Text>
          </View>
          <Text style={styles.stepDescription}>
            La app registra automáticamente las coordenadas GPS del avistamiento
            para mapear la distribución de las especies. Si la foto proviene de
            tu galería, se extraen los metadatos de ubicación (si están
            disponibles).
          </Text>
        </View>
      </View>

      <View style={styles.tutorialStep}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>5</Text>
        </View>
        <View style={styles.stepContent}>
          <View style={styles.stepTitleContainer}>
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color={theme.colors.forest}
            />
            <Text style={styles.stepTitle}>Revisión y Aprobación</Text>
          </View>
          <Text style={styles.stepDescription}>
            Tu publicación será revisada por un administrador. Recibirás una
            notificación cuando sea aprobada o rechazada.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="lightbulb-on"
            size={24}
            color={theme.colors.secondary}
          />
          <Text style={styles.subtitle}>Tips para Mejores Fotos</Text>
        </View>
        <View style={styles.bulletList}>
          <View style={styles.bulletItem}>
            <MaterialCommunityIcons
              name="white-balance-sunny"
              size={16}
              color={theme.colors.secondary}
            />
            <Text style={styles.bulletText}>
              Toma fotos con buena iluminación natural
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <MaterialCommunityIcons
              name="focus-field"
              size={16}
              color={theme.colors.secondary}
            />
            <Text style={styles.bulletText}>Enfoca bien al animal</Text>
          </View>
          <View style={styles.bulletItem}>
            <MaterialCommunityIcons
              name="flash-off"
              size={16}
              color={theme.colors.secondary}
            />
            <Text style={styles.bulletText}>
              Evita usar flash (puede asustar al animal)
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <MaterialCommunityIcons
              name="ruler"
              size={16}
              color={theme.colors.secondary}
            />
            <Text style={styles.bulletText}>Mantén una distancia segura</Text>
          </View>
          <View style={styles.bulletItem}>
            <MaterialCommunityIcons
              name="forest"
              size={16}
              color={theme.colors.secondary}
            />
            <Text style={styles.bulletText}>
              Incluye el hábitat en la foto si es posible
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderFAQContent = () => (
    <View style={styles.content}>
      <View style={styles.section}>
        <Text style={styles.title}>Preguntas Frecuentes</Text>
      </View>

      <View style={styles.faqItem}>
        <View style={styles.faqQuestionContainer}>
          <MaterialCommunityIcons
            name="help-circle"
            size={20}
            color={theme.colors.info}
          />
          <Text style={styles.faqQuestion}>¿Qué significa cada estado?</Text>
        </View>
        <Text style={styles.faqAnswer}>
          <Text style={styles.bold}>Pendiente:</Text> Tu publicación está en
          revisión.{'\n'}
          <Text style={styles.bold}>Aprobada:</Text> Tu avistamiento fue
          verificado y publicado.{'\n'}
          <Text style={styles.bold}>Rechazada:</Text> La publicación no cumple
          los criterios (verás el motivo).
        </Text>
      </View>

      <View style={styles.faqItem}>
        <View style={styles.faqQuestionContainer}>
          <MaterialCommunityIcons
            name="help-circle"
            size={20}
            color={theme.colors.info}
          />
          <Text style={styles.faqQuestion}>
            ¿Por qué fue rechazada mi publicación?
          </Text>
        </View>
        <Text style={styles.faqAnswer}>
          Las razones comunes incluyen: foto borrosa, animal no identificable,
          ubicación incorrecta, o no es fauna silvestre. Revisa el motivo en la
          notificación e intenta nuevamente.
        </Text>
      </View>

      <View style={styles.faqItem}>
        <View style={styles.faqQuestionContainer}>
          <MaterialCommunityIcons
            name="help-circle"
            size={20}
            color={theme.colors.info}
          />
          <Text style={styles.faqQuestion}>¿Puedo editar una publicación?</Text>
        </View>
        <Text style={styles.faqAnswer}>
          No es posible editar publicaciones ya enviadas. Si necesitas hacer
          cambios, elimina la publicación y crea una nueva.
        </Text>
      </View>

      <View style={styles.faqItem}>
        <View style={styles.faqQuestionContainer}>
          <MaterialCommunityIcons
            name="help-circle"
            size={20}
            color={theme.colors.info}
          />
          <Text style={styles.faqQuestion}>
            ¿Qué puedo hacer si el animal no aparece en el catálogo?
          </Text>
        </View>
        <Text style={styles.faqAnswer}>
          Si el animal no está en el catálogo, contacta al administrador a
          través del correo de soporte. Incluye el nombre y una breve
          descripción del animal para que pueda ser agregado. Mientras recibes
          respuesta, puedes seleccionar la opción "Desconocido" y escribir el
          nombre del animal manualmente.
        </Text>
      </View>

      <View style={styles.faqItem}>
        <View style={styles.faqQuestionContainer}>
          <MaterialCommunityIcons
            name="help-circle"
            size={20}
            color={theme.colors.info}
          />
          <Text style={styles.faqQuestion}>¿La app funciona sin internet?</Text>
        </View>
        <Text style={styles.faqAnswer}>
          Necesitas conexión a internet para enviar publicaciones y ver el
          catálogo actualizado. Sin embargo, puedes tomar fotos offline y
          subirlas después.
        </Text>
      </View>

      <View style={styles.faqItem}>
        <View style={styles.faqQuestionContainer}>
          <MaterialCommunityIcons
            name="help-circle"
            size={20}
            color={theme.colors.info}
          />
          <Text style={styles.faqQuestion}>¿Cómo contacto a soporte?</Text>
        </View>
        <Text style={styles.faqAnswer}>
          Consulta los métodos de contacto disponibles en la sección "Métodos de
          Contacto" más abajo.
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="contacts"
            size={24}
            color={theme.colors.forest}
          />
          <Text style={styles.subtitle}>Métodos de Contacto</Text>
        </View>
        <View style={styles.contactMethodsGrid}>
          {activeContactMethods.map(method => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.contactMethodCard,
                { borderLeftColor: method.color }
              ]}
              onPress={() => handleContactMethod(method)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.contactMethodIcon,
                  { backgroundColor: method.color }
                ]}
              >
                {renderIcon(method, 22, '#FFFFFF')}
              </View>
              <View style={styles.contactMethodInfo}>
                <Text style={styles.contactMethodLabel}>{method.label}</Text>
                <Text style={styles.contactMethodValue}>{method.value}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {(SUPPORT_INFO.workingHours || SUPPORT_INFO.responseTime) && (
          <View style={styles.supportInfoBox}>
            {SUPPORT_INFO.workingHours && (
              <View style={styles.infoItem}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={theme.colors.forest}
                />
                <Text style={styles.infoItemText}>
                  {SUPPORT_INFO.workingHours}
                </Text>
              </View>
            )}
            {SUPPORT_INFO.responseTime && (
              <View style={styles.infoItem}>
                <Ionicons
                  name="chatbubble-outline"
                  size={16}
                  color={theme.colors.forest}
                />
                <Text style={styles.infoItemText}>
                  Respuesta: {SUPPORT_INFO.responseTime}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );

  const renderSponsorsContent = () => {
    const variables = {
      '--primary': theme.colors.primary,
      '--text': theme.colors.text,
      '--text-secondary': theme.colors.textSecondary,
      '--card-background': theme.colors.cardBackground,
      '--surface-variant': theme.colors.surfaceVariant,
      '--border': theme.colors.border,
      '--shadow': theme.colors.shadow,
      '--forest': theme.colors.forest,
      '--water': theme.colors.water,
      '--border-radius-medium': theme.borderRadius.medium,
      '--border-radius-large': theme.borderRadius.large,
      '--border-radius-xlarge': theme.borderRadius.xlarge
    } as ThemeVariablesType;

    return (
      <View style={styles.content}>
        <SponsorsFooterComponent variables={variables} mode="screen" />
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <MaterialCommunityIcons
              name="help-circle"
              size={28}
              color={theme.colors.forest}
            />
            <Text style={styles.headerTitle}>Ayuda y Tutorial</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cerrar ayuda"
          >
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <View style={styles.tabRow}>
            {renderTabButton('about', 'Acerca', 'information-circle')}
            {renderTabButton('tutorial', 'Tutorial', 'school')}
          </View>
          <View style={styles.tabRow}>
            {renderTabButton('faq', 'FAQ', 'help-circle')}
            {renderTabButton('sponsors', 'Patrocinadores', 'business')}
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'about' && renderAboutContent()}
          {activeTab === 'tutorial' && renderTutorialContent()}
          {activeTab === 'faq' && renderFAQContent()}
          {activeTab === 'sponsors' && renderSponsorsContent()}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default React.memo(HelpModal);
