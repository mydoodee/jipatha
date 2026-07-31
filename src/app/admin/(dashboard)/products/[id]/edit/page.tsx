"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductFormData } from "@/lib/validation/product";
import { getProductById, updateProduct, deleteProduct } from "@/lib/firebase/services/products";
import { getCategories } from "@/lib/firebase/services/categories";
import { getAffiliateLinkByProductId, createAffiliateLink, updateAffiliateLink } from "@/lib/firebase/services/affiliateLinks";
import { CategorySerialized } from "@/types/category";
import { ProductSerialized } from "@/types/product";
import { Trash2 } from "lucide-react";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params);
  const [product, setProduct] = useState<ProductSerialized | null>(null);
  const [categories, setCategories] = useState<CategorySerialized[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const [prod, cats, affLink] = await Promise.all([
          getProductById(id),
          getCategories("active"),
          getAffiliateLinkByProductId(id),
        ]);
        if (prod) {
          if (affLink?.affiliateUrl) {
            prod.affiliateUrl = affLink.affiliateUrl;
          }
          setProduct(prod);
        }
        setCategories(cats);
      } catch (err) {
        console.error("Error loading product data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      await updateProduct(id, data);

      if (data.affiliateUrl) {
        const existingLink = await getAffiliateLinkByProductId(id);
        if (existingLink) {
          await updateAffiliateLink(existingLink.id, {
            originalUrl: data.affiliateUrl,
            affiliateUrl: data.affiliateUrl,
          });
        } else {
          const newLinkId = await createAffiliateLink({
            productId: id,
            originalUrl: data.affiliateUrl,
            affiliateUrl: data.affiliateUrl,
            platform: "shopee",
            status: "active",
          });
          await updateProduct(id, { affiliateLinkId: newLinkId });
        }
      }

      router.refresh();
      router.push("/admin/products");
    } catch (err) {
      console.error("Error updating product:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกสินค้า");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?")) return;
    try {
      await deleteProduct(id);
      router.push("/admin/products");
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("เกิดข้อผิดพลาดในการลบสินค้า");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-gray-500">
        กำลังโหลดข้อมูลสินค้า...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-center text-red-600 font-semibold text-sm">
        ไม่พบข้อมูลสินค้าที่ต้องการแก้ไข
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">แก้ไขสินค้า</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            รหัสสินค้า: {product.id}
          </p>
        </div>

        <button
          onClick={handleDelete}
          className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          <span>ลบสินค้า</span>
        </button>
      </div>

      <ProductForm
        initialData={product}
        categories={categories}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
