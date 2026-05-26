/**
 * Paywall intent — a one-shot flag stashed in AsyncStorage when we
 * detour a paywall press into the Login flow. After login completes
 * the user returns to whatever screen was below (AccountMain or
 * LevelsMain); that screen's focus listener consumes the flag and
 * re-opens the paywall so the user doesn't have to hunt for it.
 *
 * Stored as a plain string; presence is true, absence is false. The
 * consume call clears it atomically so it can't fire twice.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'paywall.intent';

export async function setPaywallIntent() {
  try {
    await AsyncStorage.setItem(KEY, '1');
  } catch {}
}

export async function consumePaywallIntent() {
  try {
    const v = await AsyncStorage.getItem(KEY);
    if (v) {
      await AsyncStorage.removeItem(KEY);
      return true;
    }
  } catch {}
  return false;
}
