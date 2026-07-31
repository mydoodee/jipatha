import Link from "next/link";
import { getProducts } from "@/lib/firebase/services/products";
import { getCategories } from "@/lib/firebase/services/categories";
import { getPosts } from "@/lib/firebase/services/posts";
import { ProductGrid } from "@/components/product/ProductGrid";
import { CategoryCard } from "@/components/category/CategoryCard";
import { BlogCard } from "@/components/blog/BlogCard";
import { AffiliateDisclosure } from "@/components/affiliate/AffiliateDisclosure";
import { SeoJsonLd } from "@/components/seo/SeoJsonLd";
import { generateWebSiteSchema, generateOrganizationSchema } from "@/lib/seo/schema";
import { ShoppingBag, Sparkles, TrendingUp, BookOpen, ArrowRight, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";

export const revalidate = 3600;

export default async function HomePage() {
  const [featuredProducts, latestProducts, categories, latestPosts] = await Promise.all([
    getProducts({ featured: true, limitCount: 4 }),
    getProducts({ limitCount: 8 }),
    getCategories("active"),
    getPosts({ limitCount: 3 }),
  ]);

  return (
    <>
      <SeoJsonLd data={generateWebSiteSchema()} />
      <SeoJsonLd data={generateOrganizationSchema()} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-600 via-orange-500 to-amber-600 text-white py-12 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium">
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>แหล่งรวมรีวิวและโปรโมชั่นสินค้า Shopee ที่คุ้มค่าที่สุด</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            ค้นหาสินค้าคุณภาพ เปรียบเทียบราคา <br className="hidden sm:block" />
            พร้อมรับส่วนลดพิเศษก่อนใคร
          </h1>

          <p className="text-sm sm:text-lg text-orange-100 max-w-2xl mx-auto leading-relaxed">
            รวบรวมสินค้ายอดนิยม รีวิวจากผู้ใช้จริง และดีลพิเศษจาก Shopee ช่วยคุณตัดสินใจซื้อได้อย่างมั่นใจ
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/products"
              className="px-6 py-3 bg-white text-orange-600 font-bold rounded-xl shadow-md hover:bg-orange-50 transition-all text-sm sm:text-base inline-flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>เรียกดูสินค้าทั้งหมด</span>
            </Link>
            <Link
              href="/blog"
              className="px-6 py-3 bg-orange-700/60 hover:bg-orange-700 text-white font-semibold rounded-xl border border-white/30 transition-all text-sm sm:text-base inline-flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              <span>อ่านบทความแนะนำ</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">

        {/* Popular Categories */}
        {categories.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <span>หมวดหมู่ยอดนิยม</span>
              </h2>
              <Link
                href="/categories"
                className="text-xs sm:text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <span>ดูทั้งหมด</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          </section>
        )}

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-600" />
                <span>สินค้าแนะนำพิเศษ</span>
              </h2>
              <Link
                href="/products?featured=true"
                className="text-xs sm:text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <span>ดูทั้งหมด</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ProductGrid products={featuredProducts} />
          </section>
        )}

        {/* Latest Products */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
              <span>สินค้าล่าสุด</span>
            </h2>
            <Link
              href="/products"
              className="text-xs sm:text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>ดูทั้งหมด</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ProductGrid products={latestProducts} />
        </section>

        {/* Latest Blog */}
        {latestPosts.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-600" />
                <span>บทความน่าสนใจ</span>
              </h2>
              <Link
                href="/blog"
                className="text-xs sm:text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <span>บทความทั้งหมด</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* SEO Content Section */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-600" />
            <span>เกี่ยวกับ {siteConfig.name} — ศูนย์รวมการเปรียบเทียบสินค้าและดีลสุดคุ้ม</span>
          </h2>
          <div className="text-xs sm:text-sm text-gray-600 space-y-3 leading-relaxed">
            <p>
              {siteConfig.name} คือแพลตฟอร์มแนะนำสินค้าและเปรียบเทียบราคา ที่มุ่งมั่นนำเสนอข้อมูลสินค้าคุณภาพจาก Shopee เพื่อให้ผู้ซื้อสามารถตัดสินใจซื้อได้อย่างรวดเร็วและคุ้มค่าที่สุด เราคัดสรรสินค้าจากร้านค้าที่น่าเชื่อถือ พร้อมอัปเดตราคา ส่วนลด และโปรโมชั่นล่าสุดเป็นประจำ
            </p>
            <p>
              ไม่ว่าคุณจะมองหาสินค้าไอที แฟชั่น เครื่องใช้ในบ้าน หรือสินค้าแม่และเด็ก {siteConfig.name} ช่วยให้คุณค้นหาสินค้าที่ตอบโจทย์ความต้องการได้ในราคาที่ดีที่สุด
            </p>
          </div>
        </section>

        {/* Affiliate Disclosure Notice */}
        <AffiliateDisclosure />
      </div>
    </>
  );
}
