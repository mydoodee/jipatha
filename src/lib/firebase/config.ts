// Firebase configuration from environment variables with safe defaults for production build
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDgyhnq2wjjD-7pV4G-yWu5vi-6ET6EU0s",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "jipatha-798.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "jipatha-798",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "jipatha-798.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "742269197952",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:742269197952:web:5e733c805acb73e5b71065",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-3YK5SDJGJJ",
};

export function validateFirebaseConfig(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey.length > 5 &&
    firebaseConfig.projectId &&
    firebaseConfig.authDomain
  );
}
