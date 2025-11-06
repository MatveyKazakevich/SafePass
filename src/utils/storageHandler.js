import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from 'expo-crypto';

const ENCRYPTION_KEY = 'your-secure-encryption-key-32-chars';

const getEncryptionKey = async () => {
  try {
    let key = await AsyncStorage.getItem('encryption_key');
    if (!key) {
      key = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        ENCRYPTION_KEY + Date.now().toString()
      );
      await AsyncStorage.setItem('encryption_key', key);
    }
    return key.substring(0, 32);
  } catch (error) {
    console.error('Error getting encryption key:', error);
    return ENCRYPTION_KEY;
  }
};

const getDataType = (data) => {
  if (typeof data === 'string') {
    try {
      JSON.parse(data);
      return 'old_unencrypted';
    } catch (e) {
      return 'encrypted';
    }
  } else if (data && data.encrypted) {
    return 'new_encrypted';
  }
  return 'unknown';
};

const encryptData = async (data) => {
  try {
    console.log('Шифрование данных:', data.length, 'записей');
    const key = await getEncryptionKey();
    const dataString = JSON.stringify(data);
    
    let encrypted = '';
    for (let i = 0; i < dataString.length; i++) {
      const keyChar = key.charCodeAt(i % key.length);
      const dataChar = dataString.charCodeAt(i);
      encrypted += String.fromCharCode(dataChar ^ keyChar);
    }
    
    const base64Encoded = btoa(encrypted);
    
    return {
      encrypted: base64Encoded,
      iv: 'simple-iv',
      version: '1.0'
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
};

const decryptData = async (encryptedData) => {
  try {
    console.log('Дешифрование данных, тип:', typeof encryptedData);
    
    if (!encryptedData) {
      console.log('Нет данных для дешифрования');
      return [];
    }
    
    const dataType = getDataType(encryptedData);
    console.log('Тип данных:', dataType);
    
    if (dataType === 'old_unencrypted') {
      console.log('Обнаружены старые данные без шифрования');
      try {
        const oldData = JSON.parse(encryptedData);
        console.log('Загружено старых данных:', oldData.length, 'записей');
        
        console.log('Миграция старых данных в зашифрованный формат...');
        await savePasswordsToStorage(oldData);
        console.log('Миграция завершена');
        
        return oldData;
      } catch (e) {
        console.error('Ошибка загрузки старых данных:', e);
        return [];
      }
    }
    
    if (dataType === 'new_encrypted' && encryptedData.encrypted) {
      console.log('Обнаружены новые зашифрованные данные');
      const key = await getEncryptionKey();
      const base64Encoded = encryptedData.encrypted;
      
      try {
        const encrypted = atob(base64Encoded);
        
        let decrypted = '';
        for (let i = 0; i < encrypted.length; i++) {
          const keyChar = key.charCodeAt(i % key.length);
          const encryptedChar = encrypted.charCodeAt(i);
          decrypted += String.fromCharCode(encryptedChar ^ keyChar);
        }
        
        const parsedData = JSON.parse(decrypted);
        console.log('Успешно дешифровано:', parsedData.length, 'записей');
        return parsedData;
        
      } catch (parseError) {
        console.error('Ошибка дешифрования новых данных:', parseError);
        return [];
      }
    }
    
    console.log('Неизвестный формат данных');
    return [];
    
  } catch (error) {
    console.error('Decryption error:', error);
    return [];
  }
};

export const savePasswordsToStorage = async (passwords) => {
  try {
    console.log('Сохранение паролей:', passwords.length, 'записей');
    const encryptedData = await encryptData(passwords);
    await AsyncStorage.setItem('passwords', JSON.stringify(encryptedData));
    console.log('Пароли успешно сохранены и зашифрованы');
  } catch (e) {
    console.error('Ошибка сохранения с шифрованием', e);
    try {
      await AsyncStorage.setItem('passwords', JSON.stringify(passwords));
      console.log('Пароли сохранены без шифрования (fallback)');
    } catch (fallbackError) {
      console.error('Fallback save error:', fallbackError);
    }
  }
};

export const loadPasswordsFromStorage = async () => {
  try {
    console.log('=== НАЧАЛО ЗАГРУЗКИ ПАРОЛЕЙ ===');
    const saved = await AsyncStorage.getItem('passwords');
    console.log('Данные из хранилища:', saved ? 'ЕСТЬ' : 'НЕТ');
    
    if (!saved) {
      console.log('Нет сохраненных паролей');
      return [];
    }
    
    console.log('Пробуем определить формат данных...');
    try {
      const parsedData = JSON.parse(saved);
      console.log('Данные успешно распарсены как JSON');
      const passwords = await decryptData(parsedData);
      console.log('=== ЗАГРУЗКА ЗАВЕРШЕНА ===');
      console.log('Загружено паролей:', passwords.length);
      return passwords;
    } catch (parseError) {
      console.log('Не удалось распарсить как JSON, пробуем как старые данные...');
      const passwords = await decryptData(saved);
      console.log('=== ЗАГРУЗКА ЗАВЕРШЕНА ===');
      console.log('Загружено паролей:', passwords.length);
      return passwords;
    }
    
  } catch (e) {
    console.error('Ошибка загрузки', e);
    return [];
  }
};

export const forceMigrateData = async () => {
  try {
    const saved = await AsyncStorage.getItem('passwords');
    if (saved) {
      console.log('Принудительная миграция данных...');
      await AsyncStorage.removeItem('passwords');
      console.log('Старые данные очищены, можно добавлять новые');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Ошибка миграции:', error);
    return false;
  }
};