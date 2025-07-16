import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { themeVariables, Theme } from "../../contexts/theme-context";

interface RejectionModalProps {
  visible: boolean;
  onDismiss: () => void;
  rejectionReason: string;
  setRejectionReason: (text: string) => void;
  onConfirm: () => void;
  theme: Theme;
}

const RejectionModal: React.FC<RejectionModalProps> = ({
  visible,
  onDismiss,
  rejectionReason,
  setRejectionReason,
  onConfirm,
  theme,
}) => {
  const vars = themeVariables(theme);
  const styles = createLocalStyles(vars);

  const isConfirmEnabled = rejectionReason.trim().length > 0;

  return (
    <SafeAreaProvider>
      <Modal
        visible={visible}
        animationType="fade"
        transparent
        onRequestClose={onDismiss}
        statusBarTranslucent
      >
        <SafeAreaView style={[styles.overlay, { backgroundColor: vars["--overlay"] }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoidingView}
          >
            <View style={[styles.modalContainer, { backgroundColor: vars["--surface"] }]}>
              <Text style={[styles.title, { color: vars["--text"] }]}>
                Rechazar publicación
              </Text>
              <Text style={[styles.subtitle, { color: vars["--text-secondary"] }]}>
                Por favor, ingresa la razón del rechazo:
              </Text>

              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: vars["--border"],
                    backgroundColor: vars["--surface-variant"],
                    color: vars["--text"],
                  },
                ]}
                multiline
                placeholder="Escribe aquí la razón..."
                placeholderTextColor={vars["--placeholder"]}
                value={rejectionReason}
                onChangeText={setRejectionReason}
                autoFocus
                maxLength={500}
                accessibilityLabel="Campo para ingresar la razón del rechazo"
                textAlignVertical="top"
              />

              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.button, { backgroundColor: vars["--secondary"] }]}
                  onPress={onDismiss}
                  accessibilityRole="button"
                  accessibilityLabel="Cancelar rechazo"
                >
                  <Text style={[styles.buttonText, { color: vars["--text-on-secondary"] }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.button,
                    {
                      backgroundColor: isConfirmEnabled ? vars["--primary"] : vars["--disabled"],
                      opacity: isConfirmEnabled ? 1 : 0.6,
                    },
                  ]}
                  onPress={onConfirm}
                  disabled={!isConfirmEnabled}
                  accessibilityRole="button"
                  accessibilityLabel="Confirmar rechazo"
                >
                  <Text style={[styles.buttonText, { color: vars["--text-on-primary"] }]}>
                    Confirmar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaProvider>
  );
};

const createLocalStyles = (vars: Record<string, string>) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      backgroundColor: 'rgba(0,0,0,0.5)', // fallback if vars["--overlay"] undefined
    },
    keyboardAvoidingView: {
      width: '100%',
      paddingHorizontal: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '90%',
      backgroundColor: vars["--surface"],
      borderRadius: 16,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 10,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 15,
      fontWeight: '400',
      marginBottom: 16,
      textAlign: 'center',
    },
    textInput: {
      minHeight: 140,
      borderWidth: 1,
      borderRadius: 10,
      padding: 16,
      fontSize: 16,
      textAlignVertical: 'top',
      marginBottom: 24,
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    button: {
      flex: 1,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      fontWeight: '700',
      fontSize: 16,
      textTransform: 'uppercase',
    },
  });

export default RejectionModal;
