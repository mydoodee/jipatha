import { NextRequest, NextResponse } from "next/server";
import { testShopeeSellerCookie } from "@/lib/shopee/seller-api";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cookie } = body;

    if (!cookie || typeof cookie !== "string" || cookie.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุ Cookie ของ Shopee Seller Centre" },
        { status: 400 }
      );
    }

    const testResult = await testShopeeSellerCookie(cookie);

    return NextResponse.json({
      success: testResult.valid,
      ...testResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "เกิดข้อผิดพลาดในการตรวจสอบ Cookie" },
      { status: 500 }
    );
  }
}
