"use client";

import { useEffect, useState, useCallback } from "react";
import { ProductSerialized } from "@/types/product";
import { getProducts } from "@/lib/firebase/services/products";
import {
  getAffiliateLinkByProductId,
  createAffiliateLink,
  updateAffiliateLink,
} from "@/lib/firebase/services/affiliateLinks";
import { shopeeAffiliateProvider } from "@/lib/affiliate/shopee";
import { Link as LinkIcon, ExternalLink, Check, Save } from "lucide-react";

export default function AdminAffiliatePage() {
  const [products, setProducts] = useState<ProductSerialized[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductSerialized | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [clickCount, setClickCount] = useState(0);
  const [linkId, setLinkId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const selectProduct = useCallback(async (product: ProductSerialized) => {
    setSelectedProduct(product);
    setMsg("");
    try {
      const link = await getAffiliateLinkByProductId(product.id);
      if (link) {
        setLinkId(link.id);
        setOriginalUrl(link.originalUrl);
        setAffiliateUrl(link.affiliateUrl);
        setStatus(link.status);
        setClickCount(link.clickCount);
      } else {
        setLinkId(null);
        setOriginalUrl("");
        setAffiliateUrl("");
        setStatus("active");
        setClickCount(0);
      }
    } catch (err) {
      console.error("Error loading affiliate link:", err);
    }
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts({ status: undefined, limitCount: 100 });
        setProducts(data);
        if (data.length > 0) {
          await selectProduct(data[0]);
        }
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [selectProduct]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    // Validate link format
    const isValidOriginal = await shopeeAffiliateProvider.validateLink(originalUrl);
    if (originalUrl && !isValidOriginal) {
      setMsg("⚠️ URL ต้นทางไม่ใช่ Shopee URL ที่ถูกต้อง (ต้องเป็น shopee.co.th หรือ s.shopee.co.th)");
      return;
    }

    setIsSubmitting(true);
    setMsg("");

    try {
      if (linkId) {
        await updateAffiliateLink(linkId, {
          originalUrl,
          affiliateUrl: affiliateUrl || originalUrl,
          status,
        });
        setMsg("✅ อัปเดตลิงก์ Affiliate เรียบร้อยแล้ว");
      } else {
        const newId = await createAffiliateLink({
          productId: selectedProduct.id,
          platform: "shopee",
          originalUrl,
          affiliateUrl: affiliateUrl || originalUrl,
          status,
        });
        setLinkId(newId);
        setMsg("✅ สร้างลิงก์ Affiliate ใหม่เรียบร้อยแล้ว");
      }
    } catch (err) {
      console.error("Error saving affiliate link:", err);
      setMsg("❌ เกิดข้อผิดพลาดในการบันทึกลิงก์");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">จัดการลิงก์ Affiliate (Shopee)</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          แมปสินค้าในระบบกับ Shopee Affiliate Link เพื่อใช้สำหรับการเปลี่ยนทิศทาง (Redirect `/go/[slug]`)
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500">กำลังโหลดข้อมูล...</div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500 text-xs">
          ยังไม่มีสินค้าในระบบ กรุณาเพิ่มสินค้าก่อนจัดการลิงก์ Affiliate
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Select List */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-700">
              เลือกสินค้าเพื่อตั้งค่าลิงก์
            </div>
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {products.map((p) => {
                const isSelected = selectedProduct?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => selectProduct(p)}
                    className={`w-full p-3 text-left flex items-center justify-between text-xs transition-colors ${
                      isSelected
                        ? "bg-orange-50 text-orange-900 font-semibold border-l-4 border-orange-600"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span className="truncate pr-2">{p.name}</span>
                    <span className="font-bold text-orange-600 flex-shrink-0">฿{p.price.toLocaleString()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Affiliate Detail & Form */}
          <div className="lg:col-span-2 space-y-4">
            {selectedProduct && (
              <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 shadow-2xs">
                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">{selectedProduct.name}</h2>
                    <span className="text-xs text-gray-400 font-mono">Redirect URL: /go/{selectedProduct.slug}</span>
                  </div>

                  <div className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>คลิกทั้งหมด: {clickCount} ครั้ง</span>
                  </div>
                </div>

                {msg && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-lg flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>{msg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    URL สินค้าเดิมบน Shopee (Original URL)
                  </label>
                  <input
                    type="url"
                    required
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    placeholder="https://shopee.co.th/product-item-i.123456.7890"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    ลิงก์หน้ารายละเอียดสินค้าจริงใน Shopee
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Shopee Affiliate URL (Generated Link) *
                  </label>
                  <input
                    type="url"
                    required
                    value={affiliateUrl}
                    onChange={(e) => setAffiliateUrl(e.target.value)}
                    placeholder="https://shope.ee/abcdefg หรือ https://s.shopee.co.th/..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono text-xs"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    ลิงก์ Affiliate ที่สร้างจาก Shopee Affiliate Portal (ผู้ใช้จะถูก Redirect ไปยังลิงก์นี้เมื่อคลิก &quot;ดูสินค้าใน Shopee&quot;)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    สถานะลิงก์
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                  >
                    <option value="active">เปิดใช้งาน (Active)</option>
                    <option value="inactive">ปิดใช้งาน (Inactive)</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <a
                    href={`/go/${selectedProduct.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-orange-600 hover:text-orange-700 font-semibold inline-flex items-center gap-1"
                  >
                    <span>ทดสอบเปิดลิงก์ Redirect</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSubmitting ? "กำลังบันทึก..." : "บันทึกลิงก์ Affiliate"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
