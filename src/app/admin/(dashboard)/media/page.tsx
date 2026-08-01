"use client";

import { useState, useEffect, useCallback } from "react";
import { STORAGE_PATHS } from "@/config/constants";
import { Image as ImageIcon, Upload, Copy, Check, Trash2, Folder, Cloud, RefreshCw } from "lucide-react";

export default function AdminMediaPage() {
  const [selectedFolder, setSelectedFolder] = useState<string>("products");
  const [files, setFiles] = useState<{ name: string; fullPath: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const loadMedia = useCallback(async (folder: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/media/list?folder=${folder}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setFiles(data.items);
      } else {
        setFiles([]);
      }
    } catch (err) {
      console.error("Error listing files:", err);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedia(selectedFolder);
  }, [selectedFolder, loadMedia]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    try {
      const file = fileList[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", selectedFolder);

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        await loadMedia(selectedFolder);
        alert("อัปโหลดไฟล์ไปยัง Vercel Storage เรียบร้อยแล้ว!");
      } else {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการอัปโหลดไฟล์");
      }
    } catch (err: unknown) {
      console.error("Upload error:", err);
      alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการอัปโหลดไฟล์");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDelete = async (url: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์นี้จาก Vercel Storage?")) return;
    try {
      const res = await fetch(`/api/admin/media/list?url=${encodeURIComponent(url)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        await loadMedia(selectedFolder);
      } else {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการลบไฟล์");
      }
    } catch (err) {
      console.error("Delete file error:", err);
      alert("เกิดข้อผิดพลาดในการลบไฟล์");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cloud className="w-6 h-6 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-900">คลังสื่อ (Vercel Free Storage)</h1>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            จัดการรูปภาพและไฟล์บน Vercel Blob Storage ฟรี 1GB
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadMedia(selectedFolder)}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 rounded-lg transition-colors"
            title="รีเฟรชรายการ"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <label className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-lg shadow-xs cursor-pointer transition-colors inline-flex items-center gap-1.5 w-fit">
            <Upload className="w-4 h-4" />
            <span>{uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูปภาพใหม่ (Vercel)"}</span>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Folder Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        {Object.entries(STORAGE_PATHS).map(([key, folder]) => (
          <button
            key={key}
            onClick={() => setSelectedFolder(folder)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              selectedFolder === folder
                ? "bg-orange-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span className="capitalize">/{folder}</span>
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
          <span>กำลังโหลดไฟล์สื่อจาก Vercel Storage...</span>
        </div>
      ) : files.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-xs">
          <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p>ยังไม่มีไฟล์ในโฟลเดอร์ /{selectedFolder}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {files.map((file) => (
            <div
              key={file.fullPath}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>

              <div className="p-2 bg-white flex items-center justify-between gap-1 border-t border-gray-100 mt-auto">
                <span className="text-[10px] text-gray-500 font-mono truncate flex-1" title={file.name}>
                  {file.name}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopyUrl(file.url)}
                    className="p-1 text-gray-400 hover:text-orange-600 rounded"
                    title="คัดลอก URL"
                  >
                    {copiedUrl === file.url ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(file.url)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                    title="ลบไฟล์"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
