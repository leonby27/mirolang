/**
 * IAP helper for MiroLang Pro.
 *
 * Three SKUs, two product types:
 *   - mirolang_pro_monthly  — Auto-Renewable Subscription
 *   - mirolang_pro_yearly   — Auto-Renewable Subscription (with 14-day intro)
 *   - mirolang_pro_lifetime — Non-Consumable In-App Purchase
 *
 * Setup required:
 * 1. App Store Connect / Google Play Console: create the three products
 *    with the IDs above. Subscriptions go in one Subscription Group
 *    ("MiroLang Pro Access") so they upgrade/downgrade cleanly. Lifetime
 *    is a separate non-consumable.
 * 2. Deploy Cloud Function `verifyPurchase` (src/cloud-functions/
 *    verifyPurchase.ts). Make sure it accepts all three productIds and
 *    sets `pro:true` for any of them.
 * 3. (Optional) Add Firebase App Check.
 */

import {
  initConnection,
  endConnection,
  getSubscriptions,
  getProducts,
  requestSubscription,
  requestPurchase,
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

export const SUBSCRIPTION_IDS = Platform.select({
  ios: ['mirolang_pro_monthly', 'mirolang_pro_yearly'],
  android: ['mirolang_pro_monthly', 'mirolang_pro_yearly'],
});

export const LIFETIME_IDS = Platform.select({
  ios: ['mirolang_pro_lifetime'],
  android: ['mirolang_pro_lifetime'],
});

export const PRODUCT_IDS = [...SUBSCRIPTION_IDS, ...LIFETIME_IDS];

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

/**
 * Load all three product offers. Subscriptions and non-consumables live on
 * different StoreKit APIs, so we issue two parallel fetches and merge.
 * Each entry exposes `productId`, `localizedPrice`, and `price` (numeric);
 * the paywall uses `localizedPrice` for display.
 */
export async function loadProducts() {
  try {
    const [subs, prods] = await Promise.all([
      getSubscriptions({skus: SUBSCRIPTION_IDS}).catch(e => {
        console.warn('IAP getSubscriptions failed:', e);
        return [];
      }),
      getProducts({skus: LIFETIME_IDS}).catch(e => {
        console.warn('IAP getProducts failed:', e);
        return [];
      }),
    ]);
    return [...subs, ...prods];
  } catch (e) {
    console.warn('IAP loadProducts failed:', e);
    return [];
  }
}

/**
 * Server-side receipt verification.
 * Calls a Cloud Function which validates with Apple/Google and writes
 * `pro:true` to the user's Firestore document. Client never writes pro
 * directly. The function accepts both subscription and non-consumable
 * receipts; lifetime purchases set `pro:true` permanently.
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

  // Cloud Function has updated Firestore; sync local AsyncStorage.
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
      // Both subscriptions and non-consumables finish the same way —
      // `isConsumable: false` works for both. (Consumable would re-grant
      // the product on next launch, which we don't want.)
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

/**
 * Kick off a purchase flow. The product type (subscription vs
 * non-consumable) is inferred from the SKU and dispatched to the right
 * react-native-iap entry point.
 */
export async function purchasePro(productId) {
  if (LIFETIME_IDS.includes(productId)) {
    await requestPurchase({sku: productId});
  } else if (SUBSCRIPTION_IDS.includes(productId)) {
    await requestSubscription({sku: productId});
  } else {
    throw new Error('Unknown product');
  }
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
