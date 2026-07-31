import { NextRequest, NextResponse } from "next/server";
import { getPosts } from "@/lib/firebase/services/posts";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const limitCount = Number(searchParams.get("limit")) || 20;

    const posts = await getPosts({
      categoryId,
      limitCount,
    });

    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    console.error("API posts error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
