import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/firebase/services/products";
import { getAffiliateLinkByProductId, incrementClickCount } from "@/lib/firebase/services/affiliateLinks";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    // 1. Find Product
    const product = await getProductBySlug(slug);
    if (!product) {
      return new NextResponse("Product Not Found", { status: 404 });
    }

    // 2. Find Affiliate Link
    const affiliateLink = await getAffiliateLinkByProductId(product.id);

    // Fallback: Check affiliate_links collection or direct product.affiliateUrl property
    const destinationUrl =
      affiliateLink?.affiliateUrl ||
      affiliateLink?.originalUrl ||
      (product as any).affiliateUrl;

    if (!destinationUrl) {
      // Redirect back to product detail page if link is inactive or missing
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      return NextResponse.redirect(`${siteUrl}/products/${slug}`, { status: 302 });
    }

    // 3. Track Event / Increment Click Count (Async without blocking response delay)
    if (affiliateLink?.id) {
      incrementClickCount(affiliateLink.id).catch((err) =>
        console.error("Click tracking error:", err)
      );
    }

    // 4. Redirect to Shopee Affiliate URL
    return NextResponse.redirect(destinationUrl, { status: 302 });
  } catch (error) {
    console.error("Affiliate redirect error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
