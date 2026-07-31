"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, CategoryFormData } from "@/lib/validation/category";
import { generateSlug } from "@/lib/utils";
import { Save } from "lucide-react";

interface CategoryFormProps {
  initialData?: Partial<CategoryFormData>;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function CategoryForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      image: initialData?.image || "",
      status: initialData?.status || "active",
      sortOrder: initialData?.sortOrder || 0,
      seoTitle: initialData?.seoTitle || "",
      seoDescription: initialData?.seoDescription || "",
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue("name", name);
    if (!initialData?.slug) {
      setValue("slug", generateSlug(name));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white rounded-xl border border-gray-200 p-6 shadow-2xs">
      <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
        {initialData?.name ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            ชื่อหมวดหมู่ *
          </label>
          <input
            type="text"
            {...register("name")}
            onChange={handleNameChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
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
            ลำดับการจัดเรียง (Sort Order)
          </label>
          <input
            type="number"
            {...register("sortOrder", { valueAsNumber: true })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            สถานะ
          </label>
          <select
            {...register("status")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
          >
            <option value="active">เปิดใช้งาน (Active)</option>
            <option value="inactive">ปิดใช้งาน (Inactive)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          คำอธิบายหมวดหมู่
        </label>
        <textarea
          rows={2}
          {...register("description")}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
        />
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? "กำลังบันทึก..." : "บันทึกหมวดหมู่"}</span>
        </button>
      </div>
    </form>
  );
}
