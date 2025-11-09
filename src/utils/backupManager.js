import * as LegacyFileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Crypto from 'expo-crypto';
import * as DocumentPicker from 'expo-document-picker';

const BACKUP_KEY = 'safe-pass-backup-key-2024';

const encryptBackup = async (data) => {
  try {
    const dataString = JSON.stringify(data);
    let encrypted = '';
    
    for (let i = 0; i < dataString.length; i++) {
      const keyChar = BACKUP_KEY.charCodeAt(i % BACKUP_KEY.length);
      const dataChar = dataString.charCodeAt(i);
      encrypted += String.fromCharCode(dataChar ^ keyChar);
    }
    
    return btoa(encrypted);
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
};

const decryptBackup = async (encryptedData) => {
  try {
    const encrypted = atob(encryptedData);
    let decrypted = '';
    
    for (let i = 0; i < encrypted.length; i++) {
      const keyChar = BACKUP_KEY.charCodeAt(i % BACKUP_KEY.length);
      const encryptedChar = encrypted.charCodeAt(i);
      decrypted += String.fromCharCode(encryptedChar ^ keyChar);
    }
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
};

export const exportToEncrypted = async (passwords, language = 'ru') => {
  try {
    console.log('Экспорт в зашифрованный формат:', passwords.length, 'записей');
    
    const encryptedData = await encryptBackup(passwords);
    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      count: passwords.length,
      data: encryptedData
    };
    const fileName = `SafePass_Backup_${new Date().toISOString().split('T')[0]}.safepass`;
    const fileUri = LegacyFileSystem.documentDirectory + fileName;
    await LegacyFileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData));
    console.log('Зашифрованный файл создан:', fileUri);
    return fileUri;
  } catch (error) {
    console.error('Encrypted export error:', error);
    throw new Error(`Ошибка экспорта: ${error.message}`);
  }
};

export const importFromEncrypted = async (fileUri) => {
  try {
    console.log('Импорт из зашифрованного файла:', fileUri);
    const fileContent = await LegacyFileSystem.readAsStringAsync(fileUri);
    const backupData = JSON.parse(fileContent);
    if (!backupData.data || !backupData.version) {
      throw new Error('Неверный формат файла бэкапа');
    }
    const passwords = await decryptBackup(backupData.data);
    console.log('Успешно импортировано:', passwords.length, 'записей');
    return passwords;
  } catch (error) {
    console.error('Encrypted import error:', error);
    throw new Error(`Ошибка импорта из зашифрованного файла: ${error.message}`);
  }
};

export const importFromCSV = async (fileUri) => {
  try {
    console.log('Импорт из CSV:', fileUri);
    const fileContent = await LegacyFileSystem.readAsStringAsync(fileUri);
    const lines = fileContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV файл пустой или неверный формат');
    }
    const passwords = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const columns = line.split(',').map(col => {
        let value = col.trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1).replace(/""/g, '"');
        }
        return value;
      });
      
      if (columns.length >= 3) {
        const [site, email, password] = columns;
        if (site && email && password) {
          passwords.push({ 
            site: site || 'Неизвестный сервис', 
            email: email || '', 
            password: password || '' 
          });
        }
      }
    }
    
    console.log('Успешно импортировано из CSV:', passwords.length, 'записей');
    return passwords;
  } catch (error) {
    console.error('CSV import error:', error);
    throw new Error(`Ошибка импорта из CSV: ${error.message}`);
  }
};

export const shareFile = async (fileUri) => {
  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        UTI: 'public.json'
      });
    } else {
      throw new Error('Шеринг недоступен на этом устройстве');
    }
  } catch (error) {
    console.error('Share error:', error);
    throw error;
  }
};

export const pickFileForImport = async () => {
  try {
    console.log('Выбор файла для импорта...');
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    console.log('Результат выбора файла:', result);
    
    if (result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      console.log('Информация о файле:', {
        name: file.name,
        size: file.size,
        uri: file.uri,
        mimeType: file.mimeType
      });
      return file;
    }
    
    return null;
  } catch (error) {
    console.error('File pick error:', error);
    throw new Error(`Ошибка выбора файла: ${error.message}`);
  }
};

export const getFileType = (fileName) => {
  if (!fileName) {
    console.log('Имя файла не определено');
    return 'unknown';
  }
  
  console.log('Проверка типа файла:', fileName);
  
  if (fileName.endsWith('.safepass')) {
    console.log('Обнаружен зашифрованный файл');
    return 'encrypted';
  } else if (fileName.endsWith('.csv')) {
    console.log('Обнаружен CSV файл');
    return 'csv';
  } else {
    console.log('Неизвестный тип файла:', fileName);
    return 'unknown';
  }
};

export const importFromFile = async (fileUri, fileName) => {
  try {
    console.log('🔄 Универсальный импорт файла:', fileName);
    
    const fileType = getFileType(fileName);
    
    switch (fileType) {
      case 'encrypted':
        return await importFromEncrypted(fileUri);
      case 'csv':
        return await importFromCSV(fileUri);
      default:
        console.log('Автоматическое определение типа файла...');
        const fileContent = await LegacyFileSystem.readAsStringAsync(fileUri);
        try {
          const jsonData = JSON.parse(fileContent);
          if (jsonData.data && jsonData.version) {
            console.log('Автоопределение: зашифрованный формат');
            return await importFromEncrypted(fileUri);
          }
        } catch (jsonError) {
          console.log('Автоопределение: пробуем как CSV');
          return await importFromCSV(fileUri);
        }
        
        throw new Error('Не удалось определить формат файла');
    }
  } catch (error) {
    console.error('Universal import error:', error);
    throw error;
  }
};