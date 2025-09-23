import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ToastAndroid,
  Platform,
  Modal,
  Image,
  Switch,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { generatePassword } from './utils/passwordGenerator';
import PasswordList from './components/PasswordList';
import AddPasswordModal from './components/AddPasswordModal';
import PasswordDetailsModal from './components/PasswordDetailsModal';
import { savePasswordsToStorage } from './utils/storageHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [passwords, setPasswords] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [site, setSite] = useState('');
  const [email, setEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [visibleItems, setVisibleItems] = useState({});
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [language, setLanguage] = useState('ru');

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

    setVisibleItems(prev => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });

    if (selectedIndex === index) {
      setSelectedItem(null);
      setSelectedIndex(null);
      setDetailModalVisible(false);
    }
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

  const markAsVisible = (index) => {
    setVisibleItems(prev => ({ ...prev, [index]: true }));
  };

  const handleShowSettings = () => {
    setSettingsModalVisible(true);
  };

  const handleCloseSettings = () => {
    setSettingsModalVisible(false);
  };

  return (
    <View style={[styles.container, isDarkTheme && styles.darkContainer]}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.settingsButton} onPress={handleShowSettings}>
          <Image
            source={require('./assets/icons/equalizersoutline_114523.png')}
            style={[
              styles.settingsIcon,
              { tintColor: isDarkTheme ? 'white' : 'black' }
            ]}
          />
        </TouchableOpacity>


        <Text style={[styles.title, isDarkTheme && styles.darkTitle]}>
          {language === 'ru' ? 'SafePass' : 'SafePass'}
        </Text>
        <View style={{width: 40}} />
      </View>

      <View style={[styles.tableHeader, isDarkTheme && styles.darkTableHeader]}>
        <Text style={[styles.headerCell, { flex: 0.8 }, isDarkTheme && styles.darkText]}>
          {language === 'ru' ? 'Сервис' : 'Service'}
        </Text>
        <Text style={[styles.headerCell, { flex: 1 }, isDarkTheme && styles.darkText]}>
          {language === 'ru' ? 'Логин' : 'Login'}
        </Text>
        <Text style={[styles.headerCell, { flex: 1 }, isDarkTheme && styles.darkText]}>
          {language === 'ru' ? 'Пароль' : 'Password'}
        </Text>
        <Text style={[styles.headerCell, { flex: 1.2 }, isDarkTheme && styles.darkText]}>
          {language === 'ru' ? 'Подробнее' : 'Details'}
        </Text>
      </View>

      <PasswordList
        passwords={passwords}
        visibleItems={visibleItems}
        markAsVisible={index => setVisibleItems(prev => ({ ...prev, [index]: true }))}
        onShowDetails={handleShowDetails}
        onCopy={copyToClipboard}
        isDarkTheme={isDarkTheme}
        language={language}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={[styles.fabText, isDarkTheme && styles.darkfabText]}>+</Text>
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
        isDarkTheme={isDarkTheme}
        language={language}
      />

      <PasswordDetailsModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        item={selectedItem}
        index={selectedIndex}
        visibleItems={visibleItems}
        onCopy={copyToClipboard}
        handleDelete={handleDelete}
        isDarkTheme={isDarkTheme}
        language={language}
      />

      <Modal
        visible={settingsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseSettings}
      >
        <View style={styles.settingsModalContainer}>
          <View style={[styles.settingsModalContent, isDarkTheme && styles.darkModalContent]}>
            <Text style={[styles.modalTitle, isDarkTheme && styles.darkTitle]}>
              {language === 'ru' ? 'Настройки' : 'Settings'}
            </Text>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, isDarkTheme && styles.darkText]}>
                {language === 'ru' ? 'Темная тема' : 'Dark Theme'}
              </Text>
              <Switch
                value={isDarkTheme}
                onValueChange={setIsDarkTheme}
              />
            </View>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, isDarkTheme && styles.darkText]}>
                {language === 'ru' ? 'Язык приложения' : 'App Language'}
              </Text>
              <TouchableOpacity onPress={() => setLanguage(language === 'ru' ? 'en' : 'ru')}>
                <Text style={[styles.languageButton, isDarkTheme && styles.darkText]}>
                  {language === 'ru' ? 'Русский' : 'English'}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleCloseSettings} style={styles.closeSettingsButton}>
              <Text style={{color: '#ff0707ff', fontSize: 16}}>
                {language === 'ru' ? 'Закрыть' : 'Close'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={[styles.bannerContainer, isDarkTheme && styles.darkBannerContainer]}>
        <Text style={[styles.bannerText, isDarkTheme && styles.darkText]}>Рекламный баннер</Text>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    paddingTop: 50,
  },
  darkContainer: {
    backgroundColor: '#2a2727ff',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  darkTitle: {
    color: '#fff',
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 5,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  darkTableHeader: {
    backgroundColor: '#2a2727ff',
  },
  darkText: {
    color: '#fff',
  },
  headerCell: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 35,
    bottom: 757,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkfabText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 400,
    marginBottom: 3,
    fontSize: 40,
  },
  fabText: {
    color: 'black',
    fontSize: 30,
    fontWeight: 500,
    marginBottom: 3,
    fontSize: 40,
  },
  settingsModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsModalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  darkModalContent: {
    backgroundColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
  },
  settingLabel: {
    fontSize: 16,
  },
  languageButton: {
    fontSize: 16,
    color: '#007bff',
  },
  closeSettingsButton: {
    marginTop: 10,
    alignSelf: 'center',
  },
  bannerContainer: {
    height: 100,
    width: '110%',
    backgroundColor: '#ededed',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ccc',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  darkBannerContainer: {
    backgroundColor: '#222',
  },
  bannerText: {
    fontSize: 16,
    color: '#555',
  },
});