import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { firebaseConfig } from "./config";

let app: FirebaseApp;
let authInstance: Auth;
let dbInstance: Firestore;
let storageInstance: FirebaseStorage;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

authInstance = getAuth(app);
dbInstance = getFirestore(app);
storageInstance = getStorage(app);

export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;
export default app;
