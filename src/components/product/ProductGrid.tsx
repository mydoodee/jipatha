import { ProductSerialized } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { PackageX } from "lucide-react";

interface ProductGridProps {
  products: ProductSerialized[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ProductGrid({
  products,
  loading = false,
  emptyTitle = "ไม่พบสินค้า",
  emptyDescription = "ยังไม่มีสินค้าในรายการนี้ กรุณาลองค้นหาใหม่อีกครั้ง",
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden p-4 space-y-3 animate-pulse"
          >
            <div className="aspect-square bg-gray-200 rounded-lg" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-6 bg-gray-200 rounded w-1/3 pt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center my-6">
        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <PackageX className="w-6 h-6" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
          {emptyTitle}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
