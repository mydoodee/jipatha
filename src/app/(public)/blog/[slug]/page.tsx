import { notFound } from "next/navigation";
import Image from "next/image";
import { getPostBySlug } from "@/lib/firebase/services/posts";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { AffiliateDisclosure } from "@/components/affiliate/AffiliateDisclosure";
import { SeoJsonLd } from "@/components/seo/SeoJsonLd";
import { generateArticleSchema } from "@/lib/seo/schema";
import { constructMetadata } from "@/lib/seo/metadata";
import { formatDate } from "@/lib/utils";
import { Calendar, User, Tag } from "lucide-react";
import { siteConfig } from "@/config/site";
import type { Metadata } from "next";

export const revalidate = 3600;

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return constructMetadata({
      title: "ไม่พบบทความ",
      noIndex: true,
    });
  }

  return constructMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    image: post.featuredImage,
    path: `/blog/${post.slug}`,
    type: "article",
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <SeoJsonLd data={generateArticleSchema(post)} />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Breadcrumb
          items={[
            { label: "บทความทั้งหมด", href: "/blog" },
            { label: post.title },
          ]}
        />

        {/* Article Header */}
        <header className="space-y-4 text-center sm:text-left border-b border-gray-200 pb-6">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4 text-orange-600" />
              <span>{siteConfig.author}</span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        )}

        {/* Excerpt Summary Box */}
        <div className="bg-orange-50/70 border-l-4 border-orange-500 rounded-r-xl p-4 text-sm text-gray-700 font-medium leading-relaxed">
          {post.excerpt}
        </div>

        {/* Main Content */}
        <div className="prose prose-orange max-w-none text-gray-800 leading-relaxed text-sm sm:text-base whitespace-pre-line bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
          {post.content}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2">
            <Tag className="w-4 h-4 text-gray-400" />
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-md font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Affiliate Disclosure */}
        <AffiliateDisclosure />
      </article>
    </>
  );
}
