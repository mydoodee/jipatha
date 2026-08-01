"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductFormData } from "@/lib/validation/product";
import { CategorySerialized } from "@/types/category";
import { createCategory } from "@/lib/firebase/services/categories";
import { generateSlug } from "@/lib/utils";
import { Save, ArrowLeft, Sparkles, RefreshCw, Link as LinkIcon, CheckCircle2, Plus } from "lucide-react";
import Link from "next/link";

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  categories: CategorySerialized[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function ProductForm({
  initialData,
  categories,
  onSubmit,
  isSubmitting = false,
}: ProductFormProps) {
  const [categoriesList, setCategoriesList] = useState<CategorySerialized[]>(categories);
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatInput, setNewCatInput] = useState("");
  const [statusBanner, setStatusBanner] = useState<{
    type: "success" | "warning" | "error";
    message: string;
  } | null>(null);

  const [extractUrl, setExtractUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState(false);

  const [imagesInput, setImagesInput] = useState<string>(
    initialData?.images ? initialData.images.join("\n") : ""
  );
  const [tagsInput, setTagsInput] = useState<string>(
    initialData?.tags ? initialData.tags.join(", ") : ""
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      shortDescription: initialData?.shortDescription || "",
      description: initialData?.description || "",
      images: initialData?.images || [],
      price: initialData?.price || 0,
      originalPrice: initialData?.originalPrice || undefined,
      discountPercent: initialData?.discountPercent || undefined,
      rating: initialData?.rating || 5,
      categoryId: initialData?.categoryId || (categories[0]?.id || ""),
      tags: initialData?.tags || [],
      platform: "shopee",
      affiliateLinkId: initialData?.affiliateLinkId || "",
      affiliateUrl: initialData?.affiliateUrl || "",
      status: initialData?.status || "draft",
      featured: initialData?.featured || false,
      seoTitle: initialData?.seoTitle || "",
      seoDescription: initialData?.seoDescription || "",
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue("name", name);
    if (!initialData?.slug) {
      setValue("slug", generateSlug(name));
    }
  };

  const isShopeeShortLink = (urlStr: string) => {
    return urlStr.includes("s.shopee.co.th") || urlStr.match(/\/s\/[a-zA-Z0-9]/);
  };

  const extractTitleFromUrl = (urlStr: string): string => {
    if (isShopeeShortLink(urlStr)) return ""; // NEVER use short hash as title!
    try {
      const parsedUrl = new URL(urlStr);
      const pathname = decodeURIComponent(parsedUrl.pathname);
      const parts = pathname.split("/").filter(Boolean);

      for (let i = parts.length - 1; i >= 0; i--) {
        const part = parts[i];
        if (part === "universal-link" || part === "product") continue;
        let clean = part.replace(/-i\.\d+\.\d+$/, "").replace(/[\-_]/g, " ").trim();
        clean = clean.replace(/\?.*$/, "").replace(/__mobile__.*$/, "").trim();
        // Require Thai characters or long descriptive words (never short code like 3qLwdKMIOw)
        if (clean && clean.length > 5 && (clean.match(/[\u0E00-\u0E7F]/) || clean.includes(" "))) {
          return clean;
        }
      }
    } catch {
      // Ignore
    }
    return "";
  };

  /**
   * Helper to fetch via CORS proxy or Microlink API.
   */
  const fetchViaProxy = async (targetUrl: string, timeoutMs = 6000): Promise<{ contents: string; finalUrl: string } | null> => {
    // Try microlink API first (has CORS headers, resolves redirects reliably without 403)
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(targetUrl)}`, { signal: controller.signal });
      clearTimeout(timer);

      if (res.ok) {
        const json = await res.json();
        if (json.status === "success" && json.data) {
          const finalUrl = json.data.url || targetUrl;
          return { contents: JSON.stringify(json.data), finalUrl };
        }
      }
    } catch {
      // Ignore microlink error
    }

    // Fallback proxies
    const proxies = [
      (u: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
    ];

    for (const makeUrl of proxies) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        const res = await fetch(makeUrl(targetUrl), { signal: controller.signal });
        clearTimeout(timer);

        if (!res.ok) continue;
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const json = await res.json();
          const contents = json.contents || "";
          const finalUrl = json.status?.url || targetUrl;
          if (contents) return { contents, finalUrl };
        }
      } catch {
        // Try next
      }
    }
    return null;
  };

  /**
   * Parse OG meta from HTML — handles both attribute orders:
   *   property="og:title" content="..."
   *   content="..." property="og:title"
   */
  const parseOgMeta = (html: string, property: string): string => {
    const m1 = html.match(new RegExp(`property=["']${property}["']\\s+content=["']([^"']+)["']`, "i"));
    if (m1?.[1]) return m1[1];
    const m2 = html.match(new RegExp(`content=["']([^"']+)["']\\s+property=["']${property}["']`, "i"));
    if (m2?.[1]) return m2[1];
    return "";
  };

  const fetchMetadataFromApis = async (targetUrl: string): Promise<{ title: string; image: string; description: string; price: number; resolvedUrl: string }> => {
    let title = extractTitleFromUrl(targetUrl);
    let image = "";
    let description = "";
    let price = 0;
    let resolvedUrl = targetUrl;

    // 1. Resolve short link via Microlink API
    if (isShopeeShortLink(targetUrl)) {
      const proxyResult = await fetchViaProxy(targetUrl, 6000);
      if (proxyResult) {
        if (proxyResult.finalUrl && !proxyResult.finalUrl.includes("s.shopee.co.th")) {
          resolvedUrl = proxyResult.finalUrl;
        }

        // Check microlink JSON output if contents is JSON
        try {
          const data = JSON.parse(proxyResult.contents);
          if (data.title && !data.title.toLowerCase().includes("shopee thailand") && data.title !== "Shopee") {
            const rawTitle = data.title.replace(/\s*\|\s*Shopee.*$/i, "").trim();
            if (!rawTitle.match(/^[\d\s\?\&\=\_\-]+$/) && !rawTitle.includes("__mobile__") && rawTitle.length > 3) {
              title = rawTitle;
            }
          }
          if (data.image?.url) {
            image = data.image.url;
          }
          if (data.description && !data.description.includes("Buy and Sell on Mobile")) {
            description = data.description.trim();
          }
        } catch {
          // html contents fallback
          const html = proxyResult.contents;
          const urlPatterns = [
            /content=["']([^"']+)["']\s*property=["']og:url["']/i,
            /property=["']og:url["']\s*content=["']([^"']+)["']/i,
            /href=["'](https?:\/\/shopee\.co\.th\/[^"']+)["']/i,
            /(https:\/\/shopee\.co\.th\/[^\s"'<>]+)/i,
          ];
          for (const pattern of urlPatterns) {
            const match = html.match(pattern);
            if (match?.[1]) {
              resolvedUrl = match[1];
              break;
            }
          }
        }
      }
    }

    // 2. Decode Title from resolved URL path if title is still missing
    if (!title || title.match(/^[\d\s]+$/)) {
      const urlTitle = extractTitleFromUrl(resolvedUrl);
      if (urlTitle) title = urlTitle;
    }

    // 3. Extract item ID from resolved URL or target URL
    const iFormatMatch = resolvedUrl.match(/i\.(\d+)\.(\d+)/) || targetUrl.match(/i\.(\d+)\.(\d+)/);
    const pathMatch = resolvedUrl.match(/\/(?:product\/)?(\d{5,15})\/(\d{5,15})/) ||
                      targetUrl.match(/\/(?:product\/)?(\d{5,15})\/(\d{5,15})/);
    const bestMatch = iFormatMatch || pathMatch;

    const shopId = bestMatch?.[1] || null;
    const itemId = bestMatch?.[2] || bestMatch?.[1] || null;

    // 4. Try fetching expanded product page metadata if missing
    if (shopId && itemId && (!title || !image)) {
      const scrapeUrl = `https://shopee.co.th/product/${shopId}/${itemId}`;
      const proxyResult = await fetchViaProxy(scrapeUrl, 6000);

      if (proxyResult?.contents) {
        try {
          const data = JSON.parse(proxyResult.contents);
          if (data.title && !title) title = data.title.replace(/\s*\|\s*Shopee.*$/i, "").trim();
          if (data.image?.url && !image) image = data.image.url;
          if (data.description && !description) description = data.description;
        } catch {
          const html = proxyResult.contents;
          if (!title) {
            const ogTitle = parseOgMeta(html, "og:title");
            if (ogTitle) title = ogTitle.replace(/\s*\|\s*Shopee\s*Thailand$/i, "").trim();
          }
          if (!image) {
            const ogImage = parseOgMeta(html, "og:image");
            if (ogImage && ogImage.includes("susercontent.com")) image = ogImage;
          }
          if (!description) {
            const ogDesc = parseOgMeta(html, "og:description");
            if (ogDesc && !ogDesc.includes("Buy and Sell on Mobile")) description = ogDesc;
          }
        }
      }
    }

    // Clean description if generic
    if (description.includes("Buy and Sell on Mobile")) {
      description = "";
    }

    // Extract price from title or description if not found yet
    if (!price) {
      const textToSearch = `${title} ${description}`;
      const priceMatch = textToSearch.match(/[฿]\s*([\d,]+(?:\.\d+)?)/) ||
                         textToSearch.match(/(?:ราคา|เพียง)\s*([\d,]+(?:\.\d+)?)\s*(?:บาท|\.-)/i) ||
                         textToSearch.match(/([\d,]+)\s*บาท/i);
      if (priceMatch?.[1]) {
        const p = parseFloat(priceMatch[1].replace(/,/g, ""));
        if (p > 0 && p < 1000000) price = p;
      }
    }

    return { title, image, description, price, resolvedUrl };
  };

  const extractShopeeClientSide = async (targetUrl: string) => {
    let cleanUrl = targetUrl.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const { title, image, description, price, resolvedUrl } = await fetchMetadataFromApis(cleanUrl);

    const displayTitle = title || "สินค้าจาก Shopee";
    const rawSlug = generateSlug(displayTitle);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug = rawSlug && rawSlug.length > 3
      ? `${rawSlug.substring(0, 60).replace(/-+$/, "")}-${randomSuffix}`
      : `shopee-item-${Date.now()}-${randomSuffix}`;
    const computedOrigPrice = price > 0 ? price + 5 : 0;
    const computedDiscount = computedOrigPrice > price ? Math.round(((computedOrigPrice - price) / computedOrigPrice) * 100) : 0;

    return {
      name: displayTitle,
      slug,
      price,
      originalPrice: computedOrigPrice,
      discountPercent: computedDiscount,
      images: image ? [image] : [],
      shortDescription: description ? description.slice(0, 160) : `แนะนำ ${displayTitle} การันตีคุณภาพ ราคาคุ้มค่าที่สุด`,
      description: description || `รายละเอียดสินค้า ${displayTitle} สามารถเช็คโปรโมชั่นล่าสุดและคูปองส่วนลดเพิ่มเติมได้ที่ปุ่มเช็คราคา`,
      affiliateUrl: cleanUrl,
      suggestedCategory: { name: "สินค้าทั่วไป", slug: "general-products" },
      seo: {
        title: `${displayTitle} — ราคาพิเศษ Shopee`,
        description: `ซื้อ ${displayTitle} ราคาดีที่สุด เช็คส่วนลดได้ที่นี่`,
        keywords: [displayTitle, "Shopee Affiliate", "ส่วนลด Shopee"],
      },
    };
  };



  const handleAutoExtract = async () => {
    if (!extractUrl.trim()) {
      setStatusBanner({
        type: "warning",
        message: "กรุณาวางลิงก์ Shopee หรือ Affiliate Link ก่อนกดดึงข้อมูลครับ",
      });
      return;
    }

    setIsExtracting(true);
    setExtractSuccess(false);

    try {
      let d: any = null;

      // Step 1: Try local API endpoint (if running Next.js SSR server)
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 7000);
        const res = await fetch("/api/admin/extract-shopee", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: extractUrl.trim() }),
          signal: controller.signal,
        });
        clearTimeout(timer);

        const contentType = res.headers.get("content-type") || "";
        if (res.ok && contentType.includes("application/json")) {
          const result = await res.json();
          if (result && result.data && result.data.name && !result.data.name.includes("สินค้าคุณภาพจาก Shopee")) {
            d = result.data;
          }
        }
      } catch {
        // Ignore API route error on static export
      }

      // Step 2: Client-side fallback if API route returned HTML or generic name
      if (!d) {
        d = await extractShopeeClientSide(extractUrl.trim());
      }

      if (!d || !d.name) {
        throw new Error("ไม่สามารถอ่านข้อมูลจาก URL นี้ได้ กรุณากรอกข้อมูลสินค้าโดยตรง");
      }

      setValue("name", d.name);
      setValue("slug", d.slug);
      setValue("price", d.price);

      const computedOrigPrice = d.originalPrice && d.originalPrice > d.price ? d.originalPrice : (d.price > 0 ? d.price + 5 : 0);
      setValue("originalPrice", computedOrigPrice);
      if (computedOrigPrice && d.price > 0 && computedOrigPrice > d.price) {
        setValue("discountPercent", Math.round(((computedOrigPrice - d.price) / computedOrigPrice) * 100));
      }

      setValue("shortDescription", d.shortDescription);
      setValue("description", d.description);
      setValue("affiliateUrl", extractUrl.trim());

      if (d.images && d.images.length > 0) {
        setImagesInput(d.images.join("\n"));
        setValue("images", d.images);
      }

      if (d.seo) {
        if (d.seo.title) setValue("seoTitle", d.seo.title.slice(0, 70));
        if (d.seo.description) setValue("seoDescription", d.seo.description.slice(0, 160));
        if (d.seo.keywords) setTagsInput(d.seo.keywords.join(", "));
      }

      let createdCategoryName = "";
      // Auto-match or Auto-create Category
      if (d.suggestedCategory) {
        const targetName = d.suggestedCategory.name;
        const targetSlug = d.suggestedCategory.slug;

        const existing = categoriesList.find(
          (c) =>
            c.name.toLowerCase().includes(targetName.toLowerCase()) ||
            targetName.toLowerCase().includes(c.name.toLowerCase()) ||
            c.slug === targetSlug
        );

        if (existing) {
          setValue("categoryId", existing.id);
          createdCategoryName = existing.name;
        } else {
          try {
            const cleanName = targetName.trim();
            const slug = targetSlug || generateSlug(cleanName) || `cat-${Date.now()}`;

            const newId = await createCategory({
              name: cleanName,
              slug,
              description: `หมวดหมู่สินค้า ${cleanName}`,
              sortOrder: categoriesList.length + 1,
              status: "active",
            });

            const newCatItem: CategorySerialized = {
              id: newId,
              name: cleanName,
              slug,
              description: `หมวดหมู่สินค้า ${cleanName}`,
              sortOrder: categoriesList.length + 1,
              status: "active",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            setCategoriesList((prev) => [...prev, newCatItem]);
            setValue("categoryId", newId);
            createdCategoryName = cleanName;
          } catch (cErr) {
            console.error("Error auto creating category:", cErr);
          }
        }
      }

      setExtractSuccess(true);
      const catMsg = createdCategoryName ? ` หมวดหมู่: "${createdCategoryName}"` : "";
      if (!d.price || d.price === 0) {
        setStatusBanner({
          type: "warning",
          message: `✨ เติมข้อมูลสินค้า, ลิงก์, รูปภาพ และ SEO ให้อัตโนมัติเรียบร้อยแล้ว! (กรุณาใส่ราคาขายในช่องด้านล่าง)`,
        });
      } else {
        setStatusBanner({
          type: "success",
          message: `✨ ดึงข้อมูลสินค้าสำเร็จ และจัด${catMsg} ให้อัตโนมัติเรียบร้อยแล้ว!`,
        });
      }
    } catch (err: unknown) {
      console.error("Auto extract error:", err);
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการดึงข้อมูล";
      setStatusBanner({
        type: "error",
        message: `ไม่สามารถดึงข้อมูลได้: ${msg}`,
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleQuickCreateCategory = async (nameToCreate: string) => {
    if (!nameToCreate || !nameToCreate.trim()) return null;

    setIsCreatingCat(true);
    try {
      const cleanName = nameToCreate.trim();
      const slug = generateSlug(cleanName) || `cat-${Date.now()}`;

      const newId = await createCategory({
        name: cleanName,
        slug,
        description: `หมวดหมู่สินค้า ${cleanName}`,
        sortOrder: categoriesList.length + 1,
        status: "active",
      });

      const newCatItem: CategorySerialized = {
        id: newId,
        name: cleanName,
        slug,
        description: `หมวดหมู่สินค้า ${cleanName}`,
        sortOrder: categoriesList.length + 1,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCategoriesList((prev) => [...prev, newCatItem]);
      setValue("categoryId", newId);
      setShowCatModal(false);
      setNewCatInput("");
      setStatusBanner({
        type: "success",
        message: `เพิ่มหมวดหมู่ "${cleanName}" เรียบร้อยแล้ว`,
      });
      return newId;
    } catch (err) {
      console.error("Error creating category:", err);
      setStatusBanner({
        type: "error",
        message: "เกิดข้อผิดพลาด ไม่สามารถสร้างหมวดหมู่ได้",
      });
      return null;
    } finally {
      setIsCreatingCat(false);
    }
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    const images = imagesInput
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    await onSubmit({
      ...data,
      images,
      tags,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 max-w-4xl relative">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ย้อนกลับ</span>
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? "กำลังบันทึก..." : "บันทึกสินค้า"}</span>
        </button>
      </div>

      {/* STATUS BANNER NOTIFICATION */}
      {statusBanner && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold shadow-xs animate-in fade-in slide-in-from-top-2 ${
            statusBanner.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : statusBanner.type === "warning"
              ? "bg-amber-50 text-amber-900 border-amber-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{statusBanner.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-gray-400 hover:text-gray-700 font-bold text-sm px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* QUICK CATEGORY CREATION MODAL */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-gray-900">เพิ่มหมวดหมู่ใหม่แบบด่วน</h3>
            <input
              type="text"
              placeholder="ระบุชื่อหมวดหมู่ เช่น แคมป์ปิ้ง"
              value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCatModal(false);
                  setNewCatInput("");
                }}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => handleQuickCreateCategory(newCatInput)}
                disabled={isCreatingCat || !newCatInput.trim()}
                className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-semibold text-xs rounded-lg"
              >
                {isCreatingCat ? "กำลังสร้าง..." : "ตกลง"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTO EXTRACTOR CARD */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 rounded-2xl p-5 text-white shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
            <Sparkles className="w-5 h-5 text-amber-200" />
            <span>⚡ ระบบดึงข้อมูลสินค้า & SEO อัตโนมัติ (Auto-Sync Extractor)</span>
          </div>
          {extractSuccess && (
            <span className="bg-emerald-500/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ดึงข้อมูลสำเร็จ!</span>
            </span>
          )}
        </div>

        <p className="text-xs text-orange-100">
          แค่วาง **Shopee Affiliate Link** ระบบจะดึง **ชื่อสินค้า, ราคา, รูปภาพ, รายละเอียด และตั้งค่า SEO Metadata** ให้อัตโนมัติในคลิกเดียว!
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={extractUrl}
              onChange={(e) => setExtractUrl(e.target.value)}
              placeholder="วางลิงก์ Shopee เช่น https://s.shopee.co.th/xxx หรือ https://shopee.co.th/..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white/95 text-gray-900 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-inner font-mono"
            />
            <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            type="button"
            onClick={handleAutoExtract}
            disabled={isExtracting}
            className="w-full sm:w-auto px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:bg-amber-200 text-gray-950 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 flex-shrink-0"
          >
            {isExtracting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>กำลังดึงข้อมูล...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-orange-950" />
                <span>ดึงข้อมูลอัตโนมัติ</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-2xs">
        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
          ข้อมูลพื้นฐาน
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              ชื่อสินค้า *
            </label>
            <input
              type="text"
              {...register("name")}
              onChange={handleNameChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Slug (URL) *
            </label>
            <input
              type="text"
              {...register("slug")}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
            {errors.slug && <p className="text-xs text-red-600 mt-1">{errors.slug.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              ราคาขาย (บาท) *
            </label>
            <input
              type="number"
              step="any"
              {...register("price", {
                valueAsNumber: true,
                onChange: (e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val > 0) {
                    const orig = val + 5;
                    setValue("originalPrice", orig);
                    setValue("discountPercent", Math.round((5 / orig) * 100));
                  }
                },
              })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none font-semibold text-orange-600"
            />
            {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              ราคาเดิม (บาท)
            </label>
            <input
              type="number"
              step="any"
              {...register("originalPrice", { valueAsNumber: true })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              คะแนนรีวิว (0 - 5)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              {...register("rating", { valueAsNumber: true })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700">
                หมวดหมู่ *
              </label>
              <button
                type="button"
                onClick={() => setShowCatModal(true)}
                disabled={isCreatingCat}
                className="text-[11px] text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-0.5 hover:underline"
              >
                <Plus className="w-3 h-3" />
                <span>{isCreatingCat ? "กำลังสร้าง..." : "สร้างหมวดใหม่"}</span>
              </button>
            </div>
            <select
              {...register("categoryId")}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white font-medium"
            >
              <option value="">-- เลือกหมวดหมู่ --</option>
              {categoriesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="text-xs text-red-600 mt-1">{errors.categoryId.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              สถานะสินค้า
            </label>
            <select
              {...register("status")}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
            >
              <option value="draft">ฉบับร่าง (Draft)</option>
              <option value="published">เผยแพร่ (Published)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            ลิงก์ Shopee Affiliate (URL)
          </label>
          <input
            type="text"
            {...register("affiliateUrl")}
            placeholder="https://s.shopee.co.th/xxx"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono text-xs text-blue-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            รายละเอียดสั้น *
          </label>
          <textarea
            rows={2}
            {...register("shortDescription")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
          {errors.shortDescription && <p className="text-xs text-red-600 mt-1">{errors.shortDescription.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            รายละเอียดสินค้าเต็ม *
          </label>
          <textarea
            rows={6}
            {...register("description")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
          {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            URL รูปภาพสินค้า (บรรทัดละ 1 URL)
          </label>
          <textarea
            rows={3}
            value={imagesInput}
            onChange={(e) => setImagesInput(e.target.value)}
            placeholder="https://down-aka-th.img.susercontent.com/..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            แท็ก / คำค้นหา (แยกด้วยเครื่องหมายจุลภาค ,)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="มือถือ, แก็ดเจ็ต, ส่วนลด Shopee"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="featured"
            {...register("featured")}
            className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
          />
          <label htmlFor="featured" className="text-xs font-semibold text-gray-800">
            แสดงเป็นสินค้าแนะนำพิเศษ (Featured Product)
          </label>
        </div>
      </div>

      {/* SEO Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-2xs">
        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
          ตั้งค่า SEO Metadata (สร้างให้อัตโนมัติ)
        </h2>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            SEO Title (ไม่เกิน 70 ตัวอักษร)
          </label>
          <input
            type="text"
            {...register("seoTitle")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            SEO Description (ไม่เกิน 160 ตัวอักษร)
          </label>
          <textarea
            rows={2}
            {...register("seoDescription")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
        </div>
      </div>
    </form>
  );
}
