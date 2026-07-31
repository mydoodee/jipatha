import {
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  serializeTimestamp,
} from "../firestore";
import { User, UserSerialized } from "@/types/user";

const USERS_COLLECTION = "users";

export function serializeUser(user: User): UserSerialized {
  return {
    ...user,
    createdAt: serializeTimestamp(user.createdAt),
  };
}

export async function getUserById(id: string): Promise<UserSerialized | null> {
  try {
    const docRef = doc(db, USERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;

    const user: User = {
      id: docSnap.id,
      ...docSnap.data(),
    } as User;
    return serializeUser(user);
  } catch (error) {
    console.error("Error fetching user by id:", error);
    return null;
  }
}

export async function createUserProfile(
  id: string,
  email: string,
  displayName?: string,
  role: "admin" | "editor" | "viewer" = "viewer"
): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, id);
  await setDoc(docRef, {
    email,
    displayName: displayName || "",
    role,
    status: "active",
    createdAt: serverTimestamp(),
  });
}

export async function updateUserRole(
  id: string,
  role: "admin" | "editor" | "viewer"
): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, id);
  await updateDoc(docRef, { role });
}
