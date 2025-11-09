import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as BackupManager from '../utils/backupManager';

const SettingsPage = ({
  isDarkTheme,
  setIsDarkTheme,
  language,
  setLanguage,
  passwords,
  onImportPasswords,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const texts = {
    backup: language === 'ru' ? 'Резервное копирование' : 'Backup & Restore',
    exportData: language === 'ru' ? 'Экспорт данных' : 'Export Data',
    importData: language === 'ru' ? 'Импорт данных' : 'Import Data',
    cancel: language === 'ru' ? 'Отмена' : 'Cancel',
    exporting: language === 'ru' ? 'Экспорт...' : 'Exporting...',
    importing: language === 'ru' ? 'Импорт...' : 'Importing...',
    successExport: language === 'ru' ? 'Данные успешно экспортированы' : 'Data exported successfully',
    successImport: language === 'ru' ? 'Данные успешно импортированы' : 'Data imported successfully',
    errorExport: language === 'ru' ? 'Ошибка экспорта' : 'Export error',
    errorImport: language === 'ru' ? 'Ошибка импорта' : 'Import error',
    noData: language === 'ru' ? 'Нет данных для экспорта' : 'No data to export',
    confirmImport: language === 'ru' ? 'Импортировать данные?' : 'Import data?',
    importWarning: language === 'ru' ? 'Существующие данные будут заменены' : 'Existing data will be replaced',
    backupSection: language === 'ru' ? 'Управление данными' : 'Data Management',
    exportDescription: language === 'ru' ? 'Создать зашифрованную резервную копию' : 'Create encrypted backup',
    importDescription: language === 'ru' ? 'Загрузить данные из резервной копии' : 'Load data from backup',
  };

  const handleExport = async () => {
    if (passwords.length === 0) {
      Alert.alert(texts.errorExport, texts.noData);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Начало экспорта...');
      const fileUri = await BackupManager.exportToEncrypted(passwords, language);
      console.log('Файл создан, делимся...');
      await BackupManager.shareFile(fileUri);
      Alert.alert(
        texts.successExport, 
        language === 'ru' ? 
          `Экспортировано ${passwords.length} записей в зашифрованном формате` : 
          `Exported ${passwords.length} records in encrypted format`
      );
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      Alert.alert(texts.errorExport, error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    setIsLoading(true);
    try {
      console.log('Начало импорта...');
      const fileResult = await BackupManager.pickFileForImport();
      
      if (!fileResult) {
        console.log('Файл не выбран');
        setIsLoading(false);
        return;
      }

      console.log('Выбран файл:', fileResult.name, fileResult.uri);

      Alert.alert(
        texts.confirmImport,
        texts.importWarning,
        [
          { 
            text: language === 'ru' ? 'Отмена' : 'Cancel', 
            style: 'cancel' 
          },
          {
            text: 'OK',
            onPress: async () => {
              try {
                const importedPasswords = await BackupManager.importFromFile(
                  fileResult.uri, 
                  fileResult.name
                );

                if (importedPasswords.length > 0) {
                  console.log('Импорт успешен:', importedPasswords.length, 'записей');
                  onImportPasswords(importedPasswords);
                  Alert.alert(
                    texts.successImport,
                    language === 'ru' ? 
                      `Импортировано ${importedPasswords.length} записей` : 
                      `Imported ${importedPasswords.length} records`
                  );
                } else {
                  console.log('Импорт не удался: нет данных');
                  Alert.alert(
                    texts.errorImport, 
                    language === 'ru' ? 
                    'Не удалось импортировать данные из файла' : 
                    'Failed to import data from file'
                  );
                }
              } catch (error) {
                console.error('Ошибка импорта:', error);
                Alert.alert(
                  texts.errorImport, 
                  language === 'ru' ? 
                  `Ошибка импорта: ${error.message}\n\nУбедитесь что файл создан в этом приложении.` : 
                  `Import error: ${error.message}\n\nMake sure the file was created in this app.`
                );
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Ошибка выбора файла:', error);
      Alert.alert(texts.errorImport, error.message);
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, isDarkTheme && styles.darkContainer]}>
      <View style={styles.content}>
        <Text style={[styles.title, isDarkTheme && styles.darkText]}>
          {language === 'ru' ? 'Настройки' : 'Settings'}
        </Text>
        <View style={[styles.section, isDarkTheme && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkTheme && styles.darkText]}>
            {language === 'ru' ? 'Внешний вид' : 'Appearance'}
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
        </View>
        <View style={[styles.section, isDarkTheme && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkTheme && styles.darkText]}>
            {texts.backupSection}
          </Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007bff" />
              <Text style={[styles.loadingText, isDarkTheme && styles.darkText]}>
                {texts.exporting}
              </Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.backupButton, styles.exportButton]}
                onPress={handleExport}
                disabled={passwords.length === 0}
              >
                <Text style={styles.backupButtonText}>{texts.exportData}</Text>
              </TouchableOpacity>
              <Text style={[styles.backupDescription, isDarkTheme && styles.darkText]}>
                {texts.exportDescription}
              </Text>

              <TouchableOpacity
                style={[styles.backupButton, styles.importButton]}
                onPress={handleImport}
              >
                <Text style={styles.backupButtonText}>{texts.importData}</Text>
              </TouchableOpacity>
              <Text style={[styles.backupDescription, isDarkTheme && styles.darkText]}>
                {texts.importDescription}
              </Text>

              <Text style={[styles.backupInfo, isDarkTheme && styles.darkText]}>
                {language === 'ru' 
                  ? `Всего паролей: ${passwords.length}` 
                  : `Total passwords: ${passwords.length}`
                }
              </Text>
            </>
          )}
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
  sectionDark:{
    backgroundColor: '#333',
  },
  section: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  languageButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    minWidth: 100,
    alignItems: 'center',
  },
  darkLanguageButton: {
    backgroundColor: '#4c4a4aff',
  },
  languageButtonText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  backupButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  exportButton: {
    backgroundColor: '#007bff',
  },
  importButton: {
    backgroundColor: '#28a745',
  },
  backupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  backupDescription: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 15,
    color: '#666',
    fontStyle: 'italic',
  },
  backupInfo: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000',
  },
  infoSection: {
    marginTop: 10,
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
    marginBottom: 10,
    textAlign: 'center',
    color: '#000',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    color: '#666',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default SettingsPage;