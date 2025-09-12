import React from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet, TouchableOpacity,
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
}) => {
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
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Добавить данные</Text>
          <TextInput
            style={styles.input}
            placeholder="Название сайта или приложения"
            value={site}
            onChangeText={setSite}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Пароль"
            value={customPassword}
            onChangeText={setCustomPassword}
            secureTextEntry
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.button} onPress={onSave}>
              <Text style={styles.buttonText}>Сохранить данные</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onGenerate}>
              <Text style={styles.buttonText}>Сгенерировать пароль</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cancelButton}>
            <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
                <Text style={styles.btnCancelText}>Отмена</Text>
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
  btnCancel:{
    marginTop: 10,
  },
  btnCancelText:{
    margin: 6,
    color: '#ff0707ff',
    fontWeight: 700,
    fontSize: 18,
    justifyContent: 'center',
    textAlign: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    width: '90%',
  },
  button: {
    padding: 10,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default AddPasswordModal;
