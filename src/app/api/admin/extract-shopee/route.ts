import { NextRequest, NextResponse } from "next/server";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateThaiSlug(name: string): string {
  const clean = slugify(name);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  if (clean && clean.length > 3) {
    return `${clean}-${randomSuffix}`;
  }
  return `shopee-item-${Date.now()}-${randomSuffix}`;
}

function detectCategory(title: string, description: string): { name: string; slug: string } {
  const text = `${title} ${description}`.toLowerCase();

  const rules: { keywords: string[]; name: string; slug: string }[] = [
    {
      keywords: ["แคมป์ปิ้ง", "แคมป์", "เต็นท์", "เดินป่า", "ถุงนอน", "ฟลายชีท", "เก้าอี้สนาม", "โต๊ะพับ", "ตะเกียง", "เตาแก๊สพกพา", "outdoor", "camping", "tent"],
      name: "แคมป์ปิ้ง & กิจกรรมกลางแจ้ง",
      slug: "camping-and-outdoor",
    },
    {
      keywords: ["รถยนต์", "มอเตอร์ไซค์", "หมวกกันน็อค", "น้ำมันเครื่อง", "ยางรถ", "กล้องติดรถ", "ฟิล์มกรองแสง", "car", "motorcycle", "auto"],
      name: "ยานยนต์ & อุปกรณ์ตกแต่ง",
      slug: "automotive",
    },
    {
      keywords: ["กีฬา", "ออกกำลังกาย", "ฟิตเนส", "ดัมเบล", "เสื่อโยคะ", "จักรยาน", "วิ่ง", "sport", "fitness", "exercise"],
      name: "กีฬา & ฟิตเนส",
      slug: "sports-and-fitness",
    },
    {
      keywords: ["สกุชชี่", "ของเล่น", "ตุ๊กตา", "การ์ตูน", "ตัวต่อ", "โมเดล", "บอร์ดเกม", "ของสะสม", "ฟิกเกอร์", "กล่องสุ่ม", "squishy", "toy", "doll", "lego"],
      name: "ของเล่น & ของสะสม",
      slug: "toys-and-collectibles",
    },
    {
      keywords: ["เด็ก", "ทารก", "ผ้าอ้อม", "ขวดนม", "รถดัน", "เปล", "คาร์ซีท", "baby", "kid"],
      name: "แม่และเด็ก",
      slug: "baby-and-kids",
    },
    {
      keywords: ["เสื้อ", "กางเกง", "กระโปรง", "ชุด", "เดรส", "รองเท้า", "กระเป๋า", "หมวก", "ถุงเท้า", "แว่นตา", "เครื่องประดับ", "นาฬิกา", "แฟชั่น", "shirt", "dress", "shoes", "bag", "fashion"],
      name: "แฟชั่น & เครื่องแต่งกาย",
      slug: "fashion-apparel",
    },
    {
      keywords: ["ครีม", "เซรั่ม", "ลิป", "แป้ง", "เครื่องสำอาง", "น้ำหอม", "สกินแคร์", "แชมพู", "สบู่", "สิว", "หน้าผาก", "skin", "cream", "makeup", "beauty"],
      name: "ความงาม & ของใช้ส่วนตัว",
      slug: "beauty-personal-care",
    },
    {
      keywords: ["โทรศัพท์", "มือถือ", "เคส", "หูฟัง", "สายชาร์จ", "พาวเวอร์แบงค์", "โน๊ตบุ๊ค", "คอมพิวเตอร์", "คีย์บอร์ด", "เมาส์", "กล้อง", "ลำโพง", "smartwatch", "phone", "case", "headphone", "gadget"],
      name: "ไอที & อิเล็กทรอนิกส์",
      slug: "it-electronics",
    },
    {
      keywords: ["แก้ว", "จาน", "ชาม", "หม้อ", "กระทะ", "พัดลม", "โคมไฟ", "เก้าอี้", "โต๊ะ", "หมอน", "ผ้าห่ม", "กล่องเก็บ", "ทำความสะอาด", "แต่งบ้าน", "home", "kitchen"],
      name: "ของใช้ในบ้าน & ตกแต่ง",
      slug: "home-living",
    },
    {
      keywords: ["ขนม", "กาแฟ", "ชา", "อาหาร", "ช็อกโกแลต", "คุ้กกี้", "เครื่องดื่ม", "snack", "coffee", "food"],
      name: "อาหาร & เครื่องดื่ม",
      slug: "food-and-beverages",
    },
    {
      keywords: ["วิตามิน", "อาหารเสริม", "คอลลาเจน", "ยาสมุนไพร", "โปรตีน", "mask", "หน้ากาก", "vitamin", "supplement"],
      name: "สุขภาพ & อาหารเสริม",
      slug: "health-supplements",
    },
    {
      keywords: ["แมว", "หมา", "สุนัข", "อาหารแมว", "อาหารหมา", "ทรายแมว", "กรง", "cat", "dog", "pet"],
      name: "ของใช้สัตว์เลี้ยง",
      slug: "pet-supplies",
    },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      return { name: rule.name, slug: rule.slug };
    }
  }

  // Extract first 2 clean words from title if no rule matched
  const cleanTitle = title.replace(/[🔥⚡💥🚀✨💖✅❌\(\)\[\]\-_]/g, " ").trim();
  const words = cleanTitle.split(/\s+/).filter((w) => w.length > 2);
  if (words.length > 0) {
    const name = words.slice(0, 2).join(" ");
    const slug = slugify(name) || `cat-${Date.now()}`;
    return { name, slug };
  }

  return { name: "สินค้าทั่วไป", slug: "general-products" };
}

/**
 * Resolve Shopee short link (s.shopee.co.th) to full product URL.
 * Tries multiple User-Agents because Shopee behaves differently per bot.
 */
async function resolveShortLink(targetUrl: string): Promise<string> {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Twitterbot/1.0",
    "",
  ];

  for (const ua of userAgents) {
    try {
      const headers: Record<string, string> = {};
      if (ua) headers["User-Agent"] = ua;

      const res = await fetch(targetUrl, {
        method: "GET",
        redirect: "manual",
        headers,
      });

      const location = res.headers.get("location");
      if (location && location.includes("shopee.co.th")) {
        return location;
      }
    } catch {
      // try next UA
    }
  }

  // Fallback: follow redirect fully
  try {
    const res = await fetch(targetUrl, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      },
    });
    return res.url;
  } catch {
    return targetUrl;
  }
}

/**
 * Extract shopId and itemId from Shopee URL formats:
 *   /product/shopId/itemId
 *   /shopName/shopId/itemId
 *   /product-name-i.shopId.itemId
 */
function extractIds(url: string): { shopId: string; itemId: string } | null {
  const m = url.match(/\/(\d+)\/(\d+)/) || url.match(/i\.(\d+)\.(\d+)/);
  if (m) return { shopId: m[1], itemId: m[2] };
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "กรุณาระบุ URL ของ Shopee" },
        { status: 400 }
      );
    }

    let targetUrl = url.trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = `https://${targetUrl}`;
    }

    // ── Step 1: Resolve short link ─────────────────────────
    const resolvedUrl = await resolveShortLink(targetUrl);

    // ── Step 2: Build canonical product URL ────────────────
    const ids = extractIds(resolvedUrl);
    const fetchUrl = ids
      ? `https://shopee.co.th/product/${ids.shopId}/${ids.itemId}`
      : resolvedUrl;

    // ── Step 3: Fetch SSR HTML via Twitterbot ──────────────
    // Shopee serves full OpenGraph metadata + embedded JSON to Twitterbot
    let html = "";
    try {
      const pageRes = await fetch(fetchUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Twitterbot/1.0",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7",
        },
      });
      html = await pageRes.text();
    } catch {
      // ignore
    }

    // ── Step 4: Extract metadata ───────────────────────────

    // Title
    let title = "";
    const ogTitleMatch =
      html.match(
        /property=["']og:title["']\s*content=["']([^"']+)["']/i
      ) ||
      html.match(
        /content=["']([^"']+)["']\s*property=["']og:title["']/i
      );
    if (ogTitleMatch?.[1]) {
      title = ogTitleMatch[1];
    } else {
      const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleTag?.[1]) title = titleTag[1];
    }
    title = title.replace(/\s*\|\s*Shopee.*$/i, "").trim();

    // Image
    let image = "";
    const ogImageMatch =
      html.match(
        /property=["']og:image["']\s*content=["']([^"']+)["']/i
      ) ||
      html.match(
        /content=["']([^"']+)["']\s*property=["']og:image["']/i
      );
    if (ogImageMatch?.[1]) {
      image = ogImageMatch[1];
    }

    // Description
    let description = "";
    const ogDescMatch =
      html.match(
        /property=["']og:description["']\s*content=["']([^"']+)["']/i
      ) ||
      html.match(
        /content=["']([^"']+)["']\s*property=["']og:description["']/i
      );
    if (ogDescMatch?.[1]) {
      description = ogDescMatch[1].trim();
    }

    // ── Step 5: Extract Price (multi-strategy) ─────────────
    let price = 0;
    let originalPrice = 0;

    // Strategy A: OG meta tag product:price:amount
    const ogPriceMatch =
      html.match(
        /product:price:amount["']\s*content=["']([^"']+)["']/i
      ) ||
      html.match(
        /og:price:amount["']\s*content=["']([^"']+)["']/i
      );
    if (ogPriceMatch?.[1]) {
      price = parseFloat(ogPriceMatch[1]);
    }

    // Strategy B: JSON embedded in script tags — "price":"69.00" or "price":69
    if (!price) {
      const scriptPriceMatch = html.match(
        /"price"\s*:\s*"?(\d+(?:\.\d+)?)"?/
      );
      if (scriptPriceMatch?.[1]) {
        let p = parseFloat(scriptPriceMatch[1]);
        // Shopee internal API uses price * 100000, but SSR HTML uses real price
        if (p > 100000) p = p / 100000;
        price = p;
      }
    }

    // Strategy C: price_min from JSON
    if (!price) {
      const priceMinMatch = html.match(
        /"price_min"\s*:\s*"?(\d+(?:\.\d+)?)"?/
      );
      if (priceMinMatch?.[1]) {
        let p = parseFloat(priceMinMatch[1]);
        if (p > 100000) p = p / 100000;
        price = p;
      }
    }

    // Strategy D: JSON-LD structured data (offers.lowPrice / highPrice)
    if (!price) {
      const jsonLdMatches = html.match(
        /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
      );
      if (jsonLdMatches) {
        for (const block of jsonLdMatches) {
          try {
            const inner = block
              .replace(/<script[^>]*>/i, "")
              .replace(/<\/script>/i, "");
            const json = JSON.parse(inner);
            if (json["@type"] === "Product" && json.offers) {
              const offers = json.offers;
              if (offers.lowPrice) {
                price = parseFloat(offers.lowPrice);
              } else if (offers.price) {
                price = parseFloat(offers.price);
              }
              if (offers.highPrice && parseFloat(offers.highPrice) > price) {
                originalPrice = parseFloat(offers.highPrice);
              }
              // Also extract image from JSON-LD if not found yet
              if (!image && json.image) {
                image = typeof json.image === "string" ? json.image : json.image[0];
              }
              // Extract description from JSON-LD if not found yet
              if (!description && json.description) {
                description = json.description.slice(0, 500);
              }
              break;
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    }

    // Strategy E: ฿ symbol in HTML text (last resort)
    if (!price) {
      const bahtMatch = html.match(/[฿]\s*(\d[\d,]*(?:\.\d+)?)/);
      if (bahtMatch?.[1]) {
        price = parseFloat(bahtMatch[1].replace(/,/g, ""));
      }
    }

    // Extract original price (price_before_discount)
    const pbdMatch = html.match(
      /"price_before_discount"\s*:\s*"?(\d+(?:\.\d+)?)"?/
    );
    if (pbdMatch?.[1]) {
      let op = parseFloat(pbdMatch[1]);
      if (op > 100000) op = op / 100000;
      originalPrice = op;
    }

    // If original price is not present or not higher than current price, set originalPrice = price + 5
    if (price > 0 && (!originalPrice || originalPrice <= price)) {
      originalPrice = price + 5;
    }

    // Calculate discount
    let discountPercent = 0;
    if (originalPrice && price && originalPrice > price) {
      discountPercent = Math.round(
        ((originalPrice - price) / originalPrice) * 100
      );
    }

    // ── Step 6: Build response ─────────────────────────────
    const displayTitle = title || "สินค้าคุณภาพจาก Shopee";
    const seoTitle = `${displayTitle} — ราคาพิเศษ & ดีลส่วนลด Shopee`;
    const seoDescription = description
      ? `${description.slice(0, 140)}... เช็คราคาสุดคุ้มและส่วนลดพิเศษได้ที่นี่`
      : `ซื้อ ${displayTitle} ในราคาที่ดีที่สุด พร้อมโปรโมชั่นและส่วนลดพิเศษจาก Shopee`;

    const keywordsArray = [
      displayTitle,
      `รีวิว ${displayTitle}`,
      `เช็คราคา ${displayTitle}`,
      "Shopee Affiliate",
      "ส่วนลด Shopee",
    ];

    const slug = generateThaiSlug(displayTitle);
    const suggestedCategory = detectCategory(displayTitle, description);

    return NextResponse.json({
      success: true,
      data: {
        name: displayTitle,
        slug,
        price: price || 0,
        originalPrice: originalPrice || 0,
        discountPercent,
        images: image ? [image] : [],
        shortDescription: description
          ? description.slice(0, 160)
          : `แนะนำ ${displayTitle} การันตีคุณภาพ ราคาคุ้มค่าที่สุด`,
        description:
          description ||
          `รายละเอียดสินค้า ${displayTitle} สามารถเช็คโปรโมชั่นล่าสุดและคูปองส่วนลดเพิ่มเติมได้ที่ปุ่มเช็คราคา`,
        affiliateUrl: targetUrl,
        status: "published",
        featured: false,
        rating: 4.8,
        reviewCount: Math.floor(20 + Math.random() * 80),
        suggestedCategory,
        seo: {
          title: seoTitle.slice(0, 70),
          description: seoDescription.slice(0, 160),
          keywords: keywordsArray,
        },
      },
    });
  } catch (error: unknown) {
    console.error("Auto extraction error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "ไม่สามารถดึงข้อมูลจาก URL นี้ได้";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
