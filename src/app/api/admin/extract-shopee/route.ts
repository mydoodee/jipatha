import { NextRequest, NextResponse } from "next/server";

// force-static for production static export compatibility.
// In dev mode (yarn dev), Next.js still runs this POST handler dynamically.
export const dynamic = "force-static";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Remove all non-ASCII letters/digits (strips Thai, emojis, special chars)
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateThaiSlug(name: string): string {
  const clean = slugify(name);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  if (clean && clean.length > 3) {
    // Limit slug length to avoid overly long URLs
    const trimmed = clean.substring(0, 60).replace(/-+$/, "");
    return `${trimmed}-${randomSuffix}`;
  }
  return `shopee-item-${Date.now()}-${randomSuffix}`;
}

function detectCategory(title: string, description: string): { name: string; slug: string } {
  const text = `${title} ${description}`.toLowerCase();

  const rules: { keywords: string[]; name: string; slug: string }[] = [
    {
      keywords: ["แคมป์ปิ้ง", "แคมป์", "เต็นท์", "เดินป่า", "ถุงนอน", "ฟลายชีท", "เก้าอี้สนาม", "โต๊ะพับ", "ตะเกียง", "เตาแก๊สพกพา", "เก้าอี้พับ", "กลางแจ้ง", "outdoor", "camping", "tent"],
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
 * Uses browser-like User-Agent and follows redirects to find the final URL.
 */
async function resolveShortLink(targetUrl: string): Promise<string> {
  if (!targetUrl.includes("s.shopee.co.th") && !targetUrl.includes("shopee.co.th/s/")) {
    return targetUrl;
  }

  const browserUA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

  // Method A: Follow redirect with browser UA — Shopee redirects to full URL
  try {
    const res = await fetch(targetUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": browserUA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    // Check if final URL has product IDs
    if (res.url && !res.url.includes("s.shopee.co.th")) {
      return res.url;
    }

    // Parse HTML body for URLs if still at short link domain
    const htmlText = await res.text();

    // Try to find product URL in the HTML
    const urlPatterns = [
      /property=["']og:url["']\s*content=["']([^"']+)["']/i,
      /content=["']([^"']+)["']\s*property=["']og:url["']/i,
      /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i,
      /href=["'](https?:\/\/shopee\.co\.th\/[^"']+)["']/i,
      /(https:\/\/shopee\.co\.th\/[^\s"'<>]+)/i,
    ];

    for (const pattern of urlPatterns) {
      const match = htmlText.match(pattern);
      if (match?.[1]) {
        return match[1];
      }
    }
  } catch {
    // fallback
  }

  // Method B: Manual redirect to capture Location header (301/302)
  try {
    const res = await fetch(targetUrl, {
      method: "GET",
      redirect: "manual",
      headers: {
        "User-Agent": browserUA,
      },
    });
    const location = res.headers.get("location");
    if (location && location.includes("shopee.co.th")) {
      return location;
    }
  } catch {
    // fallback
  }

  return targetUrl;
}

/**
 * Extract shopId and itemId from Shopee URL formats:
 *   /product/shopId/itemId
 *   /product/itemId
 *   /universal-link/product/itemId
 *   /product-name-i.shopId.itemId
 *   /shopName/shopId/itemId
 */
function extractIds(url: string): { shopId?: string; itemId: string } | null {
  // i.shopId.itemId format (most reliable)
  const iMatch = url.match(/i\.(\d+)\.(\d+)/);
  if (iMatch) {
    return { shopId: iMatch[1], itemId: iMatch[2] };
  }

  // /product/shopId/itemId or /username/shopId/itemId
  const productMatch = url.match(/\/(?:product\/)?(\d{5,15})\/(\d{5,15})/);
  if (productMatch) {
    return { shopId: productMatch[1], itemId: productMatch[2] };
  }

  // Single numeric ID: /product/itemId
  const singleMatch = url.match(/\/product\/(\d{5,15})(?:\?|\/|$)/);
  if (singleMatch) {
    return { itemId: singleMatch[1] };
  }

  return null;
}

/**
 * Parse OG meta tags from HTML. Handles both attribute orders:
 *   - property="og:title" content="..."
 *   - content="..." property="og:title"
 */
function parseOgMeta(html: string, property: string): string {
  // Order 1: property first
  const m1 = html.match(
    new RegExp(`property=["']${property}["']\\s+content=["']([^"']+)["']`, "i")
  );
  if (m1?.[1]) return m1[1];

  // Order 2: content first (Shopee's format)
  const m2 = html.match(
    new RegExp(`content=["']([^"']+)["']\\s+property=["']${property}["']`, "i")
  );
  if (m2?.[1]) return m2[1];

  return "";
}

function parseMetaName(html: string, name: string): string {
  const m1 = html.match(
    new RegExp(`name=["']${name}["']\\s+content=["']([^"']+)["']`, "i")
  );
  if (m1?.[1]) return m1[1];

  const m2 = html.match(
    new RegExp(`content=["']([^"']+)["']\\s+name=["']${name}["']`, "i")
  );
  if (m2?.[1]) return m2[1];

  return "";
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

    console.log("[extract-shopee] Input URL:", targetUrl);

    // ── Step 1: Resolve short link ─────────────────────────
    const resolvedUrl = await resolveShortLink(targetUrl);
    console.log("[extract-shopee] Resolved URL:", resolvedUrl);

    // ── Step 2: Extract IDs ────────────────────────────────
    const ids = extractIds(resolvedUrl) || extractIds(targetUrl);
    console.log("[extract-shopee] Extracted IDs:", ids);

    let title = "";
    let image = "";
    let description = "";
    let price = 0;
    let originalPrice = 0;
    let rating = 4.8;
    let ratingCount = 0;

    // ── Step 3: Scrape product page with Twitterbot UA ─────
    // Shopee returns full SSR HTML with OG tags + JSON-LD to social bots
    const scrapeUrl = ids?.shopId && ids?.itemId
      ? `https://shopee.co.th/product/${ids.shopId}/${ids.itemId}`
      : resolvedUrl;

    let html = "";
    try {
      const pageRes = await fetch(scrapeUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Twitterbot/1.0",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7",
        },
      });
      html = await pageRes.text();
      console.log("[extract-shopee] HTML length:", html.length);
    } catch (err) {
      console.error("[extract-shopee] Failed to fetch page:", err);
    }

    // ── Step 4: Parse JSON-LD Product data (most reliable) ─
    if (html) {
      const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
      let jsonLdMatch;
      while ((jsonLdMatch = jsonLdRegex.exec(html)) !== null) {
        try {
          const jsonData = JSON.parse(jsonLdMatch[1]);
          if (jsonData["@type"] === "Product") {
            if (jsonData.name) {
              title = jsonData.name;
            }
            if (jsonData.description) {
              description = jsonData.description;
            }
            if (jsonData.image) {
              image = typeof jsonData.image === "string" ? jsonData.image : jsonData.image[0];
            }
            if (jsonData.offers) {
              const offers = jsonData.offers;
              if (offers.price) {
                price = parseFloat(offers.price);
              } else if (offers.lowPrice) {
                price = parseFloat(offers.lowPrice);
              }
              if (offers.highPrice && parseFloat(offers.highPrice) > price) {
                originalPrice = parseFloat(offers.highPrice);
              }
            }
            // Extract seller rating if available
            if (jsonData.offers?.seller?.aggregateRating) {
              const aggRating = jsonData.offers.seller.aggregateRating;
              if (aggRating.ratingValue) {
                rating = parseFloat(aggRating.ratingValue);
              }
              if (aggRating.ratingCount) {
                ratingCount = parseInt(aggRating.ratingCount, 10);
              }
            }
            break;
          }
        } catch {
          // ignore parse errors
        }
      }
    }

    // ── Step 5: Fallback to OG meta tags ───────────────────
    if (html) {
      if (!title) {
        const ogTitle = parseOgMeta(html, "og:title");
        if (ogTitle) {
          title = ogTitle.replace(/\s*\|\s*Shopee\s*Thailand$/i, "").trim();
        }
      }

      if (!image) {
        const ogImage = parseOgMeta(html, "og:image");
        if (ogImage && ogImage.includes("susercontent.com")) {
          image = ogImage;
        }
      }

      if (!description) {
        const ogDesc = parseOgMeta(html, "og:description");
        if (ogDesc && !ogDesc.includes("Buy and Sell on Mobile")) {
          description = ogDesc;
        }
      }

      if (!description) {
        const metaDesc = parseMetaName(html, "description");
        if (metaDesc && !metaDesc.includes("Buy and Sell on Mobile")) {
          description = metaDesc;
        }
      }
    }

    // ── Step 6: Fallback title extraction from URL path ────
    if (!title) {
      try {
        const parsed = new URL(resolvedUrl);
        const pathname = decodeURIComponent(parsed.pathname);
        const titleMatch = pathname.match(/\/([^/]+)-i\.\d+\.\d+/);
        if (titleMatch?.[1]) {
          title = titleMatch[1].replace(/[-_]/g, " ").trim();
        }
      } catch {
        // ignore
      }
    }

    // ── Step 7: Fallback price parsing from HTML ───────────
    if (!price && html) {
      // product:price:amount meta
      const priceMetaMatch =
        html.match(/product:price:amount["']\s*content=["']([^"']+)["']/i) ||
        html.match(/content=["']([^"']+)["']\s*property=["']product:price:amount["']/i);
      if (priceMetaMatch?.[1]) {
        price = parseFloat(priceMetaMatch[1]);
      }
    }

    if (!price && html) {
      // "price":"169.00" in embedded JSON
      const scriptPriceMatch = html.match(/"price"\s*:\s*"?(\d+(?:\.\d+)?)"?/);
      if (scriptPriceMatch?.[1]) {
        let p = parseFloat(scriptPriceMatch[1]);
        if (p > 100000) p = p / 100000;
        price = p;
      }
    }

    // ── Step 8: Compute originalPrice if not found ─────────
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

    // ── Step 9: Clean title ────────────────────────────────
    // Remove generic Shopee suffixes
    title = title
      .replace(/\s*\|\s*Shopee\s*Thailand$/i, "")
      .replace(/\s*\|\s*Shopee$/i, "")
      .trim();

    // Reject garbage titles
    if (
      !title ||
      title.match(/^[\d\s\?&=_\-]+$/) ||
      title.includes("__mobile__") ||
      title.toLowerCase() === "shopee" ||
      title.toLowerCase() === "shopee thailand"
    ) {
      title = "";
    }

    // ── Step 10: Build response ────────────────────────────
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

    // Clean description for storage
    let cleanDescription = description || "";
    if (cleanDescription.includes("Buy and Sell on Mobile")) {
      cleanDescription = "";
    }

    console.log("[extract-shopee] Result:", {
      title: displayTitle,
      price,
      originalPrice,
      image: image ? "found" : "missing",
      category: suggestedCategory.name,
    });

    return NextResponse.json({
      success: true,
      data: {
        name: displayTitle,
        slug,
        price: price || 0,
        originalPrice: originalPrice || 0,
        discountPercent,
        images: image ? [image] : [],
        shortDescription: cleanDescription
          ? cleanDescription.slice(0, 160)
          : `แนะนำ ${displayTitle} การันตีคุณภาพ ราคาคุ้มค่าที่สุด`,
        description:
          cleanDescription ||
          `รายละเอียดสินค้า ${displayTitle} สามารถเช็คโปรโมชั่นล่าสุดและคูปองส่วนลดเพิ่มเติมได้ที่ปุ่มเช็คราคา`,
        affiliateUrl: targetUrl,
        status: "published",
        featured: false,
        rating: rating || 4.8,
        reviewCount: ratingCount || Math.floor(20 + Math.random() * 80),
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
