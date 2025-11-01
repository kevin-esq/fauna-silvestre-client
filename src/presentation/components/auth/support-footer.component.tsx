import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useTheme, themeVariables } from '../../contexts/theme.context';
import CustomModal from '../ui/custom-modal.component';
import { createStyles } from './support-footer.styles';
import {
  SUPPORT_CONTACT_METHODS,
  SUPPORT_INFO,
  SUPPORT_MESSAGES,
  type ContactMethod
} from '@/shared/constants/support.constants';

interface SupportFooterProps {
  showContextualHelp?: boolean;
  contextMessage?: string;
}

export const SupportFooter: React.FC<SupportFooterProps> = ({
  showContextualHelp = false,
  contextMessage = '¿Problemas para ingresar?'
}) => {
  const { theme } = useTheme();
  const variables = themeVariables(theme);
  const styles = createStyles(variables);
  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    message: string;
  }>({
    visible: false,
    message: ''
  });

  const activeContactMethods = SUPPORT_CONTACT_METHODS.filter(
    method => method.value && method.value.trim() !== ''
  );

  const handleContactSupport = () => {
    setShowModal(true);
  };

  const handleContactMethod = async (method: ContactMethod) => {
    setShowModal(false);
    const url = method.url(method.value);

    try {
      await Linking.openURL(url);
    } catch {
      setErrorModal({ visible: true, message: method.errorMessage });
    }
  };

  const renderIcon = (method: ContactMethod, size: number, color: string) => {
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
  };

  return (
    <>
      <View style={styles.container}>
        {showContextualHelp ? (
          <TouchableOpacity
            style={styles.contextualHelp}
            onPress={handleContactSupport}
            activeOpacity={0.7}
          >
            <Text style={styles.contextualText}>{contextMessage}</Text>
            <Text style={styles.contactLink}>Contactar a soporte</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Necesitas ayuda?</Text>
            <TouchableOpacity
              onPress={handleContactSupport}
              activeOpacity={0.7}
            >
              <Text style={styles.supportLink}>Contactar Soporte</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <CustomModal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        title={SUPPORT_MESSAGES.contactTitle}
        description={SUPPORT_MESSAGES.contactDescription}
        type="default"
        size="medium"
        centered
        showFooter={false}
      >
        <View style={styles.contactOptions}>
          {activeContactMethods.map(method => (
            <TouchableOpacity
              key={method.id}
              style={[styles.contactOption, { backgroundColor: method.color }]}
              onPress={() => handleContactMethod(method)}
              activeOpacity={0.8}
            >
              <View style={styles.contactIconContainer}>
                {renderIcon(method, 32, '#FFFFFF')}
              </View>
              <Text style={styles.contactOptionText}>{method.label}</Text>
              <Text style={styles.contactSubtext}>{method.value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {(SUPPORT_INFO.workingHours || SUPPORT_INFO.responseTime) && (
          <View style={styles.supportInfo}>
            {SUPPORT_INFO.workingHours && (
              <View style={styles.infoRow}>
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={variables['--primary']}
                />
                <Text style={styles.infoText}>{SUPPORT_INFO.workingHours}</Text>
              </View>
            )}
            {SUPPORT_INFO.responseTime && (
              <View style={styles.infoRow}>
                <Ionicons
                  name="chatbubble-outline"
                  size={18}
                  color={variables['--primary']}
                />
                <Text style={styles.infoText}>
                  Tiempo de respuesta: {SUPPORT_INFO.responseTime}
                </Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setShowModal(false)}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </CustomModal>

      <CustomModal
        isVisible={errorModal.visible}
        onClose={() => setErrorModal({ visible: false, message: '' })}
        title="Error"
        description={errorModal.message}
        type="alert"
        size="small"
        centered
        showFooter
        buttons={[
          {
            label: 'OK',
            onPress: () => setErrorModal({ visible: false, message: '' }),
            variant: 'primary'
          }
        ]}
      />
    </>
  );
};
