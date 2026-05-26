/**
 * Progress storage — per-language-pair, with a single AsyncStorage key.
 *
 * Storage shape:
 *   {
 *     user: { email, pro, provider, ... },   // global — Pro flag is the same
 *                                              // whichever language you're learning
 *     pairs: {
 *       'ru-en': { data: { <levelId>: { <wordId>: {status, date} } } },
 *       'ru-de': { ... },
 *       ...
 *     }
 *   }
 *
 * Consumers see the legacy shape `{user, data}` where `data` is scoped to
 * the current (native, target) pair — that way the screens that read
 * `progress.data[level.id]?.[word.id]?.status` keep working without code
 * changes inside their flow.
 *
 * Legacy data ({user, data} with no `pairs`) is migrated lazily on first
 * write: we don't try to guess which pair it belongs to, instead the next
 * `saveProgress` call drops `data` and lets the current pair own its own
 * bucket from there. To avoid clobbering legacy progress on launch, the
 * first `loadProgress` after upgrade serves the legacy `data` as if it
 * were the current pair's progress.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {getNativeLanguage, getTargetLanguage} from './i18n';

const STORAGE_KEY = 'progress';

function getPairKey() {
  return `${getNativeLanguage()}-${getTargetLanguage()}`;
}

async function readRaw() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
    return null;
  } catch {
    return null;
  }
}

async function writeRaw(value) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {}
}

/**
 * Load progress shaped for screen consumers: `{user, data}` where `data`
 * is the current pair's data.
 */
export async function loadProgress() {
  const pairKey = getPairKey();
  const stored = await readRaw();
  if (!stored) return {user: null, data: {}};

  // Legacy: { user, data } — return the legacy data as the current pair's
  // progress so an upgrading user doesn't see their counts vanish.
  if (stored.data && !stored.pairs) {
    return {user: stored.user || null, data: stored.data};
  }

  return {
    user: stored.user || null,
    data: stored.pairs?.[pairKey]?.data || {},
  };
}

/**
 * Persist progress: `progress.user` is written globally, `progress.data`
 * lands in this pair's bucket. Legacy `data` at the top level is removed
 * once we have a multi-pair structure.
 */
export async function saveProgress(progress) {
  const pairKey = getPairKey();
  const stored = (await readRaw()) || {};

  // Migrate legacy storage in-place: if it had `data` but no `pairs`, the
  // first thing we do is move it under the *currently active* pair key.
  // That preserves existing progress for the pair the user has been using.
  if (stored.data && !stored.pairs) {
    stored.pairs = {[pairKey]: {data: stored.data}};
    delete stored.data;
  }
  if (!stored.pairs) stored.pairs = {};

  stored.user = progress?.user ?? null;
  stored.pairs[pairKey] = {data: progress?.data || {}};
  await writeRaw(stored);
}

/**
 * Clear the current pair's progress only. Other pairs and the global
 * `user` slice are untouched.
 */
export async function clearCurrentPairProgress() {
  const pairKey = getPairKey();
  const stored = await readRaw();
  if (!stored) return;
  if (stored.data && !stored.pairs) {
    // Legacy → treat as current pair → clear it.
    delete stored.data;
  }
  if (stored.pairs?.[pairKey]) {
    delete stored.pairs[pairKey];
  }
  await writeRaw(stored);
}

/**
 * Reset everything: all pairs, plus the user slice. Used by full account
 * deletion. Equivalent to `AsyncStorage.removeItem('progress')`.
 */
export async function resetAllProgress() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {}
}

/**
 * Replace progress wholesale from a server-side snapshot (Firestore sync
 * after sign-in or after IAP receipt verification). The snapshot is a
 * legacy-shape `{user, data}` object; we install its `data` under the
 * *current* pair so it surfaces to the user immediately. Other pairs
 * remain in place.
 */
export async function replaceFromRemote(remote) {
  if (!remote) return;
  await saveProgress({
    user: remote.user ?? null,
    data: remote.data || {},
  });
}
