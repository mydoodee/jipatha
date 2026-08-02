import fs from "fs";
import path from "path";
import readline from "readline";
import { parseCSVLine, parseThaiPrice, parseCommissionRate, syncShopeeCSVProductsToFirestore } from "../src/lib/shopee/csv-parser";

/**
 * High-performance streaming processor for giant Shopee Datafeed files (3GB+)
 */
async function processLargeDatafeedFile(params: {
  filePath: string;
  minCommission?: number;
  limit?: number;
  outputCsvPath?: string;
  importToFirestore?: boolean;
}) {
  const { filePath, minCommission = 10, limit = 1000, outputCsvPath, importToFirestore = false } = params;

  if (!fs.existsSync(filePath)) {
    console.error(`❌ ไม่พบไฟล์: ${filePath}`);
    return;
  }

  const stats = fs.statSync(filePath);
  console.log(`📁 กำลังเริ่มอ่านไฟล์ Datafeed ขนาด ${(stats.size / (1024 * 1024 * 1024)).toFixed(2)} GB...`);
  console.log(`🎯 เงื่อนไขการกรอง: ค่าคอมมิชชัน >= ${minCommission}% | จำกัดจำนวนสูงสุด: ${limit} รายการ\n`);

  const fileStream = fs.createReadStream(filePath, { encoding: "utf-8" });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let lineCount = 0;
  let matchedCount = 0;
  let headers: string[] = [];

  const matchedProducts: any[] = [];
  const outputRows: string[] = [];

  for await (const line of rl) {
    lineCount++;
    if (lineCount === 1) {
      // Clean UTF-8 BOM
      const cleanedHeader = line.replace(/^\uFEFF/, "").trim();
      headers = parseCSVLine(cleanedHeader);
      outputRows.push(line);
      continue;
    }

    if (matchedCount >= limit) {
      break;
    }

    const row = parseCSVLine(line);
    if (row.length < 3) continue;

    // Search header indices
    let commRateIdx = headers.findIndex((h) => h.includes("อัตราค่าคอมมิชชัน") || h.includes("Commission Rate") || h.includes("commission_rate"));
    let priceIdx = headers.findIndex((h) => h.includes("ราคา") || h.includes("Price") || h.includes("product_price"));
    let titleIdx = headers.findIndex((h) => h.includes("ชื่อสินค้า") || h.includes("Item Name") || h.includes("title") || h.includes("product_name"));
    let idIdx = headers.findIndex((h) => h.includes("รหัสสินค้า") || h.includes("Item ID") || h.includes("product_id"));
    let affUrlIdx = headers.findIndex((h) => h.includes("ลิงก์ข้อเสนอ") || h.includes("Offer Link") || h.includes("offer_link") || h.includes("affiliate_link"));
    let prodUrlIdx = headers.findIndex((h) => h.includes("ลิงก์สินค้า") || h.includes("Product Link") || h.includes("product_link"));
    let imgIdx = headers.findIndex((h) => h.includes("รูปภาพ") || h.includes("Image") || h.includes("image_url") || h.includes("cover"));

    if (commRateIdx === -1) commRateIdx = 5;
    if (priceIdx === -1) priceIdx = 2;
    if (titleIdx === -1) titleIdx = 1;
    if (idIdx === -1) idIdx = 0;
    if (affUrlIdx === -1) affUrlIdx = 8;
    if (prodUrlIdx === -1) prodUrlIdx = 7;

    const commRateStr = row[commRateIdx] || "0";
    const commRate = parseCommissionRate(commRateStr);
    const title = row[titleIdx] || "";
    const price = parseThaiPrice(row[priceIdx] || "0");
    const itemId = row[idIdx] || `item-${matchedCount}`;
    const affUrl = row[affUrlIdx] || row[prodUrlIdx] || "";
    const imgUrl = imgIdx !== -1 && row[imgIdx] ? row[imgIdx] : "";

    // Filter condition: Commission rate >= minCommission
    if (commRate >= minCommission && title && price > 0) {
      matchedCount++;
      outputRows.push(line);

      matchedProducts.push({
        itemId,
        title,
        price,
        originalPrice: Math.round(price * 1.15),
        discountPercent: 13,
        soldText: "",
        shopName: "Shopee Seller",
        commissionRate: commRate,
        commissionAmount: Math.round((price * commRate) / 100),
        productUrl: row[prodUrlIdx] || affUrl,
        affiliateUrl: affUrl,
        image: imgUrl,
      });

      if (matchedCount % 100 === 0) {
        console.log(`✅ คัดเลือกสินค้าคอมมิชชันสูงได้แล้ว ${matchedCount} รายการ (อ่านไปแล้ว ${lineCount.toLocaleString()} บรรทัด)...`);
      }
    }
  }

  console.log(`\n🎉 อ่านไฟล์สำเร็จ! ทั้งหมด ${lineCount.toLocaleString()} บรรทัด`);
  console.log(`✨ คัดสรรสินค้าคอมสูง (>= ${minCommission}%) ได้ทั้งหมด ${matchedCount} รายการ`);

  // Write output CSV if requested
  if (outputCsvPath) {
    fs.writeFileSync(outputCsvPath, outputRows.join("\n"), "utf-8");
    console.log(`💾 บันทึกไฟล์ CSV สินค้าคอมสูงตัวท็อปไว้ที่: ${outputCsvPath}`);
  }

  // Import to Firestore if requested
  if (importToFirestore && matchedProducts.length > 0) {
    console.log(`🚀 กำลังนำเข้าสินค้า ${matchedProducts.length} รายการเข้าสู่ฐานข้อมูล Firestore...`);
    const results = await syncShopeeCSVProductsToFirestore(matchedProducts);
    console.log(`🎉 นำเข้าสำเร็จ! เพิ่มใหม่ ${results.imported} รายการ | อัปเดต ${results.updated} รายการ | ล้มเหลว ${results.failed} รายการ`);
  }
}

// Command line usage execution example:
// npx ts-node scripts/process-large-datafeed.ts "path/to/3.7gb.csv"
const targetFilePath = process.argv[2] || path.join(process.cwd(), "file_product", "datafeed.csv");
if (fs.existsSync(targetFilePath)) {
  processLargeDatafeedFile({
    filePath: targetFilePath,
    minCommission: 10,
    limit: 1000,
    outputCsvPath: path.join(process.cwd(), "file_product", "top_commission_products.csv"),
    importToFirestore: true,
  });
}

export { processLargeDatafeedFile };
