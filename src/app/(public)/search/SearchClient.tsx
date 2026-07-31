"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { getProducts } from "@/lib/firebase/services/products";
import { getPosts } from "@/lib/firebase/services/posts";
import { ProductSerialized } from "@/types/product";
import { PostSerialized } from "@/types/post";
import { ProductGrid } from "@/components/product/ProductGrid";
import { BlogCard } from "@/components/blog/BlogCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { Search, ShoppingBag, BookOpen, Loader2 } from "lucide-react";

export function SearchClient() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [products, setProducts] = useState<ProductSerialized[]>([]);
  const [posts, setPosts] = useState<PostSerialized[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [prods, pts] = await Promise.all([
          getProducts({ status: "published", limitCount: 100 }),
          getPosts({ status: "published", limitCount: 50 }),
        ]);
        setProducts(prods);
        setPosts(pts);
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const searchTerm = queryParam.trim().toLowerCase();

  // Perform multi-field search filtering
  const filteredProducts = searchTerm
    ? products.filter((p) => {
        const name = (p.name || "").toLowerCase();
        const shortDesc = (p.shortDescription || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();
        const tags = (p.tags || []).map((t) => t.toLowerCase());

        return (
          name.includes(searchTerm) ||
          shortDesc.includes(searchTerm) ||
          desc.includes(searchTerm) ||
          tags.some((t) => t.includes(searchTerm))
        );
      })
    : [];

  const filteredPosts = searchTerm
    ? posts.filter((post) => {
        const title = (post.title || "").toLowerCase();
        const excerpt = (post.excerpt || "").toLowerCase();
        const content = (post.content || "").toLowerCase();
        const tags = (post.tags || []).map((t) => t.toLowerCase());

        return (
          title.includes(searchTerm) ||
          excerpt.includes(searchTerm) ||
          content.includes(searchTerm) ||
          tags.some((t) => t.includes(searchTerm))
        );
      })
    : [];

  const totalResults = filteredProducts.length + filteredPosts.length;

  return (
    <div className="space-y-8">
      {/* Header Search Box */}
      <div className="max-w-2xl mx-auto space-y-4 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center justify-center gap-2">
          <Search className="w-7 h-7 text-orange-600" />
          <span>ค้นหาสินค้าและบทความ</span>
        </h1>
        <SearchBar initialQuery={queryParam} className="max-w-xl mx-auto" />
      </div>

      {/* Query Info Strip */}
      {queryParam && (
        <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">
            ผลการค้นหาสำหรับ &ldquo;<span className="text-orange-600 font-bold">{queryParam}</span>&rdquo;
          </p>
          {!loading && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-semibold">
              พบ {totalResults} รายการ
            </span>
          )}
        </div>
      )}

      {/* Results Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center my-6 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-sm text-gray-500 font-medium">กำลังค้นหาข้อมูล...</p>
        </div>
      ) : !queryParam.trim() ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500 max-w-md mx-auto shadow-xs">
          พิมพ์คำค้นหาที่ต้องการในช่องค้นหาด้านบน
        </div>
      ) : totalResults === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center my-6 shadow-xs">
          <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            ไม่พบผลการค้นหาสำหรับ &ldquo;{queryParam}&rdquo;
          </h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            ลองใช้คำค้นหาที่สั้นลง หรือใช้คำสำคัญอื่น เช่น ชื่อสินค้า แบรนด์ หรือหมวดหมู่
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
