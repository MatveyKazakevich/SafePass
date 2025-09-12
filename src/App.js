import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ToastAndroid, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { generatePassword } from './utils/passwordGenerator';
import PasswordList from './components/PasswordList';
import AddPasswordModal from './components/AddPasswordModal';
import PasswordDetailsModal from './components/PasswordDetailsModal';
import {savePasswordsToStorage} from "./utils/storageHandler";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [passwords, setPasswords] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [site, setSite] = useState('');
  const [email, setEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);


  useEffect(() => {
    const loadPasswords = async () => {
      try {
        const saved = await AsyncStorage.getItem('passwords');
        if (saved) {
          setPasswords(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Ошибка загрузки', e);
      }
    };

    loadPasswords();
  }, []);

  const handleDelete = (index) => {
    const updatedPasswords = passwords.filter((_, i) => i !== index);
    setPasswords(updatedPasswords);
    savePasswordsToStorage(updatedPasswords);
  };

  const handleSaveData = () => {
    if (!site.trim() || !email.trim() || !customPassword.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля, включая пароль.');
      return;
    }
    const updatedPasswords = [
      { site, email, password: customPassword },
      ...passwords,
    ];
    setPasswords(updatedPasswords);
    savePasswordsToStorage(updatedPasswords);
    setSite('');
    setEmail('');
    setCustomPassword('');
    setModalVisible(false);
  };

  const handleGenerateAndSave = () => {
    if (!site.trim() || !email.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните поля "Сайт" и "Email" перед генерацией пароля.');
      return;
    }

    const newPassword = generatePassword();
    const updatedPasswords = [
      { site, email, password: newPassword },
      ...passwords,
    ];

    setPasswords(updatedPasswords);
    savePasswordsToStorage(updatedPasswords);

    setSite('');
    setEmail('');
    setCustomPassword('');
    setModalVisible(false);

    if (Platform.OS === 'android') {
      ToastAndroid.show('Пароль сгенерирован и сохранён', ToastAndroid.SHORT);
    } else {
      Alert.alert('Успех', 'Пароль сгенерирован и сохранён');
    }
  };


  const copyToClipboard = async (text, label) => {
    await Clipboard.setStringAsync(text);
    if (Platform.OS === 'android') {
      ToastAndroid.show(`${label} скопирован(а)`, ToastAndroid.SHORT);
    } else {
      Alert.alert('Скопировано', `${label} скопирован(а)`);
    }
  };

  const handleShowDetails = (item, index) => {
  setSelectedItem(item);
  setSelectedIndex(index);
  setDetailModalVisible(true);
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SafePass</Text>

      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 1 }]}>Сервис</Text>
        <Text style={[styles.headerCell, { flex: 1.2 }]}>Email</Text>
        <Text style={[styles.headerCell, { flex: 1.2 }]}>Пароль</Text>
        <Text style={[styles.headerCell, { flex: 1.2 }]}>Подробнее</Text>
      </View>

      <PasswordList
        passwords={passwords}
        onDelete={handleDelete}
        onShowDetails={handleShowDetails}
        onCopy={copyToClipboard}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AddPasswordModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveData}
        onGenerate={handleGenerateAndSave}
        site={site}
        setSite={setSite}
        email={email}
        setEmail={setEmail}
        customPassword={customPassword}
        setCustomPassword={setCustomPassword}
      />

      <PasswordDetailsModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        item={selectedItem}
        onCopy={copyToClipboard}
        handleDelete={handleDelete}
        index={selectedIndex}      
      />


      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 5,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerCell: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 3,
  },
});
