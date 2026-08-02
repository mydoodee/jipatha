import { NextRequest, NextResponse } from "next/server";
import { fetchShopeeAffiliateOffers } from "@/lib/shopee/affiliate-api";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cookie, page = 1, pageSize = 20, keyword = "", sortType = 1 } = body;

    if (!cookie || typeof cookie !== "string") {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุ Cookie ของ Shopee Affiliate Portal" },
        { status: 400 }
      );
    }

    const result = await fetchShopeeAffiliateOffers({
      cookie,
      page: Number(page),
      pageSize: Number(pageSize),
      keyword: String(keyword),
      sortType: Number(sortType),
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "เกิดข้อผิดพลาดในการดึงสินค้า Affiliate" },
      { status: 500 }
    );
  }
}
