"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductFormData } from "@/lib/validation/product";
import { createProduct, updateProduct } from "@/lib/firebase/services/products";
import { getCategories } from "@/lib/firebase/services/categories";
import { createAffiliateLink } from "@/lib/firebase/services/affiliateLinks";
import { CategorySerialized } from "@/types/category";

export default function NewProductPage() {
  const [categories, setCategories] = useState<CategorySerialized[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const cats = await getCategories("active");
        setCategories(cats);
      } catch (err) {
        console.error("Error loading categories:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      // 1. Create Product document
      const productId = await createProduct(data);

      // 2. If affiliateUrl exists, create affiliate link document & link it
      if (data.affiliateUrl) {
        const linkId = await createAffiliateLink({
          productId,
          originalUrl: data.affiliateUrl,
          affiliateUrl: data.affiliateUrl,
          platform: "shopee",
          status: "active",
        });
        await updateProduct(productId, { affiliateLinkId: linkId });
      }

      router.refresh();
      router.push("/admin/products");
    } catch (err) {
      console.error("Error creating product:", err);
      setErrorMsg("เกิดข้อผิดพลาดในการเพิ่มสินค้า กรุณาตรวจสอบข้อมูลอีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-gray-500">
        กำลังโหลดแบบฟอร์ม...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">เพิ่มสินค้าใหม่</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          กรอกข้อมูลสินค้า วางลิงก์ Shopee หรือใช้ระบบดึงข้อมูลอัตโนมัติ
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex justify-between items-center">
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)}>✕</button>
        </div>
      )}

      <ProductForm
        categories={categories}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
