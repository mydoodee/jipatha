"use client";

import { useState, useEffect, useCallback } from "react";
import { uploadFile, listFiles, deleteFile } from "@/lib/firebase/storage";
import { STORAGE_PATHS } from "@/config/constants";
import { Image as ImageIcon, Upload, Copy, Check, Trash2, Folder } from "lucide-react";

export default function AdminMediaPage() {
  const [selectedFolder, setSelectedFolder] = useState<string>("products");
  const [files, setFiles] = useState<{ name: string; fullPath: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const loadMedia = useCallback(async (folder: string) => {
    setLoading(true);
    try {
      const items = await listFiles(folder);
      setFiles(items);
    } catch (err) {
      console.error("Error listing files:", err);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      setLoading(true);
      try {
        const items = await listFiles(selectedFolder);
        if (!ignore) {
          setFiles(items);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error listing files:", err);
        if (!ignore) {
          setFiles([]);
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, [selectedFolder]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    try {
      const file = fileList[0];
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const path = `${selectedFolder}/${filename}`;

      await uploadFile(path, file);
      await loadMedia(selectedFolder);
      alert("อัปโหลดไฟล์เรียบร้อยแล้ว");
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

  const handleDelete = async (fullPath: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์นี้?")) return;
    try {
      await deleteFile(fullPath);
      await loadMedia(selectedFolder);
    } catch (err) {
      console.error("Delete file error:", err);
      alert("เกิดข้อผิดพลาดในการลบไฟล์");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">คลังสื่อ (Media Library)</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            จัดการรูปภาพและไฟล์บน Firebase Storage
          </p>
        </div>

        <label className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-lg shadow-xs cursor-pointer transition-colors inline-flex items-center gap-1.5 w-fit">
          <Upload className="w-4 h-4" />
          <span>{uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูปภาพใหม่"}</span>
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={handleUpload}
            className="hidden"
          />
        </label>
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
        <div className="p-12 text-center text-xs text-gray-500">กำลังโหลดไฟล์สื่อ...</div>
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
                    onClick={() => handleDelete(file.fullPath)}
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
