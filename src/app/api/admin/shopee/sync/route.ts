import { NextRequest, NextResponse } from "next/server";
import { syncShopeeProductsToFirestore, fetchShopeeSellerProducts, ShopeeSellerProduct } from "@/lib/shopee/seller-api";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cookie, products, syncAll = false } = body;

    let itemsToSync: ShopeeSellerProduct[] = [];

    if (syncAll && cookie) {
      // Fetch all products across pages if requested
      let currentPage = 1;
      const pageSize = 50;
      let totalFetched = 0;
      let totalAvailable = 1;

      while (totalFetched < totalAvailable && currentPage <= 20) {
        const fetchRes = await fetchShopeeSellerProducts({
          cookie,
          page: currentPage,
          pageSize,
          status: "all",
        });

        if (!fetchRes.success || fetchRes.products.length === 0) {
          break;
        }

        itemsToSync.push(...fetchRes.products);
        totalAvailable = fetchRes.total;
        totalFetched += fetchRes.products.length;
        currentPage++;
      }
    } else if (Array.isArray(products) && products.length > 0) {
      itemsToSync = products;
    } else {
      return NextResponse.json(
        { success: false, error: "ไม่มีรายการสินค้าที่จะทำการซิงค์" },
        { status: 400 }
      );
    }

    const results = await syncShopeeProductsToFirestore(itemsToSync);

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "เกิดข้อผิดพลาดในการนำเข้าสินค้า" },
      { status: 500 }
    );
  }
}
