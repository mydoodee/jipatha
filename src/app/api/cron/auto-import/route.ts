import { NextRequest, NextResponse } from "next/server";
import { db, collection, getDocs, query, where, addDoc, serverTimestamp } from "@/lib/firebase/firestore";

export const dynamic = "force-dynamic";

// Curated list of popular Shopee product links across trending categories
const DEFAULT_TARGET_URLS = [
  "https://s.shopee.co.th/4Vbe7zo4fk", // Yegey เก้าอี้พับ
  "https://shopee.co.th/product/1421404320/25294615650",
  "https://s.shopee.co.th/30mqNEV8CY",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateThaiSlug(name: string): string {
  const clean = slugify(name);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  if (clean && clean.length > 3) {
    const trimmed = clean.substring(0, 60).replace(/-+$/, "");
    return `${trimmed}-${randomSuffix}`;
  }
  return `shopee-item-${Date.now()}-${randomSuffix}`;
}

function detectCategory(title: string, description: string): { name: string; slug: string } {
  const text = `${title} ${description}`.toLowerCase();

  const rules = [
    {
      keywords: ["แคมป์ปิ้ง", "แคมป์", "เต็นท์", "เดินป่า", "ถุงนอน", "ฟลายชีท", "เก้าอี้สนาม", "โต๊ะพับ", "ตะเกียง", "เก้าอี้พับ", "กลางแจ้ง", "outdoor", "camping"],
      name: "แคมป์ปิ้ง & กิจกรรมกลางแจ้ง",
      slug: "camping-and-outdoor",
    },
    {
      keywords: ["รถยนต์", "มอเตอร์ไซค์", "หมวกกันน็อค", "น้ำมันเครื่อง", "ยางรถ", "กล้องติดรถ", "car", "auto"],
      name: "ยานยนต์ & อุปกรณ์ตกแต่ง",
      slug: "automotive",
    },
    {
      keywords: ["กีฬา", "ออกกำลังกาย", "ฟิตเนส", "ดัมเบล", "เสื่อโยคะ", "จักรยาน", "fitness"],
      name: "กีฬา & ฟิตเนส",
      slug: "sports-and-fitness",
    },
    {
      keywords: ["สกุชชี่", "ของเล่น", "ตุ๊กตา", "การ์ตูน", "โมเดล", "บอร์ดเกม", "toy", "doll"],
      name: "ของเล่น & ของสะสม",
      slug: "toys-and-collectibles",
    },
    {
      keywords: ["เด็ก", "ทารก", "ผ้าอ้อม", "ขวดนม", " baby", "kid"],
      name: "แม่และเด็ก",
      slug: "baby-and-kids",
    },
    {
      keywords: ["เสื้อ", "กางเกง", "เดรส", "รองเท้า", "กระเป๋า", "หมวก", "แฟชั่น", "fashion", "shoes"],
      name: "แฟชั่น & เครื่องแต่งกาย",
      slug: "fashion-apparel",
    },
    {
      keywords: ["ครีม", "เซรั่ม", "ลิป", "แป้ง", "เครื่องสำอาง", "สกินแคร์", "แชมพู", "skin", "cream"],
      name: "ความงาม & ของใช้ส่วนตัว",
      slug: "beauty-personal-care",
    },
    {
      keywords: ["โทรศัพท์", "มือถือ", "เคส", "หูฟัง", "สายชาร์จ", "พาวเวอร์แบงค์", "คอมพิวเตอร์", "คีย์บอร์ด", "phone", "gadget"],
      name: "ไอที & อิเล็กทรอนิกส์",
      slug: "it-electronics",
    },
    {
      keywords: ["แก้ว", "พัดลม", "โคมไฟ", "เก้าอี้", "โต๊ะ", "หมอน", "กล่องเก็บ", "แต่งบ้าน", "home", "kitchen"],
      name: "ของใช้ในบ้าน & ตกแต่ง",
      slug: "home-living",
    },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      return { name: rule.name, slug: rule.slug };
    }
  }

  return { name: "สินค้าทั่วไป", slug: "general-products" };
}

async function extractMetadata(targetUrl: string) {
  const browserUA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
  const twitterBotUA = "Twitterbot/1.0";

  let resolvedUrl = targetUrl;

  // Resolve short link
  if (targetUrl.includes("s.shopee.co.th") || targetUrl.includes("shopee.co.th/s/")) {
    try {
      const res = await fetch(targetUrl, {
        method: "GET",
        redirect: "follow",
        headers: { "User-Agent": browserUA },
      });
      if (res.url && !res.url.includes("s.shopee.co.th")) {
        resolvedUrl = res.url;
      }
    } catch {
      // fallback
    }
  }

  // Extract shopId & itemId
  const iFormatMatch = resolvedUrl.match(/i\.(\d+)\.(\d+)/) || targetUrl.match(/i\.(\d+)\.(\d+)/);
  const pathMatch = resolvedUrl.match(/\/(?:[a-zA-Z0-9_\.-]+\/)?(\d{5,15})\/(\d{5,15})/) ||
                    targetUrl.match(/\/(?:[a-zA-Z0-9_\.-]+\/)?(\d{5,15})\/(\d{5,15})/);
  const bestMatch = iFormatMatch || pathMatch;
  const shopId = bestMatch?.[1] || null;
  const itemId = bestMatch?.[2] || bestMatch?.[1] || null;

  let title = "";
  let description = "";
  let image = "";
  let price = 0;

  if (shopId && itemId) {
    const scrapeUrl = `https://shopee.co.th/product/${shopId}/${itemId}`;
    try {
      const res = await fetch(scrapeUrl, {
        headers: { "User-Agent": twitterBotUA, "Accept-Language": "th-TH,th;q=0.9,en;q=0.8" },
      });

      if (res.ok) {
        const html = await res.text();
        // JSON-LD Product
        const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
        let jsonLdMatch;
        while ((jsonLdMatch = jsonLdRegex.exec(html)) !== null) {
          try {
            const jsonData = JSON.parse(jsonLdMatch[1]);
            if (jsonData["@type"] === "Product") {
              if (jsonData.name) title = jsonData.name;
              if (jsonData.description) description = jsonData.description;
              if (jsonData.image) {
                image = typeof jsonData.image === "string" ? jsonData.image : jsonData.image[0];
              }
              if (jsonData.offers) {
                if (jsonData.offers.price) price = parseFloat(jsonData.offers.price);
                else if (jsonData.offers.lowPrice) price = parseFloat(jsonData.offers.lowPrice);
              }
              break;
            }
          } catch {
            // ignore
          }
        }

        if (!title) {
          const ogTitle = html.match(/content=["']([^"']+)["']\s*property=["']og:title["']/i) ||
                          html.match(/property=["']og:title["']\s*content=["']([^"']+)["']/i);
          if (ogTitle?.[1]) {
            title = ogTitle[1].replace(/\s*\|\s*Shopee.*$/i, "").trim();
          }
        }
        if (!image) {
          const ogImage = html.match(/content=["']([^"']+)["']\s*property=["']og:image["']/i) ||
                          html.match(/property=["']og:image["']\s*content=["']([^"']+)["']/i);
          if (ogImage?.[1] && ogImage[1].includes("susercontent.com")) {
            image = ogImage[1];
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // URL fallback decoding if title missing
  if (!title || title.match(/^[\d\s]+$/)) {
    try {
      const parsedUrl = new URL(resolvedUrl);
      const pathname = decodeURIComponent(parsedUrl.pathname);
      const parts = pathname.split("/").filter(Boolean);
      for (let i = parts.length - 1; i >= 0; i--) {
        const part = parts[i];
        if (part === "universal-link" || part === "product") continue;
        let clean = part.replace(/-i\.\d+\.\d+$/, "").replace(/[\-_]/g, " ").trim();
        clean = clean.replace(/\?.*$/, "").replace(/__mobile__.*$/, "").trim();
        if (clean && clean.length > 3 && !clean.match(/^[a-zA-Z0-9]{4,15}$/)) {
          title = clean;
          break;
        }
      }
    } catch {
      // ignore
    }
  }

  return {
    title: title || "สินค้าแนะนำจาก Shopee",
    image: image || "",
    description: description || "",
    price: price || 0,
    resolvedUrl,
  };
}

async function runAutoImport(urlList: string[]) {
  const results = {
    total: urlList.length,
    imported: 0,
    skipped: 0,
    failed: 0,
    items: [] as any[],
  };

  // Get existing product names & affiliate URLs to avoid duplicates
  const existingSnapshot = await getDocs(collection(db, "products"));
  const existingNames = new Set(existingSnapshot.docs.map((d) => (d.data().name || "").toLowerCase().trim()));
  const existingUrls = new Set(existingSnapshot.docs.map((d) => (d.data().affiliateUrl || "").trim()));

  // Get categories to auto-assign categoryId
  const categoriesSnapshot = await getDocs(collection(db, "categories"));
  const categoryMap = new Map<string, string>(); // slug -> id
  categoriesSnapshot.docs.forEach((d) => {
    categoryMap.set(d.data().slug, d.id);
  });
  const defaultCategoryId = categoriesSnapshot.docs[0]?.id || "general-products";

  for (const rawUrl of urlList) {
    const cleanUrl = rawUrl.trim();
    if (!cleanUrl || !cleanUrl.startsWith("http")) continue;

    if (existingUrls.has(cleanUrl)) {
      results.skipped++;
      results.items.push({ url: cleanUrl, status: "skipped", reason: "มี URL นี้ในระบบแล้ว" });
      continue;
    }

    try {
      const meta = await extractMetadata(cleanUrl);

      if (existingNames.has(meta.title.toLowerCase().trim())) {
        results.skipped++;
        results.items.push({ url: cleanUrl, status: "skipped", reason: "มีชื่อสินค้านี้ในระบบแล้ว", title: meta.title });
        continue;
      }

      const slug = generateThaiSlug(meta.title);
      const cat = detectCategory(meta.title, meta.description);
      const categoryId = categoryMap.get(cat.slug) || defaultCategoryId;
      const computedOrigPrice = meta.price > 0 ? meta.price + 5 : 0;
      const computedDiscount = computedOrigPrice > meta.price ? Math.round(((computedOrigPrice - meta.price) / computedOrigPrice) * 100) : 0;

      // Create product in Firestore
      const productDoc = await addDoc(collection(db, "products"), {
        name: meta.title,
        slug,
        price: meta.price,
        originalPrice: computedOrigPrice,
        discountPercent: computedDiscount,
        rating: 5,
        categoryId,
        images: meta.image ? [meta.image] : [],
        shortDescription: meta.description ? meta.description.slice(0, 160) : `แนะนำ ${meta.title} การันตีคุณภาพ ราคาคุ้มค่าที่สุด`,
        description: meta.description || `รายละเอียดสินค้า ${meta.title} เช็คโปรโมชั่นส่วนลดล่าสุดได้ที่ปุ่มเช็คราคา`,
        affiliateUrl: cleanUrl,
        affiliateLinkId: "",
        tags: [meta.title, "Shopee Affiliate", "ส่วนลด Shopee"],
        platform: "shopee",
        status: "published",
        featured: false,
        seoTitle: `${meta.title} — ราคาพิเศษ Shopee`,
        seoDescription: `ซื้อ ${meta.title} ราคาดีที่สุด เช็คส่วนลดและโปรโมชั่นล่าสุด`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Create affiliate link in Firestore
      const linkDoc = await addDoc(collection(db, "affiliate_links"), {
        productId: productDoc.id,
        originalUrl: cleanUrl,
        affiliateUrl: cleanUrl,
        platform: "shopee",
        clicks: 0,
        conversions: 0,
        earnings: 0,
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      results.imported++;
      results.items.push({
        id: productDoc.id,
        title: meta.title,
        price: meta.price,
        slug,
        status: "success",
      });
    } catch (err: any) {
      results.failed++;
      results.items.push({ url: cleanUrl, status: "failed", error: err.message });
    }
  }

  return results;
}

export async function GET(req: NextRequest) {
  try {
    const results = await runAutoImport(DEFAULT_TARGET_URLS);
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const urls: string[] = body.urls && Array.isArray(body.urls) && body.urls.length > 0
      ? body.urls
      : DEFAULT_TARGET_URLS;

    const results = await runAutoImport(urls);
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
