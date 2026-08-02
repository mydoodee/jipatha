import { db, collection, getDocs, addDoc, updateDoc, doc, serverTimestamp } from "@/lib/firebase/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export interface ShopeeCSVProduct {
  itemId: string;
  title: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  soldText: string;
  shopName: string;
  commissionRate: number;
  commissionAmount: number;
  productUrl: string;
  affiliateUrl: string;
  image?: string;
}

/**
 * Fetch product cover image from Shopee public API or Open Graph scraper
 */
export async function fetchShopeeProductImage(productUrl: string, itemId: string): Promise<string> {
  const match = productUrl.match(/product\/(\d+)\/(\d+)/) || productUrl.match(/i\.(\d+)\.(\d+)/);
  const shopId = match?.[1] || "";
  const itemRealId = match?.[2] || itemId;

  if (shopId && itemRealId) {
    try {
      const res = await fetch(`https://shopee.co.th/api/v4/item/get?itemid=${itemRealId}&shopid=${shopId}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
          Referer: `https://shopee.co.th/product/${shopId}/${itemRealId}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const imageHash = data.data?.image || data.item?.image || (data.data?.images && data.data.images[0]);
        if (imageHash) {
          return imageHash.startsWith("http") ? imageHash : `https://down-th.img.susercontent.com/file/${imageHash}`;
        }
      }
    } catch {
      // ignore
    }

    try {
      const ogRes = await fetch(`https://shopee.co.th/product/${shopId}/${itemRealId}`, {
        headers: { "User-Agent": "Twitterbot/1.0" },
      });
      if (ogRes.ok) {
        const html = await ogRes.text();
        const ogMatch = html.match(/property=["']og:image["']\s*content=["']([^"']+)["']/i) || html.match(/content=["']([^"']+)["']\s*property=["']og:image["']/i);
        if (ogMatch?.[1] && (ogMatch[1].includes("susercontent.com") || ogMatch[1].includes("shopee"))) {
          return ogMatch[1];
        }
      }
    } catch {
      // ignore
    }
  }

  return "";
}

/**
 * Parse Thai price string like "184", "1.6พัน", "26.5พัน" into actual numbers
 */
export function parseThaiPrice(priceStr: string): number {
  if (!priceStr) return 0;
  const clean = priceStr.replace(/[^0-9.พันหมื่นแสนล้าน]/g, "").trim();

  if (clean.includes("พัน")) {
    const num = parseFloat(clean.replace("พัน", ""));
    return isNaN(num) ? 0 : Math.round(num * 1000);
  }
  if (clean.includes("หมื่น")) {
    const num = parseFloat(clean.replace("หมื่น", ""));
    return isNaN(num) ? 0 : Math.round(num * 10000);
  }
  if (clean.includes("แสน")) {
    const num = parseFloat(clean.replace("แสน", ""));
    return isNaN(num) ? 0 : Math.round(num * 100000);
  }
  if (clean.includes("ล้าน")) {
    const num = parseFloat(clean.replace("ล้าน", ""));
    return isNaN(num) ? 0 : Math.round(num * 1000000);
  }

  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parse commission percentage string like "13%", "7.2%"
 */
export function parseCommissionRate(commStr: string): number {
  if (!commStr) return 0;
  const num = parseFloat(commStr.replace(/[^0-9.]/g, ""));
  return isNaN(num) ? 0 : num;
}

/**
 * Split CSV line respecting quoted columns with commas inside
 */
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      result.push(cur.trim().replace(/^"+|"+$/g, ""));
      cur = "";
    } else {
      cur += c;
    }
  }
  result.push(cur.trim().replace(/^"+|"+$/g, ""));
  return result;
}

/**
 * Parse full CSV file text exported from Shopee Affiliate Portal
 */
export function parseShopeeAffiliateCSV(csvContent: string): ShopeeCSVProduct[] {
  const cleanedContent = csvContent.replace(/^\uFEFF/, "").trim();
  const lines = cleanedContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const products: ShopeeCSVProduct[] = [];

  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);

  let idIdx = headers.findIndex((h) => h.includes("รหัสสินค้า") || h.includes("Item ID") || h.includes("itemId"));
  let titleIdx = headers.findIndex((h) => h.includes("ชื่อสินค้า") || h.includes("Item Name") || h.includes("title"));
  let priceIdx = headers.findIndex((h) => h.includes("ราคา") || h.includes("Price"));
  let soldIdx = headers.findIndex((h) => h.includes("ขาย") || h.includes("Sold"));
  let shopIdx = headers.findIndex((h) => h.includes("ร้านค้า") || h.includes("Shop"));
  let commRateIdx = headers.findIndex((h) => h.includes("อัตราค่าคอมมิชชัน") || h.includes("Commission Rate"));
  let commAmtIdx = headers.findIndex((h) => h.includes("คอมมิชชัน") && !h.includes("อัตรา"));
  let prodUrlIdx = headers.findIndex((h) => h.includes("ลิงก์สินค้า") || h.includes("Product Link") || h.includes("product_link") || h.includes("url"));
  let affUrlIdx = headers.findIndex((h) => h.includes("ลิงก์ข้อเสนอ") || h.includes("Offer Link") || h.includes("Affiliate Link") || h.includes("offer_link"));
  let imgIdx = headers.findIndex((h) => h.includes("รูปภาพ") || h.includes("รูปปก") || h.includes("Image") || h.includes("image") || h.includes("image_url") || h.includes("cover"));

  if (idIdx === -1) idIdx = 0;
  if (titleIdx === -1) titleIdx = 1;
  if (priceIdx === -1) priceIdx = 2;
  if (soldIdx === -1) soldIdx = 3;
  if (shopIdx === -1) shopIdx = 4;
  if (commRateIdx === -1) commRateIdx = 5;
  if (commAmtIdx === -1) commAmtIdx = 6;
  if (prodUrlIdx === -1) prodUrlIdx = 7;
  if (affUrlIdx === -1) affUrlIdx = 8;

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < 3) continue;

    const itemId = row[idIdx] || `csv-item-${i}`;
    const title = row[titleIdx] || "สินค้า Shopee Affiliate";
    const price = parseThaiPrice(row[priceIdx] || "0");
    const soldText = row[soldIdx] || "";
    const shopName = row[shopIdx] || "Shopee Seller";
    const commRate = parseCommissionRate(row[commRateIdx] || "0");
    const commAmt = parseThaiPrice(row[commAmtIdx] || "0");
    const productUrl = row[prodUrlIdx] || "";
    const affiliateUrl = row[affUrlIdx] || productUrl;
    const rawImage = imgIdx !== -1 && row[imgIdx] ? row[imgIdx] : "";

    if (!title || price === 0) continue;

    const originalPrice = Math.round(price * 1.15);
    const discountPercent = 13;

    products.push({
      itemId: String(itemId),
      title: String(title),
      price: isNaN(price) ? 0 : price,
      originalPrice: isNaN(originalPrice) ? 0 : originalPrice,
      discountPercent: isNaN(discountPercent) ? 0 : discountPercent,
      soldText: String(soldText),
      shopName: String(shopName),
      commissionRate: isNaN(commRate) ? 0 : commRate,
      commissionAmount: isNaN(commAmt) ? 0 : commAmt,
      productUrl: String(productUrl),
      affiliateUrl: String(affiliateUrl),
      image: rawImage,
    });
  }

  return products;
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

/**
 * Import parsed CSV products into Firestore (with auto image fetching)
 */
export async function syncShopeeCSVProductsToFirestore(productsToSync: ShopeeCSVProduct[]) {
  const results = {
    total: productsToSync.length,
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

  for (const item of productsToSync) {
    try {
      const slug = createSlug(item.title, item.itemId);
      const existingDocId = existingMapByShopeeId.get(item.itemId) || existingMapByUrl.get(item.affiliateUrl);

      // Auto fetch image for product if not present in CSV
      const imageUrl = item.image || (await fetchShopeeProductImage(item.productUrl, item.itemId));
      const images = imageUrl ? [imageUrl] : [];

      const productPayload = {
        name: item.title || "สินค้า Shopee Affiliate",
        slug,
        price: item.price || 0,
        originalPrice: item.originalPrice || 0,
        discountPercent: item.discountPercent || 0,
        rating: 5,
        stock: 99,
        categoryId: defaultCategoryId,
        images,
        shortDescription: `แนะนำ ${item.title || ""} สินค้ารับคอมมิชชันพิเศษจาก Shopee Affiliate`,
        description: `รายละเอียดสินค้า ${item.title || ""} สั่งซื้อราคาพิเศษจากร้าน ${item.shopName || ""} รับส่วนลดและโปรโมชันล่าสุด`,
        affiliateUrl: item.affiliateUrl || item.productUrl || "",
        affiliateLinkId: "",
        shopeeItemId: item.itemId || "",
        shopeeShopId: "",
        commissionRate: item.commissionRate || 0,
        tags: [item.title || "Shopee", "Shopee Affiliate", "ส่วนลด Shopee"],
        platform: "shopee",
        status: "published",
        featured: false,
        seoTitle: `${item.title || ""} — ส่วนลด Shopee`,
        seoDescription: `ซื้อ ${item.title || ""} ราคาคุ้มค่าที่สุด`,
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
          itemId: item.itemId,
          title: item.title,
          status: "updated",
          price: item.price,
          hasImage: images.length > 0,
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
            originalUrl: item.productUrl || "",
            affiliateUrl: item.affiliateUrl || item.productUrl || "",
            platform: "shopee",
            commissionRate: item.commissionRate || 0,
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
            originalUrl: item.productUrl || "",
            affiliateUrl: item.affiliateUrl || item.productUrl || "",
            platform: "shopee",
            commissionRate: item.commissionRate || 0,
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
          itemId: item.itemId,
          title: item.title,
          status: "created",
          price: item.price,
          hasImage: images.length > 0,
        });
      }
    } catch (err: any) {
      results.failed++;
      results.items.push({
        itemId: item.itemId,
        title: item.title,
        price: item.price || 0,
        status: "failed",
        error: err?.message || String(err),
      });
    }
  }

  return results;
}

/**
 * Scan all products in Firestore and fetch missing Shopee images automatically
 */
export async function fixMissingProductImagesInFirestore() {
  let updatedCount = 0;
  let totalScanned = 0;

  try {
    const snap = await adminDb.collection("products").get();
    totalScanned = snap.docs.length;

    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const images: string[] = data.images || [];

      if (images.length === 0 || !images[0]) {
        const productUrl = data.affiliateUrl || data.originalUrl || "";
        const itemId = data.shopeeItemId || "";

        if (productUrl) {
          const imgUrl = await fetchShopeeProductImage(productUrl, itemId);
          if (imgUrl) {
            await adminDb.collection("products").doc(docSnap.id).update({
              images: [imgUrl],
              updatedAt: FieldValue.serverTimestamp(),
            });
            updatedCount++;
          }
        }
      }
    }
  } catch (err: any) {
    console.error("Failed to fix missing images:", err);
  }

  return { totalScanned, updatedCount };
}
