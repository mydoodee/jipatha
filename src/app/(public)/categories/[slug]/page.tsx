import { notFound } from "next/navigation";
import { getCategoryBySlug, getCategories } from "@/lib/firebase/services/categories";
import { getProducts } from "@/lib/firebase/services/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { constructMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const categories = await getCategories("active");
    if (categories.length > 0) {
      return categories.map((c) => ({ slug: c.slug }));
    }
  } catch (err) {
    console.error("Error generating category static params:", err);
  }
  return [{ slug: "general-products" }];
}

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return constructMetadata({
      title: "ไม่พบหมวดหมู่",
      noIndex: true,
    });
  }

  return constructMetadata({
    title: category.seoTitle || `สินค้าหมวดหมู่ ${category.name}`,
    description: category.seoDescription || category.description || `รวมสินค้ายอดนิยมในหมวดหมู่ ${category.name}`,
    path: `/categories/${category.slug}`,
  });
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = await getProducts({ categoryId: category.id });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb
        items={[
          { label: "หมวดหมู่ทั้งหมด", href: "/categories" },
          { label: category.name },
        ]}
      />

      <div className="border-b border-gray-200 pb-4 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-xs sm:text-sm text-gray-500">{category.description}</p>
        )}
      </div>

      <ProductGrid
        products={products}
        emptyTitle={`ไม่พบสินค้าในหมวดหมู่ ${category.name}`}
        emptyDescription="ขออภัย ยังไม่มีสินค้าในหมวดหมู่นี้ในขณะนี้"
      />
    </div>
  );
}
