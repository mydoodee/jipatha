import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  serializeTimestamp,
} from "../firestore";
import { Category, CategorySerialized } from "@/types/category";

const CATEGORIES_COLLECTION = "categories";

export function serializeCategory(category: Category): CategorySerialized {
  return {
    ...category,
    createdAt: serializeTimestamp(category.createdAt),
    updatedAt: serializeTimestamp(category.updatedAt),
  };
}

export async function getCategories(status?: "active" | "inactive"): Promise<CategorySerialized[]> {
  try {
    let q;
    if (status) {
      q = query(collection(db, CATEGORIES_COLLECTION), where("status", "==", status));
    } else {
      q = query(collection(db, CATEGORIES_COLLECTION));
    }
    const snapshot = await getDocs(q);

    const categories = snapshot.docs.map((docSnap) => {
      const category: Category = {
        id: docSnap.id,
        ...docSnap.data(),
      } as Category;
      return serializeCategory(category);
    });

    // Sort by sortOrder in JS to avoid needing a composite index
    return categories.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<CategorySerialized | null> {
  try {
    const q = query(
      collection(db, CATEGORIES_COLLECTION),
      where("slug", "==", slug),
      where("status", "==", "active")
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];
    const category: Category = {
      id: docSnap.id,
      ...docSnap.data(),
    } as Category;
    return serializeCategory(category);
  } catch (error) {
    console.error("Error fetching category by slug:", error);
    return null;
  }
}

export async function getCategoryById(id: string): Promise<CategorySerialized | null> {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;

    const category: Category = {
      id: docSnap.id,
      ...docSnap.data(),
    } as Category;
    return serializeCategory(category);
  } catch (error) {
    console.error("Error fetching category by id:", error);
    return null;
  }
}

export async function createCategory(
  data: Omit<Category, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateCategory(
  id: string,
  data: Partial<Omit<Category, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  const docRef = doc(db, CATEGORIES_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  const docRef = doc(db, CATEGORIES_COLLECTION, id);
  await deleteDoc(docRef);
}
