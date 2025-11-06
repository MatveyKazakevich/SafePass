import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
} from 'react-native';

const SettingsPage = ({
  isDarkTheme,
  setIsDarkTheme,
  language,
  setLanguage,
}) => {
  return (
    <ScrollView style={[styles.container, isDarkTheme && styles.darkContainer]}>
      <View style={styles.content}>
        <Text style={[styles.title, isDarkTheme && styles.darkText]}>
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
          <TouchableOpacity 
            style={[styles.languageButton, isDarkTheme && styles.darkLanguageButton]}
            onPress={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
          >
            <Text style={[styles.languageButtonText, isDarkTheme && styles.darkText]}>
              {language === 'ru' ? 'Русский' : 'English'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.infoSection, isDarkTheme && styles.darkInfoSection]}>
          <Text style={[styles.infoTitle, isDarkTheme && styles.darkText]}>
            {language === 'ru' ? 'О приложении' : 'About App'}
          </Text>
          <Text style={[styles.infoText, isDarkTheme && styles.darkText]}>
            {language === 'ru' 
              ? 'SafePass - безопасное хранение паролей' 
              : 'SafePass - secure password storage'
            }
          </Text>
          <Text style={[styles.versionText, isDarkTheme && styles.darkText]}>
            Version 1.0.0
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#2a2727ff',
  },
  content: {
    padding: 20,
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    color: '#000',
  },
  languageButton: {
    paddingHorizontal: '5%',
    paddingVertical: '3%',
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
  },
  darkLanguageButton: {
    backgroundColor: '#333',
  },
  languageButtonText: {
    fontSize: 14,
    color: '#007bff',
  },
  infoSection: {
    marginTop: '10%',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
  },
  darkInfoSection: {
    backgroundColor: '#333',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 'auto',
    marginBottom: 10,
    color: '#000',
  },
  infoText: {
    fontSize: 14,
    marginBottom: '5%',
    marginHorizontal: 'auto',
    color: '#666',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default SettingsPage;