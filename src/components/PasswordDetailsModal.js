import React, { useState, useEffect } from 'react';
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

const PasswordDetailsModal = ({
  visible,
  handleDelete,
  onClose,
  item,
  onCopy,
  index,
  visibleItems,
  isDarkTheme = false,
  language = 'ru',
}) => {
  const [visibleDetails, setVisibleDetails] = useState(false);

  useEffect(() => {
    if (visible) {
      if (visibleItems && visibleItems[index]) {
        setVisibleDetails(true);
      } else {
        setVisibleDetails(false);
      }
    } else {
      setVisibleDetails(false);
    }
  }, [visible, visibleItems, index]);

  const authenticateAndShowDetails = async () => {
    if (visibleDetails) return;

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert(
          language === 'ru' ? 'Ошибка' : 'Error',
          language === 'ru'
            ? 'Устройство не поддерживает биометрическую аутентификацию'
            : 'Device does not support biometric authentication'
        );
        return;
      }
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert(
          language === 'ru' ? 'Ошибка' : 'Error',
          language === 'ru'
            ? 'Установите биометрическую аутентификацию на устройстве'
            : 'Please set up biometric authentication on your device'
        );
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage:
          language === 'ru' ? 'Подтвердите личность для показа данных' : 'Authenticate to show data',
      });
      if (result.success) {
        setVisibleDetails(true);
      }
    } catch (e) {
      Alert.alert(
        language === 'ru' ? 'Ошибка' : 'Error',
        language === 'ru' ? 'Не удалось выполнить аутентификацию' : 'Failed to authenticate'
      );
    }
  };

  const handleClose = () => {
    setVisibleDetails(false);
    onClose();
  };

  if (!item) return null;

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.modalContent, isDarkTheme && styles.darkModalContent]}>
          <Text style={[styles.modalTitle, isDarkTheme && styles.darkText]}>
            {language === 'ru' ? 'Детали сервиса' : 'Details'}
          </Text>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, isDarkTheme && styles.darkText]}>
              {language === 'ru' ? 'Сервис:' : 'Service:'}
            </Text>
            <Text style={[styles.detailValue, isDarkTheme && styles.darkText]}>{item.site}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, isDarkTheme && styles.darkText]}>
              {language === 'ru' ? 'Логин:' : 'Login:'}
            </Text>
            <TouchableOpacity
              style={styles.detailValue}
              onPress={!visibleDetails ? authenticateAndShowDetails : undefined}
              activeOpacity={visibleDetails ? 1 : 0.7}
            >
              <Text style={[styles.copyableText, isDarkTheme && styles.darkText]}>
                {visibleDetails ? item.email : '************'}
              </Text>
            </TouchableOpacity>
            {visibleDetails && (
              <TouchableOpacity style={styles.copyButton} onPress={() => onCopy(item.email, language === 'ru' ? 'Логин' : 'Login')}>
                <Text style={[styles.copyButtonText, isDarkTheme && styles.darkText]}>
                  {language === 'ru' ? 'Копировать' : 'Copy'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, isDarkTheme && styles.darkText]}>
              {language === 'ru' ? 'Пароль:' : 'Password:'}
            </Text>
            <TouchableOpacity
              style={styles.detailValue}
              onPress={!visibleDetails ? authenticateAndShowDetails : undefined}
              activeOpacity={visibleDetails ? 1 : 0.7}
            >
              <Text style={[styles.copyableText, isDarkTheme && styles.darkText]}>
                {visibleDetails ? item.password : '************'}
              </Text>
            </TouchableOpacity>
            {visibleDetails && (
              <TouchableOpacity style={styles.copyButton} onPress={() => onCopy(item.password, language === 'ru' ? 'Пароль' : 'Password')}>
                <Text style={[styles.copyButtonText, isDarkTheme && styles.darkText]}>
                  {language === 'ru' ? 'Копировать' : 'Copy'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.buttonsRow}>
            <View style={styles.buttonWrapper}>
              <Button
                title={language === 'ru' ? 'Закрыть' : 'Close'}
                color="#007bff"
                onPress={handleClose}
              />
            </View>
            <View style={styles.buttonWrapper}>
              <Button
                title={language === 'ru' ? 'Удалить' : 'Delete'}
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
    backgroundColor: 'white', padding: 20, borderRadius: 10, width: '95%',
  },
  darkModalContent: {
    backgroundColor: '#333',
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
    padding: 8, marginLeft: 5,
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
  darkText: {
    color: '#eee',
  },
});

export default PasswordDetailsModal;