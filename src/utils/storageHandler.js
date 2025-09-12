import AsyncStorage from "@react-native-async-storage/async-storage";

export const savePasswordsToStorage = async (passwords) => {
    try {
        await AsyncStorage.setItem('passwords', JSON.stringify(passwords));
    } catch (e) {
        console.error('Ошибка сохранения', e);
    }
};
