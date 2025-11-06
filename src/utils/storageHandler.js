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

const encryptData = async (data) => {
  try {
    const key = await getEncryptionKey();
    const dataString = JSON.stringify(data);
    const iv = Crypto.getRandomBytes(16);
    
    const encrypted = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      dataString + key
    );
    
    return {
      encrypted: encrypted,
      iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('')
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
};

const decryptData = async (encryptedData) => {
  try {
    if (!encryptedData || !encryptedData.encrypted) {
      return [];
    }
    
    const key = await getEncryptionKey();
    
    try {
      const decrypted = JSON.parse(encryptedData.encrypted);
      return decrypted;
    } catch {
      return [];
    }
  } catch (error) {
    console.error('Decryption error:', error);
    return [];
  }
};

export const savePasswordsToStorage = async (passwords) => {
  try {
    const encryptedData = await encryptData(passwords);
    await AsyncStorage.setItem('passwords', JSON.stringify(encryptedData));
  } catch (e) {
    console.error('Ошибка сохранения', e);
    try {
      await AsyncStorage.setItem('passwords', JSON.stringify(passwords));
    } catch (fallbackError) {
      console.error('Fallback save error:', fallbackError);
    }
  }
};

export const loadPasswordsFromStorage = async () => {
  try {
    const saved = await AsyncStorage.getItem('passwords');
    if (saved) {
      const encryptedData = JSON.parse(saved);
      return await decryptData(encryptedData);
    }
    return [];
  } catch (e) {
    console.error('Ошибка загрузки', e);
    try {
      const saved = await AsyncStorage.getItem('passwords');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (fallbackError) {
      console.error('Fallback load error:', fallbackError);
    }
    return [];
  }
};

export const clearAllData = async () => {
  try {
    await AsyncStorage.removeItem('passwords');
    await AsyncStorage.removeItem('encryption_key');
  } catch (e) {
    console.error('Ошибка очистки данных', e);
  }
};