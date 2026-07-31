"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PostForm } from "@/components/admin/PostForm";
import { PostFormData } from "@/lib/validation/post";
import { getPostById, updatePost, deletePost } from "@/lib/firebase/services/posts";
import { getCategories } from "@/lib/firebase/services/categories";
import { CategorySerialized } from "@/types/category";
import { PostSerialized } from "@/types/post";
import { Trash2 } from "lucide-react";

interface EditPostClientProps {
  params: Promise<{ id: string }>;
}

export default function EditPostClient({ params }: EditPostClientProps) {
  const { id } = use(params);
  const [post, setPost] = useState<PostSerialized | null>(null);
  const [categories, setCategories] = useState<CategorySerialized[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const [postData, cats] = await Promise.all([
          getPostById(id),
          getCategories("active"),
        ]);
        setPost(postData);
        setCategories(cats);
      } catch (err) {
        console.error("Error loading post:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleSubmit = async (data: PostFormData) => {
    setIsSubmitting(true);
    try {
      await updatePost(id, data);
      router.push("/admin/posts");
    } catch (err) {
      console.error("Error updating post:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกบทความ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบบทความนี้?")) return;
    try {
      await deletePost(id);
      router.push("/admin/posts");
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("เกิดข้อผิดพลาดในการลบบทความ");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-gray-500">
        กำลังโหลดข้อมูลบทความ...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-8 text-center text-red-600 font-semibold text-sm">
        ไม่พบข้อมูลบทความที่ต้องการแก้ไข
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">แก้ไขบทความ</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            รหัสบทความ: {post.id}
          </p>
        </div>

        <button
          onClick={handleDelete}
          className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          <span>ลบบทความ</span>
        </button>
      </div>

      <PostForm
        initialData={post}
        categories={categories}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
