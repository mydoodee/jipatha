"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PostForm } from "@/components/admin/PostForm";
import { PostFormData } from "@/lib/validation/post";
import { createPost } from "@/lib/firebase/services/posts";
import { getCategories } from "@/lib/firebase/services/categories";
import { CategorySerialized } from "@/types/category";

export default function NewPostPage() {
  const [categories, setCategories] = useState<CategorySerialized[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const cats = await getCategories("active");
        setCategories(cats);
      } catch (err) {
        console.error("Error loading categories:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (data: PostFormData) => {
    setIsSubmitting(true);
    try {
      await createPost(data);
      router.push("/admin/posts");
    } catch (err) {
      console.error("Error creating post:", err);
      alert("เกิดข้อผิดพลาดในการเพิ่มบทความ");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-gray-500">
        กำลังโหลดแบบฟอร์ม...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">เขียนบทความใหม่</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          กรอกข้อมูลเนื้อหาบทความและตั้งค่า SEO
        </p>
      </div>

      <PostForm
        categories={categories}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
