import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
const PasswordList = ({
  passwords,
  onShowDetails,
  onCopy,
  isDarkTheme = false,
  language = 'ru',
}) => {
  const [visibleItems, setVisibleItems] = useState({});
  const authenticateAndShow = async (index) => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert(language === 'ru' ? 'Ошибка' : 'Error', language === 'ru' ? 'Устройство не поддерживает биометрическую аутентификацию' : 'Device does not support biometric authentication');
        return;
      }
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert(language === 'ru' ? 'Ошибка' : 'Error', language === 'ru' ? 'Установите биометрическую аутентификацию на устройстве' : 'Please set up biometric authentication on your device');
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: language === 'ru' ? 'Подтвердите личность для показа данных' : 'Authenticate to show data',
        fallbackLabel: language === 'ru' ? 'Использовать пароль' : 'Use Password',
      });
      if (result.success) {
        setVisibleItems(prev => ({ ...prev, [index]: true }));
      }
    } catch (error) {
      Alert.alert(language === 'ru' ? 'Ошибка' : 'Error', language === 'ru' ? 'Не удалось выполнить аутентификацию' : 'Failed to authenticate');
    }
  };
  return (
    <ScrollView style={[styles.table, isDarkTheme && styles.darkTable]}>
      {passwords.map((item, index) => {
        const visible = !!visibleItems[index];
        return (
          <View key={index} style={[styles.row, isDarkTheme && styles.darkRow]}>
            <TouchableOpacity style={[styles.cell, { flex: 0.7 }]}>
              <Text style={[styles.serviceText, isDarkTheme && styles.darkText]}>{item.site}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cell, { flex: 1 }]}
              onPress={() => {
                if (visible) {
                  onCopy(item.email, language === 'ru' ? 'Email' : 'Email');
                } else {
                  authenticateAndShow(index);
                }
              }}
            >
              <Text style={[styles.copyableText, isDarkTheme && styles.darkText]}>
                {visible ? item.email : '*********'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cell, { flex: 1 }]}
              onPress={() => {
                if (visible) {
                  onCopy(item.password, language === 'ru' ? 'Пароль' : 'Password');
                } else {
                  authenticateAndShow(index);
                }
              }}
            >
              <Text style={[styles.copyableText, isDarkTheme && styles.darkText]}>
                {visible ? item.password : '*********'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => onShowDetails(item, index)}
            >
              <Text style={[styles.infoButtonText, isDarkTheme && styles.darkText1]}>
                {language === 'ru' ? 'Подробнее' : 'Details'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  table: {
    flex: 1,
    marginTop: 10,
    backgroundColor: '#fff',
  },
  darkTable: {
    backgroundColor: '#2a2727ff',
  },
  row: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  darkRow: {
    borderBottomColor: '#333',
  },
  cell: {
    padding: 6,
    alignItems: 'center',
  },
  copyableText: {
    color: '#007bff',
    fontSize: 12,
  },
  serviceText: {
    color: '#000000ff',
    fontWeight: 'bold',
  },
  darkText: {
    color: '#eee',
  },
  darkText1: {
    color: '#007bff',
  },
  infoButton: {
    padding: 2,
    borderRadius: 5,
    flex: 1.2,
  },
  infoButtonText: {
    color: '#007bff',
    textAlign: 'center',
    fontWeight: '700',
  },
});
export default PasswordList;