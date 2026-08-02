import { NextRequest, NextResponse } from "next/server";
import { parseShopeeAffiliateCSV, syncShopeeCSVProductsToFirestore } from "@/lib/shopee/csv-parser";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const csvContentText = formData.get("csvText") as string | null;

    let csvData = "";

    if (file) {
      csvData = await file.text();
    } else if (csvContentText) {
      csvData = csvContentText;
    } else {
      return NextResponse.json(
        { success: false, error: "กรุณาอัปโหลดไฟล์ CSV หรือส่งข้อความ CSV" },
        { status: 400 }
      );
    }

    const parsedProducts = parseShopeeAffiliateCSV(csvData);

    if (parsedProducts.length === 0) {
      return NextResponse.json(
        { success: false, error: "ไม่พบรายการสินค้าในไฟล์ CSV หรือรูปแบบไฟล์ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const results = await syncShopeeCSVProductsToFirestore(parsedProducts);

    return NextResponse.json({
      success: true,
      parsedCount: parsedProducts.length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "เกิดข้อผิดพลาดในการอ่านไฟล์ CSV" },
      { status: 500 }
    );
  }
}
