import { NextRequest, NextResponse } from "next/server";
import { testShopeeAffiliateCookie } from "@/lib/shopee/affiliate-api";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cookie } = body;

    if (!cookie || typeof cookie !== "string" || cookie.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุ Cookie ของ Shopee Affiliate Portal (affiliate.shopee.co.th)" },
        { status: 400 }
      );
    }

    const testResult = await testShopeeAffiliateCookie(cookie);

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
