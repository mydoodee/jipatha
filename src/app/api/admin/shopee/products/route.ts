import { NextRequest, NextResponse } from "next/server";
import { fetchShopeeSellerProducts } from "@/lib/shopee/seller-api";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cookie, page = 1, pageSize = 24, search = "", status = "all" } = body;

    if (!cookie || typeof cookie !== "string") {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุ Cookie ของ Shopee Seller Centre" },
        { status: 400 }
      );
    }

    const result = await fetchShopeeSellerProducts({
      cookie,
      page: Number(page),
      pageSize: Number(pageSize),
      search: String(search),
      status: String(status),
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "เกิดข้อผิดพลาดในการดึงรายการสินค้า" },
      { status: 500 }
    );
  }
}
