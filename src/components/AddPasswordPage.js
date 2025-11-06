import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

const AddPasswordPage = ({
  onAddPassword,
  onGeneratePassword,
  isDarkTheme = false,
  language = 'ru',
}) => {
  const [site, setSite] = useState('');
  const [email, setEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');

  const texts = {
    title: language === 'ru' ? 'Добавить пароль' : 'Add Password',
    sitePlaceholder: language === 'ru' ? 'Название сайта или приложения' : 'Site or App Name',
    loginPlaceholder: language === 'ru' ? 'Логин или email' : 'Login or Email',
    passwordPlaceholder: language === 'ru' ? 'Пароль' : 'Password',
    saveButton: language === 'ru' ? 'Сохранить пароль' : 'Save Password',
    generateButton: language === 'ru' ? 'Сгенерировать и сохранить' : 'Generate & Save',
  };

  const handleSave = () => {
    onAddPassword(site, email, customPassword);
    setSite('');
    setEmail('');
    setCustomPassword('');
  };

  const handleGenerate = () => {
    onGeneratePassword(site, email);
    setSite('');
    setEmail('');
    setCustomPassword('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.content, isDarkTheme && styles.darkContent]}>
          <Text style={[styles.title, isDarkTheme && styles.darkText]}>
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

          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>
                {texts.saveButton}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.generateButton]} 
              onPress={handleGenerate}
            >
              <Text style={styles.buttonText}>
                {texts.generateButton}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  darkContent: {
    backgroundColor: '#2a2727ff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#000',
  },
  darkText: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  darkInput: {
    borderColor: '#555',
    color: '#fff',
    backgroundColor: '#333',
  },
  buttonsContainer: {
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#007bff',
  },
  generateButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddPasswordPage;