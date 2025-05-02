// frontend/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import translationEN from './translations/en.json';
import translationRU from './translations/ru.json';

// Language resources
const resources = {
  en: {
    translation: translationEN
  },
  ru: {
    translation: translationRU
  }
};

// Language detector to use saved language from AsyncStorage
const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      // Get stored language from AsyncStorage
      const storedLanguage = await AsyncStorage.getItem('@oral_care_language');
      // Use stored language or default to device language or English
      const language = storedLanguage || 'en';
      callback(language);
    } catch (error) {
      console.log('Error detecting language:', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language) => {
    try {
      // Save selected language to AsyncStorage
      await AsyncStorage.setItem('@oral_care_language', language);
    } catch (error) {
      console.log('Error caching language:', error);
    }
  }
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    compatibilityJSON: 'v3', // For compatibility with Android
    interpolation: {
      escapeValue: false // React already escapes values
    },
    react: {
      useSuspense: false // Disable suspense in React
    }
  });

export default i18n;