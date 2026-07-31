import { NextRequest, NextResponse } from "next/server";
import { affiliateLinkSchema } from "@/lib/validation/affiliate";
import { createAffiliateLink } from "@/lib/firebase/services/affiliateLinks";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = affiliateLinkSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation Error", details: result.error.format() },
        { status: 400 }
      );
    }

    const id = await createAffiliateLink(result.data);
    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error("API affiliate error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
