import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from "firebase/storage";
import { storage } from "./client";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from "@/config/constants";

export { storage, ref, getDownloadURL, deleteObject, listAll };

export async function uploadFile(
  path: string,
  file: File
): Promise<string> {
  // Validate file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(
      `ประเภทไฟล์ไม่รองรับ กรุณาใช้: ${ALLOWED_IMAGE_TYPES.join(", ")}`
    );
  }

  // Validate file size
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    throw new Error(`ขนาดไฟล์เกิน ${MAX_IMAGE_SIZE_MB}MB`);
  }

  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
    });
    return await getDownloadURL(snapshot.ref);
  } catch (error: any) {
    console.error("Firebase Storage Upload Error:", error);
    if (error.code === "storage/retry-limit-exceeded" || error.code === "storage/unauthorized") {
      throw new Error(
        "ไม่สามารถอัปโหลดไปยัง Firebase Storage ได้ (กรุณาเปิดสิทธิ์ Firebase Storage Rules เป็น allow read, write: if true; ใน Firebase Console)"
      );
    }
    throw error;
  }
}

export async function deleteFile(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error: any) {
    console.error("Firebase Storage Delete Error:", error);
    if (error.code === "storage/object-not-found") return;
    throw error;
  }
}

export async function listFiles(path: string) {
  try {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    return await Promise.all(
      result.items.map(async (item) => ({
        name: item.name,
        fullPath: item.fullPath,
        url: await getDownloadURL(item),
      }))
    );
  } catch (error: any) {
    console.error("Firebase Storage List Error:", error);
    return [];
  }
}
