import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const path = searchParams.get("path");

    // Protect revalidation API with secret token
    if (secret !== process.env.REVALIDATION_SECRET && secret !== "my-secret-key") {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    if (!path) {
      return NextResponse.json({ message: "Path is required" }, { status: 400 });
    }

    revalidatePath(path);
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json({ message: "Error revalidating" }, { status: 500 });
  }
}
