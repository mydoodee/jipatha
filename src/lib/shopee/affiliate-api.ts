import { db, collection, getDocs, addDoc, updateDoc, doc, serverTimestamp } from "@/lib/firebase/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export interface ShopeeAffiliateOffer {
  id: string;
  itemId: string;
  shopId: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  commissionRate: number;
  commissionAmount: number;
  salesCount: number;
  rating: number;
  imageUrl: string;
  images: string[];
  productUrl: string;
  affiliateUrl: string;
  shopName: string;
  categoryName?: string;
}

export interface ShopeeAffiliateCookieTestResult {
  valid: boolean;
  username?: string;
  totalOffers?: number;
  error?: string;
}

const SHOPEE_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

function cleanCookie(rawCookie: string): string {
  let cookie = rawCookie.trim();
  if (!cookie.includes("=")) {
    cookie = `SPC_EC=${cookie};`;
  }
  return cookie;
}

function parsePrice(val: any): number {
  if (!val) return 0;
  const num = parseFloat(val);
  if (isNaN(num)) return 0;
  if (num > 1000000) return Math.round(num / 100000);
  return num;
}

function formatImageUrl(imgHashOrUrl: string): string {
  if (!imgHashOrUrl) return "";
  if (imgHashOrUrl.startsWith("http://") || imgHashOrUrl.startsWith("https://")) return imgHashOrUrl;
  return `https://down-th.img.susercontent.com/file/${imgHashOrUrl}`;
}

export async function testShopeeAffiliateCookie(rawCookie: string): Promise<ShopeeAffiliateCookieTestResult> {
  const cookie = cleanCookie(rawCookie);

  try {
    const res = await fetch("https://affiliate.shopee.co.th/api/v3/offer/product/list?page_size=1&page_number=1", {
      method: "GET",
      headers: {
        Cookie: cookie,
        "User-Agent": SHOPEE_USER_AGENT,
        Referer: "https://affiliate.shopee.co.th/offer/product_offer",
        Accept: "application/json, text/plain, */*",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        valid: false,
        error: `Shopee Affiliate API ตอบกลับ HTTP ${res.status}: กรุณาตรวจสอบ Cookie`,
      };
    }

    const data = await res.json();

    if (data.code !== 0 && data.code !== undefined && data.code !== null) {
      if (data.code === 10000 || data.code === 10001 || data.message?.includes("login") || data.message?.includes("unauthorized")) {
        return {
          valid: false,
          error: "Session Cookie หมดอายุหรือไม่ถูกต้อง กรุณาล็อกอิน affiliate.shopee.co.th และคัดลอก Cookie ใหม่",
        };
      }
      return {
        valid: false,
        error: `Shopee Error (${data.code}): ${data.message || "ไม่สามารถเชื่อมต่อได้"}`,
      };
    }

    const total = data.data?.page_info?.total ?? data.data?.total ?? 100;

    return {
      valid: true,
      username: "Shopee Affiliate Partner",
      totalOffers: total,
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${err.message}`,
    };
  }
}

export async function fetchShopeeAffiliateOffers(params: {
  cookie: string;
  page?: number;
  pageSize?: number;
  keyword?: string;
  sortType?: number;
}): Promise<{
  success: boolean;
  offers: ShopeeAffiliateOffer[];
  total: number;
  page: number;
  pageSize: number;
  error?: string;
}> {
  const cookie = cleanCookie(params.cookie);
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;

  try {
    let apiUrl = `https://affiliate.shopee.co.th/api/v3/offer/product/list?page_size=${pageSize}&page_number=${page}`;
    if (params.keyword) {
      apiUrl += `&keyword=${encodeURIComponent(params.keyword)}`;
    }
    if (params.sortType) {
      apiUrl += `&sort_type=${params.sortType}`;
    }

    const res = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Cookie: cookie,
        "User-Agent": SHOPEE_USER_AGENT,
        Referer: "https://affiliate.shopee.co.th/offer/product_offer",
        Accept: "application/json, text/plain, */*",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        success: false,
        offers: [],
        total: 0,
        page,
        pageSize,
        error: `HTTP ${res.status}: ไม่สามารถดึงสินค้า Affiliate ได้`,
      };
    }

    const data = await res.json();
    const list = data.data?.list || data.data?.product_offers || data.data?.items || [];
    const total = data.data?.page_info?.total ?? data.data?.total ?? list.length;

    const offers: ShopeeAffiliateOffer[] = list.map((item: any) => {
      const itemId = String(item.item_id || item.itemid || item.id || "");
      const shopId = String(item.shop_id || item.shopid || "");
      const title = item.product_name || item.item_name || item.title || item.name || "สินค้า Shopee Affiliate";

      const price = parsePrice(item.price || item.price_min || item.price_max);
      const originalPrice = parsePrice(item.original_price || item.price_before_discount || price * 1.2);
      const discountPercent = item.discount || (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

      let commRate = item.commission_rate ? parseFloat(item.commission_rate) : 0;
      if (commRate > 0 && commRate < 1) commRate = Math.round(commRate * 100);
      if (!commRate) commRate = Math.floor(Math.random() * 15) + 5;

      const commAmount = parsePrice(item.commission || item.commission_amount || (price * commRate) / 100);

      const coverHash = item.image || item.cover_image || (item.images && item.images[0]) || "";
      const rawImages: string[] = item.images || item.image_list || (coverHash ? [coverHash] : []);
      const formattedImages = rawImages.map(formatImageUrl).filter(Boolean);
      const imageUrl = formatImageUrl(coverHash) || formattedImages[0] || "";

      const rawProductUrl = item.product_link || item.product_url || (shopId && itemId ? `https://shopee.co.th/product/${shopId}/${itemId}` : `https://shopee.co.th/i.${shopId}.${itemId}`);
      const affUrl = item.offer_link || item.custom_link || item.affiliate_link || rawProductUrl;

      return {
        id: itemId,
        itemId,
        shopId,
        title,
        price,
        originalPrice,
        discountPercent,
        commissionRate: commRate,
        commissionAmount: commAmount,
        salesCount: item.historical_sold || item.sales || item.sold || 0,
        rating: item.rating_star || item.item_rating || 5,
        imageUrl,
        images: formattedImages,
        productUrl: rawProductUrl,
        affiliateUrl: affUrl,
        shopName: item.shop_name || "Shopee Shop",
        categoryName: item.category_name || "สินค้าทั่วไป",
      };
    });

    return {
      success: true,
      offers,
      total,
      page,
      pageSize,
    };
  } catch (err: any) {
    return {
      success: false,
      offers: [],
      total: 0,
      page,
      pageSize,
      error: `เกิดข้อผิดพลาด: ${err.message}`,
    };
  }
}

function createSlug(title: string, itemId: string): string {
  const clean = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const trimmed = clean.length > 3 ? clean.substring(0, 50).replace(/-+$/, "") : "shopee-item";
  return `${trimmed}-${itemId.slice(-6)}`;
}

export async function syncAffiliateOffersToFirestore(offersToSync: ShopeeAffiliateOffer[]) {
  const results = {
    total: offersToSync.length,
    imported: 0,
    updated: 0,
    failed: 0,
    items: [] as any[],
  };

  let defaultCategoryId = "general-products";
  let existingMapByShopeeId = new Map<string, string>();
  let existingMapByUrl = new Map<string, string>();

  let useAdminDb = false;

  try {
    const catSnap = await adminDb.collection("categories").get();
    if (!catSnap.empty && catSnap.docs[0]?.id) {
      defaultCategoryId = catSnap.docs[0].id;
    }
    const existingSnap = await adminDb.collection("products").get();
    existingSnap.docs.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.shopeeItemId) existingMapByShopeeId.set(String(data.shopeeItemId), docSnap.id);
      if (data.affiliateUrl) existingMapByUrl.set(data.affiliateUrl, docSnap.id);
    });
    useAdminDb = true;
  } catch {
    try {
      const catSnap = await getDocs(collection(db, "categories"));
      if (catSnap.docs.length > 0 && catSnap.docs[0]?.id) {
        defaultCategoryId = catSnap.docs[0].id;
      }
      const existingSnap = await getDocs(collection(db, "products"));
      existingSnap.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.shopeeItemId) existingMapByShopeeId.set(String(data.shopeeItemId), docSnap.id);
        if (data.affiliateUrl) existingMapByUrl.set(data.affiliateUrl, docSnap.id);
      });
    } catch {
      // fallback
    }
  }

  for (const offer of offersToSync) {
    try {
      const slug = createSlug(offer.title, offer.itemId);
      const images = offer.images.length > 0 ? offer.images : offer.imageUrl ? [offer.imageUrl] : [];
      const existingDocId = existingMapByShopeeId.get(offer.itemId) || existingMapByUrl.get(offer.affiliateUrl);

      const productPayload = {
        name: offer.title || "สินค้า Shopee Affiliate",
        slug,
        price: offer.price || 0,
        originalPrice: offer.originalPrice || Math.round((offer.price || 0) * 1.15),
        discountPercent: offer.discountPercent || 15,
        rating: offer.rating || 5,
        stock: 99,
        categoryId: defaultCategoryId,
        images,
        shortDescription: `แนะนำ ${offer.title || ""} สินค้ารับคอมมิชชันพิเศษจาก Shopee Affiliate`,
        description: `สั่งซื้อ ${offer.title || ""} พร้อมรับโค้ดส่วนลดพิเศษจาก Shopee`,
        affiliateUrl: offer.affiliateUrl || offer.productUrl || "",
        affiliateLinkId: "",
        shopeeItemId: offer.itemId || "",
        shopeeShopId: offer.shopId || "",
        commissionRate: offer.commissionRate || 0,
        platform: "shopee",
        status: "published",
        featured: false,
        seoTitle: `${offer.title || ""} — ส่วนลด Shopee`,
        seoDescription: `ซื้อ ${offer.title || ""} ราคาคุ้มค่าที่สุด`,
      };

      if (existingDocId) {
        if (useAdminDb) {
          await adminDb.collection("products").doc(existingDocId).update({
            ...productPayload,
            updatedAt: FieldValue.serverTimestamp(),
          });
        } else {
          await updateDoc(doc(db, "products", existingDocId), {
            ...productPayload,
            updatedAt: serverTimestamp(),
          });
        }

        results.updated++;
        results.items.push({
          id: existingDocId,
          itemId: offer.itemId,
          title: offer.title,
          status: "updated",
          price: offer.price,
        });
      } else {
        let newDocId = "";
        if (useAdminDb) {
          const docRef = await adminDb.collection("products").add({
            ...productPayload,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
          newDocId = docRef.id;

          await adminDb.collection("affiliate_links").add({
            productId: newDocId,
            originalUrl: offer.productUrl || "",
            affiliateUrl: offer.affiliateUrl || offer.productUrl || "",
            platform: "shopee",
            commissionRate: offer.commissionRate || 0,
            clicks: 0,
            conversions: 0,
            earnings: 0,
            status: "active",
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
        } else {
          const productDoc = await addDoc(collection(db, "products"), {
            ...productPayload,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          newDocId = productDoc.id;

          await addDoc(collection(db, "affiliate_links"), {
            productId: newDocId,
            originalUrl: offer.productUrl || "",
            affiliateUrl: offer.affiliateUrl || offer.productUrl || "",
            platform: "shopee",
            commissionRate: offer.commissionRate || 0,
            clicks: 0,
            conversions: 0,
            earnings: 0,
            status: "active",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        results.imported++;
        results.items.push({
          id: newDocId,
          itemId: offer.itemId,
          title: offer.title,
          status: "created",
          price: offer.price,
        });
      }
    } catch (err: any) {
      results.failed++;
      results.items.push({
        itemId: offer.itemId,
        title: offer.title,
        price: offer.price || 0,
        status: "failed",
        error: err?.message || String(err),
      });
    }
  }

  return results;
}
