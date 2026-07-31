import { getProducts } from "@/lib/firebase/services/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Pagination } from "@/components/ui/Pagination";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { constructMetadata } from "@/lib/seo/metadata";
import { PRODUCTS_PER_PAGE } from "@/config/constants";

export const revalidate = 3600;
export const dynamic = "force-static";

export const metadata = constructMetadata({
  title: "สินค้าทั้งหมด — รีวิวและแนะนำสินค้าราคาพิเศษ",
  description: "รวมรายการสินค้าทั้งหมดจาก Shopee คัดสรรคุณภาพ พร้อมเปรียบเทียบราคาและรับดีลพิเศษก่อนใคร",
  path: "/products",
});

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    featured?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;
  const categoryId = resolvedParams.category;
  const isFeatured = resolvedParams.featured === "true";

  const products = await getProducts({
    categoryId,
    featured: isFeatured ? true : undefined,
    limitCount: PRODUCTS_PER_PAGE * page,
  });

  const paginatedProducts = products.slice(
    (page - 1) * PRODUCTS_PER_PAGE,
    page * PRODUCTS_PER_PAGE
  );
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb items={[{ label: "สินค้าทั้งหมด" }]} />

      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          {isFeatured ? "สินค้าแนะนำพิเศษ" : "สินค้าทั้งหมด"}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          สำรวจสินค้าราคาดี โปรโมชั่นเด็ดจาก Shopee
        </p>
      </div>

      <ProductGrid products={paginatedProducts} />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        baseUrl="/products"
      />
    </div>
  );
}
