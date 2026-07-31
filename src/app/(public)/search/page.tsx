import { getProducts } from "@/lib/firebase/services/products";
import { getPosts } from "@/lib/firebase/services/posts";
import { ProductGrid } from "@/components/product/ProductGrid";
import { BlogCard } from "@/components/blog/BlogCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { constructMetadata } from "@/lib/seo/metadata";
import { Search, ShoppingBag, BookOpen } from "lucide-react";

export const metadata = constructMetadata({
  title: "ค้นหาสินค้าและบทความ",
  description: "ค้นหาสินค้าคุณภาพ เปรียบเทียบราคา และอ่านบทความรีวิว",
  path: "/search",
  noIndex: true, // Internal search pages should not be indexed by Google
});

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const searchTerm = q.trim().toLowerCase();

  const [allProducts, allPosts] = await Promise.all([
    getProducts({ limitCount: 50 }),
    getPosts({ status: "published", limitCount: 20 }),
  ]);

  // Client/Server filter fallback for search
  const filteredProducts = searchTerm
    ? allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.shortDescription.toLowerCase().includes(searchTerm) ||
          p.tags?.some((t) => t.toLowerCase().includes(searchTerm))
      )
    : [];

  const filteredPosts = searchTerm
    ? allPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm) ||
          post.excerpt.toLowerCase().includes(searchTerm)
      )
    : [];

  const totalResults = filteredProducts.length + filteredPosts.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb items={[{ label: "ค้นหา" }]} />

      <div className="max-w-2xl mx-auto space-y-4 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center justify-center gap-2">
          <Search className="w-7 h-7 text-orange-600" />
          <span>ค้นหาบนเว็บไซต์</span>
        </h1>
        <SearchBar initialQuery={q} className="max-w-xl mx-auto" />
      </div>

      {searchTerm && (
        <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">
            ผลการค้นหาสำหรับ &ldquo;<span className="text-orange-600 font-bold">{q}</span>&rdquo;
          </p>
          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-semibold">
            พบ {totalResults} รายการ
          </span>
        </div>
      )}

      {!searchTerm ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500 max-w-md mx-auto">
          พิมพ์คำค้นหาที่ต้องการในช่องค้นหาด้านบน
        </div>
      ) : totalResults === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center my-6">
          <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            ไม่พบผลการค้นหาสำหรับ &ldquo;{q}&rdquo;
          </h3>
          <p className="text-xs text-gray-500">
            ลองใช้คำค้นหาอื่น หรือตรวจดูตัวสะกดอีกครั้ง
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Products Results */}
          {filteredProducts.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
                <span>สินค้าที่พบ ({filteredProducts.length})</span>
              </h2>
              <ProductGrid products={filteredProducts} />
            </section>
          )}

          {/* Blog Results */}
          {filteredPosts.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-600" />
                <span>บทความที่พบ ({filteredPosts.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
