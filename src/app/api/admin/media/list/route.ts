import { NextRequest, NextResponse } from "next/server";
import { list, del } from "@vercel/blob";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder") || "products";

    const { blobs } = await list({
      prefix: folder,
    });

    const items = blobs.map((b) => ({
      name: b.pathname.split("/").pop() || b.pathname,
      fullPath: b.url,
      url: b.url,
      uploadedAt: b.uploadedAt,
      size: b.size,
    }));

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error("Vercel Blob List Error:", error);
    return NextResponse.json({ success: true, items: [] });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ success: false, error: "ไม่พบ URL ไฟล์ที่ต้องการลบ" }, { status: 400 });
    }

    await del(url);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Vercel Blob Delete Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
