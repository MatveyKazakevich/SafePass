import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';

export const checkBiometricSupport = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  
  return {
    isSupported: hasHardware && isEnrolled,
    hasHardware,
    isEnrolled
  };
};

export const hashData = async (data) => {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    data
  );
};

export const getSecureRandom = (min, max) => {
  const randomBytes = Crypto.getRandomBytes(4);
  const randomValue = (randomBytes[0] << 24) | 
                     (randomBytes[1] << 16) | 
                     (randomBytes[2] << 8) | 
                     randomBytes[3];
  return min + (randomValue % (max - min + 1));
};

export const checkPasswordLeak = async (password) => {
  const passwordHash = await hashData(password);
  return false; 
};