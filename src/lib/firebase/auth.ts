import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "./client";

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export function onAuthChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export { auth };
