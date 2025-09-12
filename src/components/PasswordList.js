import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

const PasswordList = ({ passwords, onShowDetails, onCopy }) => {
  const [visibleItems, setVisibleItems] = useState({});

  const authenticateAndShow = async (index) => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert('Ошибка', 'Устройство не поддерживает биометрическую аутентификацию');
        return;
      }
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert('Ошибка', 'Установите биометрическую аутентификацию на устройстве');
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Подтвердите личность для показа данных',
        fallbackLabel: 'Использовать пароль',
      });
      if (result.success) {
        setVisibleItems((prev) => ({ ...prev, [index]: true }));
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выполнить аутентификацию');
    }
  };

  return (
    <ScrollView style={styles.table}>
      {passwords.map((item, index) => {
        const visible = !!visibleItems[index];
        return (
          <View key={index} style={styles.row}>
            <TouchableOpacity style={[styles.cell, { flex: 0.7 }]}>
              <Text style={styles.serviceText}>{item.site}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cell, { flex: 1 }]}
              onPress={() => {
                if (visible) {
                  onCopy(item.email, 'Email');
                } else {
                  authenticateAndShow(index);
                }
              }}
            >
              <Text style={styles.copyableText}>
                {visible ? item.email : '*********'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cell, { flex: 1 }]}
              onPress={() => {
                if (visible) {
                  onCopy(item.password, 'Пароль');
                } else {
                  authenticateAndShow(index);
                }
              }}
            >
              <Text style={styles.copyableText}>
                {visible ? item.password : '*********'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => onShowDetails(item, index)}
            >
              <Text style={styles.infoButtonText}>Подробнее</Text>
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
  },
  row: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  cell: {
    padding: 6,
  },
  copyableText: {
    color: '#007bff',
    fontSize: 12,
  },
  serviceText: {
    color: '#000000ff',
    fontWeight: 'bold',
  },
  infoButton: {
    padding: 2,
    borderRadius: 5,
    flex: 1.2,
  },
  infoButtonText: {
    color: '#007bff',
    textAlign: 'center',
    fontWeight: 700,
  },
});

export default PasswordList;
