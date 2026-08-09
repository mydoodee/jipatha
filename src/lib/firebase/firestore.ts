import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  writeBatch,
  type QueryConstraint,
  type DocumentData,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./client";

// Re-export commonly used Firestore utilities
export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  Timestamp,
  db,
};

export type { QueryConstraint, DocumentData };

// Helper: Convert Firestore document to typed object with id
export function docToObject<T>(
  docSnap: DocumentData & { id: string; data: () => DocumentData }
): T & { id: string } {
  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as T & { id: string };
}

// Helper: Serialize Timestamp fields to ISO strings for client components
export function serializeTimestamp(timestamp: Timestamp | undefined): string {
  if (!timestamp) return "";
  return timestamp.toDate().toISOString();
}
