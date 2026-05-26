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

import {useEffect, useMemo, useRef, useState} from 'react';
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

/**
 * Cross-pair synthesis for foreign↔foreign combinations.
 *
 * The only datasets we ship are English-headword pairs (`{word: EN, ru:
 * <native translation>}`), so a pair like "RU native learning DE" needs
 * to be synthesised by joining two datasets on the shared English word
 * IDs. Walk the *target* dataset's structure (so module/level titles are
 * in the language being learned), and for each word swap the `ru` field
 * to the *native* translation pulled from the native dataset.
 *
 * Memoised by (target, native) pair.
 */
const crossPairCache = new Map(); // `${target}:${native}` -> transformed array

function buildCrossPair(target, native) {
  const key = `${target}:${native}`;
  const cached = crossPairCache.get(key);
  if (cached) return cached;

  const targetData = DATA_BY_LANG[target];
  const nativeData = DATA_BY_LANG[native];
  if (!targetData || !nativeData) return ruData;

  // Build a (moduleId, levelId, wordId) → native translation index once.
  const nativeIndex = new Map();
  for (const mod of nativeData) {
    for (const level of mod.data) {
      for (const w of level.words) {
        nativeIndex.set(`${mod.id}:${level.id}:${w.id}`, w.ru);
      }
    }
  }

  const transformed = targetData.map(mod => ({
    ...mod,
    data: mod.data.map(level => ({
      ...level,
      words: level.words.map(w => {
        const nativeTranslation = nativeIndex.get(
          `${mod.id}:${level.id}:${w.id}`,
        );
        return {
          id: w.id,
          word: w.ru, // target-language word as the question
          ru: nativeTranslation || w.word, // native translation; fall back to EN if native data missing this word
          transcription: '',
        };
      }),
    })),
  }));
  crossPairCache.set(key, transformed);
  return transformed;
}

export function getContentInfo() {
  const native = getNativeLanguage();
  const target = getTargetLanguage();

  // Three shapes a pair can take:
  //   1. target === 'en'  — foreign native learning English. Native dataset
  //      ships in the right shape already: word=EN, ru=native translation.
  //   2. native === 'en'  — English native learning a foreign language.
  //      Use the target dataset and flip word↔ru.
  //   3. both foreign     — cross-pair synthesised from two foreign datasets
  //      joined on shared English word IDs.
  let data;
  let flipped;
  let ttsLang;
  if (target === 'en') {
    data = DATA_BY_LANG[native] || ruData;
    flipped = false;
    ttsLang = 'en-US';
  } else if (native === 'en') {
    data = flipDataset(DATA_BY_LANG[target] || ruData, target);
    flipped = true;
    ttsLang = TTS_LOCALE[target] || 'en-US';
  } else {
    data = buildCrossPair(target, native);
    flipped = true;
    ttsLang = TTS_LOCALE[target] || 'en-US';
  }
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

/**
 * Mid-session pair-change guard for nested learning screens (Prestart,
 * Learn, Overview). They take their data from route.params at mount,
 * so a language switch in Settings mid-session leaves them showing the
 * wrong words / wrong language while progress writes route to the new
 * pair's bucket. Pop back to the top of the stack and force the user
 * to re-enter the level under the new pair.
 */
export function useGuardAgainstPairChange(navigation) {
  const {native, target} = useContentInfo();
  const initialRef = useRef(`${native}:${target}`);
  useEffect(() => {
    const current = `${native}:${target}`;
    if (initialRef.current !== current) {
      try {
        navigation?.popToTop?.();
      } catch {}
    }
  }, [native, target, navigation]);
}

// ---------- Back-compat helpers (unchanged shape) ----------

export function getContentData() {
  return getContentInfo().data;
}

export function useContentData() {
  return useContentInfo().data;
}
