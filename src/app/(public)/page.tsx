import Link from "next/link";
import { getProducts } from "@/lib/firebase/services/products";
import { getCategories } from "@/lib/firebase/services/categories";
import { getPosts } from "@/lib/firebase/services/posts";
import { ProductGrid } from "@/components/product/ProductGrid";
import { BlogCard } from "@/components/blog/BlogCard";
import { AffiliateDisclosure } from "@/components/affiliate/AffiliateDisclosure";
import { SeoJsonLd } from "@/components/seo/SeoJsonLd";
import { generateWebSiteSchema, generateOrganizationSchema } from "@/lib/seo/schema";
import { SearchBar } from "@/components/ui/SearchBar";
import {
  ShoppingBag,
  Sparkles,
  TrendingUp,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  BadgePercent,
  Star,
  Truck,
  CreditCard,
  HeadphonesIcon,
} from "lucide-react";
import { siteConfig } from "@/config/site";

export const revalidate = 3600;

/* ─── category icon/color palette ─── */
const categoryStyles = [
  { gradient: "from-rose-500 to-pink-600", bg: "bg-rose-50", text: "text-rose-600" },
  { gradient: "from-violet-500 to-purple-600", bg: "bg-violet-50", text: "text-violet-600" },
  { gradient: "from-sky-500 to-blue-600", bg: "bg-sky-50", text: "text-sky-600" },
  { gradient: "from-emerald-500 to-teal-600", bg: "bg-emerald-50", text: "text-emerald-600" },
  { gradient: "from-amber-500 to-orange-600", bg: "bg-amber-50", text: "text-amber-600" },
  { gradient: "from-fuchsia-500 to-pink-600", bg: "bg-fuchsia-50", text: "text-fuchsia-600" },
  { gradient: "from-cyan-500 to-blue-600", bg: "bg-cyan-50", text: "text-cyan-600" },
  { gradient: "from-lime-500 to-green-600", bg: "bg-lime-50", text: "text-lime-600" },
];

const categoryEmojis = ["🛒", "🎮", "👗", "🏠", "💄", "📱", "🍜", "🐾", "⚽", "🚗", "🧸", "💊"];

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



      {/* ═══════════════════════════════════════════════════════
          TRUST STRIP — Value propositions
         ═══════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { icon: BadgePercent, label: "ราคาดีที่สุด", sub: "เปรียบเทียบให้แล้ว" },
              { icon: Truck, label: "ส่งไว ส่งฟรี", sub: "หลากหลายดีล" },
              { icon: ShieldCheck, label: "สินค้าคุณภาพ", sub: "คัดสรรจากร้านดัง" },
              { icon: HeadphonesIcon, label: "รีวิวจริง", sub: "จากผู้ใช้งานจริง" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-200/50">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">

        {/* ═══════════════════════════════════════════════════════
            CATEGORIES — Pill-style colorful grid
           ═══════════════════════════════════════════════════════ */}
        {categories.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-orange-200/50">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">หมวดหมู่ยอดนิยม</h2>
                  <p className="text-xs text-gray-500 mt-0.5">เลือกสำรวจสินค้าตามหมวดหมู่ที่สนใจ</p>
                </div>
              </div>
              <Link
                href="/categories"
                className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition-colors"
              >
                <span>ดูทั้งหมด</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {categories.slice(0, 8).map((cat, i) => {
                const style = categoryStyles[i % categoryStyles.length];
                const emoji = categoryEmojis[i % categoryEmojis.length];
                return (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className="group relative bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex items-center gap-4 hover:border-transparent hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${style.bg} flex items-center justify-center flex-shrink-0 text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300`}>
                      {emoji}
                    </div>
                    <div className="overflow-hidden min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-orange-600 transition-colors truncate">
                        {cat.name}
                      </h3>
                      {cat.description && (
                        <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{cat.description}</p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 ml-auto flex-shrink-0 group-hover:translate-x-1 transition-all" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            FEATURED PRODUCTS — With highlight banner
           ═══════════════════════════════════════════════════════ */}
        {featuredProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-200/50">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">⚡ สินค้าแนะนำพิเศษ</h2>
                  <p className="text-xs text-gray-500 mt-0.5">คัดสรรมาเพื่อคุณโดยเฉพาะ ดีลที่ไม่ควรพลาด</p>
                </div>
              </div>
              <Link
                href="/products?featured=true"
                className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition-colors"
              >
                <span>ดูทั้งหมด</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ProductGrid products={featuredProducts} />
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            PROMO BANNER — Eye-catching deal strip
           ═══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 sm:px-10 py-8 sm:py-10">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-fuchsia-400/20 rounded-full blur-2xl" />
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left space-y-2">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-white/90 border border-white/20">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                Flash Sale ทุกวัน
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                ดีลสุดพิเศษ ลดสูงสุด 90%
              </h3>
              <p className="text-sm text-white/80 max-w-md">
                สำรวจโปรโมชั่นเด็ดจาก Shopee ที่เราคัดมาให้คุณ อัปเดตใหม่ทุกวัน
              </p>
            </div>
            <Link
              href="/products"
              className="px-8 py-3.5 bg-white text-purple-700 font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 text-sm sm:text-base inline-flex items-center gap-2 flex-shrink-0"
            >
              <Zap className="w-5 h-5" />
              <span>ดูดีลทั้งหมด</span>
            </Link>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            LATEST PRODUCTS
           ═══════════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-200/50">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">🛍️ สินค้ามาใหม่ล่าสุด</h2>
                <p className="text-xs text-gray-500 mt-0.5">สินค้าเข้าใหม่ อัปเดตทุกวัน ไม่พลาดทุกดีล</p>
              </div>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition-colors"
            >
              <span>ดูทั้งหมด</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ProductGrid products={latestProducts} />
        </section>

        {/* ═══════════════════════════════════════════════════════
            LATEST BLOG POSTS
           ═══════════════════════════════════════════════════════ */}
        {latestPosts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-200/50">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">📖 บทความน่าสนใจ</h2>
                  <p className="text-xs text-gray-500 mt-0.5">เคล็ดลับช้อปปิ้ง รีวิวสินค้า และเทรนด์ล่าสุด</p>
                </div>
              </div>
              <Link
                href="/blog"
                className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition-colors"
              >
                <span>บทความทั้งหมด</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {latestPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            SEO / ABOUT SECTION — Premium card
           ═══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-white rounded-3xl border border-gray-100 p-8 sm:p-10 shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-50 to-transparent rounded-bl-full" />
          <div className="relative space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-orange-200/50">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
                เกี่ยวกับ {siteConfig.name}
              </h2>
            </div>
            <div className="text-sm text-gray-600 space-y-3 leading-relaxed max-w-3xl">
              <p>
                {siteConfig.name} คือแพลตฟอร์มแนะนำสินค้าและเปรียบเทียบราคา ที่มุ่งมั่นนำเสนอข้อมูลสินค้าคุณภาพจาก Shopee
                เพื่อให้ผู้ซื้อสามารถตัดสินใจซื้อได้อย่างรวดเร็วและคุ้มค่าที่สุด เราคัดสรรสินค้าจากร้านค้าที่น่าเชื่อถือ
                พร้อมอัปเดตราคา ส่วนลด และโปรโมชั่นล่าสุดเป็นประจำ
              </p>
              <p>
                ไม่ว่าคุณจะมองหาสินค้าไอที แฟชั่น เครื่องใช้ในบ้าน หรือสินค้าแม่และเด็ก {siteConfig.name} ช่วยให้คุณค้นหาสินค้าที่ตอบโจทย์ความต้องการได้ในราคาที่ดีที่สุด
              </p>
            </div>
          </div>
        </section>

        {/* Affiliate Disclosure */}
        <AffiliateDisclosure />
      </div>
    </>
  );
}
