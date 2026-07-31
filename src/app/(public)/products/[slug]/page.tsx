import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductBySlug, getProducts } from "@/lib/firebase/services/products";
import { getCategoryById } from "@/lib/firebase/services/categories";
import { ProductPrice } from "@/components/product/ProductPrice";
import { ProductGrid } from "@/components/product/ProductGrid";
import { AffiliateButton } from "@/components/affiliate/AffiliateButton";
import { AffiliateDisclosure } from "@/components/affiliate/AffiliateDisclosure";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { SeoJsonLd } from "@/components/seo/SeoJsonLd";
import { generateProductSchema } from "@/lib/seo/schema";
import { constructMetadata } from "@/lib/seo/metadata";
import { Star, ShieldCheck, Tag, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 3600;

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return constructMetadata({
      title: "ไม่พบสินค้า",
      noIndex: true,
    });
  }

  return constructMetadata({
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.shortDescription,
    image: product.images?.[0],
    path: `/products/${product.slug}`,
  });
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [category, relatedProducts] = await Promise.all([
    product.categoryId ? getCategoryById(product.categoryId) : null,
    getProducts({ categoryId: product.categoryId, limitCount: 4 }),
  ]);

  const filteredRelated = relatedProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <>
      <SeoJsonLd data={generateProductSchema(product)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Breadcrumb
          items={[
            { label: "สินค้าทั้งหมด", href: "/products" },
            ...(category ? [{ label: category.name, href: `/categories/${category.slug}` }] : []),
            { label: product.name },
          ]}
        />

        {/* Product Details Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-xs">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  ไม่มีรูปภาพ
                </div>
              )}
            </div>

            {/* Thumbnail list if multiple images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0"
                  >
                    <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col space-y-5">
            {category && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full w-fit">
                <Tag className="w-3.5 h-3.5" />
                <span>{category.name}</span>
              </span>
            )}

            <h1 className="text-xl sm:text-3xl font-extrabold text-gray-900 leading-snug">
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating !== undefined && product.rating > 0 && (
              <div className="flex items-center gap-1.5 text-amber-500 text-sm">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold text-gray-900">{product.rating.toFixed(1)}</span>
                <span className="text-gray-400 text-xs">(คะแนนรีวิวจากผู้ใช้จริง)</span>
              </div>
            )}

            {/* Price Box */}
            <div className="bg-orange-50/60 border border-orange-100 rounded-xl p-4 space-y-1">
              <span className="text-xs text-gray-500 font-medium">ราคาโปรโมชั่นพิเศษ</span>
              <ProductPrice
                price={product.price}
                originalPrice={product.originalPrice}
                discountPercent={product.discountPercent}
                size="lg"
              />
            </div>

            {/* Short Description */}
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* CTA Button */}
            <div className="pt-2 space-y-3 mt-auto">
              <AffiliateButton
                slug={product.slug}
                size="lg"
                label="ดูสินค้าใน Shopee"
              />
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ลิงก์ตรงไปยังร้านค้าทางการใน Shopee อย่างปลอดภัย</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <ShoppingBag className="w-5 h-5 text-orange-600" />
            <span>รายละเอียดสินค้าและจุดเด่น</span>
          </h2>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {product.description}
          </div>
        </div>

        {/* Related Products */}
        {filteredRelated.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">สินค้าที่เกี่ยวข้อง</h2>
            <ProductGrid products={filteredRelated} />
          </section>
        )}

        {/* Affiliate Disclosure */}
        <AffiliateDisclosure />
      </div>
    </>
  );
}
