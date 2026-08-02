import { NextRequest, NextResponse } from "next/server";
import { fixMissingProductImagesInFirestore } from "@/lib/shopee/csv-parser";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const result = await fixMissingProductImagesInFirestore();
    return NextResponse.json({
      success: true,
      message: `ดึงรูปภาพสินค้าสำเร็จ ${result.updatedCount} รายการ (จากทั้งหมด ${result.totalScanned} รายการ)`,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "เกิดข้อผิดพลาดในการดึงรูปภาพ" },
      { status: 500 }
    );
  }
}
