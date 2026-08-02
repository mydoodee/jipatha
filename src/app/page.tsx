import Link from "next/link";
import { getProducts } from "@/lib/firebase/services/products";
import { getPosts } from "@/lib/firebase/services/posts";
import { sampleCctvProducts } from "@/lib/data/cctvCatalog";
import { ProductGrid } from "@/components/product/ProductGrid";
import { BlogCard } from "@/components/blog/BlogCard";
import { AffiliateDisclosure } from "@/components/affiliate/AffiliateDisclosure";
import { SeoJsonLd } from "@/components/seo/SeoJsonLd";
import { generateWebSiteSchema, generateOrganizationSchema } from "@/lib/seo/schema";
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Scale,
  Video,
  Award,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { ProductSerialized } from "@/types/product";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ─── CCTV Brands List ─── */
const cctvBrands = [
  {
    name: "TP-Link Tapo",
    query: "TP-Link",
    description: "กล้องไร้สาย IP Camera ยอดฮิตอันดับ 1",
    badge: "ยอดฮิต #1",
    icon: "📷",
    bg: "bg-sky-50 text-sky-600 border-sky-100",
  },
  {
    name: "IMOU",
    query: "IMOU",
    description: "กล้อง AI อัจฉริยะ หมุนตามคน 2K/4K",
    badge: "AI Smart",
    icon: "🤖",
    bg: "bg-orange-50 text-orange-600 border-orange-100",
  },
  {
    name: "Xiaomi",
    query: "Xiaomi",
    description: "กล้องมินิมอล คมชัดสูง เชื่อม Mi Home",
    badge: "Smart Home",
    icon: "📱",
    bg: "bg-amber-50 text-amber-600 border-amber-100",
  },
  {
    name: "Ezviz",
    query: "Ezviz",
    description: "กล้องภายนอก Outdoor PTZ หมุน 360°",
    badge: "Outdoor PTZ",
    icon: "🔄",
    bg: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
  {
    name: "V380 Pro",
    query: "V380",
    description: "กล้องโซล่าเซลล์ & 4G ใส่ซิม ไร้เน็ตบ้าน",
    badge: "Solar 4G",
    icon: "☀️",
    bg: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  {
    name: "70mai",
    query: "70mai",
    description: "กล้องติดรถยนต์ หน้า-หลัง คมชัด 2.7K",
    badge: "Dash Cam",
    icon: "🚗",
    bg: "bg-rose-50 text-rose-600 border-rose-100",
  },
  {
    name: "Dahua",
    query: "Dahua",
    description: "ชุดกล้อง NVR PoE ระบบช่างติดตั้ง",
    badge: "NVR Set",
    icon: "🔒",
    bg: "bg-violet-50 text-violet-600 border-violet-100",
  },
  {
    name: "Hikvision",
    query: "Hikvision",
    description: "ระบบกล้องวงจรปิดระดับมืออาชีพ",
    badge: "Pro Security",
    icon: "🛡️",
    bg: "bg-blue-50 text-blue-600 border-blue-100",
  },
];

export default async function HomePage() {
  let featuredProducts: ProductSerialized[] = [];
  let latestProducts: ProductSerialized[] = [];
  let latestPosts: any[] = [];

  try {
    const [dbFeatured, dbLatest, dbPosts] = await Promise.all([
      getProducts({ featured: true, limitCount: 4 }),
      getProducts({ limitCount: 12 }),
      getPosts({ limitCount: 3 }),
    ]);
    featuredProducts = dbFeatured;
    latestProducts = dbLatest;
    latestPosts = dbPosts;
  } catch (e) {
    console.error("Firebase fetch error, using sample CCTV catalog fallback:", e);
  }

  // Fallback to rich CCTV sample catalog if DB products empty
  if (featuredProducts.length === 0) {
    featuredProducts = sampleCctvProducts.filter((p) => p.featured).slice(0, 4);
  }
  if (latestProducts.length === 0) {
    latestProducts = sampleCctvProducts;
  }

  return (
    <>
      <SeoJsonLd data={generateWebSiteSchema()} />
      <SeoJsonLd data={generateOrganizationSchema()} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        {/* ═══════════════════════════════════════════════════════
            POPULAR CCTV BRANDS — ยี่ห้อสินค้ายอดนิยม
           ═══════════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                style={{ background: "linear-gradient(90deg, #ff5722 0%, #ff1744 100%)" }}
                className="w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-md shadow-rose-500/20"
              >
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                  ยี่ห้อสินค้ายอดนิยม
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  เลือกดูกล้องวงจรปิดจากแบรนด์ชั้นนำยอดฮิตใน Shopee
                </p>
              </div>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-full transition-colors"
            >
              <span>ดูกล้องทั้งหมด</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {cctvBrands.map((brand, i) => (
              <Link
                key={i}
                href={`/search?q=${encodeURIComponent(brand.query)}`}
                className="group relative bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex items-center gap-4 hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/5 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${brand.bg} border flex items-center justify-center flex-shrink-0 text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300 shadow-xs`}>
                  {brand.icon}
                </div>
                <div className="overflow-hidden min-w-0 flex-grow">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-gray-900 text-sm sm:text-base group-hover:text-orange-600 transition-colors truncate">
                      {brand.name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                    {brand.description}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
                    {brand.badge}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 ml-auto flex-shrink-0 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            FEATURED CCTV PRODUCTS — Highlight deals
           ═══════════════════════════════════════════════════════ */}
        {featuredProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  style={{ background: "linear-gradient(90deg, #ff5722 0%, #ff1744 100%)" }}
                  className="w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-md shadow-rose-500/20"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                    ⚡ กล้องวงจรปิดแนะนำพิเศษ
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    คัดรุ่นที่คุ้มค่า สเปคดีที่สุด เรตติ้งสูงจาก Shopee
                  </p>
                </div>
              </div>
              <Link
                href="/products?featured=true"
                className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-full transition-colors"
              >
                <span>ดูทั้งหมด</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ProductGrid products={featuredProducts} />
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            PROMO / COMPARE BANNER — High-contrast Shopee Orange
           ═══════════════════════════════════════════════════════ */}
        <section
          className="relative overflow-hidden rounded-3xl px-6 sm:px-10 py-8 sm:py-10 text-white shadow-xl shadow-orange-500/20"
          style={{ background: "linear-gradient(90deg, #ff5722 0%, #ff1744 100%)", color: "#ffffff" }}
        >
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left space-y-2">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-extrabold text-white border border-white/30">
                <Scale className="w-4 h-4 text-white" />
                <span>ระบบเทียบราคาข้างต่อข้าง</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white" style={{ color: "#ffffff" }}>
                เลือกรุ่นที่ใช่ เปรียบเทียบสเปคก่อนตัดสินใจซื้อ
              </h3>
              <p className="text-sm text-white/95 max-w-lg font-medium" style={{ color: "#ffffff" }}>
                กดปุ่ม &ldquo;+ เทียบ&rdquo; ที่กล้องวงจรปิดรุ่นที่คุณสนใจ เพื่อนำสเปค ความละเอียด ราคา และส่วนลด Shopee มาเปรียบเทียบในตารางเดียว
              </p>
            </div>
            <Link
              href="/compare"
              className="px-8 py-3.5 bg-white hover:bg-orange-50 text-red-600 font-black rounded-full shadow-xl hover:scale-105 transition-all text-sm sm:text-base inline-flex items-center gap-2 flex-shrink-0"
            >
              <Scale className="w-5 h-5 text-red-600" />
              <span>เปิดตารางเปรียบเทียบ</span>
            </Link>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            LATEST CCTV PRODUCTS
           ═══════════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-200/50">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                  📷 กล้องวงจรปิดทั้งหมด
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  อัปเดตราคา ดีลส่วนลด Shopee ล่าสุดประจำวัน
                </p>
              </div>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-full transition-colors"
            >
              <span>ดูทั้งหมด</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ProductGrid products={latestProducts} />
        </section>

        {/* ═══════════════════════════════════════════════════════
            LATEST BLOG POSTS / GUIDES
           ═══════════════════════════════════════════════════════ */}
        {latestPosts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-200/50">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                    📖 คู่มือเลือกซื้อกล้องวงจรปิด
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    รวมบทความแนะนำการติดตั้ง และการเลือกกล้องวงจรปิด
                  </p>
                </div>
              </div>
              <Link
                href="/blog"
                className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-full transition-colors"
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
            SEO / ABOUT SECTION
           ═══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-white rounded-3xl border border-gray-100 p-8 sm:p-10 shadow-xs">
          <div className="relative space-y-5">
            <div className="flex items-center gap-3">
              <div
                style={{ background: "linear-gradient(90deg, #ff5722 0%, #ff1744 100%)" }}
                className="w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-md shadow-rose-500/20"
              >
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900">
                เกี่ยวกับ {siteConfig.name}
              </h2>
            </div>
            <div className="text-sm text-gray-600 space-y-3 leading-relaxed max-w-3xl">
              <p>
                <strong>{siteConfig.name}</strong> คือแพลตฟอร์มผู้ช่วยเลือกซื้อและเปรียบเทียบราคากล้องวงจรปิด (CCTV) ที่พัฒนาขึ้นมาด้วยเทคโนโลยี AI เพื่อช่วยเหลือผู้ใช้งานในการเลือกซื้อกล้องวงจรปิดที่เหมาะกับงบประมาณและสเปคที่ต้องการมากที่สุด
              </p>
              <p>
                ไม่ว่าคุณจะมองหากล้องวงจรปิดไร้สายสำหรับติดในบ้าน, กล้อง Outdoor กันน้ำภาพสีกลางคืน, กล้องพลังงานแสงอาทิตย์ (Solar Cell) หรือกล้อง 4G ใส่ซิมที่ไม่ต้องใช้เน็ตบ้าน ระบบ AI ของเราจะประมวลผลคำถามของคุณ เช่น &ldquo;งบ 3,000 ซื้อกล้องรุ่นไหนดี&rdquo; และวิเคราะห์เสนอดีลที่ดีที่สุดจาก Shopee Affiliate พร้อมปุ่มซื้อตรงอย่างสะดวกและปลอดภัย
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
