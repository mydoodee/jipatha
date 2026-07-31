import { getPosts } from "@/lib/firebase/services/posts";
import { BlogCard } from "@/components/blog/BlogCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Pagination } from "@/components/ui/Pagination";
import { constructMetadata } from "@/lib/seo/metadata";
import { POSTS_PER_PAGE } from "@/config/constants";
import { BookOpen } from "lucide-react";

export const revalidate = 3600;
export const dynamic = "force-static";

export const metadata = constructMetadata({
  title: "บทความทั้งหมด — คู่มือการซื้อและรีวิวสินค้า",
  description: "อ่านบทความแนะนำการเลือกซื้อสินค้า เทคนิคการเปรียบเทียบราคา และรีวิวสินค้าจากผู้ใช้งานจริง",
  path: "/blog",
});

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;

  const posts = await getPosts({
    status: "published",
    limitCount: POSTS_PER_PAGE * page,
  });

  const paginatedPosts = posts.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE
  );
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb items={[{ label: "บทความทั้งหมด" }]} />

      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-orange-600" />
          <span>บทความและรีวิว</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          สาระน่ารู้ คู่มือการเลือกซื้อ และรีวิวสินค้าคุณภาพ
        </p>
      </div>

      {paginatedPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500">
          ยังไม่มีบทความในขณะนี้
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {paginatedPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} baseUrl="/blog" />
    </div>
  );
}
