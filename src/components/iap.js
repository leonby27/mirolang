/**
 * IAP helper for MiroLang Pro subscription.
 *
 * Setup required:
 * 1. App Store Connect: create subscription products with IDs below
 * 2. Google Play Console: create subscriptions with IDs below
 * 3. Deploy Cloud Function `verifyPurchase` (see src/cloud-functions/verifyPurchase.ts)
 * 4. (Optional) Add Firebase App Check
 */

import {
  initConnection,
  endConnection,
  getSubscriptions,
  requestSubscription,
  getAvailablePurchases,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
} from 'react-native-iap';
import {Platform} from 'react-native';
import functions from '@react-native-firebase/functions';
import {replaceFromRemote} from '../progress';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const PRODUCT_IDS = Platform.select({
  ios: ['mirolang_pro_monthly', 'mirolang_pro_yearly'],
  android: ['mirolang_pro_monthly', 'mirolang_pro_yearly'],
});

let purchaseUpdateSub = null;
let purchaseErrorSub = null;

export async function initIAP() {
  try {
    await initConnection();
  } catch (e) {
    console.warn('IAP initConnection failed:', e);
  }
}

export function teardownIAP() {
  try { purchaseUpdateSub?.remove?.(); } catch {}
  try { purchaseErrorSub?.remove?.(); } catch {}
  try { endConnection(); } catch {}
}

export async function loadProducts() {
  try {
    const subs = await getSubscriptions({skus: PRODUCT_IDS});
    return subs;
  } catch (e) {
    console.warn('IAP loadProducts failed:', e);
    return [];
  }
}

/**
 * Server-side receipt verification.
 * Calls a Cloud Function which validates with Apple/Google and
 * writes `pro:true` to the user's Firestore document.
 * Client never writes pro directly.
 */
async function verifyAndActivate(purchase) {
  const uid = auth().currentUser?.uid;
  if (!uid) throw new Error('Not signed in');

  const payload = {
    platform: Platform.OS,
    productId: purchase.productId,
    transactionId: purchase.transactionId,
    receipt: Platform.OS === 'ios' ? purchase.transactionReceipt : purchase.purchaseToken,
    packageNameAndroid: purchase.packageNameAndroid,
  };

  const result = await functions().httpsCallable('verifyPurchase')(payload);
  if (!result?.data?.ok) {
    throw new Error(result?.data?.error || 'Verification failed');
  }

  // Cloud Function has updated Firestore; sync local AsyncStorage
  const snapshot = await firestore().collection('users').doc(uid).get();
  const remoteData = snapshot.data()?.data;
  if (remoteData) {
    // Drop remote `user` + `data` into local progress: user lands in the
    // global slice (Pro flag stays cross-pair), data populates the current
    // pair's bucket without touching other pairs.
    await replaceFromRemote(remoteData);
  }
  return true;
}

export function setupPurchaseListeners(onSuccess, onError) {
  purchaseUpdateSub = purchaseUpdatedListener(async (purchase) => {
    try {
      if (!purchase?.transactionReceipt && !purchase?.purchaseToken) return;
      await verifyAndActivate(purchase);
      await finishTransaction({purchase, isConsumable: false});
      onSuccess?.(purchase);
    } catch (e) {
      console.warn('purchaseUpdatedListener failed:', e);
      onError?.(e);
    }
  });

  purchaseErrorSub = purchaseErrorListener((error) => {
    console.warn('purchaseErrorListener:', error);
    if (error?.code !== 'E_USER_CANCELLED') {
      onError?.(error);
    }
  });
}

export async function purchasePro(productId) {
  if (!PRODUCT_IDS.includes(productId)) throw new Error('Unknown product');
  await requestSubscription({sku: productId});
}

export async function restorePurchases() {
  const purchases = await getAvailablePurchases();
  for (const p of purchases) {
    if (PRODUCT_IDS.includes(p.productId)) {
      try {
        await verifyAndActivate(p);
        return true;
      } catch (e) {
        console.warn('restore verify failed:', e);
      }
    }
  }
  return false;
}
