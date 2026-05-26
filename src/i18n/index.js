/**
 * i18n setup for MiroLang.
 *
 * UI language is decoupled from content language pair (e.g. RU→EN word data).
 * - i18n is initialised synchronously at module load with English defaults,
 *   so any component that calls useTranslation in its first render works
 *   without a "not initialised" warning.
 * - On app boot, `resolveAppLocale()` picks the right locale (stored override
 *   → device locale → English) and applies it via changeLanguage, which
 *   triggers a re-render through react-i18next.
 * - User can override via the language picker in AccountSettings; choice
 *   persists to AsyncStorage.
 */

import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {getLocales} from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ru from './locales/ru.json';
import en from './locales/en.json';

export const SUPPORTED_LOCALES = ['en', 'ru'];
export const DEFAULT_LOCALE = 'en';
const STORAGE_KEY = 'app.locale';

// Synchronous init — uses English first; the real locale is applied below.
i18n.use(initReactI18next).init({
  resources: {
    en: {translation: en},
    ru: {translation: ru},
  },
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  interpolation: {escapeValue: false},
  returnEmptyString: false,
  compatibilityJSON: 'v4',
});

/** Pick the best initial locale: stored override → device locale → default. */
async function resolveAppLocale() {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LOCALES.includes(saved)) return saved;
  } catch {}
  try {
    const deviceLocales = getLocales();
    for (const {languageCode} of deviceLocales) {
      if (SUPPORTED_LOCALES.includes(languageCode)) return languageCode;
    }
  } catch {}
  return DEFAULT_LOCALE;
}

/**
 * Resolve and apply the user-preferred locale.
 * Call once at app startup. Safe to await; it does not block i18n itself
 * (i18n is already initialised by the time this runs).
 */
export async function initI18n() {
  const lng = await resolveAppLocale();
  if (lng !== i18n.language) {
    await i18n.changeLanguage(lng);
  }
  return lng;
}

/** Change app language at runtime and persist the choice. */
export async function setAppLocale(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) return;
  await i18n.changeLanguage(locale);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, locale);
  } catch {}
}

export default i18n;
