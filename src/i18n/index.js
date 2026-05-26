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
import de from './locales/de.json';
import nl from './locales/nl.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import it from './locales/it.json';

export const SUPPORTED_LOCALES = ['en', 'ru', 'de', 'nl', 'fr', 'es', 'it'];
export const DEFAULT_LOCALE = 'en';
const STORAGE_KEY = 'app.locale';

// The app's two language axes:
//
//   - "Native language" — the user's mother tongue. Drives both:
//       (a) the UI language (with EN as fallback for natives whose UI
//           locale isn't translated yet — see SUPPORTED_LOCALES above),
//       (b) which word-translation dataset we load (src/data/<lang>.js).
//   - "Target language" — the language the user is learning. For now
//     hardcoded to English; expanding this requires flip-rendering in
//     Learn.js / Prestart.js / Overview.js and per-target transcription
//     data, so it's a separate milestone.
//
// Internally `currentContentLanguage` is still the source of truth for
// the data resolver — `setNativeLanguage` wraps both that and the UI
// locale change so callers don't have to coordinate them.
// Native and target can be any of the seven languages independently — the
// resolver in src/contentData.js synthesises foreign↔foreign pairs by
// joining two foreign datasets on the shared English word IDs. The only
// invariant we enforce is native ≠ target (you can't learn your own
// language); when the user picks the same language for both sides we
// coerce the OTHER side to a sensible alternative.
export const SUPPORTED_NATIVE_LANGUAGES = ['ru', 'en', 'de', 'nl', 'fr', 'es', 'it'];
export const DEFAULT_NATIVE_LANGUAGE = 'ru';
export const SUPPORTED_TARGET_LANGUAGES = ['en', 'ru', 'de', 'nl', 'fr', 'es', 'it'];
export const DEFAULT_TARGET_LANGUAGE = 'en';

// Back-compat alias — the resolver and any old code keeps using these
// names. They reference the same list / value as the native-language
// constants above.
export const SUPPORTED_CONTENT_LANGUAGES = SUPPORTED_NATIVE_LANGUAGES;
export const DEFAULT_CONTENT_LANGUAGE = DEFAULT_NATIVE_LANGUAGE;

const CONTENT_STORAGE_KEY = 'app.contentLanguage';
const TARGET_STORAGE_KEY = 'app.targetLanguage';
let currentContentLanguage = DEFAULT_CONTENT_LANGUAGE;
let currentTargetLanguage = DEFAULT_TARGET_LANGUAGE;
const contentLanguageListeners = new Set();
const targetLanguageListeners = new Set();

// Synchronous init — uses English first; the real locale is applied below.
i18n.use(initReactI18next).init({
  resources: {
    en: {translation: en},
    ru: {translation: ru},
    de: {translation: de},
    nl: {translation: nl},
    fr: {translation: fr},
    es: {translation: es},
    it: {translation: it},
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
  await loadTargetLanguage();
  return lng;
}

async function loadContentLanguage() {
  let next = DEFAULT_CONTENT_LANGUAGE;
  try {
    const saved = await AsyncStorage.getItem(CONTENT_STORAGE_KEY);
    if (saved && SUPPORTED_CONTENT_LANGUAGES.includes(saved)) {
      next = saved;
    } else {
      // First launch — seed native language from device locale instead of
      // forcing the legacy RU default. Otherwise a German speaker opens
      // the app to a German UI but Russian word translations.
      try {
        const deviceLocales = getLocales();
        for (const {languageCode} of deviceLocales) {
          if (SUPPORTED_NATIVE_LANGUAGES.includes(languageCode)) {
            next = languageCode;
            break;
          }
        }
      } catch {}
    }
  } catch {}
  if (next === currentContentLanguage) return;
  currentContentLanguage = next;
  // Notify components that subscribed before init completed.
  for (const listener of contentLanguageListeners) {
    try { listener(next); } catch {}
  }
}

async function loadTargetLanguage() {
  let next = DEFAULT_TARGET_LANGUAGE;
  try {
    const saved = await AsyncStorage.getItem(TARGET_STORAGE_KEY);
    if (saved && SUPPORTED_TARGET_LANGUAGES.includes(saved)) {
      next = saved;
    }
  } catch {}
  if (next === currentTargetLanguage) return;
  currentTargetLanguage = next;
  for (const listener of targetLanguageListeners) {
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

// ---------- Native language ----------
//
// The user-facing primary picker. Changing this:
//   1. updates the content-data selector (via setContentLanguage), and
//   2. flips the UI locale to the matching language when we have a
//      translation for it; otherwise falls back to English.
//
// We don't have a separate `nativeLanguageListeners` set — natives ride on
// top of the existing content-language listener mechanism. Components that
// want to react to native-lang changes use useContentLanguage().

export function getNativeLanguage() {
  return currentContentLanguage;
}

/**
 * Set the language pair, enforcing that native ≠ target. If the caller
 * asks for both sides equal, we coerce the OTHER side to the previous
 * value of the side being changed (so picking your current native as
 * target swaps the two, instead of breaking the pair).
 *
 *   pivot = "native": native is authoritative, target gets coerced
 *   pivot = "target": target is authoritative, native gets coerced
 */
async function applyLanguagePair(native, target, pivot) {
  if (!SUPPORTED_NATIVE_LANGUAGES.includes(native)) return;
  if (!SUPPORTED_TARGET_LANGUAGES.includes(target)) return;

  if (native === target) {
    if (pivot === 'native') {
      // User picked their current target as the new native → swap.
      target = currentContentLanguage;
    } else {
      native = currentTargetLanguage;
    }
    // If swapping still leaves them equal (rare — e.g. first launch),
    // fall back to ('en', 'de').
    if (native === target) {
      if (pivot === 'native') target = native === 'en' ? 'de' : 'en';
      else native = target === 'en' ? 'de' : 'en';
    }
  }

  // Persist + propagate. setContentLanguage / target setter both no-op if
  // unchanged, so calling them unconditionally is safe.
  await setContentLanguage(native);
  if (target !== currentTargetLanguage) {
    currentTargetLanguage = target;
    try {
      await AsyncStorage.setItem(TARGET_STORAGE_KEY, target);
    } catch {}
    for (const listener of targetLanguageListeners) {
      try { listener(target); } catch {}
    }
  }
  // UI follows native; falls back to English when we have no locale file.
  const uiLang = SUPPORTED_LOCALES.includes(native) ? native : DEFAULT_LOCALE;
  if (i18n.language !== uiLang) {
    await setAppLocale(uiLang);
  }
}

export async function setNativeLanguage(lang) {
  await applyLanguagePair(lang, currentTargetLanguage, 'native');
}

export function useNativeLanguage() {
  return useContentLanguage();
}

// ---------- Target language ----------
//
// What the user is *learning*. Phase 1 hardcodes this to English because
// every dataset is shaped EN-word → native-translation. Phase 3 will lift
// the restriction once Learn/Prestart/Overview can flip the card.

export function getTargetLanguage() {
  return currentTargetLanguage;
}

export async function setTargetLanguage(lang) {
  await applyLanguagePair(currentContentLanguage, lang, 'target');
}

export function subscribeTargetLanguage(listener) {
  targetLanguageListeners.add(listener);
  return () => targetLanguageListeners.delete(listener);
}

export function useTargetLanguage() {
  const [lang, setLang] = useState(currentTargetLanguage);
  useEffect(() => {
    if (currentTargetLanguage !== lang) setLang(currentTargetLanguage);
    return subscribeTargetLanguage(setLang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return lang;
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
 *
 * Inside useEffect we re-sync once after mount — `currentContentLanguage`
 * can change between this hook's useState initialiser and the subscribe
 * call (initI18n is async and may complete in the gap). Without that
 * resync the component stays stuck on the pre-init default.
 */
export function useContentLanguage() {
  const [lang, setLang] = useState(currentContentLanguage);
  useEffect(() => {
    if (currentContentLanguage !== lang) setLang(currentContentLanguage);
    return subscribeContentLanguage(setLang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return lang;
}

export default i18n;
