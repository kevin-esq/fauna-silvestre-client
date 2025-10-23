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
import { useTheme } from '../../contexts/theme.context';
import { createStyles } from './help-modal.styles';

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'about' | 'tutorial' | 'faq';

const HelpModal: React.FC<HelpModalProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets);
  const [activeTab, setActiveTab] = useState<TabType>('about');

  const handleContactPress = useCallback(() => {
    Linking.openURL('mailto:soporte@kaaxilbaalilche.org');
  }, []);

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
          <Ionicons name="leaf" size={40} color={theme.colors.forest} />
        </View>
        <Text style={styles.title}>¿Qué es K'aaxil Ba'alilche'?</Text>
        <Text style={styles.paragraph}>
          K'aaxil Ba'alilche' (que significa "Fauna Silvestre" en maya) es una
          aplicación dedicada al registro y documentación de avistamientos de
          fauna silvestre en la región.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>🎯 Nuestra Misión</Text>
        <Text style={styles.paragraph}>
          Contribuir a la conservación de la biodiversidad mediante el registro
          ciudadano de avistamientos de fauna silvestre, generando datos
          valiosos para la investigación y protección de especies.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>🌿 Importancia</Text>
        <Text style={styles.paragraph}>
          Cada registro que realizas ayuda a:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>
            • Mapear la distribución de especies
          </Text>
          <Text style={styles.bulletItem}>
            • Identificar patrones de comportamiento
          </Text>
          <Text style={styles.bulletItem}>• Detectar especies en riesgo</Text>
          <Text style={styles.bulletItem}>
            • Apoyar estudios de conservación
          </Text>
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
          <Text style={styles.stepTitle}>📸 Tomar una Foto</Text>
          <Text style={styles.stepDescription}>
            Presiona el botón verde "+" en el header para abrir la cámara o
            seleccionar una foto de tu galería.
          </Text>
        </View>
      </View>

      <View style={styles.tutorialStep}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>2</Text>
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>🐾 Seleccionar Animal</Text>
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
          <Text style={styles.stepTitle}>📝 Agregar Descripción</Text>
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
          <Text style={styles.stepTitle}>📍 Ubicación Automática</Text>
          <Text style={styles.stepDescription}>
            La app registra automáticamente las coordenadas GPS del avistamiento
            para mapear la distribución de especies.
          </Text>
        </View>
      </View>

      <View style={styles.tutorialStep}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>5</Text>
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>✅ Revisión y Aprobación</Text>
          <Text style={styles.stepDescription}>
            Tu publicación será revisada por un administrador. Recibirás una
            notificación cuando sea aprobada o rechazada.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>💡 Tips para Mejores Fotos</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>
            • Toma fotos con buena iluminación natural
          </Text>
          <Text style={styles.bulletItem}>• Enfoca bien al animal</Text>
          <Text style={styles.bulletItem}>
            • Evita usar flash (puede asustar al animal)
          </Text>
          <Text style={styles.bulletItem}>• Mantén una distancia segura</Text>
          <Text style={styles.bulletItem}>
            • Incluye el hábitat en la foto si es posible
          </Text>
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
        <Text style={styles.faqQuestion}>❓ ¿Qué significa cada estado?</Text>
        <Text style={styles.faqAnswer}>
          <Text style={styles.bold}>Pendiente ⏳:</Text> Tu publicación está en
          revisión.{'\n'}
          <Text style={styles.bold}>Aprobada ✅:</Text> Tu avistamiento fue
          verificado y publicado.{'\n'}
          <Text style={styles.bold}>Rechazada ❌:</Text> La publicación no
          cumple los criterios (verás el motivo).
        </Text>
      </View>

      <View style={styles.faqItem}>
        <Text style={styles.faqQuestion}>
          ❓ ¿Por qué fue rechazada mi publicación?
        </Text>
        <Text style={styles.faqAnswer}>
          Las razones comunes incluyen: foto borrosa, animal no identificable,
          ubicación incorrecta, o no es fauna silvestre. Revisa el motivo en la
          notificación e intenta nuevamente.
        </Text>
      </View>

      <View style={styles.faqItem}>
        <Text style={styles.faqQuestion}>
          ❓ ¿Puedo editar una publicación?
        </Text>
        <Text style={styles.faqAnswer}>
          No es posible editar publicaciones ya enviadas. Si necesitas hacer
          cambios, elimina la publicación y crea una nueva.
        </Text>
      </View>

      <View style={styles.faqItem}>
        <Text style={styles.faqQuestion}>
          ❓ ¿Qué hago si el animal no está en el catálogo?
        </Text>
        <Text style={styles.faqAnswer}>
          Contacta al administrador a través del correo de soporte. Proporciona
          el nombre del animal y una descripción para que sea agregado al
          catálogo.
        </Text>
      </View>

      <View style={styles.faqItem}>
        <Text style={styles.faqQuestion}>
          ❓ ¿La app funciona sin internet?
        </Text>
        <Text style={styles.faqAnswer}>
          Necesitas conexión a internet para enviar publicaciones y ver el
          catálogo actualizado. Sin embargo, puedes tomar fotos offline y
          subirlas después.
        </Text>
      </View>

      <View style={styles.faqItem}>
        <Text style={styles.faqQuestion}>❓ ¿Cómo contacto a soporte?</Text>
        <Text style={styles.faqAnswer}>
          Puedes escribirnos a:{'\n'}
          <Text style={styles.link} onPress={handleContactPress}>
            soporte@kaaxilbaalilche.org
          </Text>
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>📧 Contacto</Text>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleContactPress}
          accessibilityRole="button"
          accessibilityLabel="Enviar correo de soporte"
        >
          <Ionicons name="mail" size={20} color={theme.colors.surface} />
          <Text style={styles.contactButtonText}>Enviar Correo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons
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

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {renderTabButton('about', 'Acerca de', 'information-circle')}
          {renderTabButton('tutorial', 'Tutorial', 'school')}
          {renderTabButton('faq', 'FAQ', 'help-circle')}
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'about' && renderAboutContent()}
          {activeTab === 'tutorial' && renderTutorialContent()}
          {activeTab === 'faq' && renderFAQContent()}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default React.memo(HelpModal);
