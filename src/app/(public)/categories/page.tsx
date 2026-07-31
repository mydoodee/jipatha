import { getCategories } from "@/lib/firebase/services/categories";
import { CategoryCard } from "@/components/category/CategoryCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { constructMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

export const metadata = constructMetadata({
  title: "หมวดหมู่สินค้าทั้งหมด — ค้นหาสินค้าตามประเภท",
  description: "เลือกชมสินค้าจากหมวดหมู่ยอดนิยม ครอบคลุมทุกความต้องการ พร้อมส่วนลดพิเศษจาก Shopee",
  path: "/categories",
});

export default async function CategoriesPage() {
  const categories = await getCategories("active");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb items={[{ label: "หมวดหมู่ทั้งหมด" }]} />

      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          หมวดหมู่สินค้าทั้งหมด
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          เลือกหมวดหมู่สินค้าที่คุณสนใจเพื่อดูรายการสินค้าและดีลพิเศษ
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500">
          ยังไม่มีหมวดหมู่ในขณะนี้
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}
