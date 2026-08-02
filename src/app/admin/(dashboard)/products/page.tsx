"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { getProducts, deleteProduct } from "@/lib/firebase/services/products";
import { db, doc, updateDoc, deleteDoc } from "@/lib/firebase/firestore";
import { ProductSerialized } from "@/types/product";
import {
  Plus,
  Edit,
  ExternalLink,
  Package,
  Trash2,
  Search,
  RefreshCw,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  MousePointerClick,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";

export default function AdminProductsPage() {
  const [allProducts, setAllProducts] = useState<ProductSerialized[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Mode Selection: "pagination" | "infinite"
  const [displayMode, setDisplayMode] = useState<"pagination" | "infinite">("pagination");

  // Selection & Bulk Action State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState(20);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTargetRef = useRef<HTMLDivElement>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts({ status: "all", limitCount: 2000 });
      setAllProducts(data);
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter products by Search & Status
  const filteredProducts = allProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Reset page & selection when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
    setVisibleCount(pageSize);
    setSelectedIds(new Set());
  }, [searchQuery, statusFilter, pageSize]);

  // Handle Infinite Scroll IntersectionObserver
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (
        target.isIntersecting &&
        displayMode === "infinite" &&
        !loading &&
        visibleCount < filteredProducts.length
      ) {
        setLoadingMore(true);
        setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + 20, filteredProducts.length));
          setLoadingMore(false);
        }, 300);
      }
    },
    [displayMode, loading, visibleCount, filteredProducts.length]
  );

  useEffect(() => {
    const element = observerTargetRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "200px",
      threshold: 0.1,
    });

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [handleObserver]);

  // Derived Paginated Data
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);

  // Displayed Products depending on mode
  const displayedProducts =
    displayMode === "infinite"
      ? filteredProducts.slice(0, visibleCount)
      : paginatedProducts;

  // Selection Logic
  const isAllSelected =
    displayedProducts.length > 0 &&
    displayedProducts.every((p) => selectedIds.has(p.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayedProducts.map((p) => p.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Delete Single Item
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "${name}"?`)) return;

    setDeletingId(id);
    try {
      await deleteProduct(id);
      setAllProducts((prev) => prev.filter((p) => p.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("เกิดข้อผิดพลาดในการลบสินค้า");
    } finally {
      setDeletingId(null);
    }
  };

  // Bulk Delete Selected
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสินค้าที่เลือกทั้ง ${selectedIds.size} รายการ?`)) return;

    setIsBulkDeleting(true);
    try {
      for (const id of Array.from(selectedIds)) {
        await deleteDoc(doc(db, "products", id));
      }
      setAllProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
    } catch (err) {
      console.error("Error bulk deleting:", err);
      alert("เกิดข้อผิดพลาดในการลบสินค้าบางรายการ");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Bulk Status Update
  const handleBulkStatusChange = async (targetStatus: "published" | "draft") => {
    if (selectedIds.size === 0) return;

    setIsBulkDeleting(true);
    try {
      for (const id of Array.from(selectedIds)) {
        await updateDoc(doc(db, "products", id), { status: targetStatus });
      }
      setAllProducts((prev) =>
        prev.map((p) => (selectedIds.has(p.id) ? { ...p, status: targetStatus } : p))
      );
      setSelectedIds(new Set());
    } catch (err) {
      console.error("Error bulk updating status:", err);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            จัดการสินค้า
            <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2.5 py-0.5 rounded-full border border-orange-200">
              {filteredProducts.length} รายการ
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            จัดการ แก้ไข ลบ และเปลี่ยนสถานะสินค้าทั้งหมดในระบบ
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Display Mode Toggle */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs">
            <button
              onClick={() => setDisplayMode("pagination")}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                displayMode === "pagination"
                  ? "bg-white text-orange-600 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              จัดเลขหน้า
            </button>
            <button
              onClick={() => setDisplayMode("infinite")}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                displayMode === "infinite"
                  ? "bg-white text-orange-600 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <MousePointerClick className="w-3.5 h-3.5" />
              เลื่อนลงโหลดเรื่อยๆ
            </button>
          </div>

          <button
            onClick={loadProducts}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 rounded-xl transition-colors"
            title="รีเฟรชรายการ"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มสินค้าใหม่</span>
          </Link>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="ค้นหาชื่อสินค้า หรือ Slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 bg-gray-50/50"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-orange-500"
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="published">เผยแพร่แล้ว</option>
            <option value="draft">ฉบับร่าง</option>
          </select>
        </div>

        {/* Page Size Selection (in pagination mode) */}
        {displayMode === "pagination" && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>แสดงหน้าละ:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 outline-none"
            >
              <option value={20}>20 ชิ้น</option>
              <option value={50}>50 ชิ้น</option>
              <option value={100}>100 ชิ้น</option>
            </select>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs relative">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
            <span>กำลังโหลดรายการสินค้า...</span>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-sm">ไม่พบสินค้าในระบบ</p>
            <p className="text-xs text-gray-400 mt-1">คลิกปุ่ม &quot;เพิ่มสินค้าใหม่&quot; ด้านบนเพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-50 text-gray-600 text-xs font-bold uppercase border-b border-gray-200">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                  </th>
                  <th className="px-4 py-3">สินค้า</th>
                  <th className="px-4 py-3">ราคา</th>
                  <th className="px-4 py-3">สถานะ</th>
                  <th className="px-4 py-3">แนะนำ</th>
                  <th className="px-4 py-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {displayedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className={`hover:bg-orange-50/30 transition-colors ${
                      selectedIds.has(product.id) ? "bg-orange-50/40" : ""
                    }`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(product.id)}
                        onChange={() => handleToggleSelect(product.id)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0 bg-gray-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center text-[10px] text-gray-400">
                            ไม่มีรูป
                          </div>
                        )}
                        <div>
                          <span className="block font-semibold text-gray-900 line-clamp-1 max-w-md">
                            {product.name}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {product.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-bold text-orange-600">
                      ฿{product.price.toLocaleString()}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          product.status === "published"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {product.status === "published" ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-500">
                      {product.featured ? "⭐ ใช่" : "-"}
                    </td>

                    <td className="px-4 py-3 text-right space-x-1">
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="inline-block p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        title="ดูหน้าเว็บ"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-block p-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition"
                        title="แก้ไข"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deletingId === product.id}
                        className="inline-block p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
                        title="ลบสินค้า"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* INFINITE SCROLL OBSERVER SENTINEL */}
        {displayMode === "infinite" && (
          <div ref={observerTargetRef} className="p-4 text-center text-xs text-gray-400">
            {loadingMore ? (
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
                <span>กำลังโหลดรายการสินค้าเพิ่ม...</span>
              </div>
            ) : visibleCount >= filteredProducts.length ? (
              <span>แสดงสินค้าครบทั้งหมดแล้ว ({filteredProducts.length} รายการ)</span>
            ) : (
              <span>เลื่อนลงเพื่อโหลดสินค้าเพิ่มเติม...</span>
            )}
          </div>
        )}

        {/* PAGINATION BAR */}
        {displayMode === "pagination" && filteredProducts.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-600">
            <div>
              แสดง <span className="font-bold">{startIndex + 1}</span> ถึง{" "}
              <span className="font-bold">
                {Math.min(startIndex + pageSize, filteredProducts.length)}
              </span>{" "}
              จากทั้งหมด <span className="font-bold">{filteredProducts.length}</span> รายการ
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 transition flex items-center gap-1 text-xs font-semibold"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                ก่อนหน้า
              </button>

              {/* Page Number Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .map((p, idx, arr) => {
                  const prevPage = arr[idx - 1];
                  const showEllipsis = prevPage && p - prevPage > 1;

                  return (
                    <div key={p} className="flex items-center gap-1">
                      {showEllipsis && <span className="px-1 text-gray-400">...</span>}
                      <button
                        onClick={() => setCurrentPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                          currentPage === p
                            ? "bg-orange-600 text-white shadow-xs"
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {p}
                      </button>
                    </div>
                  );
                })}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 transition flex items-center gap-1 text-xs font-semibold"
              >
                ถัดไป
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FLOATING BULK ACTION BAR */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 text-xs z-50 animate-in fade-in slide-in-from-bottom-5 duration-200 border border-gray-800">
          <div className="font-bold flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-orange-400" />
            <span>เลือกแล้ว {selectedIds.size} รายการ</span>
          </div>

          <div className="h-4 w-px bg-gray-700" />

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatusChange("published")}
              disabled={isBulkDeleting}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition flex items-center gap-1 shadow-xs disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              ตั้งเป็น เผยแพร่
            </button>
            <button
              onClick={() => handleBulkStatusChange("draft")}
              disabled={isBulkDeleting}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition flex items-center gap-1 shadow-xs disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              ตั้งเป็น ฉบับร่าง
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition flex items-center gap-1 shadow-xs disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              ลบสินค้าที่เลือก
            </button>
          </div>

          <div className="h-4 w-px bg-gray-700" />

          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-gray-400 hover:text-white text-xs underline font-medium"
          >
            ยกเลิก
          </button>
        </div>
      )}
    </div>
  );
}
