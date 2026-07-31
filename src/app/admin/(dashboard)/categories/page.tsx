"use client";

import { useEffect, useState, useCallback } from "react";
import { CategorySerialized } from "@/types/category";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/firebase/services/categories";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { CategoryFormData } from "@/lib/validation/category";
import { Folder, Edit, Trash2 } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategorySerialized[]>([]);
  const [editingCategory, setEditingCategory] = useState<CategorySerialized | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const data = await getCategories();
        if (!ignore) {
          setCategories(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading categories:", err);
        if (!ignore) setLoading(false);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
        setEditingCategory(null);
      } else {
        await createCategory(data);
      }
      await loadCategories();
    } catch (err: unknown) {
      console.error("Error saving category:", err);
      const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึก";
      setErrorMsg("เกิดข้อผิดพลาด: " + message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      await loadCategories();
      setSuccessMsg("ลบหมวดหมู่เรียบร้อยแล้ว");
    } catch (err) {
      console.error("Error deleting category:", err);
      setErrorMsg("เกิดข้อผิดพลาดในการลบหมวดหมู่");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">จัดการหมวดหมู่สินค้า</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          สร้าง แก้ไข หรือลบหมวดหมู่สินค้าในระบบ
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex justify-between items-center">
          <span>{successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg(null)}>✕</button>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex justify-between items-center">
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)}>✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div>
          <CategoryForm
            key={editingCategory?.id || "new"}
            initialData={editingCategory || undefined}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
          {editingCategory && (
            <button
              onClick={() => setEditingCategory(null)}
              className="mt-2 text-xs text-gray-500 hover:text-gray-900 underline block"
            >
              + ยกเลิกการแก้ไข / เพิ่มหมวดหมู่ใหม่
            </button>
          )}
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
          {loading ? (
            <div className="p-8 text-center text-xs text-gray-500">กำลังโหลดหมวดหมู่...</div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">ยังไม่มีหมวดหมู่</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">ลำดับ</th>
                  <th className="px-6 py-3">ชื่อหมวดหมู่</th>
                  <th className="px-6 py-3">สถานะ</th>
                  <th className="px-6 py-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-500">{cat.sortOrder}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-orange-600 flex-shrink-0" />
                        <div>
                          <span className="block font-semibold">{cat.name}</span>
                          <span className="text-xs text-gray-400 font-mono">{cat.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                          cat.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {cat.status === "active" ? "ใช้งาน" : "ปิดใช้งาน"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setEditingCategory(cat)}
                        className="p-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded"
                        title="แก้ไข"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                        title="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
