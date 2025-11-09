import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as BackupManager from '../utils/backupManager';

const BackupModal = ({
  visible,
  onClose,
  passwords,
  onImport,
  isDarkTheme = false,
  language = 'ru',
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const texts = {
    title: language === 'ru' ? 'Резервное копирование' : 'Backup & Restore',
    exportCSV: language === 'ru' ? 'Экспорт в CSV' : 'Export to CSV',
    exportEncrypted: language === 'ru' ? 'Экспорт (зашифрованный)' : 'Export (Encrypted)',
    importData: language === 'ru' ? 'Импорт данных' : 'Import Data',
    cancel: language === 'ru' ? 'Отмена' : 'Cancel',
    exporting: language === 'ru' ? 'Экспорт...' : 'Exporting...',
    importing: language === 'ru' ? 'Импорт...' : 'Importing...',
    successExport: language === 'ru' ? 'Данные успешно экспортированы' : 'Data exported successfully',
    successImport: language === 'ru' ? 'Данные успешно импортированы' : 'Data imported successfully',
    errorExport: language === 'ru' ? 'Ошибка экспорта' : 'Export error',
    errorImport: language === 'ru' ? 'Ошибка импорта' : 'Import error',
    confirmImport: language === 'ru' ? 'Импортировать данные?' : 'Import data?',
    importWarning: language === 'ru' ? 'Существующие данные будут заменены' : 'Existing data will be replaced',
  };

  const handleExportCSV = async () => {
    if (passwords.length === 0) {
      Alert.alert(texts.errorExport, language === 'ru' ? 'Нет данных для экспорта' : 'No data to export');
      return;
    }

    setIsLoading(true);
    try {
      const fileUri = await BackupManager.exportToCSV(passwords, language);
      await BackupManager.shareFile(fileUri);
      Alert.alert(texts.successExport, language === 'ru' ? 
        `Экспортировано ${passwords.length} записей` : 
        `Exported ${passwords.length} records`
      );
    } catch (error) {
      Alert.alert(texts.errorExport, error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportEncrypted = async () => {
    if (passwords.length === 0) {
      Alert.alert(texts.errorExport, language === 'ru' ? 'Нет данных для экспорта' : 'No data to export');
      return;
    }

    setIsLoading(true);
    try {
      const fileUri = await BackupManager.exportToEncrypted(passwords, language);
      await BackupManager.shareFile(fileUri);
      Alert.alert(texts.successExport, language === 'ru' ? 
        `Экспортировано ${passwords.length} записей в зашифрованном формате` : 
        `Exported ${passwords.length} records in encrypted format`
      );
    } catch (error) {
      Alert.alert(texts.errorExport, error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    setIsLoading(true);
    try {
      const fileResult = await BackupManager.pickFileForImport();
      
      if (!fileResult) {
        setIsLoading(false);
        return;
      }

      Alert.alert(
        texts.confirmImport,
        texts.importWarning,
        [
          { text: texts.cancel, style: 'cancel' },
          {
            text: 'OK',
            onPress: async () => {
              try {
                let importedPasswords = [];
                const fileType = BackupManager.getFileType(fileResult.name);
                
                if (fileType === 'encrypted') {
                  importedPasswords = await BackupManager.importFromEncrypted(fileResult.uri);
                } else if (fileType === 'csv' || fileResult.name.endsWith('.csv')) {
                  importedPasswords = await BackupManager.importFromCSV(fileResult.uri);
                } else {
                  throw new Error(language === 'ru' ? 
                    'Неподдерживаемый формат файла' : 
                    'Unsupported file format'
                  );
                }

                if (importedPasswords.length > 0) {
                  onImport(importedPasswords);
                  Alert.alert(
                    texts.successImport,
                    language === 'ru' ? 
                      `Импортировано ${importedPasswords.length} записей` : 
                      `Imported ${importedPasswords.length} records`
                  );
                  onClose();
                } else {
                  Alert.alert(texts.errorImport, language === 'ru' ? 
                    'Не удалось импортировать данные' : 
                    'Failed to import data'
                  );
                }
              } catch (error) {
                Alert.alert(texts.errorImport, error.message);
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert(texts.errorImport, error.message);
      setIsLoading(false);
    }
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, isDarkTheme && styles.darkModalContent]}>
          <Text style={[styles.modalTitle, isDarkTheme && styles.darkText]}>
            {texts.title}
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
                style={[styles.button, styles.exportButton]}
                onPress={handleExportCSV}
                disabled={passwords.length === 0}
              >
                <Text style={styles.buttonText}>{texts.exportCSV}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.exportButton]}
                onPress={handleExportEncrypted}
                disabled={passwords.length === 0}
              >
                <Text style={styles.buttonText}>{texts.exportEncrypted}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.importButton]}
                onPress={handleImport}
              >
                <Text style={styles.buttonText}>{texts.importData}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>{texts.cancel}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
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
    padding: 20,
    borderRadius: 10,
    width: '85%',
    alignItems: 'center',
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
    color: '#fff',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  exportButton: {
    backgroundColor: '#007bff',
  },
  importButton: {
    backgroundColor: '#28a745',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000',
  },
});

export default BackupModal;