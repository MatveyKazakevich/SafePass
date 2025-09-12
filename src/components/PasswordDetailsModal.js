import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

const PasswordDetailsModal = ({ visible, handleDelete, onClose, item, onCopy, index }) => {
  const [visibleDetails, setVisibleDetails] = useState(false);

  const authenticateAndShowDetails = async () => {
    if (visibleDetails) return;

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert('Ошибка', 'Устройство не поддерживает биометрическую аутентификацию');
        return;
      }
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert('Ошибка', 'Установите биометрическую аутентификацию на устройстве');
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Подтвердите личность для показа данных',
      });
      if (result.success) {
        setVisibleDetails(true);
      }
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось выполнить аутентификацию');
    }
  };

  const handleClose = () => {
    setVisibleDetails(false);
    onClose();
  };

  if (!item) return null;

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Детали сервиса</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Сервис:</Text>
            <Text style={styles.detailValue}>{item.site}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email:</Text>
            <TouchableOpacity
              style={styles.detailValue}
              onPress={!visibleDetails ? authenticateAndShowDetails : undefined}
              activeOpacity={visibleDetails ? 1 : 0.7}
            >
              <Text style={styles.copyableText}>
                {visibleDetails ? item.email : '************'}
              </Text>
            </TouchableOpacity>
            {visibleDetails && (
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => onCopy(item.email, 'Email')}
              >
                <Text style={styles.copyButtonText}>Копировать</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Пароль:</Text>
            <TouchableOpacity
              style={styles.detailValue}
              onPress={!visibleDetails ? authenticateAndShowDetails : undefined}
              activeOpacity={visibleDetails ? 1 : 0.7}
            >
              <Text style={styles.copyableText}>
                {visibleDetails ? item.password : '************'}
              </Text>
            </TouchableOpacity>
            {visibleDetails && (
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => onCopy(item.password, 'Пароль')}
              >
                <Text style={styles.copyButtonText}>Копировать</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.buttonsRow}>
            <View style={styles.buttonWrapper}>
              <Button title="Закрыть" color="#007bff" onPress={handleClose} />
            </View>
            <View style={styles.buttonWrapper}>
              <Button
                title="Удалить"
                color="#ff1414"
                onPress={() => {
                  handleDelete(index);
                  handleClose();
                }}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%',
  },
  modalTitle: {
    fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 15,
  },
  detailLabel: {
    fontWeight: 'bold', width: 70,
  },
  detailValue: {
    flex: 1,
  },
  copyableText: {
    color: '#007bff',
  },
  copyButton: {
    padding: 8, marginLeft: 10,
  },
  copyButtonText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  buttonsRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 20,
  },
  buttonWrapper: {
    flex: 1, marginHorizontal: 5,
  },
});

export default PasswordDetailsModal;
