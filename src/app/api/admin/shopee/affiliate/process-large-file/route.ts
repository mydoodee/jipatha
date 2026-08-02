import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { processLargeDatafeedFile } from "@/lib/shopee/datafeed-processor";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { filePath, minCommission = 10, limit = 500 } = body;

    let targetPath = filePath;

    if (!targetPath) {
      const folderPath = path.join(process.cwd(), "file_product");
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);
        const csvFiles = files.filter((f) => f.endsWith(".csv") && !f.includes("top_commission"));
        if (csvFiles.length > 0) {
          targetPath = path.join(folderPath, csvFiles[0]);
        }
      }
    }

    if (!targetPath || !fs.existsSync(targetPath)) {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่พบไฟล์ CSV ขนาดใหญ่ในโฟลเดอร์ file_product กรุณาย้ายไฟล์ 3.76 GB มาวางในโฟลเดอร์ file_product หรือระบุที่อยู่ไฟล์",
        },
        { status: 400 }
      );
    }

    const outputPath = path.join(process.cwd(), "file_product", "top_commission_products.csv");

    const result = await processLargeDatafeedFile({
      filePath: targetPath,
      minCommission: Number(minCommission),
      limit: Number(limit),
      outputCsvPath: outputPath,
      importToFirestore: true,
    });

    return NextResponse.json({
      success: true,
      message: `ประมวลผลไฟล์ใหญ่สำเร็จ! คัดเลือกสินค้ารับคอมมิชชันสูง (>= ${minCommission}%) จำนวน ${result.matchedCount} รายการเข้าสู่ระบบเรียบร้อยแล้ว`,
      outputPath,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "เกิดข้อผิดพลาดในการประมวลผลไฟล์ใหญ่" },
      { status: 500 }
    );
  }
}
