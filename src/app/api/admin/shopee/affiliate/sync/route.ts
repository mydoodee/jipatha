import { NextRequest, NextResponse } from "next/server";
import { syncAffiliateOffersToFirestore, fetchShopeeAffiliateOffers, ShopeeAffiliateOffer } from "@/lib/shopee/affiliate-api";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cookie, offers, syncAll = false } = body;

    let itemsToSync: ShopeeAffiliateOffer[] = [];

    if (syncAll && cookie) {
      let currentPage = 1;
      const pageSize = 50;
      let totalFetched = 0;
      let totalAvailable = 1;

      while (totalFetched < totalAvailable && currentPage <= 10) {
        const fetchRes = await fetchShopeeAffiliateOffers({
          cookie,
          page: currentPage,
          pageSize,
        });

        if (!fetchRes.success || fetchRes.offers.length === 0) {
          break;
        }

        itemsToSync.push(...fetchRes.offers);
        totalAvailable = fetchRes.total;
        totalFetched += fetchRes.offers.length;
        currentPage++;
      }
    } else if (Array.isArray(offers) && offers.length > 0) {
      itemsToSync = offers;
    } else {
      return NextResponse.json(
        { success: false, error: "ไม่มีรายการสินค้า Affiliate ที่จะทำการซิงค์" },
        { status: 400 }
      );
    }

    const results = await syncAffiliateOffersToFirestore(itemsToSync);

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "เกิดข้อผิดพลาดในการนำเข้าสินค้า Affiliate" },
      { status: 500 }
    );
  }
}
