import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import es from './locales/es.json';
import en from './locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { es: { translation: es }, en: { translation: en } },
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'habitteam_lang',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  });

// Default any non-Spanish browser language to English
const detected = i18n.language?.split('-')[0];
if (detected !== 'es') i18n.changeLanguage('en');

export default i18n;
