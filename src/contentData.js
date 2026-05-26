/**
 * Content-data resolver.
 *
 * Returns the right word/level dataset for the user's current "content
 * language" (the source language we translate English INTO — distinct from
 * the UI language). Datasets are bundled per language to keep the app
 * offline-first and the loading instant.
 *
 * Consumers:
 *   - Imperative reads inside callbacks/effects: call getContentData()
 *     directly. The function returns whichever module the user has selected.
 *   - React components that need to re-render on switch: use useContentData()
 *     — it subscribes to content-language changes and triggers re-render.
 */

import {useEffect, useState} from 'react';
import {
  getContentLanguage,
  subscribeContentLanguage,
} from './i18n';

import ruData from './data';
import deData from './data/de';

const DATA_BY_LANG = {
  ru: ruData,
  de: deData,
};

export function getContentData() {
  return DATA_BY_LANG[getContentLanguage()] || ruData;
}

export function useContentData() {
  const [lang, setLang] = useState(getContentLanguage());
  useEffect(() => subscribeContentLanguage(setLang), []);
  return DATA_BY_LANG[lang] || ruData;
}
