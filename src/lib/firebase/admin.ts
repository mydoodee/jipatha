// Firebase Admin SDK — SERVER-SIDE ONLY
// This module must never be imported from client components
// It uses service account credentials that must stay on the server

import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function getServiceAccount(): ServiceAccount | undefined {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!key) return undefined;
  try {
    return JSON.parse(key) as ServiceAccount;
  } catch {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY");
    return undefined;
  }
}

function initAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = getServiceAccount();

  if (serviceAccount) {
    return initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }

  // Fallback: running on Firebase/Google Cloud with default credentials
  return initializeApp({
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const adminApp = initAdmin();

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
export default adminApp;
