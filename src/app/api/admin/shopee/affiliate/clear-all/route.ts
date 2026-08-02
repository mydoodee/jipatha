import { NextRequest, NextResponse } from "next/server";
import { db, collection, getDocs, deleteDoc, doc } from "@/lib/firebase/firestore";
import { adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let deletedProducts = 0;
    let deletedLinks = 0;

    // Try deleting via adminDb first
    try {
      const prodSnap = await adminDb.collection("products").get();
      for (const docSnap of prodSnap.docs) {
        await docSnap.ref.delete();
        deletedProducts++;
      }
      const linkSnap = await adminDb.collection("affiliate_links").get();
      for (const docSnap of linkSnap.docs) {
        await docSnap.ref.delete();
        deletedLinks++;
      }
    } catch {
      // Fallback to client DB
      const prodSnap = await getDocs(collection(db, "products"));
      for (const docSnap of prodSnap.docs) {
        await deleteDoc(doc(db, "products", docSnap.id));
        deletedProducts++;
      }
      const linkSnap = await getDocs(collection(db, "affiliate_links"));
      for (const docSnap of linkSnap.docs) {
        await deleteDoc(doc(db, "affiliate_links", docSnap.id));
        deletedLinks++;
      }
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
