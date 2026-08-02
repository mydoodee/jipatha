import { db, collection, getDocs, addDoc, updateDoc, doc, serverTimestamp } from "@/lib/firebase/firestore";

export interface ShopeeSellerProduct {
  id: string; // item_id
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
  status: string; // NORMAL, UNLIST, DELETED, etc.
  sku: string;
  images: string[];
  coverImage: string;
  description: string;
  itemUrl: string;
  shopId?: string;
  models?: {
    id: string;
    name: string;
    price: number;
    stock: number;
    sku: string;
  }[];
}

export interface ShopeeCookieTestResult {
  valid: boolean;
  shopName?: string;
  shopId?: string;
  totalProducts?: number;
  username?: string;
  error?: string;
}

const SHOPEE_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

/**
 * Format Shopee image hash into a full CDN URL if needed
 */
export function formatShopeeImageUrl(imgHashOrUrl: string): string {
  if (!imgHashOrUrl) return "";
  if (imgHashOrUrl.startsWith("http://") || imgHashOrUrl.startsWith("https://")) {
    return imgHashOrUrl;
  }
  return `https://down-th.img.susercontent.com/file/${imgHashOrUrl}`;
}

/**
 * Format Shopee price (which can sometimes be in micros like 290000000 -> 290)
 */
function parseShopeePrice(val: any): number {
  if (val === undefined || val === null) return 0;
  const num = parseFloat(val);
  if (isNaN(num)) return 0;
  // If price is in micros (Shopee API often returns price * 100,000)
  if (num > 1000000) {
    return Math.round(num / 100000);
  }
  return num;
}

/**
 * Normalize Cookie string to ensure key headers exist
 */
function cleanCookie(rawCookie: string): string {
  let cookie = rawCookie.trim();
  if (!cookie.includes("=")) {
    // If user only pasted SPC_EC value
    cookie = `SPC_EC=${cookie};`;
  }
  return cookie;
}

/**
 * Test Shopee Seller Cookie connection and fetch shop metadata
 */
export async function testShopeeSellerCookie(rawCookie: string): Promise<ShopeeCookieTestResult> {
  const cookie = cleanCookie(rawCookie);

  try {
    // Test API: Get product count or shop info
    const res = await fetch("https://seller.shopee.co.th/api/v3/product/get_product_list?page_size=1&page_number=1&status=all", {
      method: "GET",
      headers: {
        Cookie: cookie,
        "User-Agent": SHOPEE_USER_AGENT,
        Referer: "https://seller.shopee.co.th/portal/product/list/all",
        Accept: "application/json, text/plain, */*",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        valid: false,
        error: `Shopee API ตอบกลับ HTTP ${res.status}: ไม่สามารถตรวจสอบ Cookie ได้`,
      };
    }

    const data = await res.json();

    // Check code/message from Shopee response
    if (data.code !== 0 && data.code !== undefined && data.code !== null) {
      if (data.code === 10000 || data.code === 10001 || data.message?.includes("login") || data.message?.includes("cookie")) {
        return {
          valid: false,
          error: "Session Cookie หมดอายุหรือไม่ถูกต้อง กรุณาล็อกอิน Shopee Seller Centre และคัดลอก Cookie ใหม่",
        };
      }
      return {
        valid: false,
        error: `Shopee Error (${data.code}): ${data.message || "ไม่สามารถเชื่อมต่อได้"}`,
      };
    }

    const pageInfo = data.data?.page_info || data.data?.pagination || {};
    const totalProducts = pageInfo.total ?? data.data?.total ?? 0;

    // Try fetching shop user info if available
    let shopName = "Shopee Seller Shop";
    let shopId = "";

    try {
      const infoRes = await fetch("https://seller.shopee.co.th/api/v3/general/get_shop_info", {
        headers: {
          Cookie: cookie,
          "User-Agent": SHOPEE_USER_AGENT,
          Referer: "https://seller.shopee.co.th/",
        },
      });
      if (infoRes.ok) {
        const infoData = await infoRes.json();
        if (infoData.data?.shop_name) {
          shopName = infoData.data.shop_name;
        }
        if (infoData.data?.shop_id || infoData.data?.shopid) {
          shopId = String(infoData.data.shop_id || infoData.data.shopid);
        }
      }
    } catch {
      // ignore shop info failure
    }

    return {
      valid: true,
      shopName,
      shopId,
      totalProducts,
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${err.message}`,
    };
  }
}

/**
 * Fetch products list directly from Shopee Seller Centre API
 */
export async function fetchShopeeSellerProducts(params: {
  cookie: string;
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}): Promise<{
  success: boolean;
  products: ShopeeSellerProduct[];
  total: number;
  page: number;
  pageSize: number;
  error?: string;
}> {
  const cookie = cleanCookie(params.cookie);
  const page = params.page || 1;
  const pageSize = params.pageSize || 24;
  const status = params.status || "all";

  try {
    let apiUrl = `https://seller.shopee.co.th/api/v3/product/get_product_list?page_size=${pageSize}&page_number=${page}&status=${status}`;
    if (params.search) {
      apiUrl += `&search=${encodeURIComponent(params.search)}`;
    }

    const res = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Cookie: cookie,
        "User-Agent": SHOPEE_USER_AGENT,
        Referer: "https://seller.shopee.co.th/portal/product/list/all",
        Accept: "application/json, text/plain, */*",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        success: false,
        products: [],
        total: 0,
        page,
        pageSize,
        error: `Shopee HTTP Error ${res.status}`,
      };
    }

    const data = await res.json();

    if (data.code !== 0 && data.code !== undefined && data.code !== null) {
      return {
        success: false,
        products: [],
        total: 0,
        page,
        pageSize,
        error: data.message || `Shopee Code ${data.code}`,
      };
    }

    const list = data.data?.list || data.data?.products || data.data?.items || [];
    const total = data.data?.page_info?.total ?? data.data?.total ?? list.length;

    const products: ShopeeSellerProduct[] = list.map((item: any) => {
      const itemId = String(item.item_id || item.id || item.itemid || "");
      const shopId = String(item.shop_id || item.shopid || "");
      const name = item.name || item.item_name || "สินค้าไม่มีชื่อ";

      const coverHash = item.cover_image || item.image || (item.images && item.images[0]) || "";
      const rawImages: string[] = item.images || item.image_list || (coverHash ? [coverHash] : []);
      const formattedImages = rawImages.map(formatShopeeImageUrl).filter(Boolean);
      const coverImage = formatShopeeImageUrl(coverHash) || formattedImages[0] || "";

      // Price & Stock logic
      let price = parseShopeePrice(item.price || item.price_min || item.price_max);
      let stock = item.stock ?? item.normal_stock ?? item.total_stock ?? 0;

      // Models / Variations
      const models = (item.model_list || item.models || []).map((m: any) => ({
        id: String(m.model_id || m.id || ""),
        name: m.name || m.model_name || "",
        price: parseShopeePrice(m.price),
        stock: m.stock ?? 0,
        sku: m.sku || m.model_sku || "",
      }));

      if (models.length > 0 && price === 0) {
        price = models[0].price;
      }

      const sku = item.sku || item.item_sku || "";
      const statusStr = item.item_status || item.status || "NORMAL";
      const itemUrl = shopId && itemId ? `https://shopee.co.th/product/${shopId}/${itemId}` : `https://shopee.co.th/i.${shopId}.${itemId}`;

      return {
        id: itemId,
        name,
        price,
        stock,
        status: statusStr,
        sku,
        images: formattedImages,
        coverImage,
        description: item.description || "",
        itemUrl,
        shopId,
        models,
      };
    });

    return {
      success: true,
      products,
      total,
      page,
      pageSize,
    };
  } catch (err: any) {
    return {
      success: false,
      products: [],
      total: 0,
      page,
      pageSize,
      error: `เกิดข้อผิดพลาด: ${err.message}`,
    };
  }
}

/**
 * Generate a URL-safe Thai slug
 */
function createSlug(name: string, itemId: string): string {
  const clean = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const trimmed = clean.length > 3 ? clean.substring(0, 50).replace(/-+$/, "") : "shopee-item";
  return `${trimmed}-${itemId.slice(-6)}`;
}

/**
 * Auto-detect category based on product title
 */
function autoDetectCategory(title: string): { name: string; slug: string } {
  const text = title.toLowerCase();
  const rules = [
    { keywords: ["แคมป์", "เต็นท์", "เดินป่า", "เก้าอี้พับ", "outdoor"], name: "แคมป์ปิ้ง & กิจกรรมกลางแจ้ง", slug: "camping-and-outdoor" },
    { keywords: ["รถยนต์", "มอเตอร์ไซค์", "หมวกกันน็อค", "car", "auto"], name: "ยานยนต์ & อุปกรณ์ตกแต่ง", slug: "automotive" },
    { keywords: ["กีฬา", "ฟิตเนส", "ดัมเบล", "จักรยาน", "fitness"], name: "กีฬา & ฟิตเนส", slug: "sports-and-fitness" },
    { keywords: ["ของเล่น", "ตุ๊กตา", "โมเดล", "toy"], name: "ของเล่น & ของสะสม", slug: "toys-and-collectibles" },
    { keywords: ["เสื้อ", "กางเกง", "เดรส", "รองเท้า", "กระเป๋า", "fashion"], name: "แฟชั่น & เครื่องแต่งกาย", slug: "fashion-apparel" },
    { keywords: ["ครีม", "เซรั่ม", "เครื่องสำอาง", "สกินแคร์", "skin"], name: "ความงาม & ของใช้ส่วนตัว", slug: "beauty-personal-care" },
    { keywords: ["โทรศัพท์", "มือถือ", "เคส", "หูฟัง", "คีย์บอร์ด", "gadget"], name: "ไอที & อิเล็กทรอนิกส์", slug: "it-electronics" },
    { keywords: ["แก้ว", "โคมไฟ", "เก้าอี้", "โต๊ะ", "แต่งบ้าน", "home"], name: "ของใช้ในบ้าน & ตกแต่ง", slug: "home-living" },
  ];

  for (const r of rules) {
    if (r.keywords.some((k) => text.includes(k))) return r;
  }
  return { name: "สินค้าทั่วไป", slug: "general-products" };
}

/**
 * Sync selected Shopee Seller Products into Firestore
 */
export async function syncShopeeProductsToFirestore(productsToSync: ShopeeSellerProduct[]) {
  const results = {
    total: productsToSync.length,
    imported: 0,
    updated: 0,
    failed: 0,
    items: [] as any[],
  };

  // Get existing products snapshot for duplicate detection
  const existingSnap = await getDocs(collection(db, "products"));
  const existingMapByShopeeId = new Map<string, { id: string; name: string }>();
  const existingMapByUrl = new Map<string, string>();

  existingSnap.docs.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.shopeeItemId) {
      existingMapByShopeeId.set(String(data.shopeeItemId), { id: docSnap.id, name: data.name });
    }
    if (data.affiliateUrl) {
      existingMapByUrl.set(data.affiliateUrl, docSnap.id);
    }
  });

  // Get categories map
  const catSnap = await getDocs(collection(db, "categories"));
  const catMap = new Map<string, string>();
  catSnap.docs.forEach((c) => catMap.set(c.data().slug, c.id));
  const defaultCategoryId = catSnap.docs[0]?.id || "general-products";

  for (const item of productsToSync) {
    try {
      const slug = createSlug(item.name, item.id);
      const detectedCat = autoDetectCategory(item.name);
      const categoryId = catMap.get(detectedCat.slug) || defaultCategoryId;
      const images = item.images.length > 0 ? item.images : item.coverImage ? [item.coverImage] : [];

      const computedOrigPrice = item.price > 0 ? Math.round(item.price * 1.15) : 0;
      const computedDiscount = computedOrigPrice > item.price ? Math.round(((computedOrigPrice - item.price) / computedOrigPrice) * 100) : 0;

      const existingItem = existingMapByShopeeId.get(item.id) || (item.itemUrl ? existingMapByUrl.get(item.itemUrl) : null);

      if (existingItem) {
        // Update existing item in Firestore
        const docId = typeof existingItem === "string" ? existingItem : existingItem.id;
        await updateDoc(doc(db, "products", docId), {
          name: item.name,
          price: item.price,
          originalPrice: computedOrigPrice,
          discountPercent: computedDiscount,
          stock: item.stock,
          images,
          sku: item.sku || "",
          updatedAt: serverTimestamp(),
        });

        results.updated++;
        results.items.push({
          id: docId,
          shopeeId: item.id,
          name: item.name,
          status: "updated",
          price: item.price,
        });
      } else {
        // Create new item in Firestore
        const productDoc = await addDoc(collection(db, "products"), {
          name: item.name,
          slug,
          price: item.price,
          originalPrice: computedOrigPrice,
          discountPercent: computedDiscount,
          rating: 5,
          stock: item.stock,
          sku: item.sku || "",
          categoryId,
          images,
          shortDescription: item.description ? item.description.slice(0, 160) : `สินค้าคุณภาพ ${item.name} สั่งซื้อส่งตรงจากร้าน Shopee`,
          description: item.description || `รายละเอียดสินค้า ${item.name} สั่งซื้อราคาพิเศษจากร้านค้าShopee`,
          affiliateUrl: item.itemUrl,
          shopeeItemId: item.id,
          shopeeShopId: item.shopId || "",
          platform: "shopee",
          status: item.status === "NORMAL" ? "published" : "draft",
          featured: false,
          seoTitle: `${item.name} — สินค้าจาก Shopee`,
          seoDescription: `สั่งซื้อ ${item.name} ราคาคุ้มค่าที่สุด`,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // Add affiliate link record
        await addDoc(collection(db, "affiliate_links"), {
          productId: productDoc.id,
          originalUrl: item.itemUrl,
          affiliateUrl: item.itemUrl,
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
          shopeeId: item.id,
          name: item.name,
          status: "created",
          price: item.price,
        });
      }
    } catch (err: any) {
      results.failed++;
      results.items.push({
        shopeeId: item.id,
        name: item.name,
        status: "failed",
        error: err.message,
      });
    }
  }

  return results;
}
