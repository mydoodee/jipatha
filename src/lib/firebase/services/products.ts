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
  limit,
  serverTimestamp,
  serializeTimestamp,
} from "../firestore";
import { Product, ProductSerialized } from "@/types/product";

const PRODUCTS_COLLECTION = "products";

export function serializeProduct(product: Product): ProductSerialized {
  return {
    ...product,
    createdAt: serializeTimestamp(product.createdAt),
    updatedAt: serializeTimestamp(product.updatedAt),
  };
}

export interface GetProductsOptions {
  categoryId?: string;
  featured?: boolean;
  status?: "draft" | "published" | "all";
  limitCount?: number;
}

export async function getProducts(options: GetProductsOptions = {}): Promise<ProductSerialized[]> {
  try {
    const { categoryId, featured, status = "published", limitCount = 20 } = options;
    const constraints = [];

    if (status && status !== "all") {
      constraints.push(where("status", "==", status));
    }
    if (categoryId) {
      constraints.push(where("categoryId", "==", categoryId));
    }
    if (featured !== undefined) {
      constraints.push(where("featured", "==", featured));
    }

    const q = query(collection(db, PRODUCTS_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);

    const products = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const product: Product = {
        id: docSnap.id,
        ...data,
      } as Product;
      return serializeProduct(product);
    });

    // Sort by createdAt desc in JS to avoid composite index errors
    products.sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });

    if (limitCount > 0) {
      return products.slice(0, limitCount);
    }

    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<ProductSerialized | null> {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where("slug", "==", slug),
      where("status", "==", "published"),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];
    const product: Product = {
      id: docSnap.id,
      ...docSnap.data(),
    } as Product;
    return serializeProduct(product);
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}

export async function getProductById(id: string): Promise<ProductSerialized | null> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;

    const product: Product = {
      id: docSnap.id,
      ...docSnap.data(),
    } as Product;
    return serializeProduct(product);
  } catch (error) {
    console.error("Error fetching product by id:", error);
    return null;
  }
}

function cleanData<T extends Record<string, any>>(obj: T): T {
  const cleaned = { ...obj };
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === undefined) {
      delete cleaned[key];
    }
  });
  return cleaned;
}

export async function createProduct(
  data: Omit<Product, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const cleanedData = cleanData(data);
  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...cleanedData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  const cleanedData = cleanData(data);
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await updateDoc(docRef, {
    ...cleanedData,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await deleteDoc(docRef);
}
