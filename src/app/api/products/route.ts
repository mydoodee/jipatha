import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/firebase/services/products";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const featured = searchParams.get("featured") === "true" ? true : undefined;
    const limitCount = Number(searchParams.get("limit")) || 20;

    const products = await getProducts({
      categoryId,
      featured,
      limitCount,
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("API products error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
