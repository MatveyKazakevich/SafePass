import * as Crypto from 'expo-crypto';

export const generatePassword = (length = 16, options = {}) => {
  const {
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true
  } = options;

  let chars = '';
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (uppercase) chars += uppercaseChars;
  if (lowercase) chars += lowercaseChars;
  if (numbers) chars += numberChars;
  if (symbols) chars += symbolChars;

  if (chars.length === 0) {
    chars = uppercaseChars + lowercaseChars + numberChars;
  }

  const randomBytes = Crypto.getRandomBytes(length * 2);
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomValue = randomBytes[i] % chars.length;
    password += chars.charAt(randomValue);
  }

  if (uppercase && !/[A-Z]/.test(password)) {
    const randomIndex = Math.floor(Math.random() * length);
    password = password.substring(0, randomIndex) + 
               uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length)) + 
               password.substring(randomIndex + 1);
  }

  if (lowercase && !/[a-z]/.test(password)) {
    const randomIndex = Math.floor(Math.random() * length);
    password = password.substring(0, randomIndex) + 
               lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length)) + 
               password.substring(randomIndex + 1);
  }

  if (numbers && !/[0-9]/.test(password)) {
    const randomIndex = Math.floor(Math.random() * length);
    password = password.substring(0, randomIndex) + 
               numberChars.charAt(Math.floor(Math.random() * numberChars.length)) + 
               password.substring(randomIndex + 1);
  }

  if (symbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    const randomIndex = Math.floor(Math.random() * length);
    password = password.substring(0, randomIndex) + 
               symbolChars.charAt(Math.floor(Math.random() * symbolChars.length)) + 
               password.substring(randomIndex + 1);
  }

  return password;
};

export const checkPasswordStrength = (password) => {
  let score = 0;

  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;
  
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  if (!/(.)\1{2,}/.test(password)) score += 1;
  if (!/(123|abc|password|qwerty)/i.test(password)) score += 1; 
  
  if (score >= 6) return { strength: 'strong', score };
  if (score >= 4) return { strength: 'medium', score };
  return { strength: 'weak', score };
};

export const generatePassphrase = (wordCount = 4) => {
  const words = [
    'apple', 'brave', 'cloud', 'dragon', 'eagle', 'flame', 'globe', 'heart',
    'ice', 'jewel', 'king', 'light', 'mountain', 'night', 'ocean', 'peace',
    'queen', 'river', 'star', 'tree', 'unity', 'victory', 'water', 'xray',
    'year', 'zenith'
  ];
  
  let passphrase = '';
  const randomBytes = Crypto.getRandomBytes(wordCount * 2);
  
  for (let i = 0; i < wordCount; i++) {
    const randomIndex = randomBytes[i] % words.length;
    passphrase += words[randomIndex];
    if (i < wordCount - 1) passphrase += '-';
  }
  
  const randomNum = Math.floor(Math.random() * 100);
  passphrase += randomNum;
  
  return passphrase;
};