import { NextRequest, NextResponse } from "next/server";
import { sampleCctvProducts } from "@/lib/data/cctvCatalog";
import { getProducts } from "@/lib/firebase/services/products";
import { ProductSerialized } from "@/types/product";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "กรุณาระบุคำถามหรือความต้องการของคุณ" },
        { status: 400 }
      );
    }

    // 1. Fetch real DB products or fallback to sample CCTV products catalog
    let allProducts: ProductSerialized[] = [];
    try {
      allProducts = await getProducts({ status: "published", limitCount: 50 });
    } catch {
      allProducts = [];
    }

    if (!allProducts) {
      allProducts = [];
    }

    const textLower = prompt.toLowerCase();

    // 2. Parse budget requirement
    let maxBudget: number | null = null;
    const budgetMatches = textLower.match(/(?:งบ|ราคา|ไม่เกิน|ประมาณ|\D)\s*([1-9]\d{2,5})(?:\s*บาท|\s*฿)?/);
    if (budgetMatches && budgetMatches[1]) {
      const extracted = parseInt(budgetMatches[1], 10);
      if (!isNaN(extracted) && extracted >= 300 && extracted <= 100000) {
        maxBudget = extracted;
      }
    } else {
      // Direct number matches like "3,000" or "3000"
      const cleanNum = textLower.replace(/,/g, "");
      const directNum = cleanNum.match(/([1-9]\d{2,4})/);
      if (directNum && directNum[1]) {
        const val = parseInt(directNum[1], 10);
        if (!isNaN(val) && val >= 300 && val <= 50000) {
          maxBudget = val;
        }
      }
    }

    // 3. Detect feature intent
    const isSolar = textLower.includes("โซล่า") || textLower.includes("solar") || textLower.includes("แสงอาทิตย์");
    const is4G = textLower.includes("4g") || textLower.includes("ใส่ซิม") || textLower.includes("ไม่ใช้เน็ตบ้าน") || textLower.includes("ไร่นา") || textLower.includes("สวน");
    const isOutdoor = textLower.includes("นอกบ้าน") || textLower.includes("outdoor") || textLower.includes("กันน้ำ") || textLower.includes("กลางแจ้ง");
    const isIndoor = textLower.includes("ในบ้าน") || textLower.includes("indoor") || textLower.includes("เฝ้าเด็ก") || textLower.includes("สัตว์เลี้ยง");
    const isCar = textLower.includes("รถ") || textLower.includes("dash") || textLower.includes("ติดรถ");
    const isNvr = textLower.includes("ชุด") || textLower.includes("nvr") || textLower.includes("หลายตัว");

    // 4. Filter products according to requirements
    let filtered = [...allProducts];

    if (maxBudget !== null) {
      filtered = filtered.filter((p) => p.price <= maxBudget! * 1.15); // allow 15% margin
    }

    if (isSolar) {
      filtered = filtered.filter((p) => p.powerSupply?.includes("Solar") || p.tags.some(t => t.toLowerCase().includes("solar")));
    } else if (is4G) {
      filtered = filtered.filter((p) => p.connectivity?.includes("4G") || p.tags.some(t => t.toLowerCase().includes("4g")));
    } else if (isCar) {
      filtered = filtered.filter((p) => p.categoryId === "cat-dash-cam" || p.tags.some(t => t.toLowerCase().includes("car") || t.toLowerCase().includes("dash")));
    } else if (isNvr) {
      filtered = filtered.filter((p) => p.categoryId === "cat-nvr-kit" || p.tags.some(t => t.toLowerCase().includes("nvr")));
    } else if (isOutdoor) {
      filtered = filtered.filter((p) => p.environment === "outdoor" || p.waterproof || p.tags.some(t => t.toLowerCase().includes("outdoor")));
    } else if (isIndoor) {
      filtered = filtered.filter((p) => p.environment === "indoor" || p.tags.some(t => t.toLowerCase().includes("indoor")));
    }

    // Fallback if filter is too strict
    if (filtered.length === 0) {
      filtered = maxBudget !== null 
        ? allProducts.filter((p) => p.price <= maxBudget! * 1.3) 
        : allProducts;
    }

    // Sort by rating & discount
    filtered.sort((a, b) => {
      // Prioritize within budget
      if (maxBudget) {
        const diffA = Math.abs(a.price - maxBudget);
        const diffB = Math.abs(b.price - maxBudget);
        if (a.price <= maxBudget && b.price > maxBudget) return -1;
        if (b.price <= maxBudget && a.price > maxBudget) return 1;
      }
      return (b.rating || 0) - (a.rating || 0);
    });

    const recommendations = filtered.slice(0, 3);

    // 5. Generate intelligent Thai AI Response summary
    let summaryText = "";

    if (maxBudget !== null) {
      summaryText = `จากการวิเคราะห์งบประมาณ **${maxBudget.toLocaleString()} บาท** ${
        isOutdoor ? "สำหรับติดตั้งภายนอกอาคาร" : isIndoor ? "สำหรับติดตั้งภายในบ้าน" : is4G ? "รุ่นใส่ซิม 4G ไม่ใช้ Wi-Fi" : isSolar ? "รุ่นพลังงานแสงอาทิตย์ (Solar)" : "และการใช้งานของคุณ"
      } AI ขอแนะนำกล้องวงจรปิดคุ้มค่าที่สุด 3 รุ่นเด็ดดังนี้ครับ:`;
    } else if (isSolar) {
      summaryText = "สำหรับกล้องวงจรปิดพลังงานแสงอาทิตย์ (Solar Cell) ติดตั้งนอกบ้าน ไร้สาย 100% ไม่ต้องเสียบปลั๊ก แนะนำรุ่นยอดฮิตต่อไปนี้ครับ:";
    } else if (is4G) {
      summaryText = "สำหรับพื้นที่ไม่มีเน็ตบ้านหรือ Wi-Fi (เช่น ไร่ สวน บ่อปลา) แนะนำกล้องวงจรปิดใส่ซิม 4G ดูผ่านมือถือได้ 24 ชั่วโมง ดังนี้ครับ:";
    } else if (isCar) {
      summaryText = "สำหรับกล้องติดรถยนต์ บันทึกหน้า-หลัง คมชัดระดับ 2K/4K พร้อมระบบ G-Sensor และ GPS ขอแนะนำรุ่นยอดนิยมดังนี้ครับ:";
    } else {
      summaryText = "AI ได้คัดสรรกล้องวงจรปิดคุณภาพสูง คุ้มค่าเงินที่สุด ที่ตอบโจทย์การใช้งานของคุณให้เลือก 3 รุ่นยอดฮิตครับ:";
    }

    return NextResponse.json({
      prompt,
      budgetParsed: maxBudget,
      summary: summaryText,
      recommendations: recommendations.map((item, index) => ({
        label: `รุ่น ${String.fromCharCode(65 + index)}`, // รุ่น A, รุ่น B, รุ่น C
        product: item,
        whyRecommend: getWhyRecommendText(item, maxBudget, isSolar, is4G, isOutdoor),
      })),
    });
  } catch (error) {
    console.error("AI Assistant API Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ AI กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}

function getWhyRecommendText(
  p: ProductSerialized,
  budget: number | null,
  isSolar: boolean,
  is4G: boolean,
  isOutdoor: boolean
): string {
  const highlights = [];
  if (p.resolution) highlights.push(`ความละเอียด ${p.resolution}`);
  if (p.waterproof) highlights.push("กันน้ำ IP66 ทนแดดทนฝน");
  if (p.nightVision) highlights.push(p.nightVision);
  if (p.powerSupply?.includes("Solar")) highlights.push("แผงโซล่าเซลล์ ไร้สายไฟ");
  if (p.connectivity?.includes("4G")) highlights.push("ใส่ซิม 4G ไม่ต้องใช้เน็ตบ้าน");
  if (p.aiFeatures && p.aiFeatures.length > 0) highlights.push(p.aiFeatures[0]);

  if (budget && p.price <= budget) {
    const leftOver = budget - p.price;
    if (leftOver > 0) {
      return `ราคาคุ้มค่าอยู่ในงบ (เหลือเงิน ${leftOver.toLocaleString()} บาท) - ${highlights.slice(0, 2).join(", ")}`;
    }
  }
  return `จุดเด่น: ${highlights.slice(0, 3).join(" • ")}`;
}
