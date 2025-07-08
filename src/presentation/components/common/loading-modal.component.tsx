import React from 'react';
import { View, Modal, ActivityIndicator, StyleSheet, Text } from 'react-native';

interface Props {
  visible: boolean;
  theme?: any;
}

export const LoadingModal = ({ visible, theme }: Props) => {
  return (
    <Modal
      transparent={true}
      animationType="none"
      visible={visible}
      onRequestClose={() => {}}
    >
      <View style={[styles.modalBackground, { backgroundColor: theme?.colors?.shadow }]}>
        <View style={[styles.activityIndicatorWrapper, { backgroundColor: theme?.colors?.surface }]}>
          <ActivityIndicator size="large" color={theme?.colors?.primary} />
          <Text style={[styles.loadingText, { color: theme?.colors?.text }]}>Cargando...</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  activityIndicatorWrapper: {
    height: 120,
    width: 120,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  loadingText: {
    marginTop: 8,
  },
});
