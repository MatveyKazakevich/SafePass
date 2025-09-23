import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';

const AddPasswordModal = ({
  visible,
  onClose,
  onSave,
  onGenerate,
  site,
  setSite,
  email,
  setEmail,
  customPassword,
  setCustomPassword,
  isDarkTheme = false,
  language = 'ru',
}) => {
  const texts = {
    title: language === 'ru' ? 'Добавить данные' : 'Add Data',
    sitePlaceholder: language === 'ru' ? 'Название сайта или приложения' : 'Site or App Name',
    loginPlaceholder: language === 'ru' ? 'Логин' : 'Login',
    passwordPlaceholder: language === 'ru' ? 'Пароль' : 'Password',
    saveButton: language === 'ru' ? 'Сохранить данные' : 'Save Data',
    generateButton: language === 'ru' ? 'Сгенерировать пароль' : 'Generate Password',
    cancelButton: language === 'ru' ? 'Отмена' : 'Cancel',
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.modalContent, isDarkTheme && styles.darkModalContent]}>
          <Text style={[styles.modalTitle, isDarkTheme && styles.darkText]}>
            {texts.title}
          </Text>

          <TextInput
            style={[styles.input, isDarkTheme && styles.darkInput]}
            placeholder={texts.sitePlaceholder}
            placeholderTextColor={isDarkTheme ? '#aaa' : '#999'}
            value={site}
            onChangeText={setSite}
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, isDarkTheme && styles.darkInput]}
            placeholder={texts.loginPlaceholder}
            placeholderTextColor={isDarkTheme ? '#aaa' : '#999'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, isDarkTheme && styles.darkInput]}
            placeholder={texts.passwordPlaceholder}
            placeholderTextColor={isDarkTheme ? '#aaa' : '#999'}
            value={customPassword}
            onChangeText={setCustomPassword}
            secureTextEntry
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.button} onPress={onSave}>
              <Text style={[styles.buttonText, isDarkTheme && styles.darkButtonText]}>
                {texts.saveButton}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onGenerate}>
              <Text style={[styles.buttonText, isDarkTheme && styles.darkButtonText]}>
                {texts.generateButton}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cancelButton}>
            <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
              <Text style={[styles.btnCancelText, isDarkTheme && styles.darkCancelText]}>
                {texts.cancelButton}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    width: '95%',
  },
  darkModalContent: {
    backgroundColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  darkText: {
    color: '#eee',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    color: '#000',
  },
  darkInput: {
    borderColor: '#555',
    color: '#eee',
  },
  button: {
    padding: 10,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#007bff',
    fontWeight: '400',
  },
  darkButtonText: {
    color: '#66aaff',
  },
  cancelButton: {
    marginTop: 10,
  },
  btnCancelText: {
    margin: 6,
    color: '#ff0707ff',
    fontWeight: '400',
    fontSize: 18,
    textAlign: 'center',
  },
  darkCancelText: {
    color: '#ff0707ff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default AddPasswordModal;
