import Link from "next/link";
import Image from "next/image";
import { PostSerialized } from "@/types/post";
import { formatDate } from "@/lib/utils";
import { Calendar, ArrowRight } from "lucide-react";

interface BlogCardProps {
  post: PostSerialized;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col h-full">
      {/* Featured Image */}
      <Link href={`/blog/${post.slug}`} className="block relative aspect-video overflow-hidden bg-gray-100">
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            บทความ
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(post.publishedAt || post.createdAt)}</span>
        </div>

        {/* Title */}
        <Link href={`/blog/${post.slug}`} className="group-hover:text-orange-600 transition-colors">
          <h3 className="font-semibold text-gray-900 text-base line-clamp-2 mb-2 leading-snug">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 mb-4 flex-grow leading-relaxed">
          {post.excerpt}
        </p>

        {/* Read More */}
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 mt-auto pt-2"
        >
          <span>อ่านต่อ</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
