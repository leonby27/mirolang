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

import {useEffect, useState} from 'react';
import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {getLocales} from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ru from './locales/ru.json';
import en from './locales/en.json';

export const SUPPORTED_LOCALES = ['en', 'ru'];
export const DEFAULT_LOCALE = 'en';
const STORAGE_KEY = 'app.locale';

// Content language = the user's native language we translate English words
// INTO (the "ru" field in current src/data.js, "de" field in src/data/de.js,
// etc). Separate from UI language so a German speaker can keep the app in
// English but still get German word translations.
export const SUPPORTED_CONTENT_LANGUAGES = ['ru', 'de'];
export const DEFAULT_CONTENT_LANGUAGE = 'ru';
const CONTENT_STORAGE_KEY = 'app.contentLanguage';
let currentContentLanguage = DEFAULT_CONTENT_LANGUAGE;
const contentLanguageListeners = new Set();

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
  await loadContentLanguage();
  return lng;
}

async function loadContentLanguage() {
  let next = DEFAULT_CONTENT_LANGUAGE;
  try {
    const saved = await AsyncStorage.getItem(CONTENT_STORAGE_KEY);
    if (saved && SUPPORTED_CONTENT_LANGUAGES.includes(saved)) {
      next = saved;
    }
  } catch {}
  // First launch: default to RU (existing behaviour). When other source
  // languages exist, callers can decide whether to seed from device locale.
  if (next === currentContentLanguage) return;
  currentContentLanguage = next;
  // Notify components that subscribed before init completed.
  for (const listener of contentLanguageListeners) {
    try { listener(next); } catch {}
  }
}

export function getContentLanguage() {
  return currentContentLanguage;
}

export async function setContentLanguage(lang) {
  if (!SUPPORTED_CONTENT_LANGUAGES.includes(lang)) return;
  if (lang === currentContentLanguage) return;
  currentContentLanguage = lang;
  try {
    await AsyncStorage.setItem(CONTENT_STORAGE_KEY, lang);
  } catch {}
  for (const listener of contentLanguageListeners) {
    try { listener(lang); } catch {}
  }
}

/**
 * Subscribe to content-language changes. Returns an unsubscribe function.
 * Used by useContentLanguage() to trigger re-renders.
 */
export function subscribeContentLanguage(listener) {
  contentLanguageListeners.add(listener);
  return () => contentLanguageListeners.delete(listener);
}

/** Change app language at runtime and persist the choice. */
export async function setAppLocale(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) return;
  await i18n.changeLanguage(locale);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, locale);
  } catch {}
}

/**
 * React hook: returns the current content language and re-renders on change.
 */
export function useContentLanguage() {
  const [lang, setLang] = useState(currentContentLanguage);
  useEffect(() => subscribeContentLanguage(setLang), []);
  return lang;
}

export default i18n;
