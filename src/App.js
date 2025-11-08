import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ToastAndroid,
  Platform,
  Image,
  Animated,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { generatePassword } from './utils/passwordGenerator';
import PasswordList from './components/PasswordList';
import AddPasswordPage from './components/AddPasswordPage';
import SettingsPage from './components/SettingsPage';
import PasswordDetailsModal from './components/PasswordDetailsModal';
import { savePasswordsToStorage, loadPasswordsFromStorage } from './utils/storageHandler';

export default function App() {
  const [passwords, setPasswords] = useState([]);
  const [activeTab, setActiveTab] = useState('passwords');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [visibleItems, setVisibleItems] = useState({});
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [language, setLanguage] = useState('ru');

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const navIndicatorAnim = useRef(new Animated.Value(0)).current;
  const navTextScale = useRef(new Animated.Value(1)).current;

 useEffect(() => {
    const loadPasswords = async () => {
      try {
        console.log('Загрузка паролей из хранилища...');
        const loadedPasswords = await loadPasswordsFromStorage();
        console.log('Загружено паролей:', loadedPasswords.length);
        setPasswords(loadedPasswords);
      } catch (e) {
        console.error('Ошибка загрузки паролей', e);
        try {
          const saved = await AsyncStorage.getItem('passwords');
          if (saved) {
            const oldPasswords = JSON.parse(saved);
            setPasswords(oldPasswords);
            await savePasswordsToStorage(oldPasswords);
          }
        } catch (fallbackError) {
          console.error('Fallback загрузка тоже не удалась:', fallbackError);
        }
      }
    };
    
    loadPasswords();
  }, []);

    useEffect(() => {
    if (passwords.length > 0) {
      const savePasswords = async () => {
        try {
          await savePasswordsToStorage(passwords);
          console.log('Пароли автоматически сохранены');
        } catch (e) {
          console.error('Ошибка автосохранения паролей', e);
        }
      };
      savePasswords();
    }
  }, [passwords]);

  const getIndicatorPosition = (tabName) => {
    switch (tabName) {
      case 'passwords': return 0;
      case 'generator': return 1;
      case 'settings': return 2;
      default: return 0;
    }
  };

  const handleTabChange = (tabName) => {
    if (activeTab === tabName) return;
    
    const newPosition = getIndicatorPosition(tabName);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 20,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(navTextScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveTab(tabName);
      Animated.spring(navIndicatorAnim, {
        toValue: newPosition,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }).start();
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(navTextScale, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const indicatorPosition = navIndicatorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 116.7, 233.4]
  });

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

  const handleAddPassword = (site, email, password) => {
    if (!site.trim() || !email.trim() || !password.trim()) {
      Alert.alert(
        language === 'ru' ? 'Ошибка' : 'Error',
        language === 'ru' ? 'Пожалуйста, заполните все поля, включая пароль.' : 'Please fill in all fields, including password.'
      );
      return;
    }
    const updatedPasswords = [
      { site, email, password },
      ...passwords,
    ];
    setPasswords(updatedPasswords);
    savePasswordsToStorage(updatedPasswords);

    if (Platform.OS === 'android') {
      ToastAndroid.show(
        language === 'ru' ? 'Пароль сохранён' : 'Password saved', 
        ToastAndroid.SHORT
      );
    } else {
      Alert.alert(
        language === 'ru' ? 'Успех' : 'Success',
        language === 'ru' ? 'Пароль сохранён' : 'Password saved'
      );
    }

    handleTabChange('passwords');
  };

  const handleGenerateAndSave = (site, email) => {
    if (!site.trim() || !email.trim()) {
      Alert.alert(
        language === 'ru' ? 'Ошибка' : 'Error',
        language === 'ru' ? 'Пожалуйста, заполните поля "Название сервиса" и "Email" перед генерацией пароля.' : 'Please fill in "Service name" and "Email" fields before generating password.'
      );
      return;
    }
    const newPassword = generatePassword();
    const updatedPasswords = [
      { site, email, password: newPassword },
      ...passwords,
    ];
    setPasswords(updatedPasswords);
    savePasswordsToStorage(updatedPasswords);

    if (Platform.OS === 'android') {
      ToastAndroid.show(
        language === 'ru' ? 'Пароль сгенерирован и сохранён' : 'Password generated and saved',
        ToastAndroid.SHORT
      );
    } else {
      Alert.alert(
        language === 'ru' ? 'Успех' : 'Success',
        language === 'ru' ? 'Пароль сгенерирован и сохранён' : 'Password generated and saved'
      );
    }
    handleTabChange('passwords');
  };

  const copyToClipboard = async (text, label) => {
    await Clipboard.setStringAsync(text);
    if (Platform.OS === 'android') {
      ToastAndroid.show(
        `${label} ${language === 'ru' ? 'скопирован(а)' : 'copied'}`,
        ToastAndroid.SHORT
      );
    } else {
      Alert.alert(
        language === 'ru' ? 'Скопировано' : 'Copied',
        `${label} ${language === 'ru' ? 'скопирован(а)' : 'copied'}`
      );
    }
  };

  const handleShowDetails = (item, index) => {
    setSelectedItem(item);
    setSelectedIndex(index);
    setDetailModalVisible(true);
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'passwords':
        return (
          <>
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
              onShowDetails={handleShowDetails}
              onCopy={copyToClipboard}
              isDarkTheme={isDarkTheme}
              language={language}
            />
          </>
        );
      case 'generator':
        return (
          <AddPasswordPage
            onAddPassword={handleAddPassword}
            onGeneratePassword={handleGenerateAndSave}
            isDarkTheme={isDarkTheme}
            language={language}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            isDarkTheme={isDarkTheme}
            setIsDarkTheme={setIsDarkTheme}
            language={language}
            setLanguage={setLanguage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, isDarkTheme && styles.darkContainer]}>
      {activeTab === 'passwords' && (
        <View style={styles.topBar}>
          <View style={{width: 40}} />
          <Text style={[styles.title, isDarkTheme && styles.darkTitle]}>
            {language === 'ru' ? 'SafePass' : 'SafePass'}
          </Text>
          <View style={{width: 40}} />
        </View>
      )}

      <Animated.View 
        style={[
          styles.pageContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {renderActivePage()}
      </Animated.View>

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

      <View style={[styles.bannerContainer, isDarkTheme && styles.darkBannerContainer]}>
        <Text style={[styles.bannerText, isDarkTheme && styles.darkText]}>
          {language === 'ru' ? 'Рекламный баннер' : 'Ad Banner'}
        </Text>
      </View>

      <View style={[styles.navBar, isDarkTheme && styles.darkNavBar]}>
        <Animated.View 
          style={[
            styles.navIndicator,
            {
              transform: [{ translateX: indicatorPosition }]
            }
          ]}
        />
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleTabChange('passwords')}
        >
          <Animated.Text style={[
            styles.navText, 
            isDarkTheme && styles.darkNavText,
            activeTab === 'passwords' && styles.activeNavText,
            {
              transform: [{ scale: navTextScale }]
            }
          ]}>
            {language === 'ru' ? 'Главная' : 'Main'}
          </Animated.Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleTabChange('generator')}
        >
          <Animated.Text style={[
            styles.navText, 
            isDarkTheme && styles.darkNavText,
            activeTab === 'generator' && styles.activeNavText,
            {
              transform: [{ scale: navTextScale }]
            }
          ]}>
            {language === 'ru' ? 'Создать' : 'Generate'}
          </Animated.Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleTabChange('settings')}
        >
          <Animated.Text style={[
            styles.navText, 
            isDarkTheme && styles.darkNavText,
            activeTab === 'settings' && styles.activeNavText,
            {
              transform: [{ scale: navTextScale }]
            }
          ]}>
            {language === 'ru' ? 'Настройки' : 'Settings'}
          </Animated.Text>
        </TouchableOpacity>
      </View>

      <StatusBar style={isDarkTheme ? 'light' : 'dark'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  darkContainer: {
    backgroundColor: '#2a2727ff',
  },
  pageContainer: {
    flex: 1,
    padding: 10,
    marginBottom: 60,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 10,
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
    borderBottomColor: '#444',
  },
  darkText: {
    color: '#fff',
  },
  headerCell: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  navBar: {
    flexDirection: 'row',
    width: '93%',
    height: '7.6%',
    backgroundColor: '#ededed',
    borderRadius: 30,
    marginHorizontal: 'auto',
    bottom: '4%',
    overflow: 'hidden',
  },
  darkNavBar: {
    backgroundColor: '#1a1a1a',
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    zIndex: 2,
  },
  navIndicator: {
    position: 'absolute',
    width: '33%',
    height: '83%',
    backgroundColor: '#007bff',
    borderRadius: 25,
    margin: 5,
    zIndex: 1,
  },
  navText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  darkNavText: {
    color: '#ccc',
  },
  activeNavText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  bannerContainer: {
    height: '15%',
    width: '100%',
    backgroundColor: '#ededed',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    bottom: "8%",
    borderColor: '#ccc',
  },
  darkBannerContainer: {
    backgroundColor: '#222',
  },
  bannerText: {
    fontSize: 16,
    color: '#555',
  },
});