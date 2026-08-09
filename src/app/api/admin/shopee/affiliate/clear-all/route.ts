import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, collection, getDocs, writeBatch } from "@/lib/firebase/firestore";
import { adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

async function deleteCollectionBatch(collectionName: string): Promise<number> {
  let count = 0;

  // Try adminDb first
  try {
    const snap = await adminDb.collection(collectionName).get();
    count = snap.size;
    if (count > 0) {
      const batchSize = 400;
      for (let i = 0; i < snap.docs.length; i += batchSize) {
        const batch = adminDb.batch();
        const chunk = snap.docs.slice(i, i + batchSize);
        chunk.forEach((docSnap) => batch.delete(docSnap.ref));
        await batch.commit();
      }
    }
    return count;
  } catch (adminErr) {
    console.warn(`adminDb batch delete for ${collectionName} failed, falling back to client SDK writeBatch:`, adminErr);
  }

  // Fallback to client SDK writeBatch
  try {
    const snap = await getDocs(collection(db, collectionName));
    count = snap.size;
    if (count > 0) {
      const batchSize = 400;
      for (let i = 0; i < snap.docs.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = snap.docs.slice(i, i + batchSize);
        chunk.forEach((docSnap) => batch.delete(docSnap.ref));
        await batch.commit();
      }
    }
    return count;
  } catch (clientErr) {
    console.error(`Client writeBatch error for ${collectionName}:`, clientErr);
    throw clientErr;
  }
}

export async function POST(req: NextRequest) {
  try {
    const deletedProducts = await deleteCollectionBatch("products");
    const deletedLinks = await deleteCollectionBatch("affiliate_links");

    try {
      revalidatePath("/");
      revalidatePath("/products");
      revalidatePath("/categories");
    } catch (revErr) {
      console.warn("Revalidate error:", revErr);
    }

    return NextResponse.json({
      success: true,
      message: `ล้างข้อมูลเรียบร้อยแล้ว! ลบสินค้าทั้งหมด ${deletedProducts} รายการ และลิงก์ Affiliate ${deletedLinks} รายการ`,
      deletedProducts,
      deletedLinks,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "เกิดข้อผิดพลาดในการล้างข้อมูลสินค้า" },
      { status: 500 }
    );
  }
}
