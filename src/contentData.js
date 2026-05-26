/**
 * Content-data resolver.
 *
 * Returns the right word/level dataset for the user's current (native,
 * target) language pair. Two directions are supported:
 *
 *   1. Foreign native → English target (default).
 *      We load `src/data/<native>.js` as-is. `word` is the English word
 *      being learned, `ru` is its translation in the native language,
 *      `transcription` is English IPA.
 *
 *   2. English native → foreign target.
 *      We load `src/data/<target>.js` and *flip* every word so consumers
 *      can render the foreign word as the question and English as the
 *      answer without screen-side awareness. `word` and `ru` get swapped;
 *      `transcription` is dropped because the original IPA describes the
 *      English headword, not the foreign one we now show.
 *
 * Consumers:
 *   - getContentInfo() / useContentInfo() — returns
 *     { data, flipped, ttsLang } where ttsLang is the locale code to feed
 *     into react-native-tts for speaking the "front of card" word.
 *   - getContentData() / useContentData() — back-compat helpers that
 *     return just the data array.
 */

import {useEffect, useMemo, useState} from 'react';
import {
  getNativeLanguage,
  getTargetLanguage,
  subscribeContentLanguage,
  subscribeTargetLanguage,
} from './i18n';

import ruData from './data';
import deData from './data/de';
import nlData from './data/nl';
import frData from './data/fr';
import esData from './data/es';
import itData from './data/it';

const DATA_BY_LANG = {
  ru: ruData,
  de: deData,
  nl: nlData,
  fr: frData,
  es: esData,
  it: itData,
};

// react-native-tts locale codes for the language being *spoken aloud*.
const TTS_LOCALE = {
  en: 'en-US',
  ru: 'ru-RU',
  de: 'de-DE',
  nl: 'nl-NL',
  fr: 'fr-FR',
  es: 'es-ES',
  it: 'it-IT',
};

/**
 * Flip every word in the dataset so the foreign word lives in `.word`
 * and English in `.ru`. Cached because the operation is O(6,700 words)
 * and gets called every time a flipped consumer mounts.
 */
const flippedCache = new Map(); // lang -> transformed data array

function flipDataset(data, lang) {
  const cached = flippedCache.get(lang);
  if (cached) return cached;
  const transformed = data.map(category => ({
    ...category,
    data: category.data.map(level => ({
      ...level,
      words: level.words.map(w => ({
        id: w.id,
        word: w.ru, // foreign word becomes the question
        ru: w.word, // English becomes the answer
        transcription: '', // English IPA doesn't describe the foreign word
      })),
    })),
  }));
  flippedCache.set(lang, transformed);
  return transformed;
}

export function getContentInfo() {
  const native = getNativeLanguage();
  const target = getTargetLanguage();
  // Exactly one side is 'en' (the pair-validation logic in i18n keeps it
  // that way). The foreign side names the dataset we load.
  const flipped = native === 'en';
  const datasetLang = flipped ? target : native;
  const raw = DATA_BY_LANG[datasetLang] || ruData;
  const data = flipped ? flipDataset(raw, datasetLang) : raw;
  // The question side is what gets spoken aloud. Not flipped: English.
  // Flipped: the foreign target.
  const ttsLang = flipped ? TTS_LOCALE[target] || 'en-US' : 'en-US';
  return {data, flipped, ttsLang, native, target};
}

export function useContentInfo() {
  const [, force] = useState(0);
  useEffect(() => {
    const bump = () => force(n => n + 1);
    const unNative = subscribeContentLanguage(bump);
    const unTarget = subscribeTargetLanguage(bump);
    return () => {
      unNative();
      unTarget();
    };
  }, []);
  // Recomputed every render — cheap because `flipDataset` is memoised.
  // useMemo not strictly needed but keeps reference stable for the data
  // array so downstream `useEffect(..., [data])` deps stay stable.
  return useMemo(() => getContentInfo(), [
    getNativeLanguage(),
    getTargetLanguage(),
  ]);
}

// ---------- Back-compat helpers (unchanged shape) ----------

export function getContentData() {
  return getContentInfo().data;
}

export function useContentData() {
  return useContentInfo().data;
}
