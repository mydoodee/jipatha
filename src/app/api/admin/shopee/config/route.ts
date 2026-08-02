import { NextRequest, NextResponse } from "next/server";
import { db, doc, getDoc, setDoc, serverTimestamp } from "@/lib/firebase/firestore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const configSnap = await getDoc(doc(db, "settings", "shopee"));
    if (configSnap.exists()) {
      const data = configSnap.data();
      return NextResponse.json({
        success: true,
        cookie: data.cookie || "",
        shopName: data.shopName || "",
        shopId: data.shopId || "",
        totalProducts: data.totalProducts || 0,
        updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : null,
      });
    }
    return NextResponse.json({ success: true, cookie: "" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cookie, shopName, shopId, totalProducts } = body;

    await setDoc(
      doc(db, "settings", "shopee"),
      {
        cookie: cookie || "",
        shopName: shopName || "",
        shopId: shopId || "",
        totalProducts: totalProducts || 0,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      message: "บันทึกการตั้งค่า Shopee Cookie เรียบร้อยแล้ว",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
