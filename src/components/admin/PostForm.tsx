"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSchema, PostFormData } from "@/lib/validation/post";
import { CategorySerialized } from "@/types/category";
import { generateSlug } from "@/lib/utils";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PostFormProps {
  initialData?: Partial<PostFormData>;
  categories: CategorySerialized[];
  onSubmit: (data: PostFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function PostForm({
  initialData,
  categories,
  onSubmit,
  isSubmitting = false,
}: PostFormProps) {
  const [tagsInput, setTagsInput] = useState<string>(
    initialData?.tags ? initialData.tags.join(", ") : ""
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      excerpt: initialData?.excerpt || "",
      content: initialData?.content || "",
      featuredImage: initialData?.featuredImage || "",
      categoryId: initialData?.categoryId || "",
      tags: initialData?.tags || [],
      status: initialData?.status || "draft",
      seoTitle: initialData?.seoTitle || "",
      seoDescription: initialData?.seoDescription || "",
    },
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setValue("title", title);
    if (!initialData?.slug) {
      setValue("slug", generateSlug(title));
    }
  };

  const handleFormSubmit = async (data: PostFormData) => {
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    await onSubmit({
      ...data,
      tags,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/posts"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ย้อนกลับ</span>
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? "กำลังบันทึก..." : "บันทึกบทความ"}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-2xs">
        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
          ข้อมูลบทความ
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              หัวข้อบทความ *
            </label>
            <input
              type="text"
              {...register("title")}
              onChange={handleTitleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Slug (URL) *
            </label>
            <input
              type="text"
              {...register("slug")}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
            {errors.slug && <p className="text-xs text-red-600 mt-1">{errors.slug.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              หมวดหมู่บทความ
            </label>
            <select
              {...register("categoryId")}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
            >
              <option value="">-- ไม่ระบุหมวดหมู่ --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              สถานะบทความ
            </label>
            <select
              {...register("status")}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
            >
              <option value="draft">ฉบับร่าง (Draft)</option>
              <option value="published">เผยแพร่ (Published)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            URL รูปภาพหน้าปก (Featured Image)
          </label>
          <input
            type="url"
            {...register("featuredImage")}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            บทคัดย่อ (Excerpt) *
          </label>
          <textarea
            rows={2}
            {...register("excerpt")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
          {errors.excerpt && <p className="text-xs text-red-600 mt-1">{errors.excerpt.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            เนื้อหาบทความ *
          </label>
          <textarea
            rows={10}
            {...register("content")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
          {errors.content && <p className="text-xs text-red-600 mt-1">{errors.content.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            แท็ก (คั่นด้วยจุลภาค ,)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
        </div>
      </div>
    </form>
  );
}
