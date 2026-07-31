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
  limit,
  serverTimestamp,
  serializeTimestamp,
} from "../firestore";
import { AffiliateLink, AffiliateLinkSerialized } from "@/types/affiliate";

const AFFILIATE_LINKS_COLLECTION = "affiliate_links";

export function serializeAffiliateLink(link: AffiliateLink): AffiliateLinkSerialized {
  return {
    ...link,
    createdAt: serializeTimestamp(link.createdAt),
    updatedAt: serializeTimestamp(link.updatedAt),
  };
}

export async function getAffiliateLinkByProductId(
  productId: string
): Promise<AffiliateLinkSerialized | null> {
  try {
    const q = query(
      collection(db, AFFILIATE_LINKS_COLLECTION),
      where("productId", "==", productId),
      where("status", "==", "active"),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];
    const link: AffiliateLink = {
      id: docSnap.id,
      ...docSnap.data(),
    } as AffiliateLink;
    return serializeAffiliateLink(link);
  } catch (error) {
    console.error("Error fetching affiliate link by product id:", error);
    return null;
  }
}

export async function getAffiliateLinkById(id: string): Promise<AffiliateLinkSerialized | null> {
  try {
    const docRef = doc(db, AFFILIATE_LINKS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;

    const link: AffiliateLink = {
      id: docSnap.id,
      ...docSnap.data(),
    } as AffiliateLink;
    return serializeAffiliateLink(link);
  } catch (error) {
    console.error("Error fetching affiliate link by id:", error);
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

export async function createAffiliateLink(
  data: Omit<AffiliateLink, "id" | "clickCount" | "createdAt" | "updatedAt">
): Promise<string> {
  const cleanedData = cleanData(data);
  const docRef = await addDoc(collection(db, AFFILIATE_LINKS_COLLECTION), {
    ...cleanedData,
    clickCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateAffiliateLink(
  id: string,
  data: Partial<Omit<AffiliateLink, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  const cleanedData = cleanData(data);
  const docRef = doc(db, AFFILIATE_LINKS_COLLECTION, id);
  await updateDoc(docRef, {
    ...cleanedData,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAffiliateLink(id: string): Promise<void> {
  const docRef = doc(db, AFFILIATE_LINKS_COLLECTION, id);
  await deleteDoc(docRef);
}

export async function incrementClickCount(id: string): Promise<void> {
  try {
    const docRef = doc(db, AFFILIATE_LINKS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const currentCount = docSnap.data().clickCount || 0;
      await updateDoc(docRef, {
        clickCount: currentCount + 1,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error incrementing click count:", error);
  }
}
