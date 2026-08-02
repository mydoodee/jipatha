"use client";

import { useState, useEffect, useRef } from "react";
import {
  FileSpreadsheet,
  UploadCloud,
  Key,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Search,
  Download,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Save,
  Percent,
  Flame,
  FileText,
  Layers,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";

interface ShopeeAffiliateOfferItem {
  id: string;
  itemId: string;
  shopId: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  commissionRate: number;
  commissionAmount: number;
  salesCount: number;
  rating: number;
  imageUrl: string;
  productUrl: string;
  affiliateUrl: string;
  shopName: string;
  categoryName?: string;
}

export default function ShopeeSyncPage() {
  const [activeTab, setActiveTab] = useState<"csv" | "cookie">("csv");

  // CSV Import State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingCSV, setIsUploadingCSV] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cookie Sync State
  const [cookie, setCookie] = useState("");
  const [isTestingCookie, setIsTestingCookie] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    valid: boolean;
    username?: string;
    totalOffers?: number;
    error?: string;
  }>({ tested: false, valid: false });

  const [offers, setOffers] = useState<ShopeeAffiliateOfferItem[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [totalOffers, setTotalOffers] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState(1); // 1 = High Commission, 2 = Top Sales

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<any | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  useEffect(() => {
    fetchSavedConfig();
  }, []);

  const fetchSavedConfig = async () => {
    try {
      const res = await fetch("/api/admin/shopee/config");
      const data = await res.json();
      if (data.success && data.cookie) {
        setCookie(data.cookie);
        if (data.shopName || data.totalProducts) {
          setConnectionStatus({
            tested: true,
            valid: true,
            username: "Shopee Affiliate Partner",
            totalOffers: data.totalProducts || 100,
          });
        }
      }
    } catch {
      // ignore
    }
  };

  // CSV Import Handler
  const handleCSVImport = async (fileToImport?: File) => {
    const file = fileToImport || selectedFile;
    if (!file) {
      setBanner({ type: "error", message: "กรุณาเลือกไฟล์ CSV ของ Shopee Affiliate" });
      return;
    }

    setIsUploadingCSV(true);
    setSyncLogs(null);
    setBanner({ type: "info", message: `กำลังอ่านและนำเข้าสินค้าจากไฟล์ "${file.name}"...` });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/shopee/affiliate/import-csv", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setSyncLogs(data.results);
        setBanner({
          type: "success",
          message: `🎉 นำเข้าจากไฟล์สำเร็จ! อ่านพบ ${data.parsedCount} รายการ (เพิ่มใหม่ ${data.results.imported} รายการ, อัปเดต ${data.results.updated} รายการ)`,
        });
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการอ่านไฟล์ CSV");
      }
    } catch (err: any) {
      setBanner({ type: "error", message: `เกิดข้อผิดพลาด: ${err.message}` });
    } finally {
      setIsUploadingCSV(false);
    }
  };

  const handleTestConnection = async (overrideCookie?: string) => {
    const targetCookie = overrideCookie || cookie;
    if (!targetCookie.trim()) {
      setBanner({ type: "error", message: "กรุณาระบุ Cookie ของ Shopee Affiliate Portal ก่อนทดสอบ" });
      return;
    }

    setIsTestingCookie(true);
    setBanner({ type: "info", message: "กำลังทดสอบการเชื่อมต่อกับ Shopee Affiliate Portal..." });

    try {
      const res = await fetch("/api/admin/shopee/affiliate/test-cookie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookie: targetCookie }),
      });
      const data = await res.json();

      if (data.success) {
        setConnectionStatus({
          tested: true,
          valid: true,
          username: data.username || "Shopee Affiliate Partner",
          totalOffers: data.totalOffers || 100,
        });
        setBanner({
          type: "success",
          message: `เชื่อมต่อบัญชี Shopee Affiliate สำเร็จ! พร้อมดึงสินค้ารับคอมมิชชันสูง`,
        });

        await fetch("/api/admin/shopee/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cookie: targetCookie,
            shopName: "Shopee Affiliate Partner",
            totalProducts: data.totalOffers || 100,
          }),
        });

        fetchLiveOffers(targetCookie, 1, searchQuery, sortType);
      } else {
        setConnectionStatus({
          tested: true,
          valid: false,
          error: data.error || "ไม่สามารถเชื่อมต่อได้",
        });
        setBanner({ type: "error", message: data.error || "ตรวจสอบ Cookie ไม่สำเร็จ" });
      }
    } catch (err: any) {
      setBanner({ type: "error", message: `เกิดข้อผิดพลาด: ${err.message}` });
    } finally {
      setIsTestingCookie(false);
    }
  };

  const fetchLiveOffers = async (targetCookie?: string, targetPage = 1, search = "", currentSort = 1) => {
    const activeCookie = targetCookie || cookie;
    if (!activeCookie) return;

    setIsLoadingOffers(true);
    try {
      const res = await fetch("/api/admin/shopee/affiliate/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cookie: activeCookie,
          page: targetPage,
          pageSize: 20,
          keyword: search,
          sortType: currentSort,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setOffers(data.offers);
        setTotalOffers(data.total);
        setPage(targetPage);
      } else {
        setBanner({ type: "error", message: data.error || "ไม่สามารถดึงสินค้ารับคอมมิชชันได้" });
      }
    } catch (err: any) {
      setBanner({ type: "error", message: `เกิดข้อผิดพลาด: ${err.message}` });
    } finally {
      setIsLoadingOffers(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(offers.map((o) => o.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSyncSelected = async () => {
    if (selectedIds.size === 0) {
      setBanner({ type: "error", message: "กรุณาเลือกสินค้าอย่างน้อย 1 รายการก่อนนำเข้า" });
      return;
    }

    const itemsToSync = offers.filter((o) => selectedIds.has(o.id));
    setIsSyncing(true);
    setSyncLogs(null);
    setBanner({ type: "info", message: `กำลังนำเข้าสินค้า Affiliate ที่เลือก ${itemsToSync.length} รายการ...` });

    try {
      const res = await fetch("/api/admin/shopee/affiliate/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offers: itemsToSync }),
      });
      const data = await res.json();

      if (data.success) {
        setSyncLogs(data.results);
        setBanner({
          type: "success",
          message: `🎉 นำเข้าสำเร็จ! เพิ่มสินค้าใหม่ ${data.results.imported} รายการ (อัปเดต ${data.results.updated} รายการ) พร้อมสร้างลิงก์ Affiliate อัตโนมัติ`,
        });
      } else {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการนำเข้าสินค้า");
      }
    } catch (err: any) {
      setBanner({ type: "error", message: `เกิดข้อผิดพลาด: ${err.message}` });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncAllOffers = async () => {
    if (!cookie) {
      setBanner({ type: "error", message: "กรุณาระบุ Cookie ก่อนดึงสินค้ารับคอมมิชชันทั้งหน้า" });
      return;
    }

    setIsSyncing(true);
    setSyncLogs(null);
    setBanner({ type: "info", message: "กำลังดึงสินค้ารับคอมมิชชันสูงจาก Shopee Affiliate Portal โปรดรอสักครู่..." });

    try {
      const res = await fetch("/api/admin/shopee/affiliate/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookie, syncAll: true }),
      });
      const data = await res.json();

      if (data.success) {
        setSyncLogs(data.results);
        setBanner({
          type: "success",
          message: `✨ นำเข้าสินค้า Affiliate คอมมิชชันสูงเรียบร้อย! เพิ่มใหม่ ${data.results.imported} รายการ (อัปเดต ${data.results.updated} รายการ)`,
        });
      } else {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการดึงสินค้า Affiliate");
      }
    } catch (err: any) {
      setBanner({ type: "error", message: `เกิดข้อผิดพลาด: ${err.message}` });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              Shopee Affiliate Auto-Sync
              <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2.5 py-0.5 rounded-full border border-orange-200 flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-600" />
                Affiliate Account
              </span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              ดึงสินค้าคอมมิชชันสูง และสร้างลิงก์ Affiliate (`s.shopee.co.th`) นำเข้าสู่ระบบอัตโนมัติ
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200/80">
          <button
            onClick={() => setActiveTab("csv")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "csv"
                ? "bg-white text-orange-600 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            นำเข้าด้วยไฟล์ CSV (แนะนำ ⭐)
          </button>
          <button
            onClick={() => setActiveTab("cookie")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "cookie"
                ? "bg-white text-orange-600 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            ดึงสดผ่าน Cookie
          </button>
        </div>
      </div>

      {/* Banner */}
      {banner && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs ${
            banner.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : banner.type === "error"
              ? "bg-rose-50 text-rose-800 border border-rose-200"
              : "bg-blue-50 text-blue-800 border border-blue-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {banner.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
            {banner.type === "error" && <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
            {banner.type === "info" && <RefreshCw className="w-4 h-4 shrink-0 text-blue-600 animate-spin" />}
            <span>{banner.message}</span>
          </div>
          <button onClick={() => setBanner(null)} className="text-xs opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: CSV File Importer (Recommended) */}
      {activeTab === "csv" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-gray-900">
                นำเข้าสินค้าผ่านไฟล์ CSV จาก Shopee Affiliate Portal
              </h2>
              <p className="text-[11px] text-gray-500">
                ดาวน์โหลดไฟล์รายงาน/ลิงก์หลายลิงก์จาก <code className="bg-gray-100 px-1 rounded text-orange-700">affiliate.shopee.co.th</code> แล้วนำไฟล์มาอัปโหลดที่นี่
              </p>
            </div>
          </div>

          <div className="border-2 border-dashed border-orange-200 hover:border-orange-400 bg-orange-50/40 rounded-2xl p-8 text-center transition flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">
                ลากไฟล์ CSV มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                รองรับไฟล์ <code className="text-orange-700 font-mono font-bold">.csv</code> จาก Shopee (เช่น ไฟล์ชื่อ &quot;ลิงก์สินค้าหลายลิงก์....csv&quot;)
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setSelectedFile(file);
                if (file) handleCSVImport(file);
              }}
              className="hidden"
            />

            <div className="flex flex-wrap items-center gap-3 mt-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingCSV}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                {isUploadingCSV ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    กำลังนำเข้าสินค้า...
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    เลือกไฟล์ CSV
                  </>
                )}
              </button>

              <button
                onClick={async () => {
                  setBanner({ type: "info", message: "กำลังประมวลผลไฟล์ใหญ่ 3.76 GB ในโฟลเดอร์ file_product โปรดรอสักครู่..." });
                  try {
                    const res = await fetch("/api/admin/shopee/affiliate/process-large-file", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ minCommission: 10, limit: 500 }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      setBanner({ type: "success", message: `🎉 ${data.message}` });
                    } else {
                      throw new Error(data.error || "เกิดข้อผิดพลาดในการประมวลผลไฟล์ใหญ่");
                    }
                  } catch (err: any) {
                    setBanner({ type: "error", message: `เกิดข้อผิดพลาด: ${err.message}` });
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Flame className="w-3.5 h-3.5" />
                ⚡ ประมวลผลไฟล์ใหญ่ 3.76 GB (สกัดสินค้าคอมสูง)
              </button>

              <button
                onClick={async () => {
                  if (!confirm("คุณต้องการลบสินค้าและลิงก์ทั้งหมดในฐานข้อมูลใช่หรือไม่?")) return;
                  setBanner({ type: "info", message: "กำลังเคลียร์ลบสินค้าทั้งหมดในฐานข้อมูล..." });
                  try {
                    const res = await fetch("/api/admin/shopee/affiliate/clear-all", { method: "POST" });
                    const data = await res.json();
                    if (data.success) {
                      setBanner({ type: "success", message: `🗑️ ${data.message}` });
                    } else {
                      throw new Error(data.error || "เกิดข้อผิดพลาดในการลบสินค้า");
                    }
                  } catch (err: any) {
                    setBanner({ type: "error", message: `เกิดข้อผิดพลาด: ${err.message}` });
                  }
                }}
                className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs border border-rose-200"
              >
                🗑️ ลบสินค้าทั้งหมดในระบบ
              </button>
            </div>

            {selectedFile && (
              <div className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ไฟล์ที่เลือก: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Cookie Fetcher */}
      {activeTab === "cookie" && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-orange-600" />
              <h2 className="text-sm font-bold text-gray-900">ตั้งค่า Cookie บัญชี Shopee Affiliate Portal</h2>
            </div>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              วิธีเอา Cookie จาก Affiliate Portal
              {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showGuide && (
            <div className="p-4 bg-orange-50/70 border border-orange-200/60 rounded-xl text-xs text-gray-700 space-y-2.5">
              <p className="font-bold text-orange-800">📌 ขั้นตอนการเอา Cookie จาก Shopee Affiliate Portal (เลือกวิธีใดวิธีหนึ่ง):</p>
              <div className="p-3 bg-white/80 rounded-lg border border-orange-200/50 space-y-1">
                <span className="font-bold text-emerald-700">⚡ วิธีที่ 1: ผ่าน Console (ง่ายและเร็วกว่า 3 วินาที ⭐⭐⭐⭐⭐):</span>
                <ol className="list-decimal list-inside space-y-1 text-gray-600 text-[11px] pl-1">
                  <li>เปิดเว็บ <a href="https://affiliate.shopee.co.th" target="_blank" rel="noreferrer" className="text-orange-600 underline font-semibold inline-flex items-center gap-0.5">affiliate.shopee.co.th <ExternalLink className="w-3 h-3"/></a></li>
                  <li>กด <kbd className="px-1 py-0.5 bg-gray-200 rounded font-mono text-[10px]">F12</kbd> -&gt; เลือกแท็บ <strong>Console</strong></li>
                  <li>พิมพ์คำสั่ง <code className="bg-gray-100 px-1.5 py-0.5 rounded text-orange-700 font-mono font-bold">copy(document.cookie)</code> แล้วกด <kbd>Enter</kbd></li>
                  <li>Cookie ทั้งหมดจะถูกก๊อปปี้ทันที นำมาวางในช่องด้านล่างนี้ได้เลย!</li>
                </ol>
              </div>
              <div className="p-3 bg-white/80 rounded-lg border border-orange-200/50 space-y-1">
                <span className="font-bold text-gray-800">🌐 วิธีที่ 2: ก๊อปปี้จาก Network Request Headers:</span>
                <ol className="list-decimal list-inside space-y-1 text-gray-600 text-[11px] pl-1">
                  <li>เปิดหน้าเว็บ <a href="https://affiliate.shopee.co.th" target="_blank" rel="noreferrer" className="text-orange-600 underline font-semibold">affiliate.shopee.co.th</a> กด <kbd className="px-1 py-0.5 bg-gray-200 rounded font-mono text-[10px]">F12</kbd> -&gt; เลือกแท็บ <strong>Network</strong></li>
                  <li>รีเฟรชหน้าเว็บ 1 ครั้ง -&gt; คลิกรายการใดก็ได้ในฝั่งซ้าย</li>
                  <li>ฝั่งขวาหัวข้อ <strong>Request Headers</strong> -&gt; คัดลอกข้อความหลังคำว่า <strong className="text-orange-700">Cookie:</strong> ทั้งหมดมาวาง</li>
                </ol>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <textarea
              rows={3}
              value={cookie}
              onChange={(e) => setCookie(e.target.value)}
              placeholder="วาง Session Cookie จาก affiliate.shopee.co.th"
              className="w-full text-xs font-mono p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none resize-none bg-gray-50/50"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] text-gray-500">
                * Cookie จะใช้สำหรับดึงข้อเสนอสินค้ารับค่าคอมมิชชันและแปลงลิงก์ Affiliate ของคุณเอง
              </div>
              <button
                onClick={() => handleTestConnection()}
                disabled={isTestingCookie || !cookie.trim()}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                {isTestingCookie ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    กำลังทดสอบ...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    ทดสอบและบันทึก Cookie Affiliate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync Progress Log */}
      {syncLogs && (
        <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-xs text-gray-800 space-y-2 shadow-xs">
          <div className="flex items-center justify-between font-bold text-emerald-800">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              สรุปผลการนำเข้าสินค้า Shopee Affiliate:
            </span>
            <span>
              เพิ่มใหม่: {syncLogs.imported} | อัปเดต: {syncLogs.updated} | ล้มเหลว: {syncLogs.failed}
            </span>
          </div>
          {syncLogs.items && syncLogs.items.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-1 bg-white p-3 rounded-xl border border-emerald-200/60 font-mono text-[11px]">
              {syncLogs.items.map((item: any, idx: number) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-50 py-1 gap-1 last:border-none">
                  <div className="flex flex-col truncate max-w-lg">
                    <span className="truncate font-medium text-gray-900">{item.title}</span>
                    {item.error && <span className="text-[10px] text-rose-600 font-mono">Error: {item.error}</span>}
                  </div>
                  <span
                    className={`font-bold shrink-0 ${
                      item.status === "created"
                        ? "text-emerald-600"
                        : item.status === "updated"
                        ? "text-blue-600"
                        : "text-rose-600"
                    }`}
                  >
                    [{item.status}] {item.price ? `฿${item.price.toLocaleString()}` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Live Affiliate Offers Section (when using cookie tab or viewing offers) */}
      {activeTab === "cookie" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อสินค้า / คำค้นหา..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") fetchLiveOffers(cookie, 1, searchQuery, sortType);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              <select
                value={sortType}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSortType(val);
                  fetchLiveOffers(cookie, 1, searchQuery, val);
                }}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 outline-none focus:border-orange-500"
              >
                <option value={1}>🔥 คอมมิชชันสูงสุด (High Commission)</option>
                <option value={2}>📈 ยอดขายสูงสุด (Top Sales)</option>
              </select>

              <button
                onClick={() => fetchLiveOffers(cookie, 1, searchQuery, sortType)}
                disabled={isLoadingOffers || !cookie}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOffers ? "animate-spin" : ""}`} />
                โหลดสด
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncSelected}
                disabled={isSyncing || selectedIds.size === 0}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                นำเข้าที่เลือก ({selectedIds.size})
              </button>
              <button
                onClick={handleSyncAllOffers}
                disabled={isSyncing || !cookie}
                className="px-3.5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                นำเข้าคอมมิชชันสูงทั้งหมด
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={offers.length > 0 && selectedIds.size === offers.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                  </th>
                  <th className="p-3">สินค้า Affiliate</th>
                  <th className="p-3 w-28">ราคา (฿)</th>
                  <th className="p-3 w-32">% คอมมิชชัน</th>
                  <th className="p-3 w-28">รายได้/ชิ้น</th>
                  <th className="p-3 w-24">ขายแล้ว</th>
                  <th className="p-3 w-20 text-center">ลิงก์</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {isLoadingOffers ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-orange-500 mb-2" />
                      กำลังโหลดสินค้ารับคอมมิชชันสูงจาก Shopee Affiliate Portal...
                    </td>
                  </tr>
                ) : offers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">
                      {connectionStatus.valid
                        ? "ไม่พบสินค้าในหน้านี้ หรือลองกดปุ่ม 'โหลดสด'"
                        : "กรุณาระบุ Cookie จาก affiliate.shopee.co.th และกด 'ทดสอบและบันทึก Cookie'"}
                    </td>
                  </tr>
                ) : (
                  offers.map((item) => (
                    <tr key={item.id} className="hover:bg-orange-50/30 transition">
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => handleToggleSelect(item.id)}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 relative rounded-lg border border-gray-200 overflow-hidden shrink-0 bg-gray-100">
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt={item.title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">
                                ไม่มีรูป
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 line-clamp-1 max-w-md">{item.title}</div>
                            <div className="text-[10px] text-gray-400 font-mono flex items-center gap-2">
                              <span>ร้าน: {item.shopName}</span>
                              <span>ID: {item.itemId}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-bold text-gray-900">฿{item.price.toLocaleString()}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs inline-flex items-center gap-0.5">
                          <Flame className="w-3 h-3 fill-white" />
                          {item.commissionRate}%
                        </span>
                      </td>
                      <td className="p-3 font-bold text-emerald-600">
                        +฿{item.commissionAmount ? item.commissionAmount.toLocaleString() : Math.round((item.price * item.commissionRate) / 100).toLocaleString()}
                      </td>
                      <td className="p-3 text-gray-500 font-medium">{item.salesCount.toLocaleString()} ชิ้น</td>
                      <td className="p-3 text-center">
                        <a
                          href={item.affiliateUrl || item.productUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-gray-400 hover:text-orange-600 inline-block transition"
                          title="ดูสินค้า Affiliate"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
