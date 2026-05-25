/**
 * Cloud Function: verifyPurchase
 *
 * Deploy via Firebase CLI:
 *   firebase init functions  (in this repo root)
 *   firebase deploy --only functions:verifyPurchase
 *
 * Validates Apple/Google receipts server-side and sets `pro:true` on the user's
 * Firestore doc. Client must NOT write `pro` directly — Firestore rules must
 * forbid client writes to that field.
 *
 * Required env config (firebase functions:config:set):
 *   apple.shared_secret=<from App Store Connect>
 *   google.service_account=<base64 of JSON key from GCP service account>
 *
 * Dependencies:
 *   npm i firebase-admin firebase-functions node-apple-receipt-verify googleapis
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

interface VerifyPayload {
  platform: 'ios' | 'android';
  productId: string;
  transactionId: string;
  receipt: string;
  packageNameAndroid?: string;
}

export const verifyPurchase = functions.https.onCall(async (data: VerifyPayload, context) => {
  if (!context.auth?.uid) {
    return {ok: false, error: 'auth required'};
  }
  const uid = context.auth.uid;

  try {
    let isValid = false;
    let expiresAt: number | null = null;

    if (data.platform === 'ios') {
      // TODO: call Apple verifyReceipt or App Store Server API
      // const result = await appleVerify(data.receipt);
      // isValid = result.status === 0;
      // expiresAt = result.expires_date_ms;
      isValid = true; // PLACEHOLDER — implement real verification
    } else if (data.platform === 'android') {
      // TODO: call Google Play Developer API purchases.subscriptions.get
      // const result = await googlePlayVerify(data.packageNameAndroid, data.productId, data.receipt);
      // isValid = result.paymentState === 1;
      // expiresAt = parseInt(result.expiryTimeMillis);
      isValid = true; // PLACEHOLDER
    } else {
      return {ok: false, error: 'unknown platform'};
    }

    if (!isValid) {
      return {ok: false, error: 'invalid receipt'};
    }

    // Update Firestore: set pro flag + expiry
    const userRef = db.collection('users').doc(uid);
    const snap = await userRef.get();
    const existing = snap.data()?.data || {data: {}, user: {}};
    existing.user = {
      ...(existing.user || {}),
      id: uid,
      pro: true,
      proProductId: data.productId,
      proExpiresAt: expiresAt,
      proPurchaseId: data.transactionId,
    };
    await userRef.set({data: existing}, {merge: true});

    return {ok: true, expiresAt};
  } catch (e: any) {
    console.error('verifyPurchase failed:', e);
    return {ok: false, error: e?.message || String(e)};
  }
});
